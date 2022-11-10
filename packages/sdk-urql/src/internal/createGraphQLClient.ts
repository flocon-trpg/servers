import { GraphQLClient } from '@flocon-trpg/sdk';
import {
    GetMessagesDocument,
    GetRoomConnectionsDocument,
    GetRoomDocument,
    OperateDocument,
    RoomEventDocument,
    RoomEventSubscription,
    UpdateWritingMessageStatusDocument,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import { Result } from '@kizahasi/result';
import { Observable } from 'rxjs';
import { Client, CombinedError } from 'urql';
import { toObservable } from 'wonka';

export const createGraphQLClientForRoomClient = (client: Client): GraphQLClient<CombinedError> => {
    return {
        getMessagesQuery: variables =>
            client
                .query(GetMessagesDocument, variables, { requestPolicy: 'network-only' })
                .toPromise()
                .then(result => {
                    if (result.data != null) {
                        return Result.ok(result.data);
                    }
                    return Result.error(result.error!);
                }),
        getRoomConnectionsQuery: variables =>
            client
                .query(GetRoomConnectionsDocument, variables, {
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
                .query(GetRoomDocument, variables, { requestPolicy: 'network-only' })
                .toPromise()
                .then(result => {
                    if (result.data != null) {
                        return Result.ok(result.data);
                    }
                    return Result.error(result.error!);
                }),
        operateMutation: variables =>
            client
                .mutation(OperateDocument, variables)
                .toPromise()
                .then(result => {
                    if (result.data != null) {
                        return Result.ok(result.data);
                    }
                    return Result.error(result.error!);
                }),
        updateWritingMessagesStatusMutation: variables =>
            client
                .mutation(UpdateWritingMessageStatusDocument, variables)
                .toPromise()
                .then(result => {
                    if (result.data != null) {
                        return Result.ok(result.data);
                    }
                    return Result.error(result.error!);
                }),
        roomEventSubscription: variables => {
            const roomEventSubscriptionSource = client.subscription(RoomEventDocument, variables);
            const roomEventSubscriptionAsWonkaObservable = toObservable(
                roomEventSubscriptionSource
            );
            return new Observable<Result<RoomEventSubscription, CombinedError>>(observer => {
                return roomEventSubscriptionAsWonkaObservable.subscribe({
                    next: value => {
                        if (value.data != null) {
                            observer.next(Result.ok(value.data));
                            return;
                        }
                        observer.next(Result.error(value.error!));
                    },
                    error: e => observer.error(e),
                    complete: () => observer.complete(),
                });
            });
        },
    };
};
