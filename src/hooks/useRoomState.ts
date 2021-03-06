import React from 'react';
import { Subject } from 'rxjs';
import { GetRoomDocument, GetRoomFailureType, GetRoomQuery, GetRoomQueryVariables, OperateMutation, ParticipantsOperationFragment, RoomAsListItemFragment, RoomOperatedDocument, RoomOperatedSubscription, RoomOperatedSubscriptionVariables, RoomOperationFragment, useOperateMutation } from '../generated/graphql';
import * as Rx from 'rxjs/operators';
import { ApolloError, FetchResult, useApolloClient } from '@apollo/client';
import { GetOnlyStateManager, StateManager } from '../stateManagers/StateManager';
import { create as createStateManager } from '../stateManagers/main';
import MyAuthContext from '../contexts/MyAuthContext';
import NotificationContext, { apolloError, text } from '../components/room/contexts/NotificationContext';
import { Room } from '../stateManagers/states/room';
import { Participant } from '../stateManagers/states/participant';
import { authNotFound, FirebaseUserState, notSignIn } from './useFirebaseUser';

const sampleTime = 3000;

export const loading = 'loading';
export const joined = 'joined';
export const requiresReload = 'requiresReload';
export const myAuthIsUnavailable = 'myAuthIsUnavailable';
export const nonJoined = 'nonJoined';
export const getRoomFailure = 'getRoomFailure';
export const mutationFailure = 'mutationFailure';
export const deleted = 'deleted';

type RoomState = {
    type: typeof loading;
} | {
    type: typeof joined;
    roomState: Room.State;
    // undefinedならばrefetchが必要。
    operateRoom: ((operation: Room.PostOperationSetup) => void) | undefined;
    // participantの更新は、mutationを直接呼び出すことで行う。
} | {
    type: typeof myAuthIsUnavailable;
    error: typeof loading | typeof notSignIn | typeof authNotFound;
} | {
    type: typeof nonJoined;
    nonJoinedRoom: RoomAsListItemFragment;
} | {
    type: typeof getRoomFailure;
    getRoomFailureType: GetRoomFailureType;
} | {
    // TODO: エラーの内容を返したり、unionを細分化する。
    type: typeof mutationFailure;
} | {
    type: typeof deleted;
    deletedBy: string;
}

type RoomStateResult = {
    refetch: () => void;
    state: RoomState;
}

export const useRoomState = (roomId: string): RoomStateResult => {
    const myAuth = React.useContext(MyAuthContext);
    const notificationContext = React.useContext(NotificationContext);
    const apolloClient = useApolloClient();
    const [operateMutation] = useOperateMutation();
    const [state, setState] = React.useState<RoomState>({ type: loading });
    // refetchしたい場合、これを前の値と異なる値にすることで、useEffectが再度実行されてrefetchになる。
    const [refetchKey, setRefetchKey] = React.useState(0);
    // refetchとして単に () => setRefetchKey(refetchKey + 1) をそのまま返す（この値をfとする）と、レンダーのたびにfは変わるため、fをdepsに使用されたときに問題が起こる可能性が高いので、useMemoで軽減。
    const refetch = React.useMemo(() => () => setRefetchKey(refetchKey + 1), [refetchKey]);

    const userUid = typeof myAuth === 'string' ? null : myAuth.uid;
    const myAuthErrorType = typeof myAuth === 'string' ? myAuth : null;

    React.useEffect(() => {
        setState({ type: loading });

        if (myAuthErrorType != null) {
            setState({ type: myAuthIsUnavailable, error: myAuthErrorType });
            return;
        }
        if (userUid == null) {
            return; // This should not happen
        }

        let roomStateManager: StateManager<Room.State, Room.GetOperation, Room.PostOperation> | null = null;

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

        const postTrigger = new Subject<void>();
        const roomOperationCache = new Map<number, RoomOperationFragment>(); // キーはrevisionTo
        // TODO: GetRoomQueryを受信中にoperationを受け取り損ねるのをなるべく防ぐためにsubscriptionを先に行っているが、必要のない場面でもsubscribeするため非効率。もしパフォーマンス上の問題があるなら、getOperationのようなqueryをサーバー側に実装してからコードを変更すべきか。
        // そもそも、「subscribeの通信確立後にGetRoomQueryを実行」ということができればいいのだが、Apolloの仕様がまだわからないのでなんともいえない。
        const graphQLSubscriptionSubscription = apolloClient.subscribe<RoomOperatedSubscription, RoomOperatedSubscriptionVariables>({ query: RoomOperatedDocument, variables: { id: roomId } })
            .subscribe(s => {
                if (s.data?.roomOperated == null) {
                    return;
                }
                switch (s.data.roomOperated.__typename) {
                    case 'DeleteRoomOperation':
                        setState({
                            type: deleted,
                            deletedBy: s.data.roomOperated.deletedBy,
                        });
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
                }
            }, 
            () => notificationContext({
                type: text,
                notification: {
                    type: 'error',
                    message: 'RoomOperatedSubscriptionのsubscribeでerrorが呼ばれました。',
                    createdAt: new Date().getTime(),
                },
            }),
            () => notificationContext({
                type: text,
                notification: {
                    type: 'warning',
                    message: 'RoomOperatedSubscriptionの通信が終了しました。',
                    createdAt: new Date().getTime(),
                },
            }));
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let result: FetchResult<OperateMutation, Record<string, any>, Record<string, any>>;
                try {
                    result = await operateMutation({
                        variables: {
                            id: roomId,
                            operation: { value: valueInput },
                            revisionFrom: toPost.revision,
                            requestId: toPost.requestId,
                        }
                    });
                } catch (e) {
                    if (e instanceof ApolloError) {
                        notificationContext({
                            type: apolloError,
                            error: e,
                            createdAt: new Date().getTime(),
                        });
                    } else {
                        notificationContext({
                            type: text,
                            notification: {
                                type: 'error',
                                message: 'Unknown error at operateMutation, useRoomState',
                                createdAt: new Date().getTime(),
                            }
                        });
                    }
                    toPost.onPosted({ isSuccess: null });
                    return;
                }
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
                        notificationContext({
                            type: text,
                            notification: {
                                type: 'error',
                                message: '部屋に入室していないため、operateできませんでした。',
                                createdAt: new Date().getTime(),
                            }
                        });
                        // TODO: 状況によって自動リトライを可能にする。
                        setState({
                            type: mutationFailure,
                        });
                        break;
                    case 'OperateRoomFailureResult':
                        notificationContext({
                            type: text,
                            notification: {
                                type: 'error',
                                message: 'operateで問題が発生しました。',
                                description: result.data.result.failureType,
                                createdAt: new Date().getTime(),
                            }
                        });
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
                    roomOperationCache.forEach((operation, revisionTo) => {
                        // Roomは、他人が行った変更はSubscriptionの結果を用い、自分が行った変更はMutationの結果を用いている。
                        if (operation.operatedBy !== userUid) {
                            newRoomStateManager.onOthersGet(Room.createGetOperation(operation.value), revisionTo);
                        }
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

                    setState({
                        type: joined,
                        roomState: newRoomStateManager.uiState,
                        operateRoom: newRoomStateManager.requiresReload ? undefined : operate,
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
    }, [refetchKey, apolloClient, roomId, userUid, myAuthErrorType, operateMutation, notificationContext]);

    return { refetch, state };
};