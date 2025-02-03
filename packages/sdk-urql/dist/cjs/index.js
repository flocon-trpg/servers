'use strict';

var core = require('@flocon-trpg/core');
var exchangeAuth = require('@urql/exchange-auth');
var graphqlWs = require('graphql-ws');
var urql = require('urql');
var graphqlDocuments = require('@flocon-trpg/graphql-documents');
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
        let userIdTokenResult = null;
        authExchangeResult = exchangeAuth.authExchange(async (utils) => ({
            refreshAuth: async () => {
                userIdTokenResult = await execGetUserIdTokenResult(getUserIdTokenResult);
            },
            didAuthError: error => {
                return error.graphQLErrors.some(error => 
                // auth error のとき、error.extensions.code は 'INTERNAL_SERVER_ERROR' であるため、error.extensions.code だけでは auth error かどうかを判定するのは困難。
                error.message.includes("Access denied! You don't have permission for this action!"));
            },
            willAuthError: () => {
                if (userIdTokenResult == null) {
                    return true;
                }
                // この秒数以内にidTokenがexpireする状態であればエラーとみなしてidTokenの再取得を行う。
                // getIdTokenResultは、あと5分以内にexpireする状態でないとidTokenは自動更新されないため、5分以下の値にしている。
                // https://github.com/firebase/firebase-js-sdk/blob/7cad614ec2d2a34b40a3c24443c4f35571e3e68c/packages/auth/src/core/user/id_token_result.ts#L47
                const refreshIfExpiresIn = 240;
                const expirationDate = new Date(userIdTokenResult.expirationTime);
                expirationDate.setSeconds(expirationDate.getSeconds() - refreshIfExpiresIn);
                return expirationDate < new Date();
            },
            // https://formidable.com/open-source/urql/docs/advanced/authentication/#configuring-addauthtooperation
            addAuthToOperation: operation => {
                if (userIdTokenResult == null) {
                    return operation;
                }
                return utils.appendHeaders(operation, {
                    Authorization: `Bearer ${userIdTokenResult.token}`,
                });
            },
        }));
    }
    else {
        authExchangeResult = null;
    }
    const defaultExchanges = [
        urql.cacheExchange,
        ...(authExchangeResult == null ? [] : [authExchangeResult]),
        urql.fetchExchange,
        urql.subscriptionExchange({
            forwardSubscription: request => {
                const input = { ...request, query: request.query || '' };
                return {
                    subscribe: sink => {
                        const unsubscribe = wsClient(params.wsUrl, params.authorization ? params.getUserIdTokenResult : null).subscribe(input, sink);
                        return { unsubscribe };
                    },
                };
            },
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
            .query(graphqlDocuments.GetMessagesDoc, variables, { requestPolicy: 'network-only' })
            .toPromise()
            .then(result$1 => {
            if (result$1.data != null) {
                return result.Result.ok(result$1.data);
            }
            return result.Result.error(result$1.error);
        }),
        getRoomConnectionsQuery: variables => client
            .query(graphqlDocuments.GetRoomConnectionsDoc, variables, {
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
            .query(graphqlDocuments.GetRoomDoc, variables, { requestPolicy: 'network-only' })
            .toPromise()
            .then(result$1 => {
            if (result$1.data != null) {
                return result.Result.ok(result$1.data);
            }
            return result.Result.error(result$1.error);
        }),
        operateRoomMutation: variables => client
            .mutation(graphqlDocuments.OperateRoomDoc, variables)
            .toPromise()
            .then(result$1 => {
            if (result$1.data != null) {
                return result.Result.ok(result$1.data);
            }
            return result.Result.error(result$1.error);
        }),
        updateWritingMessagesStatusMutation: variables => client
            .mutation(graphqlDocuments.UpdateWritingMessageStatusDoc, variables)
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
                const subscription = wonka.pipe(client.subscription(graphqlDocuments.RoomEventDoc, variables), wonka.subscribe(value => {
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
