import { GetMessagesQueryStatus, RoomClient } from '@flocon-trpg/sdk';
import { Diff, Message } from '@flocon-trpg/web-server-utils';
export declare const useRoomMessages: <TCustomMessage, TGraphQLError>(roomClient: Pick<{
    messages: {
        messages: import("@flocon-trpg/web-server-utils").AllRoomMessages<TCustomMessage>;
        queryStatus: import("@flocon-trpg/sdk").ReadonlyBehaviorEvent<GetMessagesQueryStatus<TGraphQLError>>;
        addCustomMessage: (message: Omit<import("@flocon-trpg/web-server-utils").CustomMessage<TCustomMessage>, "type">) => void;
    };
    roomConnections: import("@flocon-trpg/sdk").ReadonlyBehaviorEvent<{
        current: ReadonlyMap<string, import("@flocon-trpg/sdk/dist/cjs/internal/roomClient/roomConnections").RoomConnectionStatus>;
        diff: import("@flocon-trpg/sdk/dist/cjs/internal/roomClient/roomConnections").RoomConnectionStatusDiff | null;
    }>;
    roomState: import("@flocon-trpg/sdk").ReadonlyBehaviorEvent<import("@flocon-trpg/sdk").RoomState<TGraphQLError>>;
    writingMessageStatus: {
        value: import("@flocon-trpg/sdk").ReadonlyBehaviorEvent<ReadonlyMap<string, import("@flocon-trpg/typed-document-node-v0.7.1").WritingMessageStatusType>>;
        update: (inputType: import("@flocon-trpg/typed-document-node-v0.7.1").WritingMessageStatusInputType) => void;
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
}, "messages">, filter?: ((message: Message<TCustomMessage>) => boolean) | undefined) => {
    /** メッセージの配列です。作成日時によって昇順にソートされています。 */
    value: readonly Message<TCustomMessage>[];
    /** 追加、変更、削除されたメッセージです。ブラウザで通知を出す際などに用いられます。 */
    diff?: Diff<TCustomMessage> | undefined;
    queryStatus: GetMessagesQueryStatus<TGraphQLError>;
};
//# sourceMappingURL=useRoomMessages.d.ts.map