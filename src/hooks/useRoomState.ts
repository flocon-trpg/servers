import React from 'react';
import { Observable, Subject } from 'rxjs';
import {
    GetRoomDocument,
    GetRoomFailureType,
    GetRoomQuery,
    GetRoomQueryVariables,
    OperateMutation,
    RoomAsListItemFragment,
    RoomEventSubscription,
    RoomOperationFragment,
    useOperateMutation,
} from '../generated/graphql';
import * as Rx from 'rxjs/operators';
import { ApolloError, FetchResult, useApolloClient } from '@apollo/client';
import { StateManager } from '../stateManagers/StateManager';
import { create as createStateManager } from '../stateManagers/main';
import MyAuthContext from '../contexts/MyAuthContext';
import { Room } from '../stateManagers/states/room';
import { authNotFound, notSignIn } from './useFirebaseUser';
import { useClientId } from './useClientId';
import { useDispatch } from 'react-redux';
import { roomModule, Notification } from '../modules/roomModule';
import { State, UpOperation } from '@kizahasi/flocon-core';
import { FirebaseAuthenticationIdTokenContext } from '../contexts/FirebaseAuthenticationIdTokenContext';

const sampleTime = 3000;

export const stopped = 'stopped';
export const loading = 'loading';
export const joined = 'joined';
export const requiresReload = 'requiresReload';
export const myAuthIsUnavailable = 'myAuthIsUnavailable';
export const nonJoined = 'nonJoined';
export const getRoomFailure = 'getRoomFailure';
export const mutationFailure = 'mutationFailure';
export const deleted = 'deleted';

// operate === undefined ⇔ operateAsState === undefined
export type RoomState =
    | {
          type: typeof loading;
          state?: undefined;
          operate?: undefined;
          operateAsState?: undefined;
      }
    | {
          type: typeof joined;
          state: State;
          // operateとoperateAsStateは、undefinedならばrefetchが必要。
          operate: ((operation: UpOperation) => void) | undefined;
          operateAsState: ((state: State) => void) | undefined;
          // participantの更新は、mutationを直接呼び出すことで行う。
      }
    | {
          type: typeof myAuthIsUnavailable;
          state?: undefined;
          operate?: undefined;
          operateAsState?: undefined;
          error: typeof loading | typeof notSignIn | typeof authNotFound;
      }
    | {
          type: typeof nonJoined;
          state?: undefined;
          operate?: undefined;
          operateAsState?: undefined;
          nonJoinedRoom: RoomAsListItemFragment;
      }
    | {
          type: typeof getRoomFailure;
          state?: undefined;
          operate?: undefined;
          operateAsState?: undefined;
          getRoomFailureType: GetRoomFailureType;
      }
    | {
          // TODO: エラーの内容を返したり、unionを細分化する。
          type: typeof mutationFailure;
          state?: undefined;
          operate?: undefined;
          operateAsState?: undefined;
      }
    | {
          type: typeof deleted;
          state?: undefined;
          operate?: undefined;
          operateAsState?: undefined;
          deletedBy: string;
      };

type RoomStateResult = {
    refetch: () => void;
    state: RoomState;
};

