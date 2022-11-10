import {
    GetRoomMessagesFailureType,
    RoomEventSubscription,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import { CustomMessage, RoomMessagesClient } from '@flocon-trpg/web-server-utils';
import { Observable } from 'rxjs';
import { BehaviorEvent } from '../rxjs/behaviorEvent';
import { ReadonlyBehaviorEvent } from '../rxjs/readonlyBehaviorEvent';
import { GraphQLClientWithStatus, PromiseError } from './graphqlClient';

const success = 'success';
const fetching = 'fetching';
const error = 'error';

export type GetMessagesQueryStatus<TGraphQLError> =
    | { type: typeof fetching }
    | {
          type: typeof success;
      }
    | {
          type: typeof error;
          error:
              | {
                    type: 'GraphQLError';
                    error: PromiseError<TGraphQLError>;
                }
              | {
                    type: 'GetRoomMessagesFailureResult';
                    failureType: GetRoomMessagesFailureType;
                };
      };

export const createRoomMessagesClient = <TCustomMessage, TGraphQLError>({
    client,
    roomEventSubscription,
}: {
    client: Pick<GraphQLClientWithStatus<TGraphQLError>, 'getMessagesQuery'>;
    roomEventSubscription: Observable<
        NonNullable<NonNullable<RoomEventSubscription['roomEvent']>['roomMessageEvent']>
    >;
}) => {
    const roomMessagesClient = new RoomMessagesClient<TCustomMessage>();
    const writableQueryStatus = new BehaviorEvent<GetMessagesQueryStatus<TGraphQLError>>({
        type: fetching,
    });

    const executeQuery = () => {
        const setQueryStatus = (newValue: GetMessagesQueryStatus<TGraphQLError>) => {
            if (writableQueryStatus.getValue().type === error) {
                return;
            }
            writableQueryStatus.next(newValue);
        };
        client.getMessagesQuery().then(result => {
            if (result.isError) {
                setQueryStatus({
                    type: error,
                    error: { type: 'GraphQLError', error: result.error },
                });
                return;
            }
            if (result.value.result.__typename !== 'RoomMessages') {
                result.value.result.failureType;
                setQueryStatus({
                    type: error,
                    error: {
                        type: 'GetRoomMessagesFailureResult',
                        failureType: result.value.result.failureType,
                    },
                });
                return;
            }
            roomMessagesClient.onQuery(result.value.result);
            setQueryStatus({ type: success });
        });
    };

    const subscriptionSubscription = roomEventSubscription.subscribe({
        next: roomMessageEvent => {
            roomMessagesClient.onEvent(roomMessageEvent);
        },
    });
    let isUnsubscribed = false;
    return {
        value: {
            messages: roomMessagesClient.messages,
            queryStatus: new ReadonlyBehaviorEvent(writableQueryStatus),
            addCustomMessage: (message: CustomMessage<TCustomMessage>) =>
                roomMessagesClient.addCustomMessage(message),
        },
        // RoomState が joined になってから Query を実行させたいので、executeQuery が実行されるまで Query は実行されないようにしている。
        executeQuery,
        unsubscribe: () => {
            subscriptionSubscription.unsubscribe();
            isUnsubscribed = true;
        },
        isUnsubscribed,
    };
};
