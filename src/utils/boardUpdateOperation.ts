import { BoardUpOperation, update, UpOperation } from '@kizahasi/flocon-core';
import { CompositeKey } from '@kizahasi/util';

export const boardUpdateOperation = (
    boardKey: CompositeKey,
    operation: BoardUpOperation
): UpOperation => {
    return {
        $v: 1,
        participants: {
            [boardKey.createdBy]: {
                type: update,
                update: {
                    $v: 1,
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
