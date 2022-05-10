import React from 'react';
import { Observable, Subject } from 'rxjs';
import {
    GetRoomDocument,
    GetRoomFailureType,
    GetRoomQuery,
    GetRoomQueryVariables,
    OperateDocument,
    OperateMutation,
    RoomAsListItemFragment,
    RoomEventSubscription,
    RoomOperationFragment,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import * as Rx from 'rxjs/operators';
import { ApolloError, FetchResult, useApolloClient, useMutation } from '@apollo/client';
import { create as createStateManager } from '../stateManagers/main';
import { useClientId } from './useClientId';
import { State as S, StateManager, UpOperation as U, roomTemplate } from '@flocon-trpg/core';
import { FirebaseAuthenticationIdTokenContext } from '../contexts/FirebaseAuthenticationIdTokenContext';
import { MyAuthContext, authNotFound, notSignIn } from '../contexts/MyAuthContext';
import { Room } from '../stateManagers/states/room';
import { apolloError, roomNotificationsAtom, text } from '../atoms/room/roomAtom';
import { useUpdateAtom } from 'jotai/utils';
import { SetAction } from '../utils/setAction';

type State = S<typeof roomTemplate>;
type UpOperation = U<typeof roomTemplate>;

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

export type RoomState =
    | {
          type: typeof loading;
          state?: undefined;
          setState?: undefined;
          setStateByApply?: undefined;
      }
    | {
          // refetchが必要なく、通常通りsetStateなどが使える状態。

          type: typeof joined;
          state: State;

          setState: (setState: SetAction<State>) => void;
          setStateByApply: (operation: UpOperation) => void;

          // participantの更新は、mutationを直接呼び出すことで行う。
      }
    | {
          // refetchが必要な状態。

          type: typeof joined;
          state: State;

          setState: undefined;
          setStateByApply: undefined;
      }
    | {
          type: typeof myAuthIsUnavailable;
          state?: undefined;
          setState?: undefined;
          setStateByApply?: undefined;
          error: typeof loading | typeof notSignIn | typeof authNotFound;
      }
    | {
          type: typeof nonJoined;
          state?: undefined;
          setState?: undefined;
          setStateByApply?: undefined;
          nonJoinedRoom: RoomAsListItemFragment;
      }
    | {
          type: typeof getRoomFailure;
          state?: undefined;
          setState?: undefined;
          setStateByApply?: undefined;
          getRoomFailureType: GetRoomFailureType;
      }
    | {
          // TODO: エラーの内容を返したり、unionを細分化する。
          type: typeof mutationFailure;
          state?: undefined;
          setState?: undefined;
          setStateByApply?: undefined;
      }
    | {
          type: typeof deleted;
          state?: undefined;
          setState?: undefined;
          setStateByApply?: undefined;
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
    const hasIdToken = React.useContext(FirebaseAuthenticationIdTokenContext) != null;
    const clientId = useClientId();
    const apolloClient = useApolloClient();
    const [operateMutation] = useMutation(OperateDocument);
    const [state, setState] = React.useState<RoomState>({ type: loading });
    // refetchしたい場合、これを前の値と異なる値にすることで、useEffectが再度実行されてrefetchになる。
    const [refetchKey, setRefetchKey] = React.useState(0);
    // refetchとして単に () => setRefetchKey(refetchKey + 1) をそのまま返す（この値をfとする）と、レンダーのたびにfは変わるため、fをdepsに使用されたときに問題が起こる可能性が高いので、useMemoで軽減。
    const refetch = React.useMemo(() => () => setRefetchKey(refetchKey + 1), [refetchKey]);
    const addRoomNotification = useUpdateAtom(roomNotificationsAtom);

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
        if (!hasIdToken) {
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
                if (oldValue.setStateByApply == null || $stateManager.requiresReload) {
                    return {
                        type: oldValue.type,
                        state: newState,
                        setStateByApply: undefined,
                        setState: undefined,
                    };
                }
                return {
                    type: oldValue.type,
                    state: newState,
                    setStateByApply: oldValue.setStateByApply,
                    setState: oldValue.setState,
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
                    let result: FetchResult<OperateMutation>;
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
                            addRoomNotification({
                                type: apolloError,
                                error: e,
                                createdAt: new Date().getTime(),
                            });
                        } else {
                            addRoomNotification({
                                type: text,
                                notification: {
                                    type: 'error',
                                    message: 'Unknown error at operateMutation, useRoomState',
                                    createdAt: new Date().getTime(),
                                },
                            });
                        }
                        toPost.onPosted({ isSuccess: null });
                        return;
                    }
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
                            addRoomNotification({
                                type: text,
                                notification: {
                                    type: 'error',
                                    message: '部屋に入室していないため、operateできませんでした。',
                                    createdAt: new Date().getTime(),
                                },
                            });
                            // TODO: 状況によって自動リトライを可能にする。
                            setState({
                                type: mutationFailure,
                            });
                            break;
                        case 'OperateRoomFailureResult':
                            addRoomNotification({
                                type: text,
                                notification: {
                                    type: 'error',
                                    message: 'operateで問題が発生しました。',
                                    description: result.data.result.failureType,
                                    createdAt: new Date().getTime(),
                                },
                            });
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
                        const setStateCore = (
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
                                        setStateByApply: undefined,
                                        setState: undefined,
                                    };
                                });
                                return;
                            }
                            if (operation.type === 'state') {
                                $stateManager.setUiState(operation.state);
                            } else {
                                $stateManager.setUiStateByApply(operation.operation);
                            }
                            onRoomStateManagerUpdate();
                            postTrigger.next();
                        };

                        if (newRoomStateManager.requiresReload) {
                            setState({
                                type: joined,
                                state: newRoomStateManager.uiState,
                                setStateByApply: undefined,
                                setState: undefined,
                            });
                        }

                        setState({
                            type: joined,
                            state: newRoomStateManager.uiState,
                            setStateByApply: operation =>
                                setStateCore({ type: 'operation', operation }),
                            setState: setState => {
                                if (typeof setState === 'function') {
                                    setStateCore({
                                        type: 'state',
                                        state: setState(newRoomStateManager.uiState),
                                    });
                                    return;
                                }
                                setStateCore({ type: 'state', state: setState });
                            },
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
        addRoomNotification,
        clientId,
        roomEventSubscription,
        hasIdToken,
    ]);

    return { refetch, state };
};
