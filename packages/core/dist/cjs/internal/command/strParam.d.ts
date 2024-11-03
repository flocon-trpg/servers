import { FObject, FValue, OnGettingParams, OnSettingParams } from '@flocon-trpg/flocon-script';
import * as StrParam from '../ot/flocon/room/character/strParam/types';
import { State } from '../ot/generator/types';
export declare class FStrParam extends FObject {
    private readonly strParam;
    constructor(strParam: State<typeof StrParam.template>);
    getCore({ key }: OnGettingParams): FValue;
    setCore({ key, newValue, astInfo }: OnSettingParams): void;
    toJObject(): unknown;
}
//# sourceMappingURL=strParam.d.ts.map