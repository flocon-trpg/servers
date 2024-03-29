import build from 'pino-abstract-transport';

/* eslint-disable no-console */
const notice = 'notice';
const LOG_FORMAT = 'LOG_FORMAT';
let notified = false;
const notifyLogIsSkippedOnce = () => {
    if (notified) {
        return;
    }
    console.info(`Because ${LOG_FORMAT} is default or not set, some logs will be skipped. Set ${LOG_FORMAT} as json to output skipped logs. / ${LOG_FORMAT} が default であるかセットされていないため、一部のログの出力はスキップされます。${LOG_FORMAT} を json にすることで、スキップせずに出力されます。`);
    notified = true;
};
function index () {
    return build(source => {
        source.on('data', obj => {
            let level;
            let consoleMethodName;
            switch (obj.level) {
                case 10:
                    level = '[TRACE]';
                    consoleMethodName = 'debug';
                    break;
                case 20:
                    level = '[DEBUG]';
                    consoleMethodName = 'debug';
                    break;
                case 30:
                    level = '[INFO]';
                    consoleMethodName = 'info';
                    break;
                case 40:
                    level = '[WARN]';
                    consoleMethodName = 'warn';
                    break;
                case 50:
                    level = '[ERROR]';
                    consoleMethodName = 'error';
                    break;
                case 60:
                    level = '[FATAL]';
                    consoleMethodName = 'error';
                    break;
                default:
                    level = '[UNKNOWN_LEVEL]';
                    consoleMethodName = 'log';
                    break;
            }
            if (obj[notice] !== true && obj.level <= 30) {
                notifyLogIsSkippedOnce();
                return;
            }
            const message = `${level} ${obj.msg}`;
            if (obj.err === undefined) {
                console[consoleMethodName](message);
            }
            else {
                console[consoleMethodName](message, obj.err);
            }
        });
    });
}

export { LOG_FORMAT, index as default, notice };
//# sourceMappingURL=index.js.map