export const useRoomState = (
    roomId: string,
    roomEventSubscription: Observable<RoomEventSubscription> | null
): RoomStateResult => {
    const myAuth = React.useContext(MyAuthContext);
    const idToken = React.useContext(FirebaseAuthenticationIdTokenContext);
    const clientId = useClientId();
    const apolloClient = useApolloClient();
    const [operateMutation] = useOperateMutation();
    const [state, setState] = React.useState<RoomState>({ type: loading });
    // refetchしたい場合、これを前の値と異なる値にすることで、useEffectが再度実行されてrefetchになる。
    const [refetchKey, setRefetchKey] = React.useState(0);
    // refetchとして単に () => setRefetchKey(refetchKey + 1) をそのまま返す（この値をfとする）と、レンダーのたびにfは変わるため、fをdepsに使用されたときに問題が起こる可能性が高いので、useMemoで軽減。
    const refetch = React.useMemo(() => () => setRefetchKey(refetchKey + 1), [refetchKey]);
    const dispatch = useDispatch();

    const userUid = typeof myAuth === 'string' ? null : myAuth.uid;
    const myAuthErrorType = typeof myAuth === 'string' ? myAuth : null;

    React.useEffect(() => {
        setState({ type: loading });

        if (myAuthErrorType != null) {
            setState({ type: myAuthIsUnavailable, error: myAuthErrorType });
            return;
        }
        if (roomEventSubscription == null) {
            return;
        }
        if (userUid == null) {
            return; // This should not happen
        }
        if (idToken == null) {
            // queryの実行で失敗することが確定しているため、実行を中止している
            return;
        }

        let roomStateManager: StateManager<State, UpOperation> | null = null;

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
                    state: newState,
                    operate: $stateManager.requiresReload ? undefined : oldValue.operate,
                };
            });
        };

        const postTrigger = new Subject<void>();
        const roomOperationCache = new Map<number, RoomOperationFragment>(); // キーはrevisionTo
        const graphQLSubscriptionSubscription = roomEventSubscription.subscribe(
            s => {
                if (s.roomEvent?.deleteRoomOperation != null) {
                    setState({
                        type: deleted,
                        deletedBy: s.roomEvent.deleteRoomOperation.deletedBy,
                    });
                    return;
                }
                if (s.roomEvent?.roomOperation != null) {
                    if (roomStateManager == null) {
                        roomOperationCache.set(
                            s.roomEvent.roomOperation.revisionTo,
                            s.roomEvent.roomOperation
                        );
                        return;
                    }
                    // Roomは、他のクライアントが行った変更はSubscriptionの結果を用い、自分のクライアントが行った変更はMutationの結果を用いている。
                    if (
                        s.roomEvent.roomOperation.operatedBy?.userUid !== userUid ||
                        s.roomEvent.roomOperation.operatedBy.clientId !== clientId
                    ) {
                        const getOperation = Room.createGetOperation(s.roomEvent.roomOperation);
                        roomStateManager.onOtherClientsGet(
                            getOperation,
                            s.roomEvent.roomOperation.revisionTo
                        );
                        onRoomStateManagerUpdate();
                    }
                    return;
                }
            },
            () => undefined
        );
        const postTriggerSubscription = postTrigger
            .pipe(
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
                    const valueInput = Room.toGraphQLInput(toPost.operationToPost, clientId);
                    console.info({ valueInput, operationToPost: toPost.operationToPost });
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    let result: FetchResult<
                        OperateMutation,
                        Record<string, any>,
                        Record<string, any>
                    >;
                    try {
                        result = await operateMutation({
                            variables: {
                                id: roomId,
                                operation: valueInput,
                                revisionFrom: toPost.revision,
                                requestId: toPost.requestId,
                            },
                        });
                    } catch (e) {
                        if (e instanceof ApolloError) {
                            dispatch(
                                roomModule.actions.addNotification({
                                    type: Notification.apolloError,
                                    error: e,
                                    createdAt: new Date().getTime(),
                                })
                            );
                        } else {
                            dispatch(
                                roomModule.actions.addNotification({
                                    type: Notification.text,
                                    notification: {
                                        type: 'error',
                                        message: 'Unknown error at operateMutation, useRoomState',
                                        createdAt: new Date().getTime(),
                                    },
                                })
                            );
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
                                result: Room.createGetOperation(result.data.result.operation),
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
                            dispatch(
                                roomModule.actions.addNotification({
                                    type: Notification.text,
                                    notification: {
                                        type: 'error',
                                        message:
                                            '部屋に入室していないため、operateできませんでした。',
                                        createdAt: new Date().getTime(),
                                    },
                                })
                            );
                            // TODO: 状況によって自動リトライを可能にする。
                            setState({
                                type: mutationFailure,
                            });
                            break;
                        case 'OperateRoomFailureResult':
                            dispatch(
                                roomModule.actions.addNotification({
                                    type: Notification.text,
                                    notification: {
                                        type: 'error',
                                        message: 'operateで問題が発生しました。',
                                        description: result.data.result.failureType,
                                        createdAt: new Date().getTime(),
                                    },
                                })
                            );
                            // TODO: 状況によって自動リトライを可能にする。
                            setState({
                                type: mutationFailure,
                            });
                            break;
                    }
                }),
                Rx.mergeAll()
            )
            .subscribe(() => undefined);

        apolloClient
            .query<GetRoomQuery, GetRoomQueryVariables>({
                query: GetRoomDocument,
                variables: { id: roomId },
                fetchPolicy: 'network-only',
            })
            .then(q => {
                switch (q.data.result.__typename) {
                    case 'GetJoinedRoomResult': {
                        const newRoomStateManager = createStateManager(
                            Room.createState(q.data.result.room),
                            q.data.result.room.revision
                        );
                        roomOperationCache.forEach((operation, revisionTo) => {
                            if (
                                operation.operatedBy?.userUid !== userUid ||
                                operation.operatedBy.clientId !== clientId
                            ) {
                                newRoomStateManager.onOtherClientsGet(
                                    Room.createGetOperation(operation),
                                    revisionTo
                                );
                            }
                        });

                        roomOperationCache.clear(); // 早めのメモリ解放
                        roomStateManager = newRoomStateManager;
                        const operateCore = (
                            operation:
                                | {
                                      type: 'operation';
                                      operation: UpOperation;
                                  }
                                | {
                                      type: 'state';
                                      state: State;
                                  }
                        ) => {
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
                                        operate: undefined,
                                    };
                                });
                                return;
                            }
                            if (operation.type === 'operation') {
                                $stateManager.operate(operation.operation);
                            } else {
                                $stateManager.operateAsState(operation.state);
                            }
                            onRoomStateManagerUpdate();
                            postTrigger.next();
                        };

                        setState({
                            type: joined,
                            state: newRoomStateManager.uiState,
                            operate: newRoomStateManager.requiresReload
                                ? undefined
                                : op => operateCore({ type: 'operation', operation: op }),
                            operateAsState: newRoomStateManager.requiresReload
                                ? undefined
                                : state => operateCore({ type: 'state', state }),
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
    }, [
        refetchKey,
        apolloClient,
        roomId,
        userUid,
        myAuthErrorType,
        operateMutation,
        dispatch,
        clientId,
        roomEventSubscription,
    ]);

    return { refetch, state };
};
