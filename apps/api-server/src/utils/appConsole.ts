import { logger } from '../logger';

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
        consoleMethodName: 'info' | 'notice' | 'warn' | 'error' | 'fatal',
        message: Message
    ): void => {
        const messageStr = messageToString(message);
        if (message.errorObject == null) {
            logger[consoleMethodName](messageStr);
        } else {
            logger[consoleMethodName](message.errorObject, messageStr);
        }
    };

    export const info = (message: Message): void => {
        logCore('info', message);
    };

    export const notice = (message: Message): void => {
        logCore('notice', message);
    };

    export const noticeJa = (message: string): void => {
        logger.notice(message);
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
