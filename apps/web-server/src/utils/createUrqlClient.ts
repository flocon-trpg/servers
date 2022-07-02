import {
    cacheExchange,
    createClient,
    dedupExchange,
    fetchExchange,
    makeOperation,
    subscriptionExchange,
} from 'urql';
import { createClient as createWsClient } from 'graphql-ws';
import { authExchange } from '@urql/exchange-auth';
import { authToken } from '@flocon-trpg/core';

type GetUserIdToken = (() => Promise<string | null>) | null;

const execGetUserIdToken = async (source: GetUserIdToken): Promise<string | null> => {
    if (source == null) {
        return null;
    }
    return await source();
};

const wsClient = (wsUrl: string, getUserIdToken: GetUserIdToken) =>
    createWsClient({
        url: wsUrl,
        connectionParams: async () => {
            const idToken = await execGetUserIdToken(getUserIdToken);
            if (idToken == null) {
                return {};
            }
            return { [authToken]: idToken };
        },
    });

export const createUrqlClient = ({
    httpUrl,
    wsUrl,
    getUserIdToken,
}: {
    httpUrl: string;
    wsUrl: string;
    getUserIdToken: GetUserIdToken;
}) =>
    createClient({
        url: httpUrl,
        exchanges: [
            dedupExchange,
            cacheExchange,
            authExchange({
                getAuth: async () => {
                    const userIdToken = await execGetUserIdToken(getUserIdToken);
                    return { userIdToken };
                },
                // https://formidable.com/open-source/urql/docs/advanced/authentication/#configuring-addauthtooperation
                addAuthToOperation: ({ authState, operation }) => {
                    if (!authState || authState.userIdToken == null) {
                        return operation;
                    }
                    const fetchOptions =
                        typeof operation.context.fetchOptions === 'function'
                            ? operation.context.fetchOptions()
                            : operation.context.fetchOptions || {};
                    return makeOperation(operation.kind, operation, {
                        ...operation.context,
                        fetchOptions: {
                            ...fetchOptions,
                            headers: {
                                ...fetchOptions.headers,
                                Authorization: `Bearer ${authState.userIdToken}`,
                            },
                        },
                    });
                },
            }),
            fetchExchange,
            subscriptionExchange({
                forwardSubscription: operation => ({
                    subscribe: sink => {
                        const unsubscribe = wsClient(wsUrl, getUserIdToken).subscribe(
                            operation,
                            sink
                        );
                        return { unsubscribe };
                    },
                }),
            }),
        ],
    });
