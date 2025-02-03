import { GetMessagesDoc, GetRoomConnectionsDoc, GetRoomDoc, OperateRoomDoc, RoomEventDoc, UpdateWritingMessageStatusDoc } from '@flocon-trpg/graphql-documents';
import { ResultOf, VariablesOf } from '@graphql-typed-document-node/core';
import { Result } from '@kizahasi/result';
import { Observable } from 'rxjs';
import { ReadonlyBehaviorEvent } from '../rxjs/readonlyBehaviorEvent';
/**
 * RoomClient で実行される GraphQL のクライアントです。
 *
 * urql を使う場合は、`@flocon-trpg/sdk-urql` を利用することで簡単に作成できます。
 *
 * urql を使わない場合は、自作する必要があります。エラーは、Promise の reject や Observable の error ではなく、Promise の resolve や Observable の next から Result.error を返すことで、型を any にせずにエラーを渡すことができます。
 */
export type GraphQLClient<TGraphQLError> = {
    getMessagesQuery: (variables: VariablesOf<typeof GetMessagesDoc>) => Promise<Result<ResultOf<typeof GetMessagesDoc>, TGraphQLError>>;
    getRoomConnectionsQuery: (variables: VariablesOf<typeof GetRoomConnectionsDoc>) => Promise<Result<ResultOf<typeof GetRoomConnectionsDoc>, TGraphQLError>>;
    getRoomQuery: (variables: VariablesOf<typeof GetRoomDoc>) => Promise<Result<ResultOf<typeof GetRoomDoc>, TGraphQLError>>;
    operateRoomMutation: (variables: VariablesOf<typeof OperateRoomDoc>) => Promise<Result<ResultOf<typeof OperateRoomDoc>, TGraphQLError>>;
    roomEventSubscription: (variables: VariablesOf<typeof RoomEventDoc>) => Observable<Result<ResultOf<typeof RoomEventDoc>, TGraphQLError>>;
    updateWritingMessagesStatusMutation: (variables: VariablesOf<typeof UpdateWritingMessageStatusDoc>) => Promise<Result<ResultOf<typeof UpdateWritingMessageStatusDoc>, TGraphQLError>>;
};
declare const fetching = "fetching";
declare const success = "success";
declare const error = "error";
declare const ok = "ok";
declare const resultError = "resultError";
export type PromiseError<TGraphQLError> = {
    type: typeof resultError;
    value: TGraphQLError;
} | {
    type: 'promiseError';
    value: unknown;
};
export type ObservableError<TGraphQLError> = {
    type: typeof resultError;
    value: TGraphQLError;
} | {
    type: 'observableError';
    value: unknown;
};
type QueryStatus<TGraphQLError> = {
    type: typeof fetching;
} | {
    type: typeof success;
} | {
    type: typeof error;
    error: PromiseError<TGraphQLError>;
};
type SubscriptionStatus<TGraphQLError> = {
    type: typeof ok;
} | {
    type: typeof error;
    error: ObservableError<TGraphQLError>;
};
declare const GetMessagesQuery = "GetMessagesQuery";
declare const GetRoomConnectionsQuery = "GetRoomConnectionsQuery";
declare const GetRoomQuery = "GetRoomQuery";
type GraphQLStatusSource<TGraphQLError> = {
    [GetMessagesQuery]: QueryStatus<TGraphQLError>;
    [GetRoomConnectionsQuery]: QueryStatus<TGraphQLError>;
    [GetRoomQuery]: QueryStatus<TGraphQLError>;
    RoomEventSubscription: SubscriptionStatus<TGraphQLError>;
};
type GraphQLStatus<TGraphQLError> = GraphQLStatusSource<TGraphQLError> & {
    hasError: boolean;
};
export declare class GraphQLStatusEventEmitter<TGraphQLError> {
    #private;
    next(update: (source: GraphQLStatus<TGraphQLError>) => GraphQLStatusSource<TGraphQLError>): void;
    toReadonlyBehaviorEvent(): ReadonlyBehaviorEvent<GraphQLStatus<TGraphQLError>>;
}
export declare class GraphQLClientWithStatus<TGraphQLError> {
    #private;
    private readonly source;
    private readonly roomId;
    constructor(source: GraphQLClient<TGraphQLError>, roomId: string);
    getMessagesQuery(): Promise<Result<import("@flocon-trpg/graphql-documents/dist/cjs/graphql-codegen/graphql").GetMessagesQuery, PromiseError<TGraphQLError>>>;
    getRoomConnectionsQuery(): Promise<Result<import("@flocon-trpg/graphql-documents/dist/cjs/graphql-codegen/graphql").GetRoomConnectionsQuery, PromiseError<TGraphQLError>>>;
    getRoomQuery(): Promise<Result<import("@flocon-trpg/graphql-documents/dist/cjs/graphql-codegen/graphql").GetRoomQuery, PromiseError<TGraphQLError>>>;
    operateMutation(variables: Pick<VariablesOf<typeof OperateRoomDoc>, 'revisionFrom' | 'operation' | 'requestId'>): Promise<Result<import("@flocon-trpg/graphql-documents/dist/cjs/graphql-codegen/graphql").OperateRoomMutation, TGraphQLError>>;
    get roomEventSubscription(): Observable<import("@flocon-trpg/graphql-documents/dist/cjs/graphql-codegen/graphql").RoomEventSubscription>;
    updateWritingMessagesStatusMutation(variables: Pick<VariablesOf<typeof UpdateWritingMessageStatusDoc>, 'newStatus'>): Promise<Result<import("@flocon-trpg/graphql-documents/dist/cjs/graphql-codegen/graphql").UpdateWritingMessageStatusMutation, TGraphQLError>>;
    get status(): ReadonlyBehaviorEvent<GraphQLStatus<TGraphQLError>>;
}
export {};
//# sourceMappingURL=graphqlClient.d.ts.map