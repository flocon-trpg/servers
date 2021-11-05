import { BoardUpOperation, update, UpOperation } from '@flocon-trpg/core';
import { CompositeKey } from '@flocon-trpg/utils';

export const boardUpdateOperation = (
    boardKey: CompositeKey,
    operation: BoardUpOperation
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
                            type: update,
                            update: operation,
                        },
                    },
                },
            },
        },
    };
};
