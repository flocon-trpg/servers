import { GroupJoinResult } from './types';

export function* groupJoinArray<TLeft, TRight>(
    left: readonly TLeft[],
    right: readonly TRight[],
): IterableIterator<GroupJoinResult<TLeft, TRight>> {
    for (let i = 0; ; i++) {
        const leftHasValue = i < left.length;
        const rightHasValue = i < right.length;
        if (leftHasValue) {
            if (rightHasValue) {
                yield { type: 'both', left: left[i]!, right: right[i]! };
                continue;
            }
            yield { type: 'left', left: left[i]! };
            continue;
        }
        if (rightHasValue) {
            yield { type: 'right', right: right[i]! };
            continue;
        }
        return;
    }
}
