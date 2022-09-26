import { groupJoinArray } from './groupJoinArray';
import { both } from './types';

export const arrayEquals = <T>(x: readonly T[], y: readonly T[]) => {
    return groupJoinArray(x, y).every(elem => {
        if (elem.type !== both) {
            return false;
        }
        return elem.left === elem.right;
    });
};
