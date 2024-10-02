import { FObject, FValue, OnGettingParams } from '@flocon-trpg/flocon-script';
import * as Character from '../ot/flocon/room/character/types';
import * as Room from '../ot/flocon/room/types';
import { State } from '../ot/generator/types';
export declare class FBoolParams extends FObject {
    private readonly boolParams;
    private readonly room;
    constructor(boolParams: NonNullable<State<typeof Character.template>['boolParams']>, room: State<typeof Room.template>);
    private findKeysByNameOrKey;
    private findByNameOrKey;
    private toggleValue;
    private setIsValuePrivate;
    getCore({ key, astInfo }: OnGettingParams): FValue;
    setCore(): void;
    toJObject(): unknown;
}
//# sourceMappingURL=boolParams.d.ts.map