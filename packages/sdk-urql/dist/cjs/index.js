'use strict';

var core = require('@flocon-trpg/core');
var exchangeAuth = require('@urql/exchange-auth');
var graphqlWs = require('graphql-ws');
var urql = require('urql');
var typedDocumentNode = require('@flocon-trpg/typed-document-node');
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
    const defaultExchanges = [
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
    ];
    return urql.createClient({
        url: params.httpUrl,
        exchanges: params.exchanges == null ? defaultExchanges : params.exchanges(defaultExchanges),
    });
};

const createGraphQLClientForRoomClient = (client) => {
    return {
        getMessagesQuery: variables => client
            .query(typedDocumentNode.GetMessagesDocument, variables, { requestPolicy: 'network-only' })
            .toPromise()
            .then(result$1 => {
            if (result$1.data != null) {
                return result.Result.ok(result$1.data);
            }
            return result.Result.error(result$1.error);
        }),
        getRoomConnectionsQuery: variables => client
            .query(typedDocumentNode.GetRoomConnectionsDocument, variables, {
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
            .query(typedDocumentNode.GetRoomDocument, variables, { requestPolicy: 'network-only' })
            .toPromise()
            .then(result$1 => {
            if (result$1.data != null) {
                return result.Result.ok(result$1.data);
            }
            return result.Result.error(result$1.error);
        }),
        operateMutation: variables => client
            .mutation(typedDocumentNode.OperateDocument, variables)
            .toPromise()
            .then(result$1 => {
            if (result$1.data != null) {
                return result.Result.ok(result$1.data);
            }
            return result.Result.error(result$1.error);
        }),
        updateWritingMessagesStatusMutation: variables => client
            .mutation(typedDocumentNode.UpdateWritingMessageStatusDocument, variables)
            .toPromise()
            .then(result$1 => {
            if (result$1.data != null) {
                return result.Result.ok(result$1.data);
            }
            return result.Result.error(result$1.error);
        }),
        roomEventSubscription: variables => {
            // 当初は、client.subscription() の戻り値を wonka の toObservable で wonka の Observable に変換して、それを RxJS の Observable に変換していた。
            // だがこの方法だと unsubscribe が効かないという問題が発生したため、toObservable を使わずに実装している。
            const observable = new rxjs.Observable(observer => {
                const subscription = wonka.pipe(client.subscription(typedDocumentNode.RoomEventDocument, variables), wonka.subscribe(value => {
                    if (value.data != null) {
                        observer.next(result.Result.ok(value.data));
                        return;
                    }
                    observer.next(result.Result.error(value.error));
                }));
                return subscription;
            });
            return observable.pipe(rxjs.share());
        },
    };
};

exports.createGraphQLClientForRoomClient = createGraphQLClientForRoomClient;
exports.createUrqlClient = createUrqlClient;
//# sourceMappingURL=index.js.map
