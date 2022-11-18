import { FObject, FValue, OnGettingParams, OnSettingParams } from '@flocon-trpg/flocon-script';
import * as Participant from '../ot/flocon/room/participant/types';
import { State } from '../ot/generator';
export declare class FParticipant extends FObject {
    readonly participant: State<typeof Participant.template>;
    constructor(participant: State<typeof Participant.template>);
    getCore({ key }: OnGettingParams): FValue;
    setCore({ key, newValue, astInfo }: OnSettingParams): void;
    toJObject(): unknown;
}
//# sourceMappingURL=participant.d.ts.map