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
/** pino のロガーを取得もしくは変更できます。 */
export declare const loggerRef: Type;
export {};
//# sourceMappingURL=logger.d.ts.map