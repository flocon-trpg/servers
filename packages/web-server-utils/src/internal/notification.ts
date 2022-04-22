export const success = 'success';
export const info = 'info';
export const warning = 'warning';
export const error = 'error';

export type Notification = {
    type: typeof success | typeof info | typeof warning | typeof error;
    message: string;
    description?: string;
    createdAt: number;
};
