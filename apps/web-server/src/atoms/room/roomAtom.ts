import { RoomEventSubscription } from '@flocon-trpg/typed-document-node-v0.7.1';
import { RoomState } from '../../hooks/useRoomState';
import { atom } from 'jotai';
import produce from 'immer';
import { Notification } from '@flocon-trpg/web-server-utils';
import { CombinedError } from '@urql/core';

export const text = 'text';
export const error = 'error';

// systemMessageなどとマージするので、createdAtの型はそれに合わせてnumberにしている。
export type NotificationPayload =
    | {
          type: typeof text;
          notification: Notification;
      }
    | {
          type: typeof error;
          error: CombinedError;
          createdAt: number;
      };

const toTextNotification = (source: NotificationPayload): Notification => {
    if (source.type === text) {
        return source.notification;
    }
    return {
        type: 'error',
        message: 'GraqhQL error',
        description: source.error.message,
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
