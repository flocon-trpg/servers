import * as t from 'io-ts';

export type MaxLengthStringBrand<N> = {
    readonly MaxLengthString: unique symbol;
    readonly length: N;
};
export const maxLengthString = <N extends number>(length: N) =>
    t.brand(
        t.string,
        // 𩸽や😀のようなサロゲートペアで表現される文字はlengthで2とカウントされるが、欲しい情報は文字数ではなく消費容量であるためlengthで問題ない
        (str): str is t.Branded<string, MaxLengthStringBrand<N>> => str.length <= length,
        'MaxLengthString'
    );

export const maxLength100String = maxLengthString(100);
export type MaxLength100String = t.TypeOf<typeof maxLength100String>;
export const maxLength1000String = maxLengthString(1000);
export type MaxLength1000String = t.TypeOf<typeof maxLength1000String>;

const emptyString = '';
let maxLength100EmptyString: t.TypeOf<typeof maxLength100String>;
if (maxLength100String.is(emptyString)) {
    maxLength100EmptyString = emptyString;
} else {
    throw new Error('this should not happen');
}
let maxLength1000EmptyString: t.TypeOf<typeof maxLength1000String>;
if (maxLength1000String.is(emptyString)) {
    maxLength1000EmptyString = emptyString;
} else {
    throw new Error('this should not happen');
}

export { maxLength100EmptyString, maxLength1000EmptyString };
