/* eslint-disable no-console */
import build from 'pino-abstract-transport';

// これらの文字列を変更したら、@flocon-trpg/logger-base の文字列も変更すること！
// 理由: @flocon-trpg/default-pino-transport は他から import されるのではく、pino で '@flocon-trpg/default-pino-transport' という文字列を渡すことでのみ参照されるという特殊性がある。そのためか、@flocon-trpg/logger-base から import するとビルドの際に警告が出る（実際に動くかどうかは確認していない）。不具合が起こる可能性を減らすため、import せずに @flocon-trpg/logger-base と同様の文字列を書いている。
const LOG_FORMAT = 'LOG_FORMAT';
const notice = 'notice';

let notified = false;
const notifyLogIsSkippedOnce = () => {
    if (notified) {
        return;
    }
    console.info(
        `Because ${LOG_FORMAT} is default or not set, some logs will be skipped. Set ${LOG_FORMAT} as json to output skipped logs. / ${LOG_FORMAT} が default であるかセットされていないため、一部のログの出力はスキップされます。${LOG_FORMAT} を json にすることで、スキップせずに出力されます。`,
    );
    notified = true;
};

export default function () {
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
            } else {
                console[consoleMethodName](message, obj.err);
            }
        });
    });
}
