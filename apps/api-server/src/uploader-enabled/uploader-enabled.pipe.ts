import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    OnModuleInit,
    PipeTransform,
} from '@nestjs/common';
import { EMBUPLOADER_PATH } from '../env';
import { ServerConfigService } from '../server-config/server-config.service';
import { AppConsole } from '../utils/appConsole';

@Injectable()
export class UploaderEnabledPipe implements PipeTransform, OnModuleInit {
    constructor(private readonly serverConfigService: ServerConfigService) {}

    onModuleInit() {
        const uploaderConfig = this.serverConfigService.getValueForce().uploader;
        if (uploaderConfig?.enabled !== true) {
            AppConsole.infoAsNotice({
                en: `The uploader of API server is disabled.`,
                ja: `APIサーバーのアップローダーは無効化されています。`,
            });
            return;
        }
        if (uploaderConfig.directory == null) {
            AppConsole.warn({
                en: `The uploader of API server is disabled because "${EMBUPLOADER_PATH}" is empty.`,
                ja: `"${EMBUPLOADER_PATH}"の値が空なので、APIサーバーのアップローダーは無効化されています。`,
            });
            return;
        }
        AppConsole.infoAsNotice({
            en: `The uploader of API server is enabled.`,
            ja: `APIサーバーのアップローダーは有効化されています。`,
        });
    }

    transform(value: unknown) {
        const uploaderConfig = this.serverConfigService.getValueForce().uploader;
        if (uploaderConfig?.enabled !== true) {
            throw new NotFoundException('Uploader is disabled by server config');
        }
        if (uploaderConfig.directory == null) {
            throw new InternalServerErrorException(
                'set serverConfig.uploader.directory to use uploader',
            );
        }
        return value;
    }
}
