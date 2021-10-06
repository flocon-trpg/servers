import * as t from 'io-ts';
import { maxLengthString } from '../src';

const obj = t.type({
    str5: maxLengthString(5),
    str10: maxLengthString(10),
});

type Obj = t.OutputOf<typeof obj>;

describe('maxLengthString', () => {
    it('tests valid source', () => {
        const source: Obj = {
            str5: 'aaaaa',
            str10: 'aaa',
        };
        const actual = obj.decode(source);
        expect(actual._tag === 'Left' ? undefined : actual.right).toBe(source);
    });

    it('tests invalid source', () => {
        const source: Obj = {
            str5: 'aaaaaaa',
            str10: 'aaa',
        };
        const actual = obj.decode(source);
        expect(actual._tag === 'Left' ? undefined : actual.right).toBeUndefined();
    });
});
