import { FObject, FValue, OnGettingParams } from '@flocon-trpg/flocon-script';
import * as Character from '../ot/flocon/room/character/types';
import * as Room from '../ot/flocon/room/types';
import { State } from '../ot/generator';
export declare class FNumParams extends FObject {
    private readonly numParams;
    private readonly room;
    constructor(numParams: NonNullable<State<typeof Character.template>['numParams']>, room: State<typeof Room.template>);
    private findKeysByName;
    private findByName;
    private incrOrDecrValue;
    private setIsValuePrivate;
    getCore({ key, astInfo }: OnGettingParams): FValue;
    setCore(): void;
    toJObject(): unknown;
}
//# sourceMappingURL=numParams.d.ts.map