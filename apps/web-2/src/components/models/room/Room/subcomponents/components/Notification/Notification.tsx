import { Tooltip } from 'antd';
import React from 'react';
import { CombinedError } from 'urql';

export const success = 'success';
export const info = 'info';
export const warning = 'warning';
export const error = 'error';

export type NotificationType<TError> = {
    type: typeof success | typeof info | typeof warning | typeof error;
    message: string;
    error?: TError;
    description?: string;
};

export const NotificationMain: React.FC<{ notification: NotificationType<CombinedError> }> = ({
    notification,
}) => {
    if (notification.error == null) {
        return <div>{notification.message}</div>;
    }
    return <Tooltip title={notification.error.message}>{notification.message}</Tooltip>;
};
