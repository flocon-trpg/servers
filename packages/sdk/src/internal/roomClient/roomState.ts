import { State as S, UpOperation as U, roomTemplate } from '@flocon-trpg/core';
import {
    GetRoomFailureType,
    OperateRoomFailureType,
    RoomEventDoc,
    RoomOperationFragmentDoc,
} from '@flocon-trpg/graphql-documents';
import { ResultOf } from '@graphql-typed-document-node/core';
import { EMPTY, Observable, Subject, Subscription, map, mergeAll, sampleTime } from 'rxjs';
import { BehaviorEvent } from '../rxjs/behaviorEvent';
import { ReadonlyBehaviorEvent } from '../rxjs/readonlyBehaviorEvent';
import { create as createStateManager } from '../stateManager/create';
import { StateManager } from '../stateManager/stateManager/stateManager';
import { Room } from '../stateManager/states/room';
import { GraphQLClientWithStatus, PromiseError } from './graphqlClient';

type RoomEventSubscriptionResult = ResultOf<typeof RoomEventDoc>['result'];

const fetching = 'fetching';
const joined = 'joined';
const nonJoined = 'nonJoined';
const GetRoomFailure = 'GetRoomFailure';
const GraphQLError = 'GraphQLError';
const transformationError = 'transformationError';
const OperateRoomFailure = 'OperateRoomFailure';
const deleted = 'deleted';

type State = S<typeof roomTemplate>;
type UpOperation = U<typeof roomTemplate>;

const onChangedLocallySampleTime = 3000;

const error = 'error';

export type SetAction<State> = State | ((prevState: State) => State);

type NonJoinedRoom = {
    id: string;
    name: string;
    createdBy: string;
    requiresPlayerPassword: boolean;
    requiresSpectatorPassword: boolean;
};

export type RoomState<TGraphQLError> =
    | {
          type: typeof fetching;
      }
    | {
          // RoomStateManager の再作成が必要なく、通常通りsetStateなどが使える状態。

          type: typeof joined;
          state: State;
          setState: (setState: SetAction<State>) => void;
          // setState と immer を組み合わせたほうが使いやすく、パフォーマンスもほぼ変わらないと考えられる。これは互換性のために残している。
          setStateByApply: (operation: UpOperation) => void;

          // participantの更新は、mutationを直接呼び出すことで行う。
      }
    | {
          // RoomStateManager の再作成が必要な状態。

          type: typeof error;
          state: State;
          error:
              | { type: typeof transformationError }
              | {
                    // TODO: このエラーの場合は、RoomStateManager の再作成は必要ないと考えられる。
                    type: typeof OperateRoomFailure;
                    error: OperateRoomFailureType;
                };
      }
    | {
          // RoomStateManager の再作成が必要な状態。
          // TODO: このエラーの場合は、RoomStateManager の再作成は必要ないと考えられる。

          type: typeof error;
          error:
              | {
                    type: typeof GetRoomFailure;
                    error: GetRoomFailureType;
                }
              | {
                    type: typeof GraphQLError;
                    name: 'GetRoomQuery';
                    error: PromiseError<TGraphQLError>;
                };
      }
    | {
          type: typeof nonJoined;
          state: State | null;
          nonJoinedRoom: NonJoinedRoom;
      }
    | {
          type: typeof deleted;
          deletedBy: string;
      };

