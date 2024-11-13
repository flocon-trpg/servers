import { UpOperation, characterTemplate, roomTemplate, update } from '@flocon-trpg/core';

// TODO: 削除する
export const characterUpdateOperation = (
    characterId: string,
    operation: UpOperation<typeof characterTemplate>,
): UpOperation<typeof roomTemplate> => {
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
