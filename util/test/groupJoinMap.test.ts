import { both, groupJoinMap, left, right } from '../src';

describe('groupJoinMap', () => {
    it('tests empty Map vs empty Map', () => {
        const leftMap = new Map();
        const rightMap = new Map();
        const actual = groupJoinMap(leftMap, rightMap);
        expect(actual).toEqual(new Map());
    });

    it('tests non-empty Map vs empty Map', () => {
        const leftMap = new Map([['a', 'A']]);
        const rightMap = new Map();
        const actual = groupJoinMap(leftMap, rightMap);
        const expected = new Map([['a', { type: left, left: 'A' }]]);
        expect(actual).toEqual(expected);
    });

    it('tests empty Map vs non-empty Map', () => {
        const leftMap = new Map();
        const rightMap = new Map([['a', 'A']]);
        const actual = groupJoinMap(leftMap, rightMap);
        const expected = new Map([['a', { type: right, right: 'A' }]]);
        expect(actual).toEqual(expected);
    });

    it('tests non-empty Map vs non-empty Map', () => {
        const leftMap = new Map([
            ['a', 'A'],
            ['b', 'Bl'],
        ]);
        const rightMap = new Map([
            ['b', 'Br'],
            ['c', 'C'],
        ]);
        const actual = groupJoinMap(leftMap, rightMap);
        const expected = new Map([
            ['a', { type: left, left: 'A' }],
            ['b', { type: both, left: 'Bl', right: 'Br' }],
            ['c', { type: right, right: 'C' }],
        ]);
        expect(actual).toEqual(expected);
    });
});
