import { GetRoomMessagesFailureType, RoomEventDoc } from '@flocon-trpg/graphql-documents';
import { ResultOf } from '@graphql-typed-document-node/core';
import { Observable } from 'rxjs';
import { ReadonlyBehaviorEvent } from '../rxjs/readonlyBehaviorEvent';
import { GraphQLClientWithStatus, PromiseError } from './graphqlClient';
type RoomEventSubscriptionResult = ResultOf<typeof RoomEventDoc>['result'];
declare const success = "success";
declare const fetching = "fetching";
declare const error = "error";
export type GetMessagesQueryStatus<TGraphQLError> = {
    type: typeof fetching;
} | {
    type: typeof success;
} | {
    type: typeof error;
    error: {
        type: 'GraphQLError';
        error: PromiseError<TGraphQLError>;
    } | {
        type: 'GetRoomMessagesFailureResult';
        failureType: GetRoomMessagesFailureType;
    };
};
export declare const createRoomMessagesClient: <TCustomMessage, TGraphQLError>({ client, roomEventSubscription, }: {
    client: Pick<GraphQLClientWithStatus<TGraphQLError>, "getMessagesQuery">;
    roomEventSubscription: Observable<NonNullable<NonNullable<RoomEventSubscriptionResult>["roomMessageEvent"]>>;
}) => {
    value: {
        messages: import("@flocon-trpg/web-server-utils").AllRoomMessages<TCustomMessage>;
        queryStatus: ReadonlyBehaviorEvent<GetMessagesQueryStatus<TGraphQLError>>;
        addCustomMessage: (message: Parameters<(message: Omit<import("@flocon-trpg/web-server-utils").CustomMessage<TCustomMessage>, "type">) => void>[0]) => void;
    };
    executeQuery: () => void;
    unsubscribe: () => void;
    isUnsubscribed: boolean;
};
export {};
//# sourceMappingURL=roomMessages.d.ts.map