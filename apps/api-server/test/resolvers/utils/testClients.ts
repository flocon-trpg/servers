import 'isomorphic-fetch'; // node.jsでは、これがないとエラーが出る。
import ws from 'isomorphic-ws';
import {
    RoomEventDocument,
    RoomEventSubscription,
    RoomEventSubscriptionVariables,
} from '@flocon-trpg/typed-document-node';
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

type ConstructorParams<TUserUids extends ReadonlyArray<string>> = {
    httpGraphQLUri: string;
    wsGraphQLUri: string;
    userUids: TUserUids;
};

type Client = ReturnType<typeof createUrqlClient>;
type Clients<TUserUids extends ReadonlyArray<string>> = { [_ in TUserUids[number]]: Client };
type Subscriptions<TUserUids extends ReadonlyArray<string>> = {
    [_ in TUserUids[number]]: TestRoomEventSubscription;
};

export class TestClients<TUserUids extends ReadonlyArray<string>> {
    public readonly clients: Clients<TUserUids>;

    public constructor(params: ConstructorParams<TUserUids>) {
        const { httpGraphQLUri, wsGraphQLUri, userUids } = params;

        const record: Record<string, Client> = {};
        for (const userUid of userUids) {
            record[userUid] = createUrqlClient(httpGraphQLUri, wsGraphQLUri, userUid);
        }

        this.clients = record as Clients<TUserUids>;
    }

    public beginSubscriptions(roomId: string) {
        const subscriptionsRecord: Record<string, TestRoomEventSubscription> = {};
        const subscriptionsArray: TestRoomEventSubscription[] = [];
        for (const userUid in this.clients) {
            const client = (this.clients as Record<string, Client>)[userUid];
            if (client == null) {
                throw new Error();
            }
            const subscription = new TestRoomEventSubscription(
                client.subscription<RoomEventSubscription, RoomEventSubscriptionVariables>(
                    RoomEventDocument,
                    {
                        id: roomId,
                    }
                )
            );
            subscriptionsRecord[userUid] = subscription;
            subscriptionsArray.push(subscription);
        }

        const allSubscriptions = new CompositeTestRoomEventSubscription(subscriptionsArray);
        return { all: allSubscriptions, value: subscriptionsRecord as Subscriptions<TUserUids> };
    }
}
