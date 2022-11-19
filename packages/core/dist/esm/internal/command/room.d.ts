import { FObject, FValue, GetCoreParams, SetCoreParams } from '@flocon-trpg/flocon-script';
import * as Room from '../ot/flocon/room/types';
import { State } from '../ot/generator';
import { FCharacter } from './character';
export declare class FRoom extends FObject {
    private readonly myUserUid;
    private readonly _room;
    constructor(source: State<typeof Room.template>, myUserUid: string);
    get room(): State<typeof Room.template>;
    findCharacter(stateId: string): FCharacter | undefined;
    getCore({ key }: GetCoreParams): FValue;
    setCore({ key, newValue, astInfo }: SetCoreParams): void;
    toJObject(): unknown;
}
//# sourceMappingURL=room.d.ts.map