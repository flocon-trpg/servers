import { State, TwoWayOperation, UpOperation } from '../../../../generator';
import { RequestedBy } from '../../../../requestedBy';
import { ServerTransform } from '../../../../util/type';
import * as Room from '../../types';
import { template } from './types';
export declare const toClientState: (requestedBy: RequestedBy, currentRoomState: State<typeof Room.template>) => (source: State<typeof template>) => State<typeof template>;
export declare const serverTransform: (requestedBy: RequestedBy, currentRoomState: State<typeof Room.template>) => ServerTransform<State<typeof template>, TwoWayOperation<typeof template>, UpOperation<typeof template>>;
//# sourceMappingURL=functions.d.ts.map