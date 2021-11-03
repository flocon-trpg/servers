import { both, groupJoinSet, left, right } from '../src';

describe('groupJoinSet', () => {
    it('tests empty Set vs empty Set', () => {
        const leftSet = new Set();
        const rightSet = new Set();
        const actual = groupJoinSet(leftSet, rightSet);
        expect(actual).toEqual(new Map());
    });

    it('tests non-empty Set vs empty Set', () => {
        const leftSet = new Set(['a']);
        const rightSet = new Set();
        const actual = groupJoinSet(leftSet, rightSet);
        const expected = new Map([['a', left]]);
        expect(actual).toEqual(expected);
    });

    it('tests empty Set vs non-empty Set', () => {
        const leftSet = new Set();
        const rightSet = new Set(['a']);
        const actual = groupJoinSet(leftSet, rightSet);
        const expected = new Map([['a', right]]);
        expect(actual).toEqual(expected);
    });

    it('tests non-empty Set vs non-empty Set', () => {
        const leftSet = new Set(['a', 'b']);
        const rightSet = new Set(['b', 'c']);
        const actual = groupJoinSet(leftSet, rightSet);
        const expected = new Map([
            ['a', left],
            ['b', both],
            ['c', right],
        ]);
        expect(actual).toEqual(expected);
    });
});
