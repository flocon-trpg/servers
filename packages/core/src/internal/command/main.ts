import * as Room from '../ot/flocon/room/types';
import {
    arrayClass,
    createConsoleClass,
    exec,
    ScriptError,
    test,
} from '@flocon-trpg/flocon-script';
import { FRoom } from './room';
import { keyNames } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { State } from '../ot/generator';

type RoomState = State<typeof Room.template>;

type CommandError = {
    message: string;
    range?: readonly [number, number];
};

export const testCommand = (script: string): Result<undefined, CommandError> => {
    try {
        test(script);
    } catch (e: unknown) {
        if (e instanceof ScriptError) {
            return Result.error({
                message: e.message,
                range: e.range,
            });
        }
        if (e instanceof Error) {
            return Result.error({
                message: e.message,
            });
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
            return Result.error({
                message: e.message,
                range: e.range,
            });
        }
        if (e instanceof Error) {
            return Result.error({
                message: e.message,
            });
        }
        throw e;
    }
    const result: RoomState = fRoom.room;
    return Result.ok(result);
};
