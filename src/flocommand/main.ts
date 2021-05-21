import Ajv from 'ajv';
import { CharacterAction, TOML } from '../@shared/flocommand';
import { Result, ResultModule } from '../@shared/Result';
import { CompositeKey, createStateMap } from '../@shared/StateMap';
import { update } from '../stateManagers/states/types';
import * as Room from '../@shared/ot/room/v1';
import * as Character from '../@shared/ot/room/participant/character/v1';

const toCharacterOperation = ({ action }: { action: CharacterAction }) => {
    const result: Character.UpOperation = { $version: 1 };
    if (action.character?.set?.name != null) {
        result.name = { newValue: action.character.set.name };
    }
    return result;
};

export const flocommand = (toml: string) => (characterKey: CompositeKey): Result<Room.UpOperation> => {
    const compiled = TOML.characterAction(toml);
    if (compiled.isError) {
        return compiled;
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
                            update: toCharacterOperation({ action: compiled.value }),
                        }
                    }
                }
            }
        }
    };

    return ResultModule.ok(result);
};