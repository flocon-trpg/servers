import * as t from 'io-ts';
import { maxLengthString } from './maxLengthString';

const obj = t.type({
    str5: maxLengthString(5),
    str10: maxLengthString(10),
});

type Obj = t.InputOf<typeof obj>;

describe('maxLengthString', () => {
    it('tests valid source', () => {
        const source: Obj = {
            str5: 'aaaaa',
            str10: 'aaa',
        };
        const actual = obj.decode(source);
        expect(actual._tag === 'Left' ? undefined : actual.right).toBe(source);
        obj.props.str5;
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
