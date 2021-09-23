import {
    chooseDualKeyRecord,
    chooseRecord,
    dualKeyRecordForEach,
    dualKeyRecordToDualKeyMap,
    isRecordEmpty,
    mapDualKeyRecord,
    mapRecord,
    mapToRecord,
    recordForEach,
    recordForEachAsync,
    recordToArray,
    recordToMap,
} from '../src';

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

describe('chooseRecord', () => {
    it('tests {}', () => {
        const source = {};
        expect(
            chooseRecord(source, () => {
                throw 'this should not be called';
            })
        ).toEqual({});
    });

    it('tests non-empty Record', () => {
        const source = {
            a: 'A',
            b: 'B',
            c: null,
        };
        expect(
            chooseRecord(source, (element, key) => {
                if (element === null) {
                    return null;
                }
                if (key === 'b') {
                    return undefined;
                }
                return key + element;
            })
        ).toEqual({ a: 'aA', c: null });
    });

    it('tests "__proto__" as a key to fail', () => {
        const source: Record<string, number | undefined> = JSON.parse('{ "__proto__": 1 }');
        expect(() => chooseRecord(source, x => x)).toThrow();
    });
});

describe('chooseDualKeyRecord', () => {
    it('tests {}', () => {
        const source = {};
        expect(
            chooseDualKeyRecord(source, () => {
                throw 'this should not be called';
            })
        ).toEqual({});
    });

    it('tests non-empty Record', () => {
        const source: Record<string, Record<string, number | undefined> | undefined> = {
            key1: {},
            key2: {
                key2_0: 0,
                key2_1: 1,
                key2_2: undefined,
            },
            key3: undefined,
        };
        const actual = chooseDualKeyRecord<number, [string, string, string]>(source, (value, key) =>
            value === 0 ? undefined : [value.toString(), key.first, key.second]
        );
        expect(actual).toEqual({
            key1: {},
            key2: {
                key2_1: ['1', 'key2', 'key2_1'],
            },
        });
    });

    it('tests "__proto__" as a first key to fail', () => {
        const source: Record<string, Record<string, number | undefined>> = JSON.parse(
            '{ "__proto__": { "a": 17 } }'
        );
        expect(() => chooseDualKeyRecord(source, x => x)).toThrow();
    });

    it('tests "__proto__" as a second key to fail', () => {
        const source: Record<string, Record<string, number | undefined>> = JSON.parse(
            '{ "a": { "__proto__": 17 } }'
        );
        expect(() => chooseDualKeyRecord(source, x => x)).toThrow();
    });
});

describe('mapRecord', () => {
    it('tests {}', () => {
        const source = {};
        expect(
            mapRecord(source, () => {
                throw 'this should not be called';
            })
        ).toEqual({});
    });

    it('tests non-empty Record', () => {
        const source = {
            a: 'A',
            b: 'B',
            c: null,
        };
        expect(
            mapRecord(source, (element, key) => {
                if (element === null) {
                    return null;
                }
                if (key === 'b') {
                    return undefined;
                }
                return key + element;
            })
        ).toEqual({ a: 'aA', b: undefined, c: null });
    });

    it('tests "__proto__" as a key to fail', () => {
        const source: Record<string, number | undefined> = JSON.parse('{ "__proto__": 1 }');
        expect(() => mapRecord(source, x => x)).toThrow();
    });
});

describe('mapDualKeyRecord', () => {
    it('tests {}', () => {
        const source = {};
        expect(
            mapDualKeyRecord(source, () => {
                throw 'this should not be called';
            })
        ).toEqual({});
    });

    it('tests non-empty Record', () => {
        const source: Record<string, Record<string, number | undefined> | undefined> = {
            key1: {},
            key2: {
                key2_0: 0,
                key2_1: 1,
            },
            key3: undefined,
        };
        const actual = mapDualKeyRecord<number, [string, string, string] | undefined>(
            source,
            (value, key) => (value === 0 ? undefined : [value.toString(), key.first, key.second])
        );
        expect(actual).toEqual({
            key1: {},
            key2: {
                key2_0: undefined,
                key2_1: ['1', 'key2', 'key2_1'],
            },
        });
    });

    it('tests "__proto__" as a first key to fail', () => {
        const source: Record<string, Record<string, number | undefined>> = JSON.parse(
            '{ "__proto__": { "a": 17 } }'
        );
        expect(() => mapDualKeyRecord(source, x => x)).toThrow();
    });

    it('tests "__proto__" as a second key to fail', () => {
        const source: Record<string, Record<string, number | undefined>> = JSON.parse(
            '{ "a": { "__proto__": 17 } }'
        );
        expect(() => mapDualKeyRecord(source, x => x)).toThrow();
    });
});

