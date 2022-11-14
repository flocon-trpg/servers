import { isBrowser } from 'browser-or-node';
import p from 'pino';

const defaultLogLevel = 'info';

// ブラウザの場合はほぼ変更なし（ログレベルを変更するくらい）でも構わない。
// ブラウザ以外の場合は、このままだと JSON がそのまま出力されて見づらいので、pino-pretty などを使わない場合は変更するほうがいいかも。
/** pino のロガーを取得もしくは変更できます。 */
export const loggerRef = {
    value: isBrowser ? p({ level: defaultLogLevel, browser: {} }) : p({ level: defaultLogLevel }),
};
