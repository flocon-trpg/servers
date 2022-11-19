import { groupJoinArray } from './groupJoinArray';
import { both } from './types';

export const arrayEquals = <T>(x: readonly T[], y: readonly T[]): boolean => {
    for (const elem of groupJoinArray(x, y)) {
        if (elem.type !== both) {
            return false;
        }
        if (elem.left !== elem.right) {
            return false;
        }
    }
    return true;
};
