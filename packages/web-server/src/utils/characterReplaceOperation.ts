import { CharacterState, replace, update, UpOperation } from '@flocon-trpg/core';
import { CompositeKey } from '@flocon-trpg/utils';

export const characterReplaceOperation = (
    characterKey: CompositeKey,
    newValue: CharacterState | undefined
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
