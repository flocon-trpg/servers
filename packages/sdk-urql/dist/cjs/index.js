'use strict';

var core = require('@flocon-trpg/core');
var exchangeAuth = require('@urql/exchange-auth');
var graphqlWs = require('graphql-ws');
var urql = require('urql');
var typedDocumentNodeV0_7_1 = require('@flocon-trpg/typed-document-node-v0.7.1');
var result = require('@kizahasi/result');
var rxjs = require('rxjs');
var wonka = require('wonka');

const execGetUserIdTokenResult = async (source) => {
    if (source == null) {
        return null;
    }
    return await source();
};
const wsClient = (wsUrl, getUserIdToken) => graphqlWs.createClient({
    url: wsUrl,
    connectionParams: async () => {
        const idTokenResult = await execGetUserIdTokenResult(getUserIdToken);
        if (idTokenResult == null) {
            return {};
        }
        return { [core.authToken]: idTokenResult.token };
    },
});
const createUrqlClient = (params) => {
    let authExchangeResult;
    if (params.authorization) {
        const getUserIdTokenResult = params.getUserIdTokenResult;
        authExchangeResult = exchangeAuth.authExchange({
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
                return urql.makeOperation(operation.kind, operation, {
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
    return urql.createClient({
        url: params.httpUrl,
        exchanges: [
            urql.dedupExchange,
            urql.cacheExchange,
            ...(authExchangeResult == null ? [] : [authExchangeResult]),
            urql.fetchExchange,
            urql.subscriptionExchange({
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
            .query(typedDocumentNodeV0_7_1.GetMessagesDocument, variables, { requestPolicy: 'network-only' })
            .toPromise()
            .then(result$1 => {
            if (result$1.data != null) {
                return result.Result.ok(result$1.data);
            }
            return result.Result.error(result$1.error);
        }),
        getRoomConnectionsQuery: variables => client
            .query(typedDocumentNodeV0_7_1.GetRoomConnectionsDocument, variables, {
            requestPolicy: 'network-only',
        })
            .toPromise()
            .then(result$1 => {
            if (result$1.data != null) {
                return result.Result.ok(result$1.data);
            }
            return result.Result.error(result$1.error);
        }),
        getRoomQuery: variables => client
            .query(typedDocumentNodeV0_7_1.GetRoomDocument, variables, { requestPolicy: 'network-only' })
            .toPromise()
            .then(result$1 => {
            if (result$1.data != null) {
                return result.Result.ok(result$1.data);
            }
            return result.Result.error(result$1.error);
        }),
        operateMutation: variables => client
            .mutation(typedDocumentNodeV0_7_1.OperateDocument, variables)
            .toPromise()
            .then(result$1 => {
            if (result$1.data != null) {
                return result.Result.ok(result$1.data);
            }
            return result.Result.error(result$1.error);
        }),
        updateWritingMessagesStatusMutation: variables => client
            .mutation(typedDocumentNodeV0_7_1.UpdateWritingMessageStatusDocument, variables)
            .toPromise()
            .then(result$1 => {
            if (result$1.data != null) {
                return result.Result.ok(result$1.data);
            }
            return result.Result.error(result$1.error);
        }),
        roomEventSubscription: variables => {
            const roomEventSubscriptionSource = client.subscription(typedDocumentNodeV0_7_1.RoomEventDocument, variables);
            const roomEventSubscriptionAsWonkaObservable = wonka.toObservable(roomEventSubscriptionSource);
            return new rxjs.Observable(observer => {
                return roomEventSubscriptionAsWonkaObservable.subscribe({
                    next: value => {
                        if (value.data != null) {
                            observer.next(result.Result.ok(value.data));
                            return;
                        }
                        observer.next(result.Result.error(value.error));
                    },
                    error: e => observer.error(e),
                    complete: () => observer.complete(),
                });
            });
        },
    };
};

exports.createGraphQLClientForRoomClient = createGraphQLClientForRoomClient;
exports.createUrqlClient = createUrqlClient;
