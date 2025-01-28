import { Test, TestingModule } from '@nestjs/testing';
import { LogConfigService } from '../log-config/log-config.service';
import { FloconLoggerService } from './flocon-logger.service';

describe('FloconLoggerService', () => {
    let service: FloconLoggerService;

    beforeEach(async () => {
        const logConfigServiceMock: Pick<LogConfigService, 'getValue' | 'getValueForce'> = {
            getValue: jest.fn(() => ({
                isError: false,
                value: {
                    logFormat: 'json',
                    logLevel: 'info',
                },
                error: undefined,
            })),
            getValueForce: jest.fn(() => ({
                logFormat: 'json',
                logLevel: 'info',
            })),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [LogConfigService, FloconLoggerService],
        })
            .overrideProvider(LogConfigService)
            .useValue(logConfigServiceMock)
            .compile();

        service = module.get<FloconLoggerService>(FloconLoggerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
