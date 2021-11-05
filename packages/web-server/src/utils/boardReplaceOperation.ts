import { BoardState, replace, update, UpOperation } from '@flocon-trpg/core';
import { CompositeKey } from '@flocon-trpg/utils';

export const boardReplaceOperation = (
    boardKey: CompositeKey,
    newValue: BoardState | undefined
): UpOperation => {
    return {
        $v: 1,
        $r: 2,
        participants: {
            [boardKey.createdBy]: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
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
