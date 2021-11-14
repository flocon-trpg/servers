import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { RoomEventSubscription } from '@flocon-trpg/typed-document-node';
import { AllRoomMessagesResult } from '../../hooks/useRoomMessages';
import { RoomState } from '../../hooks/useRoomState';
import { atom } from 'jotai';
import produce from 'immer';

export namespace Notification {
    export const text = 'text';
    export const graphQLErrors = 'graphQLErrors';
    export const apolloError = 'apolloError';

    export type StateElement = {
        type: 'success' | 'info' | 'warning' | 'error';
        message: string;
        description?: string;
        createdAt: number;
    };

    // systemMessageなどとマージするので、createdAtの型はそれに合わせてnumberにしている。
    export type Payload =
        | {
              type: typeof text;
              notification: StateElement;
          }
        | {
              type: typeof graphQLErrors;
              errors: ReadonlyArray<GraphQLError>;
              createdAt: number;
          }
        | {
              type: typeof apolloError;
              error: ApolloError;
              createdAt: number;
          };

    export const toTextNotification = (source: Payload): StateElement => {
        if (source.type === text) {
            return source.notification;
        }
        if (source.type === apolloError) {
            return {
                type: 'error',
                message: 'Apollo error',
                description: source.error.message,
                createdAt: source.createdAt,
            };
        }
        const firstError = source.errors[0];
        return {
            type: 'error',
            message: 'GraqhQL error',
            description: firstError == null ? undefined : firstError.message,
            createdAt: source.createdAt,
        };
    };

    export type State = {
        readonly values: ReadonlyArray<StateElement>;
        readonly newValue: StateElement | null;
    };

    export const initialState: State = { values: [], newValue: null };
}

export type RoomAtomValue = {
    roomId?: string;
    roomState?: RoomState;
    roomEventSubscription?: RoomEventSubscription;
    allRoomMessagesResult?: AllRoomMessagesResult;
    notifications: Notification.State;
};

const initialValue: RoomAtomValue = {
    notifications: Notification.initialState,
};

export const roomAtom = atom(initialValue);

export const roomNotificationsAtom = atom(
    get => get(roomAtom).notifications,
    (get, set, payload: Notification.Payload) => {
        set(roomAtom, roomState =>
            produce(roomState, roomState => {
                if (roomState.notifications.newValue != null) {
                    roomState.notifications.values.push(roomState.notifications.newValue);
                }
                roomState.notifications.newValue = Notification.toTextNotification(payload);
            })
        );
    }
);
