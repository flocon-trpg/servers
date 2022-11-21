import { WritingMessageStatusInputType } from '@flocon-trpg/typed-document-node-v0.7.1';
import { GraphQLClient } from './roomClient/graphqlClient';
export declare const createRoomClient: <TCustomMessage = any, TGraphQLError = any>({ client: clientSource, roomId, userUid, }: {
    client: GraphQLClient<TGraphQLError>;
    roomId: string;
    userUid: string;
}) => {
    /** メッセージの取得および変更の監視ができます。 */
    messages: {
        messages: import("@flocon-trpg/web-server-utils").AllRoomMessages<TCustomMessage>;
        queryStatus: import("..").ReadonlyBehaviorEvent<import("./roomClient/roomMessages").GetMessagesQueryStatus<TGraphQLError>>;
        addCustomMessage: (message: Omit<import("@flocon-trpg/web-server-utils").CustomMessage<TCustomMessage>, "type">) => void;
    };
    /** 部屋に参加しているユーザーの接続状況を表します。キーは Firebase Authentication の userUid です。`isConnected` が false であるか、もしくは Map に含まれないユーザーは未接続を表します。 */
    roomConnections: import("..").ReadonlyBehaviorEvent<{
        current: ReadonlyMap<string, import("./roomClient/roomConnections").RoomConnectionStatus>;
        diff: import("./roomClient/roomConnections").RoomConnectionStatusDiff | null;
    }>;
    /** メッセージ、接続状況などを除いた部屋のオブジェクト(ボード、キャラなどが含まれます)を取得できます。 */
    roomState: import("..").ReadonlyBehaviorEvent<import("./roomClient/roomState").RoomState<TGraphQLError>>;
    /** メッセージを書き込み中のユーザー一覧の取得と、自分が書き込み中かどうかを示すステータスの更新を行えます。ステータスの更新は必ず行ってください。 */
    writingMessageStatus: {
        /** メッセージを書き込み中のユーザー一覧。 */
        value: import("..").ReadonlyBehaviorEvent<ReadonlyMap<string, import("@flocon-trpg/typed-document-node-v0.7.1").WritingMessageStatusType>>;
        /** 実行することで、自分が書き込み中かどうかを示すステータスの更新を行えます。短時間で複数回実行された場合は、間引いてから API サーバーに送信されます。 */
        update: (inputType: WritingMessageStatusInputType) => void;
    };
    /** `client` のいずれかがエラーを送信(`Promise` の場合は reject、`Observable` の場合は error)したかどうかを示します。エラーが送信された場合は再度 `createRoomClient` を実行することを推奨します。 */
    graphQLStatus: import("..").ReadonlyBehaviorEvent<{
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
    }>;
    /** 内部で使用している `Observable` などの subscription を解除します。これを実行した場合、このオブジェクトの他のプロパティに存在する関数やプロパティにアクセスするとエラーが出ることがありますのでアクセスしないでください。 */
    unsubscribe: () => void;
};
export type RoomClient<TCustomMessage = any, TGraphQLError = any> = ReturnType<typeof createRoomClient<TCustomMessage, TGraphQLError>>;
//# sourceMappingURL=createRoomClient.d.ts.map