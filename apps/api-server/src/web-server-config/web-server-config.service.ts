import { parseStringToBoolean, parseStringToBooleanError } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReadonlyDeep } from 'type-fest';
import { parseErrorFromBoolean } from '../config/parseErrorFromBoolean';
import { ENABLE_WEB_SERVER_EXPERIMENTAL, SKIP_BUILD_WEB_SERVER_EXPERIMENTAL } from '../env';

export type WritableWebServerConfig = {
    enableWebServerExperimental: boolean;
    skipBuildWebServerExperimental: boolean;
};

export type WebServerConfig = ReadonlyDeep<WritableWebServerConfig>;

class WebServerConfigParser {
    public readonly [ENABLE_WEB_SERVER_EXPERIMENTAL]: Result<boolean, undefined> | undefined;
    public readonly [SKIP_BUILD_WEB_SERVER_EXPERIMENTAL]: Result<boolean, undefined> | undefined;

    public constructor(getValue: (key: string) => string | undefined) {
        const booleanProps = [
            ENABLE_WEB_SERVER_EXPERIMENTAL,
            SKIP_BUILD_WEB_SERVER_EXPERIMENTAL,
        ] as const;
        for (const prop of booleanProps) {
            const value = getValue(prop);
            if (value == null) {
                this[prop] = undefined;
                continue;
            }
            const propValue = parseStringToBoolean(value);
            if (propValue.isError) {
                this[prop] = Result.error(undefined);
            } else {
                this[prop] = propValue;
            }
        }
    }

    public getValue(): Result<WebServerConfig> {
        if (this[ENABLE_WEB_SERVER_EXPERIMENTAL]?.isError === true) {
            return parseErrorFromBoolean(ENABLE_WEB_SERVER_EXPERIMENTAL);
        }
        if (this[SKIP_BUILD_WEB_SERVER_EXPERIMENTAL]?.isError === true) {
            return parseErrorFromBoolean(SKIP_BUILD_WEB_SERVER_EXPERIMENTAL);
        }
        return Result.ok({
            enableWebServerExperimental: this[ENABLE_WEB_SERVER_EXPERIMENTAL]?.value ?? false,
            skipBuildWebServerExperimental:
                this[SKIP_BUILD_WEB_SERVER_EXPERIMENTAL]?.value ?? false,
        });
    }
}

@Injectable()
export class WebServerConfigService {
    #webServerConfigParser: WebServerConfigParser;
    constructor(configService: ConfigService) {
        this.#webServerConfigParser = new WebServerConfigParser(key =>
            configService.get<string | undefined>(key),
        );
    }

    getValue() {
        return this.#webServerConfigParser.getValue();
    }

    getValueForce() {
        const result = this.getValue();
        if (result.isError) {
            throw new Error('webServerConfig has errors. ' + result.error);
        }
        return result.value;
    }
}
