import { ReadonlyNonEmptyArray, isReadonlyNonEmptyArray } from '..';

describe('isReadonlyNonEmptyArray', () => {
    it('tests to be true', () => {
        const source = [1];
        const actual = isReadonlyNonEmptyArray(source);
        expect(actual).toBe(true);
        if (actual) {
            const _: ReadonlyNonEmptyArray<number> = source;
            // TypeScriptなどによる未使用の変数の警告を抑制している
            _ == null ? undefined : undefined;
        }
    });

    it('tests to be false', () => {
        const source: number[] = [];
        const actual = isReadonlyNonEmptyArray(source);
        expect(actual).toBe(false);
    });
});
