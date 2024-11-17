import { ReadonlyNonEmptyArray, isReadonlyNonEmptyArray } from '..';

describe('isReadonlyNonEmptyArray', () => {
    it('tests to be true', () => {
        const source = [1];
        const actual = isReadonlyNonEmptyArray(source);
        expect(actual).toBe(true);
        if (actual) {
            // sourceの型がReadonlyNonEmptyArrayになっていることを確認するためのテスト
            const _: ReadonlyNonEmptyArray<number> = source;
            // 適当な関数を実行するコードを書くことで、TypeScriptなどによる未使用の変数の警告を抑制している
            _.toString();
        }
    });

    it('tests to be false', () => {
        const source: number[] = [];
        const actual = isReadonlyNonEmptyArray(source);
        expect(actual).toBe(false);
    });
});
