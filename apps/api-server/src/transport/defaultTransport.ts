import build from 'pino-abstract-transport';
import { LOG_FORMAT } from '../env';

const transport = () => {
    return build(source => {
        source.on('data', obj => {
            let level: string;
            let consoleMethodName: 'debug' | 'log' | 'info' | 'warn' | 'error';
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
                    consoleMethodName = 'log';
                    break;
                case 35:
                    level = '[NOTICE]';
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

            // pino-http のログのmsgには"request completed"しかなく、reqやresなどに詳細なデータがある。Apolloとmikro-ormも同様であり、それぞれrequestなどとqueryなどに詳細なデータがある。それらを表示する方法の案内となるメッセージ。
            const pinoHttpInfo =
                obj.res !== undefined ||
                obj.req !== undefined ||
                obj.request !== undefined ||
                obj.query !== undefined
                    ? ` (To get detailed data, set ${LOG_FORMAT} to "json")`
                    : '';
            const message = `${level} ${obj.msg}${pinoHttpInfo}`;
            if (obj.err === undefined) {
                console[consoleMethodName](message);
            } else {
                console[consoleMethodName](message, obj.err);
            }
        });
    });
};

/** pinoのJSONではなく、比較的見やすい形でconsoleに出力します。 */
export default transport;
