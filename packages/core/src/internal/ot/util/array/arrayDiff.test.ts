import { OperationArrayElement } from '@kizahasi/ot-core';
import { arrayDiff } from './arrayDiff';

type Format<T> =
    | {
          retain: number;
      }
    | {
          insert?: T;
          delete?: T;
      };

function format<T>(source: Iterable<OperationArrayElement<T, T>>) {
    const result: Format<T>[] = [];
    for (const elem of source) {
        if (elem.type === 'retain') {
            result.push({ retain: elem.retain.value });
            continue;
        }
        result.push({
            insert: elem.edit.insert,
            delete: elem.edit.delete,
        });
    }
    return result;
}

describe('arrayDiff', () => {
    it('tests same empty arrays', () => {
        const actualIterable = arrayDiff({ prev: [], next: [], getKey: x => x }).iterate();
        const actual = [...actualIterable];
        expect(actual).toEqual([]);
    });

    it('tests same non-empty arrays', () => {
        const actualIterable = arrayDiff({
            prev: [1, 2, 3],
            next: [1, 2, 3],
            getKey: x => x,
        }).iterate();
        const actual = format(actualIterable);
        const expected: typeof actual = [{ retain: 3 }];
        expect(actual).toEqual(expected);
    });

    it('tests inserting to non-empty array', () => {
        const actualIterable = arrayDiff({ prev: [], next: [1, 2, 3], getKey: x => x }).iterate();
        const actual = format(actualIterable);
        const expected: typeof actual = [{ insert: [1, 2, 3] }];
        expect(actual).toEqual(expected);
    });

    it('tests deleting all elements', () => {
        const actualIterable = arrayDiff({ prev: [1, 2, 3], next: [], getKey: x => x }).iterate();
        const actual = format(actualIterable);
        const expected: typeof actual = [{ delete: [1, 2, 3] }];
        expect(actual).toEqual(expected);
    });

    it('tests swap', () => {
        const actualIterable = arrayDiff({
            prev: [1, 2, 3, 4, 5, 6, 7],
            next: [1, 3, 2, 4, 6, 7, 5],
            getKey: x => x,
        }).iterate();
        const actual = format(actualIterable);
        // 1,2,4,5,6 を retain としているが、1,3,4,5,6 を retain とするのも問題ない。どちらにすべきかは現時点では仕様が定まっていない。
        const expected: typeof actual = [
            { retain: 1 },
            { insert: [3] },
            { retain: 1 },
            { delete: [3] },
            { retain: 1 },
            { delete: [5] },
            { retain: 2 },
            { insert: [5] },
        ];
        expect(actual).toEqual(expected);
    });
});
