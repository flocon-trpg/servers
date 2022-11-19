import { FObject, FValue, OnGettingParams } from '@flocon-trpg/flocon-script';
import * as Character from '../ot/flocon/room/character/types';
import * as Room from '../ot/flocon/room/types';
import { State } from '../ot/generator';
export declare class FStrParams extends FObject {
    private readonly strParams;
    private readonly room;
    constructor(strParams: NonNullable<State<typeof Character.template>['strParams']>, room: State<typeof Room.template>);
    private findKeysByName;
    private findByName;
    private setIsValuePrivate;
    getCore({ key, astInfo }: OnGettingParams): FValue;
    setCore(): void;
    toJObject(): unknown;
}
//# sourceMappingURL=strParams.d.ts.map