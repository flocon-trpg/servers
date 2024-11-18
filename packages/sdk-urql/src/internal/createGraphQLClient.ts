import {
    GetMessagesDoc,
    GetRoomConnectionsDoc,
    GetRoomDoc,
    OperateDoc,
    RoomEventDoc,
    UpdateWritingMessageStatusDoc,
} from '@flocon-trpg/graphql-documents';
import { GraphQLClient } from '@flocon-trpg/sdk';
import { ResultOf } from '@graphql-typed-document-node/core';
import { Result } from '@kizahasi/result';
import { Observable, share } from 'rxjs';
import { Client, CombinedError } from 'urql';
import { pipe, subscribe } from 'wonka';

export const createGraphQLClientForRoomClient = (client: Client): GraphQLClient<CombinedError> => {
    return {
        getMessagesQuery: variables =>
            client
                .query(GetMessagesDoc, variables, { requestPolicy: 'network-only' })
                .toPromise()
                .then(result => {
                    if (result.data != null) {
                        return Result.ok(result.data);
                    }
                    return Result.error(result.error!);
                }),
        getRoomConnectionsQuery: variables =>
            client
                .query(GetRoomConnectionsDoc, variables, {
                    requestPolicy: 'network-only',
                })
                .toPromise()
                .then(result => {
                    if (result.data != null) {
                        return Result.ok(result.data);
                    }
                    return Result.error(result.error!);
                }),
        getRoomQuery: variables =>
            client
                .query(GetRoomDoc, variables, { requestPolicy: 'network-only' })
                .toPromise()
                .then(result => {
                    if (result.data != null) {
                        return Result.ok(result.data);
                    }
                    return Result.error(result.error!);
                }),
        operateMutation: variables =>
            client
                .mutation(OperateDoc, variables)
                .toPromise()
                .then(result => {
                    if (result.data != null) {
                        return Result.ok(result.data);
                    }
                    return Result.error(result.error!);
                }),
        updateWritingMessagesStatusMutation: variables =>
            client
                .mutation(UpdateWritingMessageStatusDoc, variables)
                .toPromise()
                .then(result => {
                    if (result.data != null) {
                        return Result.ok(result.data);
                    }
                    return Result.error(result.error!);
                }),
        roomEventSubscription: variables => {
            // 当初は、client.subscription() の戻り値を wonka の toObservable で wonka の Observable に変換して、それを RxJS の Observable に変換していた。
            // だがこの方法だと unsubscribe が効かないという問題が発生したため、toObservable を使わずに実装している。

            const observable = new Observable<Result<ResultOf<typeof RoomEventDoc>, CombinedError>>(
                observer => {
                    const subscription = pipe(
                        client.subscription(RoomEventDoc, variables),
                        subscribe(value => {
                            if (value.data != null) {
                                observer.next(Result.ok(value.data));
                                return;
                            }
                            observer.next(Result.error(value.error!));
                        }),
                    );
                    return subscription;
                },
            );
            return observable.pipe(share());
        },
    };
};
