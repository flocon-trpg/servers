import { exec } from '../src';

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

it.each([{ x: 0 }, { x: 0, y: 0 }])(
    'tests Array destruction in paramater with no RestElement',
    globalThis => {
        const globalThisClone = { ...globalThis };
        const actual = exec(
            `
let f = ([x,y, ,w]) => x + y + 0 + w;
f([10, 20, 30, 40]);
    `,
            globalThis
        );
        expect(actual.result).toEqual(70);
        expect(actual.getGlobalThis()).toEqual(globalThisClone);
    }
);

it.each([{ x: 0 }, { x: 0, y: 0 }])(
    'tests Array destruction in paramater with RestElement (rest.length !== 0)',
    globalThis => {
        const globalThisClone = { ...globalThis };
        const actual = exec(
            `
let f = ([x, y, ...z]) => ({ sum: x + y + 1, rest: z });
f([10, 20, 30, 40]);
    `,
            globalThis
        );
        expect(actual.result).toEqual({ sum: 31, rest: [30, 40] });
        expect(actual.getGlobalThis()).toEqual(globalThisClone);
    }
);

it.each([{ x: 0 }, { x: 0, y: 0 }])(
    'tests Array destruction in paramater with RestElement (rest.length === 0)',
    globalThis => {
        const globalThisClone = { ...globalThis };
        const actual = exec(
            `
let f = ([x, y, ...z]) => ({ sum: x + y + 1, rest: z });
f([10, 20]);
    `,
            globalThis
        );
        expect(actual.result).toEqual({ sum: 31, rest: [] });
        expect(actual.getGlobalThis()).toEqual(globalThisClone);
    }
);
