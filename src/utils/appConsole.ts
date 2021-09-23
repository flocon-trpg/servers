export namespace AppConsole {
    export type Message = {
        icon?: string;
        en: string;
        ja?: string;
    };

    const messageToString = (source: Message): string => {
        const icon = source.icon == null ? '' : `${source.icon} `;
        if (source.ja == null) {
            return `${icon}${source.en}`;
        }
        return `${icon}${source.en} / ${icon}${source.ja}`;
    };

    export const log = (message: Message): void => {
        console.log(messageToString(message));
    };

    export const warn = (message: Message): void => {
        console.warn(messageToString(message));
    };

    export const error = (message: Message): void => {
        console.error(messageToString(message));
    };
}
