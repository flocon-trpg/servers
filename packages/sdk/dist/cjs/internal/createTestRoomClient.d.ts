import { WritingMessageStatusInputType, WritingMessageStatusType } from '@flocon-trpg/typed-document-node';
import { RoomMessagesClient } from '@flocon-trpg/web-server-utils';
import { RoomClient } from './createRoomClient';
import { GraphQLStatusEventEmitter } from './roomClient/graphqlClient';
import { RoomConnectionsManager } from './roomClient/roomConnections';
import { GetMessagesQueryStatus } from './roomClient/roomMessages';
import { RoomState } from './roomClient/roomState';
import { BehaviorEvent } from './rxjs/behaviorEvent';
declare const createTestRoomClientSource: <TCustomMessage, TGraphQLError>() => {
    roomMessageClient: RoomMessagesClient<TCustomMessage>;
    queryStatus: BehaviorEvent<GetMessagesQueryStatus<TGraphQLError>>;
    roomState: BehaviorEvent<RoomState<TGraphQLError>>;
    clientStatus: GraphQLStatusEventEmitter<TGraphQLError>;
    roomConnections: RoomConnectionsManager;
    writingMessageStatusValue: BehaviorEvent<ReadonlyMap<string, WritingMessageStatusType>>;
};
type MockSource<TCustomMessage, TGraphQLError> = ReturnType<typeof createTestRoomClientSource<TCustomMessage, TGraphQLError>>;
export declare const createTestRoomClient: <TCustomMessage, TGraphQLError>(callback: {
    writingMessageStatus?: ((inputType: WritingMessageStatusInputType, source: {
        roomMessageClient: RoomMessagesClient<TCustomMessage>;
        queryStatus: BehaviorEvent<GetMessagesQueryStatus<TGraphQLError>>;
        roomState: BehaviorEvent<RoomState<TGraphQLError>>;
        clientStatus: GraphQLStatusEventEmitter<TGraphQLError>;
        roomConnections: RoomConnectionsManager;
        writingMessageStatusValue: BehaviorEvent<ReadonlyMap<string, WritingMessageStatusType>>;
    }) => void) | undefined;
    unsubscribe?: ((source: {
        roomMessageClient: RoomMessagesClient<TCustomMessage>;
        queryStatus: BehaviorEvent<GetMessagesQueryStatus<TGraphQLError>>;
        roomState: BehaviorEvent<RoomState<TGraphQLError>>;
        clientStatus: GraphQLStatusEventEmitter<TGraphQLError>;
        roomConnections: RoomConnectionsManager;
        writingMessageStatusValue: BehaviorEvent<ReadonlyMap<string, WritingMessageStatusType>>;
    }) => void) | undefined;
}) => {
    roomClient: RoomClient<TCustomMessage, TGraphQLError>;
    source: {
        clientStatus: {
            next: (update: (source: {
                RoomEventSubscription: {
                    type: "ok";
                } | {
                    type: "error";
                    error: import("./roomClient/graphqlClient").ObservableError<TGraphQLError>;
                };
                GetMessagesQuery: {
                    type: "fetching";
                } | {
                    type: "success";
                } | {
                    type: "error";
                    error: import("./roomClient/graphqlClient").PromiseError<TGraphQLError>;
                };
                GetRoomConnectionsQuery: {
                    type: "fetching";
                } | {
                    type: "success";
                } | {
                    type: "error";
                    error: import("./roomClient/graphqlClient").PromiseError<TGraphQLError>;
                };
                GetRoomQuery: {
                    type: "fetching";
                } | {
                    type: "success";
                } | {
                    type: "error";
                    error: import("./roomClient/graphqlClient").PromiseError<TGraphQLError>;
                };
            } & {
                hasError: boolean;
            }) => {
                RoomEventSubscription: {
                    type: "ok";
                } | {
                    type: "error";
                    error: import("./roomClient/graphqlClient").ObservableError<TGraphQLError>;
                };
                GetMessagesQuery: {
                    type: "fetching";
                } | {
                    type: "success";
                } | {
                    type: "error";
                    error: import("./roomClient/graphqlClient").PromiseError<TGraphQLError>;
                };
                GetRoomConnectionsQuery: {
                    type: "fetching";
                } | {
                    type: "success";
                } | {
                    type: "error";
                    error: import("./roomClient/graphqlClient").PromiseError<TGraphQLError>;
                };
                GetRoomQuery: {
                    type: "fetching";
                } | {
                    type: "success";
                } | {
                    type: "error";
                    error: import("./roomClient/graphqlClient").PromiseError<TGraphQLError>;
                };
            }) => void;
        };
        roomMessageClient: RoomMessagesClient<TCustomMessage>;
        queryStatus: BehaviorEvent<GetMessagesQueryStatus<TGraphQLError>>;
        roomState: BehaviorEvent<RoomState<TGraphQLError>>;
        roomConnections: RoomConnectionsManager;
        writingMessageStatusValue: BehaviorEvent<ReadonlyMap<string, WritingMessageStatusType>>;
    };
};
export {};
//# sourceMappingURL=createTestRoomClient.d.ts.map