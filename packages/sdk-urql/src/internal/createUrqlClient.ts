import { IdTokenResult } from '@firebase/auth';
import { authToken } from '@flocon-trpg/core';
import { authExchange } from '@urql/exchange-auth';
import { createClient as createWsClient } from 'graphql-ws';
import {
    Exchange,
    cacheExchange,
    createClient,
    dedupExchange,
    fetchExchange,
    makeOperation,
    subscriptionExchange,
} from 'urql';
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

type Exchanges = NonNullable<Parameters<typeof createClient>[0]['exchanges']>;

type Params = {
    /** API サーバーの HTTP もしくは HTTPS での URL。通常は `https://` もしくは `http://` で始まる文字列です。 */
    httpUrl: string;

    /** API サーバーの WebSocket の URL。通常は `wss://` もしくは `ws://` で始まる文字列です。 */
    wsUrl: string;

    exchanges?: (defaultExchanges: Exchanges) => Exchanges;
} & (
    | {
          /**
           * 常に Authorization ヘッダーなしで API サーバーにリクエストします。API サーバーからはログインしていないユーザーだとみなされます。
           *
           * ユーザーがログインしているか否かに関わらず、通常は `true` をセットすることを推奨します。
           */
          authorization: false;
      }
    | {
          /**
           * 可能であれば Authorization ヘッダーありで API サーバーにリクエストします。
           *
           * 有効な Authorization ヘッダーがある場合は、API サーバーからはログインしているユーザーだとみなされます。ただし、Authorization ヘッダーにセットする値を GetUserIdTokenResult から取得できなかった場合は、Authorization ヘッダーなしでリクエストします。この場合はログインしていないユーザーだとみなされます。
           */
          authorization: true;

          getUserIdTokenResult: GetUserIdTokenResult;
      }
);

export const createUrqlClient = (params: Params) => {
    let authExchangeResult: Exchange | null;
    if (params.authorization) {
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

    const defaultExchanges: Exchanges = [
        dedupExchange,
        cacheExchange,
        ...(authExchangeResult == null ? [] : [authExchangeResult]),
        fetchExchange,
        subscriptionExchange({
            forwardSubscription: operation => ({
                subscribe: sink => {
                    const unsubscribe = wsClient(
                        params.wsUrl,
                        params.authorization ? params.getUserIdTokenResult : null
                    ).subscribe(operation, sink);
                    return { unsubscribe };
                },
            }),
        }),
    ];

    return createClient({
        url: params.httpUrl,
        exchanges: params.exchanges == null ? defaultExchanges : params.exchanges(defaultExchanges),
    });
};
