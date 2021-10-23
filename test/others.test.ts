import { exec } from '../src';

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
