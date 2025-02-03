import { Error, Result } from '@kizahasi/result';

export function parseErrorFromInteger(envKey: string): Error<string> {
    // TODO: 英語でも出力する（ADMINのエラーメッセージは英語なため整合性が取れていない）
    return Result.error(`${envKey} の値を整数値に変換できませんでした。`);
}
