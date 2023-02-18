import { GetMessagesQuery, GetMessagesQueryVariables, GetRoomConnectionsQuery, GetRoomConnectionsQueryVariables, GetRoomQuery, GetRoomQueryVariables, OperateMutation, OperateMutationVariables, RoomEventSubscription, RoomEventSubscriptionVariables, RoomOperationInput, UpdateWritingMessageStatusMutation, UpdateWritingMessageStatusMutationVariables, WritingMessageStatusInputType } from '@flocon-trpg/typed-document-node-v0.7.13';
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
    getMessagesQuery: (variables: GetMessagesQueryVariables) => Promise<Result<GetMessagesQuery, TGraphQLError>>;
    getRoomConnectionsQuery: (variables: GetRoomConnectionsQueryVariables) => Promise<Result<GetRoomConnectionsQuery, TGraphQLError>>;
    getRoomQuery: (variables: GetRoomQueryVariables) => Promise<Result<GetRoomQuery, TGraphQLError>>;
    operateMutation: (variables: OperateMutationVariables) => Promise<Result<OperateMutation, TGraphQLError>>;
    roomEventSubscription: (variables: RoomEventSubscriptionVariables) => Observable<Result<RoomEventSubscription, TGraphQLError>>;
    updateWritingMessagesStatusMutation: (variables: UpdateWritingMessageStatusMutationVariables) => Promise<Result<UpdateWritingMessageStatusMutation, TGraphQLError>>;
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
    getMessagesQuery(): Promise<Result<GetMessagesQuery, PromiseError<TGraphQLError>>>;
    getRoomConnectionsQuery(): Promise<Result<GetRoomConnectionsQuery, PromiseError<TGraphQLError>>>;
    getRoomQuery(): Promise<Result<GetRoomQuery, PromiseError<TGraphQLError>>>;
    operateMutation(variables: {
        revisionFrom: number;
        operation: RoomOperationInput;
        requestId: string;
    }): Promise<Result<OperateMutation, TGraphQLError>>;
    get roomEventSubscription(): Observable<RoomEventSubscription>;
    updateWritingMessagesStatusMutation(variables: {
        newStatus: WritingMessageStatusInputType;
    }): Promise<Result<UpdateWritingMessageStatusMutation, TGraphQLError>>;
    get status(): ReadonlyBehaviorEvent<GraphQLStatus<TGraphQLError>>;
}
export {};
//# sourceMappingURL=graphqlClient.d.ts.map