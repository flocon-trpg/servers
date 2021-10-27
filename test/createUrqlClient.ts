import 'isomorphic-fetch'; // node.jsでは、これがないとエラーが出る。
import ws from 'isomorphic-ws';
import { createClient as createWsClient } from 'graphql-ws';
import { Resources } from './resources';
import { createClient, defaultExchanges, subscriptionExchange } from '@urql/core';

const wsClient = (wsUrl: string, testAuthorizationHeaderValue: string | undefined) =>
    createWsClient({
        url: wsUrl,
        connectionParams: async () => {
            return { [Resources.testAuthorizationHeader]: testAuthorizationHeaderValue };
        },
        webSocketImpl: ws, // node.jsでは、webSocketImplがないとエラーが出る
    });

export const createUrqlClient = (
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
