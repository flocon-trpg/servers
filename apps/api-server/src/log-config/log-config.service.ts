import { parsePinoLogLevel } from '@flocon-trpg/utils';
import { Ok, Result } from '@kizahasi/result';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LevelWithSilent } from 'pino';
import { ReadonlyDeep } from 'type-fest';
import { LOG_FORMAT, LOG_LEVEL } from '../env';

export const json = 'json';
export const $default = 'default';
export type LogFormat = typeof json | typeof $default;

export type WritableLogConfig = {
    logFormat: LogFormat | undefined;
    logLevel: LevelWithSilent | undefined;
};

export type LogConfig = ReadonlyDeep<WritableLogConfig>;

// 誤って source の型が Result<T, TError> になっているときに、型エラーを出すための関数。
const ensureOk = <T>(source: Ok<T> | undefined): T | undefined => {
    return source?.value;
};

/** `process.env` から、Flocon で利用される環境変数のうち、ログに関する値を取得してパースします。 */
class LogConfigParser {
    public readonly [LOG_FORMAT]: Result<LogFormat> | undefined;
    public get logFormat() {
        return this[LOG_FORMAT];
    }

    public readonly [LOG_LEVEL]: Result<LevelWithSilent> | undefined;
    public get logLevel() {
        return this[LOG_LEVEL];
    }

    public constructor(getValue: (key: string) => string | undefined) {
        this[LOG_FORMAT] = LogConfigParser.logFormat(getValue);
        this[LOG_LEVEL] = LogConfigParser.logLevel(getValue);
    }

    private static logFormat(
        getValue: (key: string) => string | undefined,
    ): Result<LogFormat> | undefined {
        const logFormat = getValue(LOG_FORMAT);
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

    private static logLevel(
        getValue: (key: string) => string | undefined,
    ): Result<LevelWithSilent> | undefined {
        const logLevel = getValue(LOG_LEVEL);
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

@Injectable()
export class LogConfigService {
    #logConfigParser: LogConfigParser;
    constructor(configService: ConfigService) {
        this.#logConfigParser = new LogConfigParser(key =>
            configService.get<string | undefined>(key),
        );
    }

    getValue() {
        return this.#logConfigParser.logConfig;
    }

    getValueForce() {
        const result = this.getValue();
        if (result.isError) {
            throw new Error('logConfig has errors. ' + result.error);
        }
        return result.value;
    }
}
