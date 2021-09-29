import { BoardState, replace, update, UpOperation } from '@kizahasi/flocon-core';
import { CompositeKey } from '@kizahasi/util';

export const boardReplaceOperation = (
    boardKey: CompositeKey,
    newValue: BoardState | undefined
): UpOperation => {
    return {
        $v: 2,
        participants: {
            [boardKey.createdBy]: {
                type: update,
                update: {
                    $v: 2,
                    boards: {
                        [boardKey.id]: {
                            type: replace,
                            replace: {
                                newValue,
                            },
                        },
                    },
                },
            },
        },
    };
};
