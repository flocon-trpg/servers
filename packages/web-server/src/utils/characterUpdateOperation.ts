import { CharacterUpOperation, update, UpOperation } from '@flocon-trpg/core';

export const characterUpdateOperation = (
    characterId: string,
    operation: CharacterUpOperation
): UpOperation => {
    return {
        $v: 2,
        $r: 1,
        characters: {
            [characterId]: {
                type: update,
                update: operation,
            },
        },
    };
};
