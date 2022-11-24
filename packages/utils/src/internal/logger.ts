import { isBrowser } from 'browser-or-node';
import pino from 'pino';

const defaultLogLevel = 'info';

// pino の関数は any や可変パラメーターが多く引数のミスが起こりやすいので、型を狭めている。
// この型では printf-style placeholder が使えないが、使う場面は今のところないので問題なし。
interface LogFn {
    (obj: Error | Record<string, unknown>, msg: string): void;
    (msg: string): void;
}

export type LoggerType = {
    debug: LogFn;
    error: LogFn;
    fatal: LogFn;
    info: LogFn;
    warn: LogFn;
    silent: LogFn;
    trace: LogFn;
};

type Type = {
    value: LoggerType;
};

// ブラウザの場合はほぼ変更なし（ログレベルを変更するくらい）でも構わない。
// ブラウザ以外の場合は、このままだと JSON がそのまま出力されて見づらいので、pino-pretty などを使わない場合は変更するほうがいいかも。
/** pino のロガーを取得もしくは変更できます。 */
export const loggerRef: Type = {
    value: isBrowser
        ? pino({ level: defaultLogLevel, browser: {} })
        : pino({ level: defaultLogLevel }),
};
