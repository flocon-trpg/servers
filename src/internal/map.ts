import { GroupJoinResult } from './types';

export const groupJoin = <TKey, TLeft, TRight>(
    left: ReadonlyMap<TKey, TLeft>,
    right: ReadonlyMap<TKey, TRight>
): Map<TKey, GroupJoinResult<TLeft, TRight>> => {
    const result = new Map<TKey, GroupJoinResult<TLeft, TRight>>();
    const rightClone = new Map(right);
    left.forEach((leftElement, key) => {
        const rightElement = rightClone.get(key);
        rightClone.delete(key);
        if (rightElement === undefined) {
            result.set(key, { type: 'left', left: leftElement });
            return;
        }
        result.set(key, {
            type: 'both',
            left: leftElement,
            right: rightElement,
        });
    });
    rightClone.forEach((rightElement, key) => {
        result.set(key, { type: 'right', right: rightElement });
    });
    return result;
};
