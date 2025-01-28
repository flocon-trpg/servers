import { FObject, FValue, OnGettingParams } from '@flocon-trpg/flocon-script';
import * as RoomTypes from '../ot/flocon/room/types';
import { State } from '../ot/generator/types';
export declare class FBgms extends FObject {
    private readonly room;
    constructor(room: State<typeof RoomTypes.template>);
    private find;
    private ensure;
    private delete;
    getCore({ key, astInfo }: OnGettingParams): FValue;
    setCore(): void;
    toJObject(): unknown;
}
//# sourceMappingURL=bgms.d.ts.map