import { RoomClient } from '@flocon-trpg/sdk';
export declare const useRoomMessageQueryStatus: <TCustomMessage, TGraphQLError>(roomClient: Pick<{
    messages: {
        messages: import("@flocon-trpg/web-server-utils").AllRoomMessages<TCustomMessage>;
        queryStatus: import("@flocon-trpg/sdk").ReadonlyBehaviorEvent<import("@flocon-trpg/sdk").GetMessagesQueryStatus<TGraphQLError>>;
        addCustomMessage: (message: Omit<import("@flocon-trpg/web-server-utils").CustomMessage<TCustomMessage>, "type">) => void;
    };
    roomConnections: import("@flocon-trpg/sdk").ReadonlyBehaviorEvent<{
        current: ReadonlyMap<string, import("@flocon-trpg/sdk/dist/cjs/internal/roomClient/roomConnections").RoomConnectionStatus>;
        diff: import("@flocon-trpg/sdk/dist/cjs/internal/roomClient/roomConnections").RoomConnectionStatusDiff | null;
    }>;
    roomState: import("@flocon-trpg/sdk").ReadonlyBehaviorEvent<import("@flocon-trpg/sdk").RoomState<TGraphQLError>>;
    writingMessageStatus: {
        value: import("@flocon-trpg/sdk").ReadonlyBehaviorEvent<ReadonlyMap<string, import("@flocon-trpg/typed-document-node-v0.7.13").WritingMessageStatusType>>;
        update: (inputType: import("@flocon-trpg/typed-document-node-v0.7.13").WritingMessageStatusInputType) => void;
    };
    graphQLStatus: import("@flocon-trpg/sdk").ReadonlyBehaviorEvent<{
        RoomEventSubscription: {
            type: "ok";
        } | {
            type: "error";
            error: import("@flocon-trpg/sdk").ObservableError<TGraphQLError>;
        };
        GetMessagesQuery: {
            type: "fetching";
        } | {
            type: "success";
        } | {
            type: "error";
            error: import("@flocon-trpg/sdk").PromiseError<TGraphQLError>;
        };
        GetRoomConnectionsQuery: {
            type: "fetching";
        } | {
            type: "success";
        } | {
            type: "error";
            error: import("@flocon-trpg/sdk").PromiseError<TGraphQLError>;
        };
        GetRoomQuery: {
            type: "fetching";
        } | {
            type: "success";
        } | {
            type: "error";
            error: import("@flocon-trpg/sdk").PromiseError<TGraphQLError>;
        };
    } & {
        hasError: boolean;
    }>;
    unsubscribe: () => void;
}, "messages">) => import("@flocon-trpg/sdk").GetMessagesQueryStatus<TGraphQLError>;
//# sourceMappingURL=useRoomMessageQueryStatus.d.ts.map