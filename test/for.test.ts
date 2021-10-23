import { exec } from '../src';

describe('for', () => {
    test('basic', () => {
        const actual = exec(
            `
let result = [];
for (let i = 1; i < 3; i++) {
    result.push(i);
}
result;
        `,
            {}
        );
        expect(actual.result).toEqual([1, 2]);
    });

    test('break', () => {
        const actual = exec(
            `
let result = [];
for (let i = 1; i < 100; i++) {
    if (i === 3) {
        break;
    }
    result.push(i);
}
result;
        `,
            {}
        );
        expect(actual.result).toEqual([1, 2]);
    });

    test('continue', () => {
        const actual = exec(
            `
let result = [];
for (let i = 1; i < 6; i++) {
    if (i === 3) {
        continue;
    }
    result.push(i);
    if (i === 4) {
        continue;
    }
}
result;
        `,
            {}
        );
        expect(actual.result).toEqual([1, 2, 4, 5]);
    });
});
