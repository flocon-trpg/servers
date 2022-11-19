import {
    ScriptError,
    arrayClass,
    createConsoleClass,
    exec,
    test,
} from '@flocon-trpg/flocon-script';
import { keyNames } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import * as Room from '../ot/flocon/room/types';
import { State } from '../ot/generator';
import { FRoom } from './room';

type RoomState = State<typeof Room.template>;

class CommandError extends Error {
    constructor(message: string, public readonly range?: readonly [number, number]) {
        super(message);
        this.name = 'CommandError';
    }
}

export const testCommand = (script: string): Result<undefined, CommandError> => {
    try {
        test(script);
    } catch (e: unknown) {
        if (e instanceof ScriptError) {
            return Result.error(new CommandError(e.message, e.range));
        }
        if (e instanceof Error) {
            return Result.error(new CommandError(e.message));
        }
        throw e;
    }
    return Result.ok(undefined);
};

type CharacterCommandParams = {
    script: string;
    room: RoomState;
    characterId: string;
    myUserUid: string;
};

type CommandResult = Result<RoomState, CommandError>;

export const execCharacterCommand = ({
    script,
    room,
    characterId,
    myUserUid,
}: CharacterCommandParams): CommandResult => {
    const fRoom = new FRoom(room, myUserUid);
    const fCharacter = fRoom.findCharacter(characterId);
    if (fCharacter == null) {
        throw new Error(`character(${keyNames(characterId)}) not found`);
    }
    const globalThis = {
        room: fRoom,
        character: fCharacter,
        Array: arrayClass,
        console: createConsoleClass('[Floconスクリプト]'),
    };
    try {
        exec(script, globalThis);
    } catch (e: unknown) {
        if (e instanceof ScriptError) {
            return Result.error(new CommandError(e.message, e.range));
        }
        if (e instanceof Error) {
            return Result.error(new CommandError(e.message));
        }
        throw e;
    }
    const result: RoomState = fRoom.room;
    return Result.ok(result);
};
