import { exec } from '../src';

describe('for-of', () => {
    test('let', () => {
        const actual = exec(
            `
let result = [];
for (let x of [1, 2]) {
    result.push(x);
}
result;
        `,
            {}
        );
        expect(actual.result).toEqual([1, 2]);
    });

    test('no-let', () => {
        const actual = exec(
            `
let result = [];
let x = 0;
for (x of [1, 2]) {
    result.push(x);
}
result;
        `,
            {}
        );
        expect(actual.result).toEqual([1, 2]);
    });

    test('assign to object', () => {
        const actual = exec(
            `
let result = [];
let obj = { x: 0 };
for (obj.x of [1, 2]) {
    result.push(obj.x);
}
result;
        `,
            {}
        );
        expect(actual.result).toEqual([1, 2]);
    });
});
