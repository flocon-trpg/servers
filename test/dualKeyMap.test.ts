import { Option } from '@kizahasi/option';
import { both, DualKeyMap, groupJoinDualKeyMap, left, right } from '../src';

describe('dualKeyMap', () => {
    it.each([undefined, new Map(), new Map([['a', new Map()]])])(
        'tests constructor with empty object',
        source => {
            const target = new DualKeyMap<string, string, string>(source);

            {
                const cloned = target.clone();
                expect(cloned).not.toBe(target);
                expect(cloned.toMap()).toEqual(target.toMap());
            }
            {
                let loopCount = 0;
                target.forEach(() => {
                    loopCount++;
                });
                expect(loopCount).toBe(0);
            }
            {
                let loopCount = 0;
                target.reduce(() => {
                    loopCount++;
                }, undefined);
                expect(loopCount).toBe(0);
            }
            expect(target.get({ first: 'key1', second: 'key1_2' })).toBeUndefined();
            expect(target.getByFirst('key1')).toEqual(new Map());
            expect(target.has({ first: 'key1', second: 'key1_2' })).toBe(false);
            expect(target.isEmpty).toBe(true);
            expect(target.size).toBe(0);
            expect(target.toArray()).toEqual([]);
            expect(target.toMap()).toEqual(new Map());
            expect(
                target.toStringRecord(
                    x => x,
                    x => x
                )
            ).toEqual({});
        }
    );

    it.each([true, false])('tests constructor with non-empty object', includeInnerEmptyMap => {
        const sourceElement: [string, Map<string, string>] = ['key1', new Map([['key1_2', '1_2']])];
        const source = new Map([sourceElement]);
        if (includeInnerEmptyMap) {
            source.set('key2', new Map());
        }
        const target = new DualKeyMap<string, string, string>(source);

        {
            const cloned = target.clone();
            expect(cloned).not.toBe(target);
            expect(cloned.toMap()).toEqual(target.toMap());
        }
        {
            const reduced: string[] = [];
            target.forEach((value, key) => {
                reduced.push(`${key.first}:${key.second}:${value}`);
            });
            expect(reduced).toEqual(['key1:key1_2:1_2']);
        }
        {
            const reduced = target.reduce((seed, value, key) => {
                seed.push(`${key.first}:${key.second}:${value}`);
                return seed;
            }, [] as string[]);
            expect(reduced).toEqual(['key1:key1_2:1_2']);
        }
        expect(target.get({ first: 'key1', second: 'key1_2' })).toBe('1_2');
        expect(target.get({ first: 'X', second: 'Y' })).toBeUndefined();
        expect(target.getByFirst('key1')).toEqual(new Map([['key1_2', '1_2']]));
        expect(target.getByFirst('X')).toEqual(new Map());
        expect(target.has({ first: 'key1', second: 'key1_2' })).toBe(true);
        expect(target.has({ first: 'X', second: 'Y' })).toBe(false);
        expect(target.isEmpty).toBe(false);
        expect(target.size).toBe(1);
        expect(target.toArray()).toEqual([[{ first: 'key1', second: 'key1_2' }, '1_2']]);
        expect(target.toMap()).toEqual(new Map([sourceElement]));
        expect(
            target.toStringRecord(
                x => x,
                x => x
            )
        ).toEqual({ key1: { key1_2: '1_2' } });
    });

    it('tests ofRecord', () => {
        const actual = DualKeyMap.ofRecord<string, string, string>({
            key1: { key1_2: '1_2', key1_3: undefined, key1_4: '1_4' },
            key2: undefined,
            key3: {},
            key4: { key4_1: '4_1' },
        });
        const expected = { key1: { key1_2: '1_2', key1_4: '1_4' }, key4: { key4_1: '4_1' } };
        expect(
            actual.toStringRecord(
                x => x,
                x => x
            )
        ).toEqual(expected);
    });

    it('tests choose', () => {
        const source = new DualKeyMap<number, number, Option<string>>();
        source.set({ first: 0, second: 0 }, Option.none());
        source.set({ first: 1, second: 1 }, Option.some('1-1'));
        const actual = source.choose(x => x);
        expect(actual.toArray()).toEqual([[{ first: 1, second: 1 }, '1-1']]);
    });

    it('tests map', () => {
        const source = new DualKeyMap<number, number, number>();
        source.set({ first: 0, second: 0 }, 0);
        source.set({ first: 1, second: 1 }, 1);
        const actual = source.map(x => x.toString());
        const expected = new DualKeyMap<number, number, string>();
        expected.set({ first: 0, second: 0 }, '0');
        expected.set({ first: 1, second: 1 }, '1');
        expect(actual.toMap()).toEqual(expected.toMap());
    });

    describe('groupJoinDualKeyMap', () => {
        it('tests empty vs empty', () => {
            const leftDualKeyMap = new DualKeyMap();
            const rightDualKeyMap = new DualKeyMap();
            const actual = groupJoinDualKeyMap(leftDualKeyMap, rightDualKeyMap);
            expect(actual.toMap()).toEqual(new Map());
        });

        it('tests non-empty vs empty', () => {
            const leftDualKeyMap = new DualKeyMap();
            leftDualKeyMap.set({ first: 'key1', second: 'key2' }, 'value');
            const rightDualKeyMap = new DualKeyMap();
            const actual = groupJoinDualKeyMap(leftDualKeyMap, rightDualKeyMap);
            const expected = [
                [
                    { first: 'key1', second: 'key2' },
                    { type: left, left: 'value' },
                ],
            ];
            expect(actual.toArray()).toEqual(expected);
        });

        it('tests empty vs non-empty', () => {
            const leftDualKeyMap = new DualKeyMap();
            const rightDualKeyMap = new DualKeyMap();
            rightDualKeyMap.set({ first: 'key1', second: 'key2' }, 'value');
            const actual = groupJoinDualKeyMap(leftDualKeyMap, rightDualKeyMap);
            const expected = [
                [
                    { first: 'key1', second: 'key2' },
                    { type: right, right: 'value' },
                ],
            ];
            expect(actual.toArray()).toEqual(expected);
        });

        it('tests non-empty vs non-empty', () => {
            const leftDualKeyMap = new DualKeyMap();
            leftDualKeyMap.set({ first: '1', second: '2' }, '1_2_L');
            leftDualKeyMap.set({ first: '1', second: '1' }, '1_1_L');
            const rightDualKeyMap = new DualKeyMap();
            rightDualKeyMap.set({ first: '1', second: '2' }, '1_2_R');
            rightDualKeyMap.set({ first: '2', second: '1' }, '2_1_R');
            const actual = groupJoinDualKeyMap(leftDualKeyMap, rightDualKeyMap);
            const expected = new DualKeyMap();
            expected.set(
                { first: '1', second: '2' },
                { type: both, left: '1_2_L', right: '1_2_R' }
            );
            expected.set({ first: '1', second: '1' }, { type: left, left: '1_1_L' });
            expected.set({ first: '2', second: '1' }, { type: right, right: '2_1_R' });
            expect(actual.toMap()).toEqual(expected.toMap());
        });
    });
});
