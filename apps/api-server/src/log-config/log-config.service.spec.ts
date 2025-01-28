import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { LOG_FORMAT, LOG_LEVEL } from '../env';
import { LogConfigService } from './log-config.service';

const setup = async (envMock: Record<string, string>) => {
    const module: TestingModule = await Test.createTestingModule({
        imports: [ConfigModule.forRoot({ envFilePath: [], load: [() => envMock] })],
        providers: [LogConfigService],
    }).compile();

    return module.get(LogConfigService);
};

describe('LogConfigService', () => {
    it('tests empty LogConfig', async () => {
        const service = await setup({});
        const logConfig = service.getValueForce();
        expect(logConfig).toEqual({});
    });

    it.each(['json', 'Json', ' JSON  ', 'pino', 'PINO'])(
        'tests LOG_FORMAT=%s to be "json"',
        async logFormat => {
            const service = await setup({ [LOG_FORMAT]: logFormat });
            const logConfig = service.getValueForce();
            expect(logConfig.logFormat).toEqual('json');
            expect(logConfig.logLevel).toBeUndefined();
        },
    );

    it('tests LOG_FORMAT to be error', async () => {
        const service = await setup({ [LOG_FORMAT]: 'abcdef!' });
        const logConfigResult = service.getValue();
        expect(logConfigResult.isError).toBe(true);
    });

    it.each(['silent', 'trace', 'debug', 'info', 'warn', 'error', 'fatal'])(
        'tests LOG_LEVEL=%s',
        async logLevel => {
            const service = await setup({ [LOG_LEVEL]: logLevel });
            const logConfig = service.getValueForce();
            expect(logConfig.logFormat).toBeUndefined();
            expect(logConfig.logLevel).toEqual(logLevel);
        },
    );

    it('tests LOG_LEVEL to be trimmed and be lowercase', async () => {
        const service = await setup({ [LOG_LEVEL]: ' Silent  ' });
        const logConfig = service.getValueForce();
        expect(logConfig.logFormat).toBeUndefined();
        expect(logConfig.logLevel).toEqual('silent');
    });

    it('tests LOG_LEVEL to be error', async () => {
        const service = await setup({ [LOG_LEVEL]: 'abcdef!' });
        const logConfigResult = service.getValue();
        expect(logConfigResult.isError).toBe(true);
    });
});
