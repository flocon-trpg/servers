import { Result } from '@kizahasi/result';
import { Logger, pino } from 'pino';
import { LogConfig } from './config/types';

export const notice = 'notice';

// pinoのデフォルトのログレベルでは、「Flocon API Server v*.*.*」や環境変数の情報などといった多くのユーザーに伝えるべきデータと、pino-httpのログのようにオンプレミスサーバーの管理者など以外に必要なさそうなデータは両方とも'info'に属するしかない。
// これらを区別するために、'notice'という独自のレベルを定義して前者のデータは'notice'を用いている。
const customLevels = {
    [notice]: 35,
} as const;

export type Pino = Logger<{ customLevels: typeof customLevels }>;

const defaultTransport = './transport/defaultTransport.js';

type LoggerRefInternal = {
    readonly isInitialized: boolean;
    readonly get: () => Pino;
};

let uninitializedLoggerCache: Pino | null = null;
const getUninitializeLogger = () => {
    if (uninitializedLoggerCache == null) {
        uninitializedLoggerCache = pino({
            customLevels,
            transport: { target: defaultTransport },
        });
    }
    return uninitializedLoggerCache;
};

const uninitializedLoggerRef: LoggerRefInternal = {
    isInitialized: false,
    get() {
        // LOG_LEVELがパースできなかった場合などはinitializeせずにエラーを通知する必要がある。その際にuninitializedLoggerが使われる。
        return getUninitializeLogger();
    },
};

let loggerRef: LoggerRefInternal = uninitializedLoggerRef;

/** `get()`を実行することでloggerを取得できます。事前に`initializeLogger`を実行しておく必要があります。 */
export const logger = {
    get() {
        return loggerRef.get();
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
    /** `get().notice` と同じです。 */
    get notice() {
        const logger = this.get();
        return logger.notice.bind(logger);
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

/** loggerを準備します。`logget.get()`などを呼び出す前に必ず実行しておく必要があります。複数回実行すると例外が投げられます。 */
export const initializeLogger = (logConfigResult: Result<LogConfig>) => {
    if (loggerRef.isInitialized) {
        throw new Error('Logger is already initialized.');
    }

    if (logConfigResult.isError) {
        throw new Error(logConfigResult.error);
    }

    const logLevel = logConfigResult.value.logLevel ?? notice;
    switch (logConfigResult.value.logFormat) {
        case 'json': {
            const logger = pino({ customLevels, level: logLevel });
            loggerRef = {
                isInitialized: false,
                get() {
                    return logger;
                },
            };
            break;
        }
        case 'default':
        case undefined: {
            const logger = pino({
                customLevels,
                level: logLevel,
                transport: { target: defaultTransport },
            });
            loggerRef = {
                isInitialized: false,
                get() {
                    return logger;
                },
            };
            break;
        }
    }
};
