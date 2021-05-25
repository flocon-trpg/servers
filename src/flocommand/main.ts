import { characterAction, CharacterActionElement, toCharacterOperation } from '../@shared/flocommand';
import { ResultModule } from '../@shared/Result';
import { CompositeKey } from '../@shared/StateMap';
import { update } from '../stateManagers/states/types';
import * as Room from '../@shared/ot/room/v1';
import * as Character from '../@shared/ot/room/participant/character/v1';
import { recordToMap } from '../@shared/utils';

export const listCharacterFlocommand = (toml: string) => {
    const compiled = characterAction(toml);
    if (compiled.isError) {
        return compiled;
    }
    return ResultModule.ok(recordToMap(compiled.value));
};

export const executeCharacterFlocommand = ({
    action,
    characterKey,
    character,
    commandKey,
}: {
    action: ReadonlyMap<string, CharacterActionElement>;
    characterKey: CompositeKey;
    character: Character.State;
    commandKey: string;
}): Room.UpOperation | undefined => {
    const operation = toCharacterOperation({ action, currentState: character, commandKey });
    if (operation == null) {
        return undefined;
    }
    const result: Room.UpOperation = {
        $version: 1,
        participants: {
            [characterKey.createdBy]: {
                type: update,
                update: {
                    $version: 1,
                    characters: {
                        [characterKey.id]: {
                            type: update,
                            update: operation,
                        }
                    }
                }
            }
        }
    };

    return result;
};