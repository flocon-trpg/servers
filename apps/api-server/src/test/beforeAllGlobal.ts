import { createDefaultLogger, loggerRef } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { pino } from 'pino';
import { LogConfig } from '../log-config/log-config.service';

let isLoggerInitialized = false;

/** loggerを準備します。この関数を実行せずにロギングが行われる場合、デフォルトのロガーが使われます。複数回実行するとwarnのログが出力されます。この関数はテスト向けです。通常の用途では FloconLoggerService を利用してください。 */
export const initializeLogger = (logConfigResult: Result<LogConfig>) => {
    if (isLoggerInitialized) {
        loggerRef.warn('initializeLogger has been called multiple times.');
    }

    if (logConfigResult.isError) {
        throw new Error(logConfigResult.error);
    }

    isLoggerInitialized = true;

    const logLevel = logConfigResult.value.logLevel ?? 'info';
    switch (logConfigResult.value.logFormat) {
        case 'json': {
            loggerRef.value = pino({ level: logLevel });
            break;
        }
        case 'default':
        case undefined: {
            loggerRef.value = createDefaultLogger({ logLevel });
            break;
        }
    }
};
// Loggerが必要なテストは import './beforeAllGlobal' としてloggerをinitializeする必要がある。

let isInitialized = false;

if (!isInitialized) {
    initializeLogger(Result.ok({ logFormat: 'json', logLevel: 'error' }));
    isInitialized = true;
}
