import { Result } from '@kizahasi/result';

export type PinoLogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';

export const parsePinoLogLevel = (source: string, envName: string): Result<PinoLogLevel> => {
    const value = source.toLowerCase().trim();
    switch (value) {
        case 'fatal':
        case 'error':
        case 'warn':
        case 'info':
        case 'debug':
        case 'trace':
        case 'silent': {
            return Result.ok(value);
        }
    }

    return Result.error(
        `${envName} value is invalid. Supported values: "fatal", "error", "warn", "info", "debug", "trace", "silent".`,
    );
};
