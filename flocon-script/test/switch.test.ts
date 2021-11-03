import { exec } from '../src';

describe('switch', () => {
    test.each([0, 1, 2, 3])('with default', i => {
        const actual = exec(
            `
let result = -1;
let i = ${i};
switch (i) {
    case 0:
        result = '0';
        break;
    case 1:
    case 2:
        result = '1or2';
        break;
    default:
        result = 'default';
        break;
}
result;
        `,
            {}
        );
        let expected = 'default';
        switch (i) {
            case 0:
                expected = '0';
                break;
            case 1:
            case 2:
                expected = '1or2';
                break;
        }
        expect(actual.result).toBe(expected);
    });

    test.each([0, 1])('without default', i => {
        const actual = exec(
            `
let result = 'default';
let i = ${i};
switch (i) {
    case 0:
        result = '0';
        break;
}
result;
        `,
            {}
        );
        expect(actual.result).toBe(i === 0 ? '0' : 'default');
    });
});
