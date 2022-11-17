import { authToken } from '@flocon-trpg/core';
import { authExchange } from '@urql/exchange-auth';
import { createClient as createClient$1 } from 'graphql-ws';
import { makeOperation, createClient, dedupExchange, cacheExchange, fetchExchange, subscriptionExchange } from 'urql';
import { GetMessagesDocument, GetRoomConnectionsDocument, GetRoomDocument, OperateDocument, UpdateWritingMessageStatusDocument, RoomEventDocument } from '@flocon-trpg/typed-document-node-v0.7.1';
import { Result } from '@kizahasi/result';
import { Observable } from 'rxjs';
import { toObservable } from 'wonka';

const execGetUserIdTokenResult = async (source) => {
    if (source == null) {
        return null;
    }
    return await source();
};
const wsClient = (wsUrl, getUserIdToken) => createClient$1({
    url: wsUrl,
    connectionParams: async () => {
        const idTokenResult = await execGetUserIdTokenResult(getUserIdToken);
        if (idTokenResult == null) {
            return {};
        }
        return { [authToken]: idTokenResult.token };
    },
});
const createUrqlClient = (params) => {
    let authExchangeResult;
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
                const fetchOptions = typeof operation.context.fetchOptions === 'function'
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
    }
    else {
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
                        const unsubscribe = wsClient(params.wsUrl, params.authorization ? params.getUserIdTokenResult : null).subscribe(operation, sink);
                        return { unsubscribe };
                    },
                }),
            }),
        ],
    });
};

const createGraphQLClientForRoomClient = (client) => {
    return {
        getMessagesQuery: variables => client
            .query(GetMessagesDocument, variables, { requestPolicy: 'network-only' })
            .toPromise()
            .then(result => {
            if (result.data != null) {
                return Result.ok(result.data);
            }
            return Result.error(result.error);
        }),
        getRoomConnectionsQuery: variables => client
            .query(GetRoomConnectionsDocument, variables, {
            requestPolicy: 'network-only',
        })
            .toPromise()
            .then(result => {
            if (result.data != null) {
                return Result.ok(result.data);
            }
            return Result.error(result.error);
        }),
        getRoomQuery: variables => client
            .query(GetRoomDocument, variables, { requestPolicy: 'network-only' })
            .toPromise()
            .then(result => {
            if (result.data != null) {
                return Result.ok(result.data);
            }
            return Result.error(result.error);
        }),
        operateMutation: variables => client
            .mutation(OperateDocument, variables)
            .toPromise()
            .then(result => {
            if (result.data != null) {
                return Result.ok(result.data);
            }
            return Result.error(result.error);
        }),
        updateWritingMessagesStatusMutation: variables => client
            .mutation(UpdateWritingMessageStatusDocument, variables)
            .toPromise()
            .then(result => {
            if (result.data != null) {
                return Result.ok(result.data);
            }
            return Result.error(result.error);
        }),
        roomEventSubscription: variables => {
            const roomEventSubscriptionSource = client.subscription(RoomEventDocument, variables);
            const roomEventSubscriptionAsWonkaObservable = toObservable(roomEventSubscriptionSource);
            return new Observable(observer => {
                return roomEventSubscriptionAsWonkaObservable.subscribe({
                    next: value => {
                        if (value.data != null) {
                            observer.next(Result.ok(value.data));
                            return;
                        }
                        observer.next(Result.error(value.error));
                    },
                    error: e => observer.error(e),
                    complete: () => observer.complete(),
                });
            });
        },
    };
};

export { createGraphQLClientForRoomClient, createUrqlClient };
