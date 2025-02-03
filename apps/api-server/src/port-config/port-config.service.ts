import { filterInt } from '@flocon-trpg/utils';
import { Ok, Result } from '@kizahasi/result';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReadonlyDeep } from 'type-fest';
import { parseErrorFromInteger } from '../config/parseErrorFromInteger';
import { PORT } from '../env';

export type WritablePortConfig = {
    port: number;
};

export type PortConfig = ReadonlyDeep<WritablePortConfig>;

// 誤って source の型が Result<T, TError> になっているときに、型エラーを出すための関数。
const ensureOk = <T>(source: Ok<T> | undefined): T | undefined => {
    return source?.value;
};

class PortConfigParser {
    public readonly [PORT]: Result<number, undefined> | undefined;
    public get port() {
        return this[PORT];
    }

    public constructor(getValue: (key: string) => string | undefined) {
        const intProps = [PORT] as const;
        for (const prop of intProps) {
            const value = getValue(prop);
            if (value == null) {
                this[prop] = undefined;
                continue;
            }
            const intValue = filterInt(value.trim());
            if (intValue == null) {
                this[prop] = Result.error(undefined);
            } else {
                this[prop] = Result.ok(intValue);
            }
        }
    }

    private createPortConfig(): Result<PortConfig> {
        if (this.port?.isError) {
            return parseErrorFromInteger(PORT);
        }

        const result: PortConfig = {
            // port のデフォルト値が 4000 なのは過去の Flocon の仕様に合わせているため
            port: ensureOk(this.port) ?? 4000,
        };
        return Result.ok(result);
    }

    private portConfigCache: Result<PortConfig> | undefined;
    public get portConfig() {
        if (this.portConfigCache == null) {
            this.portConfigCache = this.createPortConfig();
        }
        return this.portConfigCache;
    }
}

@Injectable()
export class PortConfigService {
    #portConfigParser: PortConfigParser;
    constructor(configService: ConfigService) {
        this.#portConfigParser = new PortConfigParser(key =>
            configService.get<string | undefined>(key),
        );
    }

    getValue() {
        return this.#portConfigParser.portConfig;
    }

    getValueForce() {
        const result = this.getValue();
        if (result.isError) {
            throw new Error('portConfig has errors. ' + result.error);
        }
        return result.value;
    }
}
