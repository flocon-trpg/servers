import { update } from '../stateManagers/states/types';
import { Result } from '@kizahasi/result';
import { CompositeKey, recordToMap } from '@kizahasi/util';
import { CharacterActionElement, characterActionToOperation, CharacterState, tomlToCharacterAction, UpOperation } from '@kizahasi/flocon-core';

export const listCharacterFlocommand = (toml: string) => {
    const compiled = tomlToCharacterAction(toml);
    if (compiled.isError) {
        return compiled;
    }
    return Result.ok(recordToMap(compiled.value));
};

export const executeCharacterFlocommand = ({
    action,
    characterKey,
    character,
    commandKey,
}: {
    action: ReadonlyMap<string, CharacterActionElement>;
    characterKey: CompositeKey;
    character: CharacterState;
    commandKey: string;
}): UpOperation | undefined => {
    const operation = characterActionToOperation({ action, currentState: character, commandKey });
    if (operation == null) {
        return undefined;
    }
    const result: UpOperation = {
        $version: 1,
        characters: {
            [characterKey.createdBy]: {
                [characterKey.id]: {
                    type: update,
                    update: operation,
                }
            }
        }
    };

    return result;
};