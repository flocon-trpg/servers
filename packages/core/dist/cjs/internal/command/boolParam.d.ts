import { FObject, FValue, OnGettingParams, OnSettingParams } from '@flocon-trpg/flocon-script';
import * as BoolParam from '../ot/flocon/room/character/boolParam/types';
import { State } from '../ot/generator';
export declare class FBoolParam extends FObject {
    private readonly boolParam;
    constructor(boolParam: State<typeof BoolParam.template>);
    getCore({ key }: OnGettingParams): FValue;
    setCore({ key, newValue, astInfo }: OnSettingParams): void;
    toJObject(): unknown;
}
//# sourceMappingURL=boolParam.d.ts.map