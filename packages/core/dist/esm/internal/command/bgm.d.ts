import { FObject, FValue, OnGettingParams, OnSettingParams } from '@flocon-trpg/flocon-script';
import * as BgmTypes from '../ot/flocon/room/bgm/types';
import { State } from '../ot/generator';
export declare class FBgm extends FObject {
    private readonly bgm;
    constructor(bgm: State<typeof BgmTypes.template>);
    getCore({ key }: OnGettingParams): FValue;
    setCore({ key, newValue, astInfo }: OnSettingParams): void;
    toJObject(): unknown;
}
//# sourceMappingURL=bgm.d.ts.map