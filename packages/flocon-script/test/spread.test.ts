import { exec } from '../src';

describe('spread', () => {
    test('spread Object', () => {
        const actual = exec(
            `
let spreadSource = { b: 'B1', c: 'C1' };
let spread = { a: 'A2', b: 'B2', ...spreadSource, c: 'C2', d: 'D2' };
({ spreadSource, spread })
    `,
            {},
        );
        expect(actual.result).toEqual({
            spreadSource: { b: 'B1', c: 'C1' },
            spread: { a: 'A2', b: 'B1', c: 'C2', d: 'D2' },
        });
    });

    test('spread Array to Array', () => {
        const actual = exec(
            `
let spreadSource = [20, 30];
let spread = [10, ...spreadSource, 40];
({ spreadSource, spread })
    `,
            {},
        );
        expect(actual.result).toEqual({
            spreadSource: [20, 30],
            spread: [10, 20, 30, 40],
        });
    });

    test('spread String Array', () => {
        const actual = exec(
            `
let spreadSource = 'bar';
let spread = [10, ...spreadSource, 20];
({ spreadSource, spread })
    `,
            {},
        );
        expect(actual.result).toEqual({
            spreadSource: 'bar',
            spread: [10, 'b', 'a', 'r', 20],
        });
    });
});
