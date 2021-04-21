import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import React from 'react';

export const text = 'text';
export const graphQLErrors = 'graphQLErrors';
export const apolloError = 'apolloError';

export type TextNotification = {
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
    description?: string;
    createdAt: number;
}

// systemMessageなどとマージするので、createdAtの型はそれに合わせてnumberにしている。
export type Notification = {
    type: typeof text;
    notification: TextNotification;
} | {
    type: typeof graphQLErrors;
    errors: ReadonlyArray<GraphQLError>;
    createdAt: number;
} | {
    type: typeof apolloError;
    error: ApolloError;
    createdAt: number;
}

export const toTextNotification = (source: Notification): TextNotification => {
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

export type TextNotificationsState = {
    readonly values: ReadonlyArray<TextNotification>;
    readonly newValue: TextNotification | null;
}

const LogNotificationContext = React.createContext<(notification: Notification) => void>(() => { throw 'LogNotificationContext is empty'; });
export default LogNotificationContext;