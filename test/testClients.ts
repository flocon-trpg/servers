import 'isomorphic-fetch'; // node.jsでは、これがないとエラーが出る。
import ws from 'isomorphic-ws';
import {
    RoomEventDocument,
    RoomEventSubscription,
    RoomEventSubscriptionVariables,
} from './graphql';
import { Resources } from './resources';
import { CompositeTestRoomEventSubscription, TestRoomEventSubscription } from './subscription';
import { createClient as createWsClient } from 'graphql-ws';
import { createClient, defaultExchanges, subscriptionExchange } from '@urql/core';

const wsClient = (wsUrl: string, testAuthorizationHeaderValue: string | undefined) =>
    createWsClient({
        url: wsUrl,
        connectionParams: async () => {
            return { [Resources.testAuthorizationHeader]: testAuthorizationHeaderValue };
        },
        webSocketImpl: ws, // node.jsでは、webSocketImplがないとエラーが出る
    });

const createUrqlClient = (
    httpUrl: string,
    wsUrl: string,
    testAuthorizationHeaderValue: string | undefined
) =>
    createClient({
        url: httpUrl,
        fetchOptions: () => ({
            headers: { [Resources.testAuthorizationHeader]: testAuthorizationHeaderValue },
        }),
        exchanges: [
            ...defaultExchanges,
            subscriptionExchange({
                forwardSubscription: operation => ({
                    subscribe: sink => ({
                        unsubscribe: wsClient(wsUrl, testAuthorizationHeaderValue).subscribe(
                            operation,
                            sink as any
                        ),
                    }),
                }),
            }),
        ],
    });

type ConstructorParams = {
    httpGraphQLUri: string;
    wsGraphQLUri: string;
};

export class TestClients {
    public readonly clients;

    public constructor(private readonly params: ConstructorParams) {
        const { httpGraphQLUri, wsGraphQLUri } = params;
        const roomMasterClient = createUrqlClient(
            httpGraphQLUri,
            wsGraphQLUri,
            Resources.User.master
        );
        const roomPlayer1Client = createUrqlClient(
            httpGraphQLUri,
            wsGraphQLUri,
            Resources.User.player1
        );
        const roomPlayer2Client = createUrqlClient(
            httpGraphQLUri,
            wsGraphQLUri,
            Resources.User.player2
        );
        const roomSpectatorClient = createUrqlClient(
            httpGraphQLUri,
            wsGraphQLUri,
            Resources.User.spectator
        );
        const notJoinUserClient = createUrqlClient(
            httpGraphQLUri,
            wsGraphQLUri,
            Resources.User.notJoin
        );

        // すべてのClientは（この時点では）同一。各プロパティ名は、テストで使いやすいように名前を付けているだけ
        this.clients = {
            roomMasterClient,
            roomPlayer1Client,
            roomPlayer2Client,
            roomSpectatorClient,
            notJoinUserClient,
        };
    }

    public beginSubscriptions(roomId: string) {
        const {
            roomMasterClient,
            roomPlayer1Client,
            roomPlayer2Client,
            roomSpectatorClient,
            notJoinUserClient,
        } = this.clients;

        const roomMasterClientSubscription = new TestRoomEventSubscription(
            roomMasterClient.subscription<RoomEventSubscription, RoomEventSubscriptionVariables>(
                RoomEventDocument,
                {
                    id: roomId,
                }
            )
        );
        const roomPlayer1ClientSubscription = new TestRoomEventSubscription(
            roomPlayer1Client.subscription<RoomEventSubscription, RoomEventSubscriptionVariables>(
                RoomEventDocument,
                {
                    id: roomId,
                }
            )
        );
        const roomPlayer2ClientSubscription = new TestRoomEventSubscription(
            roomPlayer2Client.subscription<RoomEventSubscription, RoomEventSubscriptionVariables>(
                RoomEventDocument,
                {
                    id: roomId,
                }
            )
        );
        const roomSpectatorClientSubscription = new TestRoomEventSubscription(
            roomSpectatorClient.subscription<RoomEventSubscription, RoomEventSubscriptionVariables>(
                RoomEventDocument,
                {
                    id: roomId,
                }
            )
        );
        const notJoinUserClientSubscription = new TestRoomEventSubscription(
            notJoinUserClient.subscription<RoomEventSubscription, RoomEventSubscriptionVariables>(
                RoomEventDocument,
                {
                    id: roomId,
                }
            )
        );
        const allSubscriptions = new CompositeTestRoomEventSubscription([
            roomMasterClientSubscription,
            roomPlayer1ClientSubscription,
            roomPlayer2ClientSubscription,
            roomSpectatorClientSubscription,
            notJoinUserClientSubscription,
        ]);
        return {
            roomMasterClientSubscription,
            roomPlayer1ClientSubscription,
            roomPlayer2ClientSubscription,
            roomSpectatorClientSubscription,
            notJoinUserClientSubscription,
            allSubscriptions,
        };
    }
}
