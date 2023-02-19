import { GetRoomMessagesFailureType, RoomEventSubscription } from '@flocon-trpg/typed-document-node';
import { Observable } from 'rxjs';
import { ReadonlyBehaviorEvent } from '../rxjs/readonlyBehaviorEvent';
import { GraphQLClientWithStatus, PromiseError } from './graphqlClient';
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
    roomEventSubscription: Observable<NonNullable<NonNullable<RoomEventSubscription['roomEvent']>['roomMessageEvent']>>;
}) => {
    value: {
        messages: import("@flocon-trpg/web-server-utils").AllRoomMessages<TCustomMessage>;
        queryStatus: ReadonlyBehaviorEvent<GetMessagesQueryStatus<TGraphQLError>>;
        addCustomMessage: (message: Omit<import("@flocon-trpg/web-server-utils").CustomMessage<TCustomMessage>, "type">) => void;
    };
    executeQuery: () => void;
    unsubscribe: () => void;
    isUnsubscribed: boolean;
};
export {};
//# sourceMappingURL=roomMessages.d.ts.map