import { RoomClient } from '@flocon-trpg/sdk';
import { Diff, Message } from '@flocon-trpg/web-server-utils';
/**
 * 部屋に投稿されたメッセージ(秘話およびログも含む)およびカスタムメッセージのリストと変更点を返します。
 *
 * @param filter function が渡された場合、true を返すメッセージのみを抽出します。変更されるたびに全てのメッセージの抽出処理が行われるため、function を渡す場合は useCallback などを用いる必要があります。
 */
export declare const useRoomMessages: <TCustomMessage, TGraphQLError>(roomClient: Pick<{
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
        value: import("@flocon-trpg/sdk").ReadonlyBehaviorEvent<ReadonlyMap<string, import("@flocon-trpg/typed-document-node").WritingMessageStatusType>>;
        update: (inputType: import("@flocon-trpg/typed-document-node").WritingMessageStatusInputType) => void;
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
    current: readonly Message<TCustomMessage>[];
    /**
     * 追加、変更、削除されたメッセージです。ただし、メッセージの多くが変更されたとき(Query による更新など)はundefined になります。
     *
     * ブラウザでの通知に用いられることを想定しています。
     */
    diff?: Diff<TCustomMessage> | undefined;
};
//# sourceMappingURL=useRoomMessages.d.ts.map