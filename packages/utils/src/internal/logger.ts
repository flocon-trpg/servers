import { notice } from '@flocon-trpg/default-pino-transport';
import { isBrowser } from 'browser-or-node';
import pino, { Logger } from 'pino';
import { PinoLogLevel } from './parsePinoLogLevel';

const defaultLogLevel = 'info';

// pino の関数は any や可変パラメーターが多く引数のミスが起こりやすいので、型を狭めている。
// この型では printf-style placeholder が使えないが、使う場面は今のところないので問題なし。
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

export const createDefaultLogger = (args?: { logLevel?: PinoLogLevel; isBrowser?: boolean }) => {
    return args?.isBrowser ?? isBrowser
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
        return this.value.debug.bind(this.value);
    },
    get error() {
        return this.value.error.bind(this.value);
    },
    get fatal() {
        return this.value.fatal.bind(this.value);
    },
    get info() {
        return this.value.info.bind(this.value);
    },
    infoAsNotice(msg) {
        return this.info({ [notice]: true }, msg);
    },
    get warn() {
        return this.value.warn.bind(this.value);
    },
    get silent() {
        return this.value.silent.bind(this.value);
    },
    get trace() {
        return this.value.trace.bind(this.value);
    },
};
