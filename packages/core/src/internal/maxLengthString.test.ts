import { maxLengthString } from './maxLengthString';

describe('maxLengthString', () => {
    it('tests valid source', () => {
        const actual = maxLengthString(5).parse('aaaaa');
        expect(actual).toBe('aaaaa');
    });

    it('tests invalid source', () => {
        const actual = () => maxLengthString(10).parse('0123456789a');
        expect(actual).toThrow();
    });
});
