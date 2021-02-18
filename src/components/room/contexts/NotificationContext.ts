import { GraphQLError } from 'graphql';
import React from 'react';
import * as Room from '../../../stateManagers/states/room';

export const text = 'text';
export const apolloErrors = 'apolloErrors';

export type TextNotification = {
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
    description?: string;
    createdAt: number;
}

export type Notification = {
    type: typeof text;
    notification: TextNotification;
} | {
    type: typeof apolloErrors;
    errors: ReadonlyArray<GraphQLError>;
    createdAt: number;
}

export const toTextNotification = (source: Notification): TextNotification => {
    if (source.type === text) {
        return source.notification;
    }
    const firstError = source.errors[0];
    return {
        type: 'error',
        message: 'Apollo error',
        description: firstError == null ? undefined : firstError.message,
        createdAt: source.createdAt,
    };
};

const NotificationContext = React.createContext<(notification: Notification) => void>(() => { throw 'NotificationContext is empty'; });
export default NotificationContext;