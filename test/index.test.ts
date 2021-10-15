import { exec, arrayClass, mapClass, createFValue, symbolClass } from '../src';

test('docs.md 例1', () => {
    const globalThis = { obj: { x: 1 } };
    const execResult = exec('this.obj.x = 2', globalThis);
    const globalThisAfterExec: any = execResult.getGlobalThis();

    expect(globalThis.obj.x).toBe(1);
    expect(globalThisAfterExec.obj.x).toBe(2);
});

test('docs.md 例2', () => {
    const obj = { x: 1 };
    const globalThis = { obj1: obj, obj2: obj };
    const execResult = exec('this.obj1.x = 2; this.obj2.x;', globalThis);
    const globalThisAfterExec: any = execResult.getGlobalThis();

    expect(execResult.result).toBe(1);
    expect(globalThisAfterExec.obj1.x).toBe(2);
    expect(globalThisAfterExec.obj2.x).toBe(1);
});

test('docs.md 例3', () => {
    const obj = createFValue({ x: 1 });
    const globalThis = { obj1: obj, obj2: obj };
    const execResult = exec('this.obj1.x = 2; this.obj2.x', globalThis);
    const globalThisAfterExec: any = execResult.getGlobalThis();

    expect(execResult.result).toBe(2);
    expect(globalThisAfterExec.obj1.x).toBe(2);
    expect(globalThisAfterExec.obj2.x).toBe(2);
});

test.each([{}, { x: 0 }, { y: 0 }])('1', globalThis => {
    const actual = exec('1', globalThis);
    expect(actual.result).toBe(1);
    expect(actual.getGlobalThis()).toEqual(globalThis);
});

test.each([{}, { x: 0 }, { y: 0 }])('let x = 1;', globalThis => {
    const actual = exec('let x = 1;', globalThis);
    expect(actual.result).toBeUndefined();
    expect(actual.getGlobalThis()).toEqual(globalThis);
});

test.each([{}, { x: 0 }, { y: 0 }])('let x = 1; x', globalThis => {
    const actual = exec(
        `
let x = 1;
x;
`,
        globalThis
    );
    expect(actual.result).toBe(1);
    expect(actual.getGlobalThis()).toEqual(globalThis);
});

test.each([{}, { x: 0 }, { y: 0 }])('let x = 1; x.toString()', globalThis => {
    const actual = exec(
        `
let x = 1;
x.toString();
`,
        globalThis
    );
    expect(actual.result).toBe('1');
    expect(actual.getGlobalThis()).toEqual(globalThis);
});

test.each([{}, { x: 0 }, { y: 0 }])(
    'let x = 1; x.toString(); let y = 2; y.toString();',
    globalThis => {
        const actual = exec(
            `
let x = 1;
x.toString();
let y = 2;
y.toString();
`,
            globalThis
        );
        expect(actual.result).toBe('2');
        expect(actual.getGlobalThis()).toEqual(globalThis);
    }
);

test.each([{ x: 0 }, { x: 0, y: 1 }])('x.toString() with globalThis', globalThis => {
    const actual = exec('x.toString()', globalThis);
    expect(actual.result).toBe('0');
});

it.each([{ x: 0 }, { x: 0, y: 0 }])('tests arrow functions scope', globalThis => {
    const globalThisClone = { ...globalThis };
    const actual = exec(
        `
let f = x => x + 1;
f(10);
    `,
        globalThis
    );
    expect(actual.result).toEqual(11);
    expect(actual.getGlobalThis()).toEqual(globalThisClone);
});

test('prevent __proto__ attack', () => {
    expect(() => {
        // この段階では、globalThisはMapで表現されているため例外は発生しない
        const execResult = exec('__proto__ = {};', {});

        // これによりMapをRecordに変換しようとするが、この際に防御機構が働き例外が発生する
        return execResult.getGlobalThis();
    }).toThrow();
});

test.each([{}, { x: 0 }])('let x = { a: 1 }; x.a;', globalThis => {
    const actual = exec(
        `
let x = { a: 1 };
x.a;
        `,
        globalThis
    );
    expect(actual.result).toBe(1);
    expect(actual.getGlobalThis()).toEqual(globalThis);
});

test.each([{}, { x: 0 }])('let x = { a: 1 }; x.a = 2;', globalThis => {
    const actual = exec(
        `
let x = { a: 1 };
x.a = 2;
x.a;
        `,
        globalThis
    );
    expect(actual.result).toBe(2);
    expect(actual.getGlobalThis()).toEqual(globalThis);
});

test.each([{ a: 0 }, { a: 0, b: -1 }])('a = 1;', globalThis => {
    const actual = exec(
        `
a = 1;
a;
        `,
        globalThis
    );
    expect(actual.result).toBe(1);
    expect(actual.getGlobalThis()).toEqual({ ...globalThis, a: 1 });
});

test('const x = 1; x = 2;', () => {
    expect(() => exec('const x = 1; x = 2;', {})).toThrow();
});

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
            {}
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
            {}
        );
        expect(actual.result).toBe(bool ? 1 : 2);
    });
});

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
let result = ${JSON.stringify(source)};
const popped = result.pop();
({ popped, result });
        `,
            {}
        );
        expect(actual.result).toEqual({ popped: expectedPopped, result: expectedArray });
    });

    test.each`
        args     | expected
        ${'3'}   | ${[1, 2, 3]}
        ${'3,4'} | ${[1, 2, 3, 4]}
        ${''}    | ${[1, 2]}
    `('push', ({ args, expected }) => {
        const actual = exec(
            `
let result = [1,2];
result.push(${args});
result;
        `,
            {}
        );
        expect(actual.result).toEqual(expected);
    });

    test.each`
        source    | expectedShifted | expectedArray
        ${[1, 2]} | ${1}            | ${[2]}
        ${[]}     | ${undefined}    | ${[]}
    `('shift', ({ source, expectedShifted, expectedArray }) => {
        const actual = exec(
            `
let result = ${JSON.stringify(source)};
const shifted = result.shift();
({ shifted, result });
        `,
            {}
        );
        expect(actual.result).toEqual({ shifted: expectedShifted, result: expectedArray });
    });

    test.each`
        args        | expected
        ${'-1'}     | ${[-1, 1, 2]}
        ${'-2, -1'} | ${[-2, -1, 1, 2]}
        ${''}       | ${[1, 2]}
    `('unshift', ({ args, expected }) => {
        const actual = exec(
            `
let result = [1,2];
result.unshift(${args});
result;
        `,
            {}
        );
        expect(actual.result).toEqual(expected);
    });
});

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
