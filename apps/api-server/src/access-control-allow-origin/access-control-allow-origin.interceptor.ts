import { Injectable } from '@nestjs/common';
import { HeadersInterceptorBase } from '../headers/headers.interceptor';
import { ServerConfigService } from '../server-config/server-config.service';
import { AppConsole } from '../utils/appConsole';

@Injectable()
export class AccessControlAllowOriginInterceptor extends HeadersInterceptorBase {
    #headerValue: string | undefined;
    public constructor(private readonly serverConfigService: ServerConfigService) {
        super();

        this.#headerValue = this.serverConfigService.getValueForce().accessControlAllowOrigin;
        if (this.#headerValue == null) {
            AppConsole.infoAsNotice({
                en: '"accessControlAllowOrigin" config was not found. "Access-Control-Allow-Origin" header will be empty.',
                ja: '"accessControlAllowOrigin" のコンフィグが見つかりませんでした。"Access-Control-Allow-Origin" ヘッダーは空になります。',
            });
        } else {
            AppConsole.infoAsNotice({
                en: `"accessControlAllowOrigin" config was found. "Access-Control-Allow-Origin" header will be "${this.#headerValue}".`,
                ja: `"accessControlAllowOrigin" のコンフィグが見つかりました。"Access-Control-Allow-Origin" ヘッダーは "${this.#headerValue}" になります。`,
            });
        }
    }

    get headers(): { [key: string]: string } {
        if (this.#headerValue == null) {
            return {};
        }
        return { 'Access-Control-Allow-Origin': this.#headerValue };
    }
}
