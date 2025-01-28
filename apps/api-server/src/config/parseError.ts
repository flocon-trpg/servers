import { Error, Result } from '@kizahasi/result';

export function parseError(envKey: string): Error<string> {
    // TODO: 英語でも出力する（ADMINのエラーメッセージは英語なため整合性が取れていない）
    return Result.error(`${envKey} の値の記入方法が誤っています。`);
}
