import { exec } from '../src';

describe.each(['let', 'const'])('declaration', kind => {
    test.each([{}, { x: 17 }, { y: 17 }])(`${kind} x = 10; x`, globalThis => {
        const actual = exec(
            `
${kind} x = 10;
x;
`,
            globalThis
        );
        expect(actual.result).toBe(10);
        expect(actual.getGlobalThis()).toEqual(globalThis);
    });

    describe.each(['[10, 20, 30, 40]', '[10, 20, 30, 40, 50]'])(
        'Array Destructuring assignment without RestElement',
        arrayScript => {
            test.each([{}, { x: 17 }, { y: 17 }])(arrayScript, globalThis => {
                const actual = exec(
                    `
${kind} [x, y, , w] = ${arrayScript};
[x, y, w];
`,
                    globalThis
                );
                expect(actual.result).toEqual([10, 20, 40]);
                expect(actual.getGlobalThis()).toEqual(globalThis);
            });
        }
    );

    test.each([{}, { x: 17 }, { y: 17 }])(
        `Array Destructuring assignment with RestElement`,
        globalThis => {
            const actual = exec(
                `
${kind} [x, ...y] = [10, 20, 30];
[x, y];
`,
                globalThis
            );
            expect(actual.result).toEqual([10, [20, 30]]);
            expect(actual.getGlobalThis()).toEqual(globalThis);
        }
    );

    describe.each(['{x: 10, y: 20}', '{x: 10, y: 20, z: 30}'])(
        'Object Destructuring assignment without RestElement',
        recordScript => {
            test.each([{}, { x: 17 }, { y: 17 }])(recordScript, globalThis => {
                const actual = exec(
                    `
${kind} {x, y} = ${recordScript};
[x, y];
`,
                    globalThis
                );
                expect(actual.result).toEqual([10, 20]);
                expect(actual.getGlobalThis()).toEqual(globalThis);
            });
        }
    );

    test.each([{}, { x: 17 }, { y: 17 }])(
        'Object Destructuring assignment with RestElement',
        globalThis => {
            const actual = exec(
                `
${kind} {x, ...rest} = {x: 10, y: 20, z: 30};
[x, rest];
`,
                globalThis
            );
            expect(actual.result).toEqual([10, { y: 20, z: 30 }]);
            expect(actual.getGlobalThis()).toEqual(globalThis);
        }
    );
});
