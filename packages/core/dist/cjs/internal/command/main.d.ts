import { Result } from '@kizahasi/result';
import * as Room from '../ot/flocon/room/types';
import { State } from '../ot/generator';
type RoomState = State<typeof Room.template>;
declare class CommandError extends Error {
    readonly range?: readonly [number, number] | undefined;
    constructor(message: string, range?: readonly [number, number] | undefined);
}
export declare const testCommand: (script: string) => Result<undefined, CommandError>;
type CharacterCommandParams = {
    script: string;
    room: RoomState;
    characterId: string;
    myUserUid: string;
};
type CommandResult = Result<RoomState, CommandError>;
export declare const execCharacterCommand: ({ script, room, characterId, myUserUid, }: CharacterCommandParams) => CommandResult;
export {};
//# sourceMappingURL=main.d.ts.map