import React from 'react';
import { Subject } from 'rxjs';
import { GetRoomDocument, GetRoomFailureType, GetRoomQuery, GetRoomQueryVariables, RoomAsListItemFragment, RoomOperatedDocument, RoomOperatedSubscription, RoomOperatedSubscriptionVariables, RoomOperationFragment, useOperateMutation } from '../generated/graphql';
import * as Rx from 'rxjs/operators';
import { useApolloClient } from '@apollo/client';
import { StateManager } from '../stateManagers/StateManager';
import * as Room from '../stateManagers/states/room';
import { create as createStateManager } from '../stateManagers/main';
import MyAuthContext from '../contexts/MyAuthContext';

const sampleTime = 3000;

export const loading = 'loading';
export const joined = 'joined';
export const requiresReload = 'requiresReload';
export const requiresLogin = 'requiresLogin';
export const nonJoined = 'nonJoined';
export const getRoomFailure = 'getRoomFailure';
export const mutationFailure = 'mutationFailure';

type RoomState = {
    type: typeof loading;
} | {
    type: typeof joined;
    state: Room.State;
    // undefinedならばrefetchが必要。
    operate: ((operation: Room.PostOperationSetup) => void) | undefined;
} | {
    type: typeof requiresLogin;
} | {
    type: typeof nonJoined;
    nonJoinedRoom: RoomAsListItemFragment;
} | {
    type: typeof getRoomFailure;
    getRoomFailureType: GetRoomFailureType;
} | {
    // TODO: エラーの内容を返したり、unionを細分化する。
    type: typeof mutationFailure;
}

type RoomStateResult = {
    refetch: () => void;
    state: RoomState;
}

