import { BoardUpOperation, update, UpOperation } from '@kizahasi/flocon-core';
import { CompositeKey } from '@kizahasi/util';

export const boardUpdateOperation = (
    boardKey: CompositeKey,
    operation: BoardUpOperation
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
                            type: update,
                            update: operation,
                        },
                    },
                },
            },
        },
    };
};
