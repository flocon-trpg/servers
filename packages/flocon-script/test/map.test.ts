import { exec, mapClass } from '../src';

describe('Map', () => {
    test.each([
        [1, '1'],
        [2, undefined],
    ])('set and get', (param, expected) => {
        const actual = exec(
            `
let map = new Map();
map.set(1, '1');
map.get(${param});
        `,
            { Map: mapClass }
        );
        expect(actual.result).toBe(expected);
    });

    test.each([
        ['', 0],
        ["map.set(1, '1');", 1],
        ["map.set(1, '1'); map.set(10, '10');", 2],
    ])('size', (script, expected) => {
        const actual = exec(
            `
let map = new Map();
${script}
map.size;
        `,
            { Map: mapClass }
        );
        expect(actual.result).toBe(expected);
    });

    test.each([
        `
    let map = new Map();
    map.clear();
    map.size;
    `,
        `
    let map = new Map();
    map.set(1, '1');
    map.clear();
    map.size;
    `,
    ])('clear', script => {
        const actual = exec(script, { Map: mapClass });
        expect(actual.result).toBe(0);
    });

    test.each`
        key  | expectedResult
        ${1} | ${true}
        ${3} | ${false}
    `('delete', ({ key, expectedResult }) => {
        const actual = exec(
            `
let map = new Map();
map.set(1, '1');
map.set(2, '2');
let result = map.delete(${key});
let size = map.size;
({ result, size });
        `,
            { Map: mapClass }
        );
        expect(actual.result).toEqual({
            result: expectedResult,
            size: expectedResult ? 1 : 2,
        });
    });

    test('forEach', () => {
        const actual = exec(
            `
let valueSum = 0;
let keySum = 0;
let map = new Map();
map.set(1, 10);
map.set(2, 20);
map.forEach((value, key) => {
    valueSum = valueSum + value;
    keySum = keySum + key;
});
({ valueSum, keySum });
        `,
            { Map: mapClass }
        );
        expect(actual.result).toEqual({ valueSum: 30, keySum: 3 });
    });

    test.each([
        [1, true],
        [2, false],
    ])('has', (param, expected) => {
        const actual = exec(
            `
let map = new Map();
map.set(1, '1');
map.has(${param});
        `,
            { Map: mapClass }
        );
        expect(actual.result).toBe(expected);
    });
});
