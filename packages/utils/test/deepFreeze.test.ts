import { deepFreeze } from '../src';

describe('deepFreeze', () => {
    it('tests number', () => {
        const target = 1;
        deepFreeze(target);
    });

    it('tests null', () => {
        const target = null;
        deepFreeze(target);
    });

    it('tests undefined', () => {
        const target = undefined;
        deepFreeze(target);
    });

    it('tests object with array', () => {
        const target = {
            one: 'foo',
            two: { first: 'two/first', second: 'two/second' },
            array: [1, 2],
        };
        deepFreeze(target);
        expect(() => {
            target.one = 'FOO';
        }).toThrow(/Cannot assign to read only property/);
        expect(() => {
            target.two.first = 'TWO/FIRST';
        }).toThrow(/Cannot assign to read only property/);
        expect(() => {
            target.array[0] = 10;
        }).toThrow(/Cannot assign to read only property/);
    });
});
