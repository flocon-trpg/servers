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

type PinoMethodName = 'debug' | 'error' | 'fatal' | 'info' | 'warn' | 'silent' | 'trace';

const printFn = (logger: Logger, methodName: PinoMethodName): LogFn => {
    function result(msg: string, ...args: readonly unknown[]): void;
    function result(
        obj: Error | Record<string, unknown>,
        msg?: string,
        ...args: readonly unknown[]
    ): void;
    function result(
        arg1: string | Error | Record<string, unknown>,
        ...arg2: readonly unknown[]
    ): void {
        if (typeof arg1 === 'string') {
            logger[methodName](arg1, ...arg2);
            return;
        }
        const [msg, ...args] = [...arg2];
        if (typeof msg !== 'string') {
            // TypeScript の型に従ってコードを書いている限り、ここには来ないはず。
            throw new Error(
                'When the first argument is an object, the second argument must be a string.',
            );
        }
        logger[methodName](arg1, msg, ...args);
    }

    return result;
};

// Promise の catch で受け取った値は型が不明なので、それをログに含めるときに便利な関数。
// もし msg を optional にすると、obj == null かつ msg === undefined のときに出力するエラーメッセージがないのと、msg を空にすることは通常はないので、msg は optional にしていない。printFn の msg のほうも optional でなくするのもいいかもしれない。
const autoDetectObjFn =
    (logger: Logger, methodName: PinoMethodName) =>
    (obj: unknown, msg: string, ...args: readonly unknown[]) => {
        if (obj instanceof Error) {
            printFn(logger, methodName)(obj, msg, ...args);
            return;
        }
        if (typeof obj === 'string') {
            if (msg == null) {
                printFn(logger, methodName)(obj, ...args);
                return;
            }
            printFn(logger, methodName)(`${msg} (Error: ${obj})`, ...args);
            return;
        }
        if (obj == null) {
            printFn(logger, methodName)(msg, ...args);
            return;
        }
        printFn(logger, methodName)(
            `${msg} (not supported obj type. typeof obj is ${typeof obj})`,
            ...args,
        );
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
export const loggerRef = {
    /** pino のインスタンスを get もしくは set できます。 */
    get value() {
        if (currentLogger == null) {
            currentLogger = createDefaultLogger();
        }
        return currentLogger;
    },
    /** pino のインスタンスを get もしくは set できます。 */
    set value(value: Logger) {
        currentLogger = value;
    },
    get debug() {
        return printFn(this.value, 'debug');
    },
    get error() {
        return printFn(this.value, 'error');
    },
    get fatal() {
        return printFn(this.value, 'fatal');
    },
    get info() {
        return printFn(this.value, 'info');
    },
    infoAsNotice(msg: string) {
        return this.info({ [notice]: true }, msg);
    },
    get warn() {
        return printFn(this.value, 'warn');
    },
    get silent() {
        return printFn(this.value, 'silent');
    },
    get trace() {
        return printFn(this.value, 'trace');
    },
    get autoDetectObj() {
        return {
            debug: autoDetectObjFn(this.value, 'debug'),
            error: autoDetectObjFn(this.value, 'error'),
            fatal: autoDetectObjFn(this.value, 'fatal'),
            info: autoDetectObjFn(this.value, 'info'),
            warn: autoDetectObjFn(this.value, 'warn'),
            silent: autoDetectObjFn(this.value, 'silent'),
            trace: autoDetectObjFn(this.value, 'trace'),
        };
    },
};
