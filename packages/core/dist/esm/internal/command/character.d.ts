import { FObject, FValue, OnGettingParams, OnSettingParams } from '@flocon-trpg/flocon-script';
import * as Character from '../ot/flocon/room/character/types';
import * as Room from '../ot/flocon/room/types';
import { State } from '../ot/generator/types';
export declare class FCharacter extends FObject {
    readonly character: State<typeof Character.template>;
    private readonly room;
    constructor(character: State<typeof Character.template>, room: State<typeof Room.template>);
    getCore({ key, astInfo }: OnGettingParams): FValue;
    setCore({ key, newValue, astInfo }: OnSettingParams): void;
    toJObject(): unknown;
}
//# sourceMappingURL=character.d.ts.map