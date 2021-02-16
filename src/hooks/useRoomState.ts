import React from 'react';
import { Subject } from 'rxjs';
import { GetRoomDocument, GetRoomFailureType, GetRoomQuery, GetRoomQueryVariables, ParticipantsOperationFragment, RoomAsListItemFragment, RoomOperatedDocument, RoomOperatedSubscription, RoomOperatedSubscriptionVariables, RoomOperationFragment, useOperateMutation } from '../generated/graphql';
import * as Rx from 'rxjs/operators';
import { useApolloClient } from '@apollo/client';
import { GetOnlyStateManager, StateManager } from '../stateManagers/StateManager';
import * as Room from '../stateManagers/states/room';
import * as Participant from '../stateManagers/states/participant';
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
    roomState: Room.State;
    // undefinedならばrefetchが必要。
    operateRoom: ((operation: Room.PostOperationSetup) => void) | undefined;
    participantsState: Participant.State;
    // participantの更新は、mutationを直接呼び出すことで行う。
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

        let roomStateManager: StateManager<Room.State, Room.GetOperation, Room.PostOperation> | null = null;
        let participantStateManager: GetOnlyStateManager<Participant.State, Participant.Operation> | null = null;

        const onRoomStateManagerUpdate = () => {
            const $stateManager = roomStateManager;
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
                    roomState: newState,
                    operateRoom: $stateManager.requiresReload ? undefined : oldValue.operateRoom,
                };
            });
        };

        const onParticipantStateManagerUpdate = () => {
            const $stateManager = participantStateManager;
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
                    participantsState: newState,
                };
            });
        };

        const postTrigger = new Subject<void>();
        const roomOperationCache = new Map<number, RoomOperationFragment>(); // キーはrevisionTo
        const participantOperationCache = new Map<number, ParticipantsOperationFragment>(); // キーはrevisionTo
        // TODO: GetRoomQueryを受信中にoperationを受け取り損ねるのをなるべく防ぐためにsubscriptionを先に行っているが、必要のない場面でもsubscribeするため非効率。もしパフォーマンス上の問題があるなら、getOperationのようなqueryをサーバー側に実装してからコードを変更すべきか。
        // そもそも、「subscribeの通信確立後にGetRoomQueryを実行」ということができればいいのだが、Apolloの仕様がまだわからないのでなんともいえない。
        const graphQLSubscriptionSubscription = apolloClient.subscribe<RoomOperatedSubscription, RoomOperatedSubscriptionVariables>({ query: RoomOperatedDocument, variables: { id: roomId } })
            .subscribe(s => {
                if (s.data?.roomOperated == null) {
                    return;
                }
                switch (s.data.roomOperated.__typename) {
                    case 'DeleteRoomOperation':
                        // TODO: 削除時の処理
                        return;
                    case 'RoomOperation': {
                        if (roomStateManager == null) {
                            roomOperationCache.set(s.data.roomOperated.revisionTo, s.data.roomOperated);
                            return;
                        }
                        // Roomは、他人が行った変更はSubscriptionの結果を用い、自分が行った変更はMutationの結果を用いている。
                        if (s.data.roomOperated.operatedBy !== userUid) {
                            const getOperation = Room.createGetOperation(s.data.roomOperated.value);
                            roomStateManager.onOthersGet(getOperation, s.data.roomOperated.revisionTo);
                            onRoomStateManagerUpdate();
                        }
                        return;
                    }
                    case 'ParticipantsOperation': {
                        if (participantStateManager == null) {
                            participantOperationCache.set(s.data.roomOperated.revisionTo, s.data.roomOperated);
                            return;
                        }
                        // Participantは、すべてSubscriptionの結果を用いている。
                        const operation = Participant.createOperation(s.data.roomOperated);
                        participantStateManager.onGet(operation, s.data.roomOperated.revisionTo);
                        onParticipantStateManagerUpdate();
                        return;
                    }
                }
            });
        const postTriggerSubscription = postTrigger.pipe(
            Rx.sampleTime(sampleTime),
            Rx.map(async () => {
                if (roomStateManager == null) {
                    return;
                }
                if (roomStateManager.isPosting || roomStateManager.requiresReload) {
                    return;
                }
                const toPost = roomStateManager.post();
                if (toPost == null) {
                    return;
                }
                const valueInput = Room.toGraphQLInput(toPost.operationToPost);
                console.info({ valueInput });
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
                        onRoomStateManagerUpdate();
                        break;
                    case 'OperateRoomIdResult':
                        toPost.onPosted({
                            isSuccess: true,
                            isId: true,
                            requestId: result.data.result.requestId,
                        });
                        onRoomStateManagerUpdate();
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
            fetchPolicy: 'network-only'
        }).then(q => {
            switch (q.data.result.__typename) {
                case 'GetJoinedRoomResult': {
                    const newRoomStateManager = createStateManager(Room.createState(q.data.result.room), q.data.result.room.revision);
                    const newParticipantManager = new GetOnlyStateManager<Participant.State, Participant.Operation>({
                        revision: q.data.result.participant.revision,
                        state: Participant.createState(q.data.result.participant),
                        apply: Participant.applyOperation,
                    });
                    roomOperationCache.forEach((operation, revisionTo) => {
                        // Roomは、他人が行った変更はSubscriptionの結果を用い、自分が行った変更はMutationの結果を用いている。
                        if (operation.operatedBy !== userUid) {
                            newRoomStateManager.onOthersGet(Room.createGetOperation(operation.value), revisionTo);
                        }
                    });
                    participantOperationCache.forEach((operation, revisionTo) => {
                        // Participantは、すべてSubscriptionの結果を用いている。
                        newParticipantManager.onGet(Participant.createOperation(operation), revisionTo);
                    });

                    roomOperationCache.clear(); // 早めのメモリ解放
                    roomStateManager = newRoomStateManager;
                    const operate = (operation: Room.PostOperationSetup) => {
                        const $stateManager = roomStateManager;
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
                                    operateRoom: undefined,
                                };
                            });
                            return;
                        }
                        $stateManager.operate(Room.setupPostOperation(operation, userUid));
                        onRoomStateManagerUpdate();
                        postTrigger.next();
                    };

                    participantOperationCache.clear(); // 早めのメモリ解放
                    participantStateManager = newParticipantManager;

                    setState({
                        type: joined,
                        roomState: newRoomStateManager.uiState,
                        operateRoom: newRoomStateManager.requiresReload ? undefined : operate,
                        participantsState: newParticipantManager.uiState,
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
            roomStateManager = null; // 早めのメモリ解放
            graphQLSubscriptionSubscription.unsubscribe();
            postTriggerSubscription.unsubscribe();
        };
    }, [refetchKey, apolloClient, roomId, myAuth?.uid, operateMutation]);

    return { refetch, state };
};