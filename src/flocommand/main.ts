import Ajv from 'ajv';
import { CharacterAction, characterActionSchema } from '../@shared/flocommand';
import { Result, ResultModule } from '../@shared/Result';
import { CompositeKey, createStateMap } from '../@shared/StateMap';
import { Character } from '../stateManagers/states/character';
import { Room } from '../stateManagers/states/room';
import { update } from '../stateManagers/states/types';


const addActionToCharacter = ({ key, postOperationSetup, action }: { key: CompositeKey; postOperationSetup: Room.PostOperationSetup; action: CharacterAction }): void => {
    const operation: Character.PostOperation = {
        boolParams: new Map(),
        numParams: new Map(),
        numMaxParams: new Map(),
        strParams: new Map(),
        pieces: createStateMap(),
        tachieLocations: createStateMap(),
    };
    if (action.character?.set?.name != null) {
        operation.name = { newValue: action.character.set.name };
    }
    postOperationSetup.characters.set(key, { type: update, operation });
};

export const flocommand = (json: string) => (characterKey: CompositeKey, myUserUid: string): Result<Room.PostOperation> => {
    const compiler = new Ajv().compile(characterActionSchema);
    const object = JSON.parse(json);
    if (!compiler(object)) {
        return ResultModule.error((compiler.errors ?? [])[0]?.message ?? '不明なエラーが発生しました。');
    }
    const operationSetup = Room.createPostOperationSetup();
    addActionToCharacter({ key: characterKey, postOperationSetup: operationSetup, action: object });
    return ResultModule.ok(Room.setupPostOperation(operationSetup, myUserUid));
};