import { Result } from '@kizahasi/result';
import { LogConfigParser } from '../src/config/logConfigParser';
import { WritableLogConfig } from '../src/config/types';

const defaultLogConfig: WritableLogConfig = {
    logFormat: undefined,
    logLevel: undefined,
};

describe('logConfigParser', () => {
    it('tests empty logConfig', () => {
        const actual = new LogConfigParser({});
        expect(actual.logConfig).toEqual(Result.ok(defaultLogConfig));
    });

    it.each(['json', 'Json', ' JSON  ', 'pino', 'PINO'])(
        'tests LOG_FORMAT=%s to be "json"',
        LOG_FORMAT => {
            const actual = new LogConfigParser({ LOG_FORMAT });
            expect(actual.logConfig).toEqual(Result.ok({ ...defaultLogConfig, logFormat: 'json' }));
        }
    );

    it('tests LOG_FORMAT to be error', () => {
        const actual = new LogConfigParser({ LOG_FORMAT: 'abcdef!' });
        expect(actual.logConfig.error).toBeTruthy();
    });

    it.each(['silent', 'trace', 'debug', 'info', 'notice', 'warn', 'error', 'fatal'])(
        'tests LOG_LEVEL=%s',
        LOG_LEVEL => {
            const actual = new LogConfigParser({ LOG_LEVEL });
            expect(actual.logConfig).toEqual(
                Result.ok({ ...defaultLogConfig, logLevel: LOG_LEVEL })
            );
        }
    );

    it('tests LOG_LEVEL=" Silent  " to be "silent"', () => {
        const actual = new LogConfigParser({ LOG_LEVEL: ' Silent  ' });
        expect(actual.logConfig).toEqual(Result.ok({ ...defaultLogConfig, logLevel: 'silent' }));
    });

    it('tests LOG_LEVEL to be error', () => {
        const actual = new LogConfigParser({ LOG_LEVEL: 'abcdef!' });
        expect(actual.logConfig.error).toBeTruthy();
    });
});