describe('recordToArray', () => {
    it('tests {}', () => {
        const source = {};
        expect(recordToArray(source)).toEqual([]);
    });

    it('tests non-empty Record', () => {
        const source = { a: 'A', b: 'B' };
        const expected = [
            { key: 'a', value: 'A' },
            { key: 'b', value: 'B' },
        ];
        expect(recordToArray(source).sort()).toEqual(expected.sort());
    });
});

describe('recordToMap', () => {
    it('tests {}', () => {
        const source = {};
        expect(recordToMap(source)).toEqual(new Map());
    });

    it('tests non-empty Record', () => {
        const source = { a: 'A', b: 'B' };
        const expected = new Map([
            ['a', 'A'],
            ['b', 'B'],
        ]);
        expect(recordToMap(source)).toEqual(expected);
    });
});

describe('dualKeyRecordToDualKeyMap', () => {
    it('tests {}', () => {
        const source = {};
        expect(dualKeyRecordToDualKeyMap(source).size).toBe(0);
    });

    it('tests non-empty Record', () => {
        const source = {
            key1: {},
            key2: { key2_1: '2_1', key2_2: '2_2', key2_3: undefined },
            key3: undefined,
            key4: { key4_1: '4_1' },
        };
        const expected = [
            [{ first: 'key2', second: 'key2_1' }, '2_1'] as const,
            [{ first: 'key2', second: 'key2_2' }, '2_2'] as const,
            [{ first: 'key4', second: 'key4_1' }, '4_1'] as const,
        ];
        const actual = [...dualKeyRecordToDualKeyMap(source)];
        const sort = (source: typeof actual) => {
            return source.sort((x, y) => x[1].localeCompare(y[1]));
        };
        expect(sort(actual)).toEqual(sort(expected));
    });
});

describe('recordForEach', () => {
    it('tests {}', () => {
        let execCount = 0;
        recordForEach({}, () => {
            execCount++;
        });
        expect(execCount).toBe(0);
    });

    it('tests non-empty Record', () => {
        const reduced: string[] = [];
        recordForEach({ a: 'A', b: 'B', c: undefined }, (value, key) => {
            reduced.push(key + value);
        });
        expect(reduced).toEqual(['aA', 'bB']);
    });
});

describe('recordForEachAsync', () => {
    it('tests {}', async () => {
        let execCount = 0;
        await recordForEachAsync({}, async () => {
            execCount++;
        });
        expect(execCount).toBe(0);
    });

    it('tests non-empty Record', async () => {
        const reduced: string[] = [];
        await recordForEachAsync({ a: 'A', b: 'B', c: undefined }, async (value, key) => {
            reduced.push(key + value);
        });
        expect(reduced).toEqual(['aA', 'bB']);
    });
});

it.each([
    [{}, true],
    [{ a: undefined }, true],
    [{ a: 17 }, false],
    [{ a: undefined, b: 17 }, false],
])('tests x', (record, expected) => {
    expect(isRecordEmpty(record)).toBe(expected);
});

describe('dualKeyRecordForEach', () => {
    it('tests {}', () => {
        let execCount = 0;
        dualKeyRecordForEach({}, () => {
            execCount++;
        });
        expect(execCount).toBe(0);
    });

    it('tests non-empty Record', () => {
        const source = {
            key1: {},
            key2: { key2_1: '2_1', key2_2: '2_2', key2_3: undefined },
            key3: undefined,
            key4: { key4_1: '4_1' },
        };
        const reduced: string[] = [];
        dualKeyRecordForEach(source, (value, key) => {
            reduced.push(`${key.first}:${key.second}:${value}`);
        });
        expect(reduced.sort()).toEqual(
            ['key2:key2_1:2_1', 'key2:key2_2:2_2', 'key4:key4_1:4_1'].sort()
        );
    });
});
