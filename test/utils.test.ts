import { chooseDualKeyRecord, mapDualKeyRecord, mapRecord } from '../src';

it('tests mapDualKeyRecord', () => {
    const source: Record<string, Record<string, number | undefined> | undefined> = {
        key1: {},
        key2: {
            key2_1: 1,
            key2_2: undefined,
        },
        key3: undefined,
    };
    const actual = mapDualKeyRecord<number, string>(
        source as Record<string, Record<string, number>>,
        x => x.toString()
    );
    expect(actual).toEqual({
        key1: {},
        key2: {
            key2_1: '1',
        },
    });
});

it('tests mapDualKeyRecord {}', () => {
    const source: Record<string, Record<string, number>> = {};
    const actual = mapDualKeyRecord<number, string>(source, x => x.toString());
    expect(actual).toEqual({});
});

it('tests mapRecord (__proto__)', () => {
    const source: Record<string, number | undefined> = JSON.parse('{ "__proto__": 1 }');
    expect(() => mapRecord(source, x => x)).toThrow();
});

it('tests chooseDualKeyRecord', () => {
    const source: Record<string, Record<string, number | undefined> | undefined> = {
        key1: {},
        key2: {
            key2_0: 0,
            key2_1: 1,
            key2_2: undefined,
        },
        key3: undefined,
    };
    const actual = chooseDualKeyRecord<number, string>(
        source as Record<string, Record<string, number>>,
        x => (x === 0 ? undefined : x.toString())
    );
    expect(actual).toEqual({
        key1: {},
        key2: {
            key2_1: '1',
        },
    });
});

it('tests chooseDualKeyRecord {}', () => {
    const source: Record<string, Record<string, number>> = {};
    const actual = chooseDualKeyRecord<number, string>(source, x => x.toString());
    expect(actual).toEqual({});
});
