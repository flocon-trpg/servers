import { loggerRef } from '@flocon-trpg/utils';

export namespace AppConsole {
    export type Message = {
        icon?: string;
        en: string;
        ja?: string;
        errorObject?: Error;
    };

    export const messageToString = (source: Message): string => {
        const icon = source.icon == null ? '' : `${source.icon} `;
        if (source.ja == null) {
            return `${icon}${source.en}`;
        }
        return `${icon}${source.en} / ${icon}${source.ja}`;
    };

    const logCore = (
        consoleMethodName: 'info' | 'warn' | 'error' | 'fatal',
        message: Message
    ): void => {
        const messageStr = messageToString(message);
        if (message.errorObject == null) {
            loggerRef[consoleMethodName](messageStr);
        } else {
            loggerRef[consoleMethodName](message.errorObject, messageStr);
        }
    };

    export const info = (message: Message): void => {
        logCore('info', message);
    };

    export const infoAsNotice = (message: Omit<Message, 'errorObject'>): void => {
        loggerRef.infoAsNotice(messageToString(message));
    };

    export const infoAsNoticeJa = (message: string): void => {
        loggerRef.infoAsNotice(message);
    };

    export const warn = (message: Message): void => {
        logCore('warn', message);
    };

    export const error = (message: Message): void => {
        logCore('error', message);
    };

    export const fatal = (message: Message): void => {
        logCore('fatal', message);
    };
}
