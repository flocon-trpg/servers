import { CharacterState, replace, update, UpOperation } from '@kizahasi/flocon-core';
import { CompositeKey } from '@kizahasi/util';

export const characterReplaceOperation = (
    characterKey: CompositeKey,
    newValue: CharacterState | undefined
): UpOperation => {
    return {
        $v: 2,
        participants: {
            [characterKey.createdBy]: {
                type: update,
                update: {
                    $v: 2,
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
