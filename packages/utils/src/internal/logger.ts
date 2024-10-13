import { notice } from '@flocon-trpg/logger-base';
import { isBrowser } from 'browser-or-node';
import pino, { Logger } from 'pino';
import { PinoLogLevel } from './parsePinoLogLevel';

const defaultLogLevel = 'info';

// pino の関数は any や可変パラメーターが多く引数のミスが起こりやすいので、型を変更したり制限をかけている。
interface LogFn {
    (msg: string, ...args: readonly unknown[]): void;
    (obj: Error | Record<string, unknown>, msg?: string, ...args: readonly unknown[]): void;
}

const toLogFn = (
    logger: Logger,
    pinoLevel: 'debug' | 'error' | 'fatal' | 'info' | 'warn' | 'silent' | 'trace',
): LogFn => {
    function print(msg: string, ...args: readonly unknown[]): void;
    function print(
        obj: Error | Record<string, unknown>,
        msg?: string,
        ...args: readonly unknown[]
    ): void;
    function print(
        arg1: string | Error | Record<string, unknown>,
        ...arg2: readonly unknown[]
    ): void {
        if (typeof arg1 === 'string') {
            logger[pinoLevel](arg1, ...arg2);
            return;
        }
        const [msg, ...args] = [...arg2];
        if (typeof msg !== 'string') {
            // TypeScript の型に従ってコードを書いている限り、ここには来ないはず。
            throw new Error(
                'When the first argument is an object, the second argument must be a string.',
            );
        }
        logger[pinoLevel](arg1, msg, ...args);
    }

    return print;
};

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

export const createDefaultLogger = (args?: { logLevel?: PinoLogLevel; isBrowser?: boolean }) => {
    return (args?.isBrowser ?? isBrowser)
        ? pino({ level: args?.logLevel ?? defaultLogLevel, browser: {} })
        : pino({
              level: args?.logLevel ?? defaultLogLevel,
              transport: { target: '@flocon-trpg/default-pino-transport' },
          });
};

let currentLogger: Logger | null = null;

/** pino のロガーを取得もしくは変更できます。 */
export const loggerRef: Type = {
    get value() {
        if (currentLogger == null) {
            currentLogger = createDefaultLogger();
        }
        return currentLogger;
    },
    set value(value: Logger) {
        currentLogger = value;
    },
    get debug() {
        return toLogFn(this.value, 'debug');
    },
    get error() {
        return toLogFn(this.value, 'error');
    },
    get fatal() {
        return toLogFn(this.value, 'fatal');
    },
    get info() {
        return toLogFn(this.value, 'info');
    },
    infoAsNotice(msg) {
        return this.info({ [notice]: true }, msg);
    },
    get warn() {
        return toLogFn(this.value, 'warn');
    },
    get silent() {
        return toLogFn(this.value, 'silent');
    },
    get trace() {
        return toLogFn(this.value, 'trace');
    },
};
