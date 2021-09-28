import * as Room from '../ot/room/types';
import { exec, ScriptError, test } from '@kizahasi/flocon-script';
import { FRoom } from './room';
import { CompositeKey, keyNames } from '@kizahasi/util';
import { Result } from '@kizahasi/result';

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
    room: Room.State;
    characterKey: CompositeKey;
};

type CommandResult = Result<Room.State, CommandError>;

export const execCharacterCommand = ({
    script,
    room,
    characterKey,
}: CharacterCommandParams): CommandResult => {
    const fRoom = new FRoom(room);
    const fCharacter = fRoom.findCharacter(characterKey);
    if (fCharacter == null) {
        throw new Error(`character(${keyNames(characterKey)}) not found`);
    }
    const globalThis = { room: fRoom, character: fCharacter };
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
    const result: Room.State = fRoom.room;
    return Result.ok(result);
};
