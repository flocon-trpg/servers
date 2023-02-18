import {
    GetMessagesQuery,
    GetMessagesQueryVariables,
    GetRoomConnectionsQuery,
    GetRoomConnectionsQueryVariables,
    GetRoomQuery,
    GetRoomQueryVariables,
    OperateMutation,
    OperateMutationVariables,
    RoomEventSubscription,
    RoomEventSubscriptionVariables,
    RoomOperationInput,
    UpdateWritingMessageStatusMutation,
    UpdateWritingMessageStatusMutationVariables,
    WritingMessageStatusInputType,
} from '@flocon-trpg/typed-document-node-v0.7.13';
import { Result } from '@kizahasi/result';
import { EMPTY, Observable, catchError, mergeMap, of, shareReplay } from 'rxjs';
import { BehaviorEvent } from '../rxjs/behaviorEvent';
import { ReadonlyBehaviorEvent } from '../rxjs/readonlyBehaviorEvent';

/**
 * RoomClient で実行される GraphQL のクライアントです。
 *
 * urql を使う場合は、`@flocon-trpg/sdk-urql` を利用することで簡単に作成できます。
 *
 * urql を使わない場合は、自作する必要があります。エラーは、Promise の reject や Observable の error ではなく、Promise の resolve や Observable の next から Result.error を返すことで、型を any にせずにエラーを渡すことができます。
 */
export type GraphQLClient<TGraphQLError> = {
    getMessagesQuery: (
        variables: GetMessagesQueryVariables
    ) => Promise<Result<GetMessagesQuery, TGraphQLError>>;

    getRoomConnectionsQuery: (
        variables: GetRoomConnectionsQueryVariables
    ) => Promise<Result<GetRoomConnectionsQuery, TGraphQLError>>;

    getRoomQuery: (
        variables: GetRoomQueryVariables
    ) => Promise<Result<GetRoomQuery, TGraphQLError>>;

    operateMutation: (
        variables: OperateMutationVariables
    ) => Promise<Result<OperateMutation, TGraphQLError>>;

    roomEventSubscription: (
        variables: RoomEventSubscriptionVariables
    ) => Observable<Result<RoomEventSubscription, TGraphQLError>>;

    updateWritingMessagesStatusMutation: (
        variables: UpdateWritingMessageStatusMutationVariables
    ) => Promise<Result<UpdateWritingMessageStatusMutation, TGraphQLError>>;
};

const fetching = 'fetching';
const success = 'success';
const error = 'error';
const ok = 'ok';
const resultError = 'resultError';

export type PromiseError<TGraphQLError> =
    | { type: typeof resultError; value: TGraphQLError }
    | { type: 'promiseError'; value: unknown };

export type ObservableError<TGraphQLError> =
    | { type: typeof resultError; value: TGraphQLError }
    | { type: 'observableError'; value: unknown };

type QueryStatus<TGraphQLError> =
    | { type: typeof fetching }
    | { type: typeof success }
    | {
          type: typeof error;
          error: PromiseError<TGraphQLError>;
      };
type SubscriptionStatus<TGraphQLError> =
    | { type: typeof ok }
    | {
          type: typeof error;
          error: ObservableError<TGraphQLError>;
      };

const GetMessagesQuery = 'GetMessagesQuery';
const GetRoomConnectionsQuery = 'GetRoomConnectionsQuery';
const GetRoomQuery = 'GetRoomQuery';

type QueryPropKeys = typeof GetMessagesQuery | typeof GetRoomConnectionsQuery | typeof GetRoomQuery;

type GraphQLStatusSource<TGraphQLError> = {
    [GetMessagesQuery]: QueryStatus<TGraphQLError>;
    [GetRoomConnectionsQuery]: QueryStatus<TGraphQLError>;
    [GetRoomQuery]: QueryStatus<TGraphQLError>;
    RoomEventSubscription: SubscriptionStatus<TGraphQLError>;
};

type GraphQLStatus<TGraphQLError> = GraphQLStatusSource<TGraphQLError> & {
    hasError: boolean;
};

