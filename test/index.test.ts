import { exec, arrayClass, createFValue } from '../src';

test('docs.md 例1', () => {
    const globalThis = { obj: { x: 1 } };
    const execResult = exec('globalThis.obj.x = 2', globalThis);
    const globalThisAfterExec: any = execResult.getGlobalThis();

    expect(globalThis.obj.x).toBe(1);
    expect(globalThisAfterExec.obj.x).toBe(2);
});

test('docs.md 例2', () => {
    const obj = { x: 1 };
    const globalThis = { obj1: obj, obj2: obj };
    const execResult = exec('globalThis.obj1.x = 2; globalThis.obj2.x;', globalThis);
    const globalThisAfterExec: any = execResult.getGlobalThis();

    expect(execResult.result).toBe(1);
    expect(globalThisAfterExec.obj1.x).toBe(2);
    expect(globalThisAfterExec.obj2.x).toBe(1);
});

test('docs.md 例3', () => {
    const obj = createFValue({ x: 1 });
    const globalThis = { obj1: obj, obj2: obj };
    const execResult = exec('globalThis.obj1.x = 2; globalThis.obj2.x', globalThis);
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

test.each([{ x: 0 }, { x: 0, y: 1 }])('x.toString() (this)', globalThis => {
    const actual = exec('x.toString()', globalThis);
    expect(actual.result).toBe('0');
});

test.each([{}, { y: 0 }, { x: 0, y: 0 }])('[1,2,3,4].filter(x => x === 2)', globalThis => {
    const actual = exec('[1,2,3,4].filter(x => x === 2)', globalThis);
    expect(actual.result).toEqual([2]);
    expect(actual.getGlobalThis()).toEqual(globalThis);
});

test('prevent __proto__ attack', () => {
    expect(() => exec('__proto__.foobar = 1', {})).toThrow();
});

test('prevent Object.__proto__ attack', () => {
    expect(() => exec('Object.__proto__.foobar = 1', {})).toThrow();
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

test('Array.isArray', () => {
    const actual = exec(
        `
Array.isArray([1,2]);
        `,
        { Array: arrayClass }
    );
    expect(actual.result).toBe(true);
});

test('Array.filter', () => {
    const actual = exec(
        `
[1,2,3,4].filter(i => i >= 3);
        `,
        {}
    );
    expect(actual.result).toEqual([3, 4]);
});

test('Array.push', () => {
    const actual = exec(
        `
let result = [1,2];
result.push(3);
result;
        `,
        {}
    );
    expect(actual.result).toEqual([1, 2, 3]);
});
