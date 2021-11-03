import { exec, symbolClass } from '../src';

describe('Symbol', () => {
    test('Symbol()', () => {
        const actual = exec(
            `
Symbol()
        `,
            { Symbol: symbolClass }
        );
        expect(typeof actual.result).toBe('symbol');
    });

    test("Symbol('x')", () => {
        const actual = exec(
            `
Symbol('x')
        `,
            { Symbol: symbolClass }
        );
        expect(typeof actual.result).toBe('symbol');
    });
});