export const useRoomState = (roomId: string): RoomStateResult => {
    const myAuth = React.useContext(MyAuthContext);
    const apolloClient = useApolloClient();
    const [operateMutation] = useOperateMutation();
    const [state, setState] = React.useState<RoomState>({ type: loading });
    // refetchしたい場合、これを前の値と異なる値にすることで、useEffectが再度実行されてrefetchになる。
    const [refetchKey, setRefetchKey] = React.useState(0);
    // refetchとして単に () => setRefetchKey(refetchKey + 1) をそのまま返す（この値をfとする）と、レンダーのたびにfは変わるため、fをdepsに使用されたときに問題が起こる可能性が高いので、useMemoで軽減。
    const refetch = React.useMemo(() => () => setRefetchKey(refetchKey + 1), [refetchKey]);

    React.useEffect(() => {
        setState({ type: loading });

        const userUid = myAuth?.uid;
        if (userUid == null) {
            setState({ type: requiresLogin });
            return;
        }

        let stateManager: StateManager<Room.State, Room.GetOperation, Room.PostOperation> | null = null;

        const onStateManagerUpdate = () => {
            const $stateManager = stateManager;
            if ($stateManager == null) {
                return;
            }
            setState(oldValue => {
                if (oldValue.type !== joined) {
                    return oldValue;
                }
                const newState = $stateManager.uiState;
                return {
                    ...oldValue,
                    state: newState,
                    operate: $stateManager.requiresReload ? undefined : oldValue.operate,
                };
            });
        };

        const postTrigger = new Subject<void>();
        const operationCache = new Map<number, RoomOperationFragment>(); // キーはrevisionTo
        // TODO: GetRoomQueryを受信中にoperationを受け取り損ねるのをなるべく防ぐためにsubscriptionを先に行っているが、必要のない場面でもsubscribeするため非効率。もしパフォーマンス上の問題があるなら、getOperationのようなqueryをサーバー側に実装してからコードを変更すべきか。
        // そもそも、「subscribeの通信確立後にGetRoomQueryを実行」ということができればいいのだが、Apolloの仕様がまだわからないのでなんともいえない。
        const subscription0 = apolloClient.subscribe<RoomOperatedSubscription, RoomOperatedSubscriptionVariables>({ query: RoomOperatedDocument, variables: { id: roomId } })
            .subscribe(s => {
                if (s.data?.roomOperated == null) {
                    return;
                }
                if (s.data.roomOperated.__typename === 'DeleteRoomOperation') {
                    // TODO: 削除時の処理
                    return;
                }
                if (s.data.roomOperated.__typename !== 'RoomOperation') {
                    return;
                }
                if (stateManager == null) {
                    operationCache.set(s.data.roomOperated.revisionTo, s.data.roomOperated);
                    return;
                }
                if (s.data.roomOperated.operatedBy !== userUid) {
                    const getOperation = Room.createGetOperation(s.data.roomOperated.value);
                    stateManager.onOthersGet(getOperation, s.data.roomOperated.revisionTo);
                    onStateManagerUpdate();
                }
            });
        const subscription1 = postTrigger.pipe(
            Rx.sampleTime(sampleTime),
            Rx.map(async () => {
                if (stateManager == null) {
                    return;
                }
                if (stateManager.isPosting || stateManager.requiresReload) {
                    return;
                }
                const toPost = stateManager.post();
                if (toPost == null) {
                    return;
                }
                const valueInput = Room.toGraphQLInput(toPost.operationToPost);
                const result = await operateMutation({
                    variables: {
                        id: roomId,
                        operation: { value: valueInput },
                        revisionFrom: toPost.revision,
                        requestId: toPost.requestId,
                    }
                });
                console.info({ valueInput, result });
                if (result.data == null) {
                    // TODO: isSuccess: falseのケースに対応（サーバー側の対応も必要か）
                    toPost.onPosted({ isSuccess: null });
                    return;
                }
                switch (result.data.result.__typename) {
                    case 'OperateRoomSuccessResult':
                        toPost.onPosted({
                            isSuccess: true,
                            isId: false,
                            revisionTo: result.data.result.operation.revisionTo,
                            result: Room.createGetOperation(result.data.result.operation.value)
                        });
                        onStateManagerUpdate();
                        break;
                    case 'OperateRoomIdResult':
                        toPost.onPosted({
                            isSuccess: true,
                            isId: true,
                            requestId: result.data.result.requestId,
                        });
                        onStateManagerUpdate();
                        break;
                    case 'OperateRoomNonJoinedResult':
                    case 'OperateRoomFailureResult':
                        // TODO: 状況によって自動リトライを可能にする。
                        setState({
                            type: mutationFailure,
                        });
                        break;
                }
            }),
            Rx.mergeAll()).subscribe(() => undefined);

        apolloClient.query<GetRoomQuery, GetRoomQueryVariables>({
            query: GetRoomDocument,
            variables: { id: roomId },
            fetchPolicy: 'no-cache'
        }).then(q => {
            switch (q.data.result.__typename) {
                case 'GetJoinedRoomResult': {
                    const newStateManager = createStateManager(Room.createState(q.data.result.room), q.data.result.room.revision);
                    operationCache.forEach((operation, revisionTo) => {
                        if (operation.operatedBy !== userUid) {
                            newStateManager.onOthersGet(Room.createGetOperation(operation.value), revisionTo);
                        }
                    });
                    operationCache.clear(); // 早めのメモリ解放
                    stateManager = newStateManager;
                    const operate = (operation: Room.PostOperationSetup) => {
                        const $stateManager = stateManager;
                        if ($stateManager == null) {
                            return;
                        }
                        if ($stateManager.requiresReload) {
                            setState(oldValue => {
                                if (oldValue.type !== joined) {
                                    return oldValue;
                                }
                                return {
                                    ...oldValue,
                                    operate: undefined,
                                };
                            });
                            return;
                        }
                        $stateManager.operate(Room.setupPostOperation(operation, userUid));
                        onStateManagerUpdate();
                        postTrigger.next();
                    };
                    setState({
                        type: joined,
                        state: newStateManager.uiState,
                        operate: newStateManager.requiresReload ? undefined : operate,
                    });
                    break;
                }
                case 'GetNonJoinedRoomResult': {
                    const nonJoinedRoom = q.data.result.roomAsListItem;
                    setState({
                        type: nonJoined,
                        nonJoinedRoom,
                    });
                    break;
                }
                case 'GetRoomFailureResult': {
                    const getRoomFailureType = q.data.result.failureType;
                    setState({
                        type: getRoomFailure,
                        getRoomFailureType,
                    });
                    break;
                }
            }
        });

        return () => {
            stateManager = null; // 早めのメモリ解放
            subscription0.unsubscribe();
            subscription1.unsubscribe();
        };
    }, [refetchKey, apolloClient, roomId, myAuth?.uid, operateMutation]);

    return { refetch, state };
};