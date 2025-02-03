import { authToken } from '@flocon-trpg/core';
import { authExchange } from '@urql/exchange-auth';
import { createClient as createClient$1 } from 'graphql-ws';
import { cacheExchange, fetchExchange, subscriptionExchange, createClient } from 'urql';
import { GetMessagesDoc, GetRoomConnectionsDoc, GetRoomDoc, OperateRoomDoc, UpdateWritingMessageStatusDoc, RoomEventDoc } from '@flocon-trpg/graphql-documents';
import { Result } from '@kizahasi/result';
import { Observable, share } from 'rxjs';
import { pipe, subscribe } from 'wonka';

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
        let userIdTokenResult = null;
        authExchangeResult = authExchange(async (utils) => ({
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
        cacheExchange,
        ...(authExchangeResult == null ? [] : [authExchangeResult]),
        fetchExchange,
        subscriptionExchange({
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
    return createClient({
        url: params.httpUrl,
        exchanges: params.exchanges == null ? defaultExchanges : params.exchanges(defaultExchanges),
    });
};

const createGraphQLClientForRoomClient = (client) => {
    return {
        getMessagesQuery: variables => client
            .query(GetMessagesDoc, variables, { requestPolicy: 'network-only' })
            .toPromise()
            .then(result => {
            if (result.data != null) {
                return Result.ok(result.data);
            }
            return Result.error(result.error);
        }),
        getRoomConnectionsQuery: variables => client
            .query(GetRoomConnectionsDoc, variables, {
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
            .query(GetRoomDoc, variables, { requestPolicy: 'network-only' })
            .toPromise()
            .then(result => {
            if (result.data != null) {
                return Result.ok(result.data);
            }
            return Result.error(result.error);
        }),
        operateRoomMutation: variables => client
            .mutation(OperateRoomDoc, variables)
            .toPromise()
            .then(result => {
            if (result.data != null) {
                return Result.ok(result.data);
            }
            return Result.error(result.error);
        }),
        updateWritingMessagesStatusMutation: variables => client
            .mutation(UpdateWritingMessageStatusDoc, variables)
            .toPromise()
            .then(result => {
            if (result.data != null) {
                return Result.ok(result.data);
            }
            return Result.error(result.error);
        }),
        roomEventSubscription: variables => {
            // 当初は、client.subscription() の戻り値を wonka の toObservable で wonka の Observable に変換して、それを RxJS の Observable に変換していた。
            // だがこの方法だと unsubscribe が効かないという問題が発生したため、toObservable を使わずに実装している。
            const observable = new Observable(observer => {
                const subscription = pipe(client.subscription(RoomEventDoc, variables), subscribe(value => {
                    if (value.data != null) {
                        observer.next(Result.ok(value.data));
                        return;
                    }
                    observer.next(Result.error(value.error));
                }));
                return subscription;
            });
            return observable.pipe(share());
        },
    };
};

export { createGraphQLClientForRoomClient, createUrqlClient };
//# sourceMappingURL=index.js.map
