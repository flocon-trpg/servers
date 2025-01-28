import { Logger } from 'pino';
import { PinoLogLevel } from './parsePinoLogLevel';
interface LogFn {
    (msg: string, ...args: readonly unknown[]): void;
    (obj: Error | Record<string, unknown>, msg: string, ...args: readonly unknown[]): void;
}
export declare const createDefaultLogger: (args?: {
    logLevel?: PinoLogLevel;
    isBrowser?: boolean;
}) => Logger<never, boolean>;
/** pino のロガーを取得もしくは変更できます。 */
export declare const loggerRef: {
    /** pino のインスタンスを get もしくは set できます。 */
    value: Logger;
    readonly debug: LogFn;
    readonly error: LogFn;
    readonly fatal: LogFn;
    readonly info: LogFn;
    infoAsNotice(msg: string): void;
    readonly warn: LogFn;
    readonly silent: LogFn;
    readonly trace: LogFn;
    readonly autoDetectObj: {
        debug: (obj: unknown, msg: string, ...args: readonly unknown[]) => void;
        error: (obj: unknown, msg: string, ...args: readonly unknown[]) => void;
        fatal: (obj: unknown, msg: string, ...args: readonly unknown[]) => void;
        info: (obj: unknown, msg: string, ...args: readonly unknown[]) => void;
        warn: (obj: unknown, msg: string, ...args: readonly unknown[]) => void;
        silent: (obj: unknown, msg: string, ...args: readonly unknown[]) => void;
        trace: (obj: unknown, msg: string, ...args: readonly unknown[]) => void;
    };
};
export {};
//# sourceMappingURL=logger.d.ts.map