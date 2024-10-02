import { exec } from '../src';

describe('if', () => {
    test.each([true, false])('if', bool => {
        const actual = exec(
            `
let result = 0;
let x = ${bool ? 'true' : 'false'}
if (x) {
    result = 1;
}
result;
        `,
            {},
        );
        expect(actual.result).toBe(bool ? 1 : 0);
    });

    test.each([true, false])('if-else', bool => {
        const actual = exec(
            `
let result = 0;
let x = ${bool ? 'true' : 'false'}
if (x) {
    result = 1;
} else {
    result = 2;
}
result;
        `,
            {},
        );
        expect(actual.result).toBe(bool ? 1 : 2);
    });
});
