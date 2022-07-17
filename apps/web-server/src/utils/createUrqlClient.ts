import {
    Exchange,
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
import { IdTokenResult } from '@firebase/auth';

type GetUserIdTokenResult = (() => Promise<IdTokenResult | null>) | null;

const execGetUserIdTokenResult = async (
    source: GetUserIdTokenResult
): Promise<IdTokenResult | null> => {
    if (source == null) {
        return null;
    }
    return await source();
};

const wsClient = (wsUrl: string, getUserIdToken: GetUserIdTokenResult) =>
    createWsClient({
        url: wsUrl,
        connectionParams: async () => {
            const idTokenResult = await execGetUserIdTokenResult(getUserIdToken);
            if (idTokenResult == null) {
                return {};
            }
            return { [authToken]: idTokenResult.token };
        },
    });

type Params = {
    httpUrl: string;
    wsUrl: string;
} & (
    | {
          useIdToken: false;
      }
    | { useIdToken: true; getUserIdTokenResult: GetUserIdTokenResult }
);

export const createUrqlClient = (params: Params) => {
    let authExchangeResult: Exchange | null;
    if (params.useIdToken) {
        const getUserIdTokenResult = params.getUserIdTokenResult;
        authExchangeResult = authExchange({
            getAuth: async () => {
                const userIdTokenResult = await execGetUserIdTokenResult(getUserIdTokenResult);
                return { userIdTokenResult };
            },
            willAuthError: ({ authState }) => {
                if (authState?.userIdTokenResult == null) {
                    return true;
                }

                // この秒数以内にidTokenがexpireする状態であればエラーとみなしてidTokenの再取得を行う。
                // getIdTokenResultは、あと5分以内にexpireする状態でないとidTokenは自動更新されないため、5分以下の値にしている。
                // https://github.com/firebase/firebase-js-sdk/blob/7cad614ec2d2a34b40a3c24443c4f35571e3e68c/packages/auth/src/core/user/id_token_result.ts#L47
                const refreshIfExpiresIn = 240;

                const expirationDate = new Date(authState.userIdTokenResult.expirationTime);
                expirationDate.setSeconds(expirationDate.getSeconds() - refreshIfExpiresIn);
                return expirationDate < new Date();
            },
            // https://formidable.com/open-source/urql/docs/advanced/authentication/#configuring-addauthtooperation
            addAuthToOperation: ({ authState, operation }) => {
                if (authState?.userIdTokenResult == null) {
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
                            Authorization: `Bearer ${authState.userIdTokenResult.token}`,
                        },
                    },
                });
            },
        });
    } else {
        authExchangeResult = null;
    }

    return createClient({
        url: params.httpUrl,
        exchanges: [
            dedupExchange,
            cacheExchange,
            ...(authExchangeResult == null ? [] : [authExchangeResult]),
            fetchExchange,
            subscriptionExchange({
                forwardSubscription: operation => ({
                    subscribe: sink => {
                        const unsubscribe = wsClient(
                            params.wsUrl,
                            params.useIdToken ? params.getUserIdTokenResult : null
                        ).subscribe(operation, sink);
                        return { unsubscribe };
                    },
                }),
            }),
        ],
    });
};
