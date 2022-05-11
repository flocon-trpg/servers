import { arrayClass, exec } from '../src';

describe('Array', () => {
    test.each(['[]', '[1,2]'])('isArray to return true', source => {
        const actual = exec(
            `
Array.isArray(${source});
        `,
            { Array: arrayClass }
        );
        expect(actual.result).toBe(true);
    });

    test.each(['1', '"1"', '{}'])('isArray to return false', source => {
        const actual = exec(
            `
Array.isArray(${source});
        `,
            { Array: arrayClass }
        );
        expect(actual.result).toBe(false);
    });

    test('filter', () => {
        const actual = exec(
            `
[1,2,3,4].filter(i => i >= 3);
        `,
            {}
        );
        expect(actual.result).toEqual([3, 4]);
    });

    test.each`
        searchKey | expectedValue | expectedIndexes
        ${3}      | ${3}          | ${[0, 1, 2]}
        ${-1}     | ${undefined}  | ${[0, 1, 2, 3]}
    `('find', ({ searchKey, expectedValue, expectedIndexes }) => {
        const actual = exec(
            `
let indexes = [];
const found = [1,2,3,4].find((x, i) => {
    indexes.push(i);
    return x === ${searchKey};
});
({ found, indexes });
        `,
            {}
        );
        expect(actual.result).toEqual({ found: expectedValue, indexes: expectedIndexes });
    });

    test('forEach', () => {
        const actual = exec(
            `
let sum = 0;
let indexes = [];
[1,2,3,4].forEach((x, i) => {
    sum = sum + x;
    indexes.push(i);
});
({ sum, indexes });
        `,
            {}
        );
        expect(actual.result).toEqual({ sum: 10, indexes: [0, 1, 2, 3] });
    });

    test('map', () => {
        const actual = exec(
            `
[1,2].map(i => i * 2);
        `,
            {}
        );
        expect(actual.result).toEqual([2, 4]);
    });

    test.each`
        source    | expectedPopped | expectedArray
        ${[1, 2]} | ${2}           | ${[1]}
        ${[]}     | ${undefined}   | ${[]}
    `('pop', ({ source, expectedPopped, expectedArray }) => {
        const actual = exec(
            `
let array = ${JSON.stringify(source)};
let popped = array.pop();
({ popped, array });
        `,
            {}
        );
        expect(actual.result).toEqual({ popped: expectedPopped, array: expectedArray });
    });

    test.each`
        args     | expectedResult | expectedArray
        ${'3'}   | ${3}           | ${[1, 2, 3]}
        ${'3,4'} | ${4}           | ${[1, 2, 3, 4]}
        ${''}    | ${2}           | ${[1, 2]}
    `('push', ({ args, expectedResult, expectedArray }) => {
        const actual = exec(
            `
let array = [1,2];
let result = array.push(${args});
({ array, result });
        `,
            {}
        );
        expect(actual.result).toEqual({ array: expectedArray, result: expectedResult });
    });

    test.each`
        source    | expectedShifted | expectedArray
        ${[1, 2]} | ${1}            | ${[2]}
        ${[]}     | ${undefined}    | ${[]}
    `('shift', ({ source, expectedShifted, expectedArray }) => {
        const actual = exec(
            `
let array = ${JSON.stringify(source)};
let shifted = array.shift();
({ shifted, array });
        `,
            {}
        );
        expect(actual.result).toEqual({ shifted: expectedShifted, array: expectedArray });
    });

    test.each`
        args        | expectedResult | expectedArray
        ${'-1'}     | ${3}           | ${[-1, 1, 2]}
        ${'-2, -1'} | ${4}           | ${[-2, -1, 1, 2]}
        ${''}       | ${2}           | ${[1, 2]}
    `('unshift', ({ args, expectedResult, expectedArray }) => {
        const actual = exec(
            `
let array = [1,2];
let result = array.unshift(${args});
({ array, result });
        `,
            {}
        );
        expect(actual.result).toEqual({ array: expectedArray, result: expectedResult });
    });
});
