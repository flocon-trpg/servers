import { parseEnvListValue } from '..';

describe('parseEnvListValue', () => {
    it('tests null', () => {
        const source = null;
        const actual = parseEnvListValue(source);
        expect(actual).toBeNull();
    });

    it('tests undefined', () => {
        const source = undefined;
        const actual = parseEnvListValue(source);
        expect(actual).toBeUndefined();
    });

    it('tests "" to be [""]', () => {
        const source = '';
        const actual = parseEnvListValue(source);
        expect(actual).toEqual(['']);
    });

    it('tests "abc" to be ["abc"]', () => {
        const source = 'abc';
        const actual = parseEnvListValue(source);
        expect(actual).toEqual(['abc']);
    });

    it('tests "abc, efg" to be ["abc", "efg"]', () => {
        const source = 'abc, efg';
        const actual = parseEnvListValue(source);
        expect(actual).toEqual(['abc', 'efg']);
    });

    it('tests ",," to be ["", "", ""]', () => {
        const source = ',,';
        const actual = parseEnvListValue(source);
        expect(actual).toEqual(['', '', '']);
    });
});
