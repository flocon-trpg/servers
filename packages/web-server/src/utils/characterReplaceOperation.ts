import { CharacterState, replace, UpOperation } from '@flocon-trpg/core';

export const characterReplaceOperation = (
    characterId: string,
    newValue: CharacterState | undefined
): UpOperation => {
    return {
        $v: 2,
        $r: 1,
        characters: {
            [characterId]: {
                type: replace,
                replace: {
                    newValue,
                },
            },
        },
    };
};
