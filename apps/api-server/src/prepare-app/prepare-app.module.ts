import { Module } from '@nestjs/common';
import { createConfigModule } from '../config/createConfigModule';
import { FloconLoggerService } from '../flocon-logger/flocon-logger.service';
import { LogConfigService } from '../log-config/log-config.service';
import { PortConfigService } from '../port-config/port-config.service';
import { WebServerConfigService } from '../web-server-config/web-server-config.service';

@Module({
    imports: [createConfigModule()],
    providers: [LogConfigService, PortConfigService, FloconLoggerService, WebServerConfigService],
})
export class PrepareAppModule {}
