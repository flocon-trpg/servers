import { __ } from '../src/internal/collection';

it('tests compact', () => {
    const source = __([0, 1, 2]);
    const actual = source.compact(i => (i === 0 ? null : i * -1)).toArray();
    expect(actual).toEqual([-1, -2]);
});

it('tests compactAsync', async () => {
    const source = __([0, 1, 2]);
    const actual = await source
        .compactAsync(async i => (i === 0 ? null : i * -1))
        .toArrayAsync();
    expect(actual).toEqual([-1, -2]);
});

it('tests map', () => {
    const source = __([0, 1, 2]);
    const actual = source.map(i => i * 10).toArray();
    expect(actual).toEqual([0, 10, 20]);
});

it('tests mapAsync', async () => {
    const source = __([0, 1, 2]);
    const actual = await source.mapAsync(async i => i * 10).toArrayAsync();
    expect(actual).toEqual([0, 10, 20]);
});

it('tests toMap', () => {
    const source = __([0, 1, 2]);
    const actual = source.toMap(i => ({ key: i.toString(), value: i }));
    expect(actual.size).toEqual(3);
    expect(actual.get('0')).toEqual(0);
    expect(actual.get('1')).toEqual(1);
    expect(actual.get('2')).toEqual(2);
});

it('tests toMapAsync', async () => {
    const source = __([0, 1, 2]);
    const actual = await source.toMapAsync(async i => ({
        key: i.toString(),
        value: i,
    }));
    expect(actual.size).toEqual(3);
    expect(actual.get('0')).toEqual(0);
    expect(actual.get('1')).toEqual(1);
    expect(actual.get('2')).toEqual(2);
});

it.each`
    count | expected
    ${-1} | ${[0, 1, 2]}
    ${0}  | ${[0, 1, 2]}
    ${1}  | ${[1, 2]}
    ${3}  | ${[]}
    ${4}  | ${[]}
`('tests skip($count)', ({ count, expected }) => {
    const source = __([0, 1, 2]);
    const actual = source.skip(count).toArray();
    expect(actual).toEqual(expected);
});

it.each`
    count | expected
    ${-1} | ${[]}
    ${0}  | ${[]}
    ${1}  | ${[0]}
    ${3}  | ${[0, 1, 2]}
    ${4}  | ${[0, 1, 2]}
`('tests take($count)', ({ count, expected }) => {
    const source = __([0, 1, 2]);
    const actual = source.take(count).toArray();
    expect(actual).toEqual(expected);
});
