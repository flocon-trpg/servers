import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import execa from 'execa';
import { AppAsErrorModule, AppModule, AppWithWebServerModule } from './app.module';
import { FloconLoggerService } from './flocon-logger/flocon-logger.service';
import { PortConfigService } from './port-config/port-config.service';
import { PrepareAppModule } from './prepare-app/prepare-app.module';
import { SetupServerService } from './setup-server/setup-server.service';
import { AppConsole } from './utils/appConsole';
import { WebServerConfigService } from './web-server-config/web-server-config.service';

async function bootstrap() {
    const prepareAppModule = await NestFactory.create(PrepareAppModule, { logger: false });
    const portConfig = prepareAppModule.get(PortConfigService).getValueForce();

    try {
        const logger = prepareAppModule.get(FloconLoggerService).getLogger();
        const webServerConfig = prepareAppModule.get(WebServerConfigService).getValueForce();

        if (webServerConfig.enableWebServerExperimental) {
            AppConsole.infoAsNotice({
                ja: '同梱Webサーバーが有効化されています。',
                en: 'The bundled web server is enabled.',
            });
            if (webServerConfig.skipBuildWebServerExperimental) {
                AppConsole.infoAsNotice({
                    ja: '同梱Webサーバーのビルドをスキップします。',
                    en: 'Skip building the bundled web server.',
                });
            } else {
                AppConsole.infoAsNotice({
                    ja: '同梱Webサーバーのビルドを開始します。これには時間がかかる場合があります。',
                    en: 'Start building the bundled web server. This may take some time.',
                });
                const buildResult = await execa(`yarn run build-web-server`);
                if (buildResult.failed) {
                    AppConsole.fatal({
                        ja: '同梱Webサーバーのビルドに失敗しました。Webサーバーに依存するパッケージがビルドされていない可能性があります。それが原因である場合は、web-server ディレクトリで `yarn build:deps` もしくは `yarn build` を実行することで解決できます。',
                        en: 'Failed to build the bundled web server. It is likely that the packages that depend on the web server are not built. If so, you can resolve it by running `yarn build:deps` or `yarn build` in the web-server directory.',
                    });
                    throw new Error();
                }
                AppConsole.infoAsNotice({
                    ja: '同梱Webサーバーのビルドが完了しました。',
                    en: 'The bundled web server has been built.',
                });
            }
        }
        const app = webServerConfig.enableWebServerExperimental
            ? await NestFactory.create(AppWithWebServerModule, { logger })
            : await NestFactory.create(AppModule, { logger });
        const setupServerService = app.get(SetupServerService);
        const setupResult = await setupServerService.setup();
        if (setupResult.isError) {
            Logger.fatal(setupResult.error);
            throw new Error();
        }
        app.enableCors();
        await app.listen(portConfig.port);
        AppConsole.infoAsNotice({
            en: `🚀 Server ready at http://localhost:${portConfig.port}`,
        });
    } catch {
        const app = await NestFactory.create(AppAsErrorModule);
        app.enableCors();
        await app.listen(portConfig.port);
        AppConsole.infoAsNotice({
            en: `⚠️ Server ready at http://localhost:${
                portConfig.port
            }, but not working. Please check the logs.`,
        });
    }
}
void bootstrap();
