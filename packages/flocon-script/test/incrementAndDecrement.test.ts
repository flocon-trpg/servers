import { exec } from '../src';

describe('increment and decrement', () => {
    test('i++', () => {
        const actual = exec(
            `
let i = 10;
let j = i++;
[i, j]
        `,
            {},
        );
        expect(actual.result).toEqual([11, 10]);
    });

    test('++i', () => {
        const actual = exec(
            `
let i = 10;
let j = ++i;
[i, j]
        `,
            {},
        );
        expect(actual.result).toEqual([11, 11]);
    });

    test('i--', () => {
        const actual = exec(
            `
let i = 10;
let j = i--;
[i, j]
        `,
            {},
        );
        expect(actual.result).toEqual([9, 10]);
    });

    test('--i', () => {
        const actual = exec(
            `
let i = 10;
let j = --i;
[i, j]
        `,
            {},
        );
        expect(actual.result).toEqual([9, 9]);
    });
});
