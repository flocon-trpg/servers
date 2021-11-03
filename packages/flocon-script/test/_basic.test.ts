import { exec } from '../src';

test.each([{}, { x: 0 }, { y: 0 }])('1', globalThis => {
    const actual = exec('1', globalThis);
    expect(actual.result).toBe(1);
    expect(actual.getGlobalThis()).toEqual(globalThis);
});

describe.each(['let', 'const'])('declaration result', kind => {
    test.each([{}, { x: 0 }, { y: 0 }])(`${kind} x = 1;`, globalThis => {
        const actual = exec(`${kind} x = 1;`, globalThis);
        expect(actual.result).toBeUndefined();
        expect(actual.getGlobalThis()).toEqual(globalThis);
    });
});
