import { both, left, right } from './types';

type GroupJoinResultType = typeof left | typeof right | typeof both;

export const groupJoinSet = <T>(
    left: ReadonlySet<T>,
    right: ReadonlySet<T>,
): Map<T, GroupJoinResultType> => {
    const result = new Map<T, GroupJoinResultType>();
    const rightClone = new Set(right);
    left.forEach(leftElement => {
        const existsInRight = rightClone.has(leftElement);
        rightClone.delete(leftElement);
        if (existsInRight) {
            result.set(leftElement, 'both');

            return;
        }
        result.set(leftElement, 'left');
    });
    rightClone.forEach(rightElement => {
        result.set(rightElement, 'right');
    });
    return result;
};
