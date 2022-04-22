import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { RoomEventSubscription } from '@flocon-trpg/typed-document-node';
import { RoomState } from '../../hooks/useRoomState';
import { atom } from 'jotai';
import produce from 'immer';
import { MessagesChanged, Notification } from '@flocon-trpg/web-server-utils';

export const text = 'text';
export const graphQLErrors = 'graphQLErrors';
export const apolloError = 'apolloError';

// systemMessageなどとマージするので、createdAtの型はそれに合わせてnumberにしている。
export type NotificationPayload =
    | {
          type: typeof text;
          notification: Notification;
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

const toTextNotification = (source: NotificationPayload): Notification => {
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

export type Notifications = {
    readonly values: ReadonlyArray<Notification>;
    readonly newValue: Notification | null;
};

const initialNotifications: Notifications = { values: [], newValue: null };

type RoomAtomValue = {
    roomId?: string;
    roomState?: RoomState;
    roomEventSubscription?: RoomEventSubscription;
    notifications: Notifications;
};

const initialValue: RoomAtomValue = {
    notifications: initialNotifications,
};

export const roomAtom = atom(initialValue);

export const roomNotificationsAtom = atom(
    get => get(roomAtom).notifications,
    (get, set, payload: NotificationPayload) => {
        set(roomAtom, roomState =>
            produce(roomState, roomState => {
                if (roomState.notifications.newValue != null) {
                    roomState.notifications.values.push(roomState.notifications.newValue);
                }
                roomState.notifications.newValue = toTextNotification(payload);
            })
        );
    }
);
