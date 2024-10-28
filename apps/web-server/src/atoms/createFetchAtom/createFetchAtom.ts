import { atomWithLazy } from 'jotai/utils';

// もし fetch に失敗した状態でキャッシュされても再び fetch しに行く場面は今のところない(ユーザーにブラウザ更新で対応してもらう)ので、atomWithCache は使っていない
export const createFetchAtom = (filepath: string) =>
    atomWithLazy(async () => {
        // chromeなどではfetchできないと `http://localhost:****/**** 404 (Not Found)` などといったエラーメッセージが表示されるが、実際は問題ない
        const txtObj = await fetch(filepath).catch(() => null);
        if (txtObj == null || !txtObj.ok) {
            // 正常に取得できなかったときはnullを返す
            return null;
        }
        return await txtObj.text();
    });
