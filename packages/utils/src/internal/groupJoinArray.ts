import { GroupJoinResult } from './types';

export const groupJoinArray = <TLeft, TRight>(
    left: readonly TLeft[],
    right: readonly TRight[]
): GroupJoinResult<TLeft, TRight>[] => {
    const result: GroupJoinResult<TLeft, TRight>[] = [];
    for (let i = 0; ; i++) {
        const leftHasValue = i < left.length;
        const rightHasValue = i < right.length;
        if (leftHasValue) {
            if (rightHasValue) {
                result.push({ type: 'both', left: left[i]!, right: right[i]! });
                continue;
            }
            result.push({ type: 'left', left: left[i]! });
            continue;
        }
        if (rightHasValue) {
            result.push({ type: 'right', right: right[i]! });
            continue;
        }
        return result;
    }
};
