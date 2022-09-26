import { both, groupJoinArray, left, right } from '../src';
import { GroupJoinResult } from '../src/internal/types';

describe('groupJoinArray', () => {
    it('tests empty vs empty', () => {
        const leftArray: never[] = [];
        const rightArray: never[] = [];
        const actual = groupJoinArray(leftArray, rightArray);
        expect(actual).toEqual([]);
    });

    it('tests non-empty vs empty', () => {
        const leftArray = [1];
        const rightArray: never[] = [];
        const actual = groupJoinArray(leftArray, rightArray);
        const expected: GroupJoinResult<number, never>[] = [{ type: left, left: 1 }];
        expect(actual).toEqual(expected);
    });

    it('tests empty vs non-empty', () => {
        const leftArray: never[] = [];
        const rightArray = [1];
        const actual = groupJoinArray(leftArray, rightArray);
        const expected: GroupJoinResult<never, number>[] = [{ type: right, right: 1 }];
        expect(actual).toEqual(expected);
    });

    it('tests length=2 vs length=2', () => {
        const leftArray = [1, 2];
        const rightArray = ['1', '2'];
        const actual = groupJoinArray(leftArray, rightArray);
        const expected: GroupJoinResult<number, string>[] = [
            { type: both, left: 1, right: '1' },
            { type: both, left: 2, right: '2' },
        ];
        expect(actual).toEqual(expected);
    });

    it('tests length=3 vs length=2', () => {
        const leftArray = [1, 2, 3];
        const rightArray = ['1', '2'];
        const actual = groupJoinArray(leftArray, rightArray);
        const expected: GroupJoinResult<number, string>[] = [
            { type: both, left: 1, right: '1' },
            { type: both, left: 2, right: '2' },
            { type: left, left: 3 },
        ];
        expect(actual).toEqual(expected);
    });

    it('tests length=2 vs length=3', () => {
        const leftArray = [1, 2];
        const rightArray = ['1', '2', '3'];
        const actual = groupJoinArray(leftArray, rightArray);
        const expected: GroupJoinResult<number, string>[] = [
            { type: both, left: 1, right: '1' },
            { type: both, left: 2, right: '2' },
            { type: right, right: '3' },
        ];
        expect(actual).toEqual(expected);
    });
});
