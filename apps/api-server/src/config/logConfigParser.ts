import { parsePinoLogLevel } from '@flocon-trpg/utils';
import { Ok, Result } from '@kizahasi/result';
import { LevelWithSilent } from 'pino';
import { LOG_FORMAT, LOG_LEVEL } from '../env';
import { $default, LogConfig, LogFormat, json } from './types';

// 誤って source の型が Result<T, TError> になっているときに、型エラーを出すための関数。
const ensureOk = <T>(source: Ok<T> | undefined): T | undefined => {
    return source?.value;
};

/** `process.env` から、Flocon で利用される環境変数のうち、ログに関する値を取得してパースします。 */
export class LogConfigParser {
    public readonly [LOG_FORMAT]: Result<LogFormat> | undefined;
    public get logFormat() {
        return this[LOG_FORMAT];
    }

    public readonly [LOG_LEVEL]: Result<LevelWithSilent> | undefined;
    public get logLevel() {
        return this[LOG_LEVEL];
    }

    public constructor(env: typeof process.env) {
        this[LOG_FORMAT] = LogConfigParser.logFormat(env);
        this[LOG_LEVEL] = LogConfigParser.logLevel(env);
    }

    private static logFormat(env: typeof process.env): Result<LogFormat> | undefined {
        const logFormat = env[LOG_FORMAT];
        if (logFormat == null) {
            return undefined;
        }

        switch (logFormat.toLowerCase().trim()) {
            case 'json':
            case 'pino':
                return Result.ok(json);
            case 'default':
                return Result.ok($default);
        }

        return Result.error(`${LOG_FORMAT} is invalid. Supported values: "json", "default".`);
    }

    private static logLevel(env: typeof process.env): Result<LevelWithSilent> | undefined {
        const logLevel = env[LOG_LEVEL];
        if (logLevel == null) {
            return undefined;
        }

        return parsePinoLogLevel(logLevel, LOG_LEVEL);
    }

    private createLogConfig(): Result<LogConfig> {
        if (this.logFormat?.isError) {
            return this.logFormat;
        }
        if (this.logLevel?.isError) {
            return this.logLevel;
        }

        const result: LogConfig = {
            logFormat: ensureOk(this.logFormat),
            logLevel: ensureOk(this.logLevel),
        };
        return Result.ok(result);
    }

    private logConfigCache: Result<LogConfig> | undefined;
    public get logConfig() {
        if (this.logConfigCache == null) {
            this.logConfigCache = this.createLogConfig();
        }
        return this.logConfigCache;
    }
}
