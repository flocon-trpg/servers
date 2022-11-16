import { z } from 'zod';

// 𩸽や😀のようなサロゲートペアで表現される文字はlengthで2とカウントされるが、欲しい情報は文字数ではなく消費容量であるためlengthで問題ない
export const maxLengthString = <N extends number>(maxLength: N) =>
    z.string().max(maxLength).brand<`MaxLength${N}String`>();

export const maxLength100String = maxLengthString(100);
export type MaxLength100String = z.TypeOf<typeof maxLength100String>;
export const maxLength1000String = maxLengthString(1000);
export type MaxLength1000String = z.TypeOf<typeof maxLength1000String>;

const emptyString = '';
const maxLength100EmptyString: z.TypeOf<typeof maxLength100String> =
    maxLength100String.parse(emptyString);
const maxLength1000EmptyString: z.TypeOf<typeof maxLength1000String> =
    maxLength1000String.parse(emptyString);

export { maxLength100EmptyString, maxLength1000EmptyString };
