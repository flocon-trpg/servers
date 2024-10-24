import { atomWithLazy } from 'jotai/utils';
import { filePath } from '@/utils/file/filePath';

// もし fetch に失敗した状態でキャッシュされると再び fetch しに行くことはないので、atomWithCache は使っていない
export const createFetchAtom = (filepath: string) =>
    atomWithLazy(async () => {
        // chromeなどではfetchできないと `http://localhost:****/**** 404 (Not Found)` などといったエラーメッセージが表示されるが、実際は問題ない
        const envTxtObj = await fetch(filepath).catch(() => null);
        if (envTxtObj == null || !envTxtObj.ok) {
            // 正常に取得できなかったときはnullを返す
            return null;
        }
        return await envTxtObj.text();
    });
