import * as t from 'io-ts';

interface MaxLengthStringBrand {
    readonly MaxLengthString: unique symbol;
}
export const maxLengthString = (length: number) =>
    t.brand(
        t.string,
        (str): str is t.Branded<string, MaxLengthStringBrand> => str.length <= length,
        'MaxLengthString'
    );
