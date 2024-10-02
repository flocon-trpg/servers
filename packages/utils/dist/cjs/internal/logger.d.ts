import { Logger } from 'pino';
import { PinoLogLevel } from './parsePinoLogLevel';
interface LogFn {
    (obj: Error | Record<string, unknown>, msg: string): void;
    (msg: string): void;
}
type Type = {
    /** pino のインスタンスを get もしくは set できます。 */
    value: Logger;
    debug: LogFn;
    error: LogFn;
    fatal: LogFn;
    info: LogFn;
    infoAsNotice: (msg: string) => void;
    warn: LogFn;
    silent: LogFn;
    trace: LogFn;
};
export declare const createDefaultLogger: (args?: {
    logLevel?: PinoLogLevel;
    isBrowser?: boolean;
}) => Logger<{
    level: PinoLogLevel;
    browser: {};
}>;
/** pino のロガーを取得もしくは変更できます。 */
export declare const loggerRef: Type;
export {};
//# sourceMappingURL=logger.d.ts.map