import { CharacterUpOperation, update, UpOperation } from '@kizahasi/flocon-core';
import { CompositeKey } from '@kizahasi/util';

export const characterUpdateOperation = (
    characterKey: CompositeKey,
    operation: CharacterUpOperation
): UpOperation => {
    return {
        $v: 1,
        $r: 2,
        participants: {
            [characterKey.createdBy]: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
                    characters: {
                        [characterKey.id]: {
                            type: update,
                            update: operation,
                        },
                    },
                },
            },
        },
    };
};
