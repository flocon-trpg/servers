import { FObject, FValue, OnGettingParams } from '@flocon-trpg/flocon-script';
import * as Room from '../ot/flocon/room/types';
import { State } from '../ot/generator/types';
export declare class FParamNames extends FObject {
    private readonly room;
    private readonly mode;
    constructor(room: State<typeof Room.template>, mode: 'Boolean' | 'Number' | 'String');
    private getParamNames;
    private find;
    private ensure;
    private delete;
    getCore({ key, astInfo }: OnGettingParams): FValue;
    setCore(): void;
    toJObject(): unknown;
}
//# sourceMappingURL=paramNames.d.ts.map