export class GraphQLStatusEventEmitter<TGraphQLError> {
    #status = new BehaviorEvent<GraphQLStatus<TGraphQLError>>({
        GetMessagesQuery: { type: fetching },
        GetRoomConnectionsQuery: { type: fetching },
        GetRoomQuery: { type: fetching },
        RoomEventSubscription: { type: ok },
        hasError: false,
    });

    next(update: (source: GraphQLStatus<TGraphQLError>) => GraphQLStatusSource<TGraphQLError>) {
        const oldValue = this.#status.getValue();
        const newValue = update(oldValue);
        this.#status.next({ ...newValue, hasError: hasError(newValue) });
    }

    toReadonlyBehaviorEvent() {
        return new ReadonlyBehaviorEvent(this.#status);
    }
}

const hasError = (source: GraphQLStatusSource<any>): boolean => {
    return (
        source.GetMessagesQuery.type === error ||
        source.GetRoomConnectionsQuery.type === error ||
        source.GetRoomQuery.type === error ||
        source.RoomEventSubscription.type === error
    );
};

export class GraphQLClientWithStatus<TGraphQLError> {
    #e = new GraphQLStatusEventEmitter<TGraphQLError>();
    #readonlyStatus = this.#e.toReadonlyBehaviorEvent();
    #roomEventSubscription;

    constructor(
        private readonly source: GraphQLClient<TGraphQLError>,
        private readonly roomId: string
    ) {
        this.#roomEventSubscription = this.source.roomEventSubscription({ id: roomId }).pipe(
            catchError(e => {
                this.#e.next(prevValue => ({
                    ...prevValue,
                    RoomEventSubscription: {
                        type: error,
                        error: { type: 'observableError', value: e },
                    },
                }));
                return EMPTY;
            }),
            mergeMap(e => {
                if (e.isError) {
                    this.#e.next(prevValue => ({
                        ...prevValue,
                        RoomEventSubscription: {
                            type: error,
                            error: { type: resultError, value: e.error },
                        },
                    }));
                    return EMPTY;
                }
                return of(e.value);
            }),
            shareReplay({ windowTime: 10_000, refCount: true })
        );
    }

    // ブラウザなどで Promise uncaught エラーが出ないようにすべて catch している。
    #catchPromiseError<T>(
        source: Promise<Result<T, TGraphQLError>>,
        name: QueryPropKeys
    ): Promise<Result<T, PromiseError<TGraphQLError>>> {
        return source
            .then(result => {
                if (result.isError) {
                    const promiseError: PromiseError<TGraphQLError> = {
                        type: resultError,
                        value: result.error,
                    };
                    this.#e.next(oldValue => {
                        const newValue = { ...oldValue };
                        newValue[name] = {
                            type: error,
                            error: promiseError,
                        };
                        return newValue;
                    });
                    return Result.error(promiseError);
                }
                return Result.ok(result.value);
            })
            .catch(e => {
                const promiseError: PromiseError<TGraphQLError> = {
                    type: 'promiseError',
                    value: e,
                };
                this.#e.next(oldValue => {
                    const newValue = { ...oldValue };
                    newValue[name] = {
                        type: error,
                        error: promiseError,
                    };
                    return newValue;
                });
                return Result.error(promiseError);
            });
    }

    getMessagesQuery() {
        return this.#catchPromiseError(
            this.source.getMessagesQuery({ roomId: this.roomId }),
            GetMessagesQuery
        );
    }

    getRoomConnectionsQuery() {
        return this.#catchPromiseError(
            this.source.getRoomConnectionsQuery({ roomId: this.roomId }),
            GetRoomConnectionsQuery
        );
    }

    getRoomQuery() {
        return this.#catchPromiseError(this.source.getRoomQuery({ id: this.roomId }), GetRoomQuery);
    }

    operateMutation(variables: {
        revisionFrom: number;
        operation: RoomOperationInput;
        requestId: string;
    }) {
        return this.source.operateMutation({ ...variables, id: this.roomId });
    }

    get roomEventSubscription() {
        return this.#roomEventSubscription;
    }

    updateWritingMessagesStatusMutation(variables: { newStatus: WritingMessageStatusInputType }) {
        return this.source.updateWritingMessagesStatusMutation({
            ...variables,
            roomId: this.roomId,
        });
    }

    get status() {
        return this.#readonlyStatus;
    }
}
