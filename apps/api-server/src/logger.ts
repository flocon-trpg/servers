import { loggerRef } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { Logger, pino } from 'pino';
import { LogConfig } from './config/types';

export const notice = 'notice';

export type Pino = Logger;
const defaultTransport = './transport/defaultTransport.js';

// LOG_LEVELがパースできなかった場合などはinitializeLoggerが実行されていない状態でエラーを通知する必要がある。その際にuninitializedLoggerが使われる。
const createUninitializeLogger = () => {
    return pino({
        transport: { target: defaultTransport },
    });
};

let currentLogger: ReturnType<typeof createUninitializeLogger> | null = null;

/** `get()`を実行することでloggerを取得できます。 */
export const logger = {
    get() {
        if (currentLogger == null) {
            // テストでは ts-jest が使われるため、./transport/defaultTransport.js は存在しない。そのため、ここに来るとエラーになる。
            // テストの場合は事前に initializeLogger を実行しておく必要がある。
            currentLogger = createUninitializeLogger();
            loggerRef.value = currentLogger;
        }
        return currentLogger;
    },
    /** `get().trace` と同じです。 */
    get trace() {
        const logger = this.get();
        return logger.trace.bind(logger);
    },
    /** `get().debug` と同じです。 */
    get debug() {
        const logger = this.get();
        return logger.debug.bind(logger);
    },
    /** `get().info` と同じです。 */
    get info() {
        const logger = this.get();
        return logger.info.bind(logger);
    },
    /** ログレベルを info としてログを出力しますが、LOG_FORMAT が default などのときでも出力します。 */
    infoAsNotice(message: string) {
        const logger = this.get();
        return logger.info({ [notice]: true }, message);
    },
    /** `get().warn` と同じです。 */
    get warn() {
        const logger = this.get();
        return logger.warn.bind(logger);
    },
    /** `get().error` と同じです。 */
    get error() {
        const logger = this.get();
        return logger.error.bind(logger);
    },
    /** `get().fatal` と同じです。 */
    get fatal() {
        const logger = this.get();
        return logger.error.bind(logger);
    },
};

/** loggerを準備します。この関数を実行せずにロギングが行われる場合、デフォルトのロガーが使われます。複数回実行するとwarnのログが出力されます。 */
export const initializeLogger = (logConfigResult: Result<LogConfig>) => {
    if (currentLogger != null) {
        logger.warn('initializeLogger was called multiple times.');
    }

    if (logConfigResult.isError) {
        throw new Error(logConfigResult.error);
    }

    const logLevel = logConfigResult.value.logLevel ?? 'info';
    switch (logConfigResult.value.logFormat) {
        case 'json': {
            currentLogger = pino({ level: logLevel });
            loggerRef.value = currentLogger;
            break;
        }
        case 'default':
        case undefined: {
            currentLogger = pino({
                level: logLevel,
                transport: { target: defaultTransport },
            });
            loggerRef.value = currentLogger;
            break;
        }
    }
};
