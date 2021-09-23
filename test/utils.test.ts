import { chooseDualKeyRecord, mapDualKeyRecord, mapRecord, mapToRecord } from '../src';

describe('mapToRecord', () => {
    it('tests empty Map', () => {
        const map = new Map<string, string>();
        expect(mapToRecord(map)).toEqual({});
    });

    it('tests non-empty Map', () => {
        const map = new Map<string, string>();
        map.set('a', 'A');
        map.set('b', 'B');
        expect(mapToRecord(map)).toEqual({ a: 'A', b: 'B' });
    });

    it('tests setting "__proto__" to throw', () => {
        const map = new Map<string, string>();
        map.set('__proto__', 'value');
        expect(() => mapToRecord(map)).toThrow();
    });
});

it('tests mapDualKeyRecord', () => {
    const source: Record<string, Record<string, number | undefined> | undefined> = {
        key1: {},
        key2: {
            key2_1: 1,
            key2_2: undefined,
        },
        key3: undefined,
    };
    const actual = mapDualKeyRecord<number, [string, string, string]>(
        source as Record<string, Record<string, number>>,
        (value, key) => [value.toString(), key.first, key.second]
    );
    expect(actual).toEqual({
        key1: {},
        key2: {
            key2_1: ['1', 'key2', 'key2_1'],
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
    const actual = chooseDualKeyRecord<number, [string, string, string]>(
        source as Record<string, Record<string, number>>,
        (value, key) => (value === 0 ? undefined : [value.toString(), key.first, key.second])
    );
    expect(actual).toEqual({
        key1: {},
        key2: {
            key2_1: ['1', 'key2', 'key2_1'],
        },
    });
});

it('tests chooseDualKeyRecord {}', () => {
    const source: Record<string, Record<string, number>> = {};
    const actual = chooseDualKeyRecord<number, string>(source, x => x.toString());
    expect(actual).toEqual({});
});
