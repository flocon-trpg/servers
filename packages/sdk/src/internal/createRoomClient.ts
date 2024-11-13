import { simpleId } from '@flocon-trpg/core';
import { WritingMessageStatusInputType } from '@flocon-trpg/typed-document-node';
import { filter, mergeMap, take } from 'rxjs';
import { GraphQLClient, GraphQLClientWithStatus } from './roomClient/graphqlClient';
import { subscribeRoomConnections } from './roomClient/roomConnections';
import { createRoomMessagesClient } from './roomClient/roomMessages';
import { RoomStateManager } from './roomClient/roomState';
import { subscribeWritingMessageStatus } from './roomClient/subscribeWritingMessageStatus';
import { updateWritingMessageStatus } from './roomClient/updateWritingMessageStatus';

export const createRoomClient = <TCustomMessage = any, TGraphQLError = any>({
    client: clientSource,
    roomId,
    userUid,
}: {
    client: GraphQLClient<TGraphQLError>;
    roomId: string;
    userUid: string;
}) => {
    const client = new GraphQLClientWithStatus(clientSource, roomId);

    const clientId = simpleId();

    const roomStateManager = new RoomStateManager({
        client,
        subscription: client.roomEventSubscription.pipe(
            mergeMap(e => (e.roomEvent == null ? [] : [e.roomEvent])),
        ),
        clientId,
        userUid,
    });

    const createMessagesResult = createRoomMessagesClient<TCustomMessage, TGraphQLError>({
        client,
        roomEventSubscription: client.roomEventSubscription.pipe(
            mergeMap(e =>
                e?.roomEvent?.roomMessageEvent == null ? [] : [e.roomEvent.roomMessageEvent],
            ),
        ),
    });

    const writingMessageStatusResult = subscribeWritingMessageStatus({
        subscription: client.roomEventSubscription.pipe(
            mergeMap(e => (e.roomEvent == null ? [] : [e.roomEvent])),
        ),
    });

    const subscribeRoomConnectionsResult = subscribeRoomConnections({
        client,
        subscription: client.roomEventSubscription.pipe(
            mergeMap(e => (e.roomEvent == null ? [] : [e.roomEvent])),
        ),
    });

    const updateWritingMessageStatusResult = updateWritingMessageStatus(client);

    const roomJoinedSubscription = roomStateManager.stateStream
        .asObservable()
        .pipe(
            filter(x => x.type === 'joined'),
            take(1),
        )
        .subscribe({
            next: () => {
                createMessagesResult.executeQuery();
                subscribeRoomConnectionsResult.executeQuery();
            },
        });

    return {
        /** メッセージの取得および変更の監視ができます。 */
        messages: createMessagesResult.value,
        /** 部屋に参加しているユーザーの接続状況を表します。キーは Firebase Authentication の userUid です。`isConnected` が false であるか、もしくは Map に含まれないユーザーは未接続を表します。 */
        roomConnections: subscribeRoomConnectionsResult.value,
        /** メッセージ、接続状況などを除いた部屋のオブジェクト(ボード、キャラなどが含まれます)を取得できます。 */
        roomState: roomStateManager.stateStream,
        /** メッセージを書き込み中のユーザー一覧の取得と、自分が書き込み中かどうかを示すステータスの更新を行えます。ステータスの更新は必ず行ってください。 */
        writingMessageStatus: {
            /** メッセージを書き込み中のユーザー一覧。 */
            value: writingMessageStatusResult.value,
            /** 実行することで、自分が書き込み中かどうかを示すステータスの更新を行えます。短時間で複数回実行された場合は、間引いてから API サーバーに送信されます。 */
            update: (inputType: WritingMessageStatusInputType) =>
                updateWritingMessageStatusResult.next(inputType),
        },
        /** `client` のいずれかがエラーを送信(`Promise` の場合は reject、`Observable` の場合は error)したかどうかを示します。エラーが送信された場合は再度 `createRoomClient` を実行することを推奨します。 */
        graphQLStatus: client.status,
        /** 内部で使用している `Observable` などの subscription を解除します。これを実行した場合、このオブジェクトの他のプロパティに存在する関数やプロパティにアクセスするとエラーが出ることがありますのでアクセスしないでください。 */
        unsubscribe: () => {
            roomStateManager.unsubscribe();
            createMessagesResult.unsubscribe();
            writingMessageStatusResult.unsubscribe();
            subscribeRoomConnectionsResult.unsubscribe();
            updateWritingMessageStatusResult.unsubscribe();
            roomJoinedSubscription.unsubscribe();
        },
    };
};

export type RoomClient<TCustomMessage = any, TGraphQLError = any> = ReturnType<
    typeof createRoomClient<TCustomMessage, TGraphQLError>
>;