export class RoomStateManager<TGraphQLError> {
    #stateStream = new BehaviorEvent<RoomState<TGraphQLError>>({
        type: fetching,
    });
    #roomStateManager: StateManager<State, UpOperation> | null = null;
    #mutationError = new BehaviorEvent<PromiseError<TGraphQLError> | null>(null);
    #readonlyMutationError = new ReadonlyBehaviorEvent(this.#mutationError);
    #unsubscribe: () => void;
    /** GetRoom query が完了する前に、Subscription で受け取った RoomOperation を保持する Map です。 */
    // キーはrevisionTo
    #roomOperationCache = new Map<number, ResultOf<typeof RoomOperationFragmentDoc>>();
    /** `setState` もしくは `setStateByApply` が実行されたときにトリガーされます。 */
    #onStateChangedLocally = new Subject<void>();

    constructor({
        client,
        subscription,
        userUid,
        clientId,
    }: {
        client: Pick<GraphQLClientWithStatus<TGraphQLError>, 'getRoomQuery' | 'operateMutation'>;
        subscription: Observable<
            Pick<NonNullable<RoomEventSubscriptionResult>, 'deleteRoomOperation' | 'roomOperation'>
        >;
        userUid: string;
        /** 同一ユーザーが複数のブラウザでアクセスしたなどの際に、それらを区別するための文字列です。 */
        clientId: string;
    }) {
        const onStateChangedSubscription = this.#subscribeOnStateChangedLocally({
            client,
            clientId,
        });
        const subscriptionSubscription = subscription.subscribe({
            next: event => {
                if (event.deleteRoomOperation != null) {
                    this.#setState({
                        type: deleted,
                        deletedBy: event.deleteRoomOperation.deletedBy,
                    });
                }
                if (event.roomOperation != null) {
                    const roomOperation = event.roomOperation;
                    if (this.#roomStateManager == null) {
                        this.#roomOperationCache.set(roomOperation.revisionTo, roomOperation);
                        return;
                    }
                    if (
                        roomOperation.operatedBy?.userUid === userUid &&
                        roomOperation.operatedBy.clientId === clientId
                    ) {
                        // Roomは、他のクライアントが行った変更はSubscriptionの結果を用い、自分のクライアントが行った変更はMutationの結果を用いている。
                        return;
                    }
                    const operation = Room.createGetOperation(roomOperation);
                    this.#roomStateManager.onOtherClientsGet(operation, roomOperation.revisionTo);
                    this.#onRoomStateManagerUpdate();
                }
            },
            complete: () => {
                this.#stateStream.complete();
            },
        });

        this.#unsubscribe = () => {
            onStateChangedSubscription.unsubscribe();
            subscriptionSubscription.unsubscribe();
        };

        this.#executeGetRoomQuery({ client, userUid, clientId });
    }

    #setState(
        action:
            | RoomState<TGraphQLError>
            | ((prevState: RoomState<TGraphQLError>) => RoomState<TGraphQLError>),
    ): void {
        const prevValue = this.stateStream.getValue();
        switch (prevValue.type) {
            case fetching:
            case joined:
                break;
            default:
                return;
        }
        const nextValue = typeof action === 'function' ? action(prevValue) : action;
        this.#stateStream.next(nextValue);
    }

    #onRoomStateManagerUpdate(): void {
        const $stateManager = this.#roomStateManager;
        if ($stateManager == null) {
            return;
        }
        this.#setState(oldValue => {
            if (oldValue.type !== joined) {
                return oldValue;
            }
            const newState = $stateManager.uiState;
            if ($stateManager.requiresReload) {
                return {
                    type: error,
                    state: newState,
                    setStateByApply: undefined,
                    setState: undefined,
                    error: {
                        type: transformationError,
                    },
                };
            }
            return {
                type: oldValue.type,
                state: newState,
                setStateByApply: oldValue.setStateByApply,
                setState: oldValue.setState,
            };
        });
    }

    #subscribeOnStateChangedLocally({
        client,
        clientId,
    }: {
        client: Pick<GraphQLClientWithStatus<TGraphQLError>, 'operateMutation'>;
        clientId: string;
    }): Subscription {
        return this.#onStateChangedLocally
            .pipe(
                sampleTime(onChangedLocallySampleTime),
                map(() => {
                    const roomStateManager = this.#roomStateManager;
                    if (roomStateManager == null) {
                        return EMPTY;
                    }
                    if (roomStateManager.isPosting || roomStateManager.requiresReload) {
                        return EMPTY;
                    }
                    const toPost = roomStateManager.post();
                    if (toPost == null) {
                        return EMPTY;
                    }
                    const valueInput = Room.toGraphQLInput(toPost.operationToPost, clientId);
                    return client
                        .operateMutation({
                            operation: valueInput,
                            revisionFrom: toPost.revision,
                            requestId: toPost.requestId,
                        })
                        .then(
                            operationResult =>
                                ({
                                    type: 'then',
                                    operationResult,
                                    toPost,
                                    getRoomState: () => roomStateManager.uiState,
                                }) as const,
                        )
                        .catch(
                            (e: unknown) =>
                                ({
                                    type: 'catch',
                                    toPost,
                                    error: e,
                                }) as const,
                        );
                }),
                mergeAll(),
            )
            .subscribe({
                next: result => {
                    if (result.type === 'catch') {
                        this.#mutationError.next({ type: 'promiseError', value: result.error });
                        result.toPost.onPosted({ isSuccess: null });
                        return;
                    }
                    if (result.operationResult.isError) {
                        this.#mutationError.next({
                            type: 'resultError',
                            value: result.operationResult.error,
                        });
                        result.toPost.onPosted({ isSuccess: null });
                        return;
                    }

                    const { operationResult, toPost, getRoomState } = result;
                    if (operationResult.isError) {
                        // TODO: isSuccess: falseのケースに対応（サーバー側の対応も必要か）
                        toPost.onPosted({ isSuccess: null });
                        return;
                    }
                    switch (operationResult.value.result.__typename) {
                        case 'OperateRoomSuccessResult':
                            toPost.onPosted({
                                isSuccess: true,
                                isId: false,
                                revisionTo: operationResult.value.result.operation.revisionTo,
                                result: Room.createGetOperation(
                                    operationResult.value.result.operation,
                                ),
                            });
                            this.#onRoomStateManagerUpdate();
                            break;
                        case 'OperateRoomIdResult':
                            toPost.onPosted({
                                isSuccess: true,
                                isId: true,
                                requestId: operationResult.value.result.requestId,
                            });
                            this.#onRoomStateManagerUpdate();
                            break;
                        case 'OperateRoomNonJoinedResult':
                            this.#setState({
                                type: nonJoined,
                                state: getRoomState(),
                                nonJoinedRoom: operationResult.value.result.roomAsListItem,
                            });
                            break;
                        case 'OperateRoomFailureResult':
                            this.#setState({
                                type: error,
                                state: getRoomState(),
                                error: {
                                    type: OperateRoomFailure,
                                    error: operationResult.value.result.failureType,
                                },
                            });
                            break;
                    }
                },
            });
    }

    #executeGetRoomQuery({
        client,
        userUid,
        clientId,
    }: {
        client: Pick<GraphQLClientWithStatus<TGraphQLError>, 'getRoomQuery'>;
        userUid: string;
        clientId: string;
    }): void {
        void client.getRoomQuery().then(q => {
            if (q.isError) {
                this.#setState({
                    type: error,
                    error: { type: GraphQLError, name: 'GetRoomQuery', error: q.error },
                });
                return;
            }
            const result = q.value.result;
            switch (result.__typename) {
                case 'GetJoinedRoomResult': {
                    const newRoomStateManager = createStateManager(
                        Room.createState(result.room),
                        result.room.revision,
                    );
                    this.#roomOperationCache.forEach((operation, revisionTo) => {
                        if (
                            operation.operatedBy?.userUid !== userUid ||
                            operation.operatedBy.clientId !== clientId
                        ) {
                            newRoomStateManager.onOtherClientsGet(
                                Room.createGetOperation(operation),
                                revisionTo,
                            );
                        }
                    });

                    this.#roomOperationCache.clear(); // 早めのメモリ解放
                    this.#roomStateManager = newRoomStateManager;
                    const setStateCore = (
                        operation:
                            | {
                                  type: 'operation';
                                  operation: UpOperation;
                              }
                            | {
                                  type: 'state';
                                  state: State;
                              },
                    ) => {
                        const $stateManager = this.#roomStateManager;
                        if ($stateManager == null) {
                            return;
                        }
                        if ($stateManager.requiresReload) {
                            this.#setState(oldValue => {
                                if (oldValue.type !== joined) {
                                    return oldValue;
                                }
                                return {
                                    type: error,
                                    state: oldValue.state,
                                    setStateByApply: undefined,
                                    setState: undefined,
                                    error: {
                                        type: transformationError,
                                    },
                                };
                            });
                            return;
                        }
                        if (operation.type === 'state') {
                            $stateManager.setUiState(operation.state);
                        } else {
                            $stateManager.setUiStateByApply(operation.operation);
                        }
                        this.#onRoomStateManagerUpdate();
                        this.#onStateChangedLocally.next();
                    };

                    if (newRoomStateManager.requiresReload) {
                        this.#setState({
                            type: error,
                            state: newRoomStateManager.uiState,
                            error: {
                                type: transformationError,
                            },
                        });
                    }

                    this.#setState({
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
                    this.#setState({
                        type: nonJoined,
                        state: null,
                        nonJoinedRoom: result.roomAsListItem,
                    });
                    break;
                }
                case 'GetRoomFailureResult': {
                    this.#setState({
                        type: error,
                        error: {
                            type: GetRoomFailure,
                            error: result.failureType,
                        },
                    });
                    break;
                }
                case undefined:
                    break;
            }
        });
    }

    #readonlyStateStream = new ReadonlyBehaviorEvent(this.#stateStream);
    get stateStream() {
        return this.#readonlyStateStream;
    }

    get mutationError() {
        return this.#readonlyMutationError;
    }

    #isUnsubscribed = false;
    get isUnsubscribed() {
        return this.#isUnsubscribed;
    }

    unsubscribe(): void {
        this.#unsubscribe();
        this.#isUnsubscribed = true;
    }
}
