import { FObject, FValue, OnGettingParams, OnSettingParams } from '@flocon-trpg/flocon-script';
import * as NumParam from '../ot/flocon/room/character/numParam/types';
import { State } from '../ot/generator';
export declare class FNumParam extends FObject {
    private readonly numParam;
    constructor(numParam: State<typeof NumParam.template>);
    getCore({ key }: OnGettingParams): FValue;
    setCore({ key, newValue, astInfo }: OnSettingParams): void;
    toJObject(): unknown;
}
//# sourceMappingURL=numParam.d.ts.map