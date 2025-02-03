import { loggerRef } from '@flocon-trpg/utils';
import { Injectable, LoggerService, Logger as NestJsLogger } from '@nestjs/common';
import { Logger, PinoLogger } from 'nestjs-pino';
import pino from 'pino';
import { LogConfigService } from '../log-config/log-config.service';

const internalLogger = new NestJsLogger('FloconLoggerService');

@Injectable()
export class FloconLoggerService {
    #logger: LoggerService;

    public constructor(private readonly logConfigService: LogConfigService) {
        const logConfigResult = this.logConfigService.getValue();
        if (logConfigResult.isError) {
            internalLogger.warn(logConfigResult.error);
            this.#logger = new NestJsLogger();
            return;
        }
        const logConfig = logConfigResult.value;
        if (logConfig.logFormat === 'json') {
            const pinoHttp = pino({ level: logConfig.logLevel ?? 'info' });
            const pinoLogger = new PinoLogger({ pinoHttp });
            loggerRef.value = pinoHttp;
            this.#logger = new Logger(pinoLogger, {});
            return;
        }
        this.#logger = new NestJsLogger();
    }

    getLogger(): LoggerService {
        return this.#logger;
    }
}
