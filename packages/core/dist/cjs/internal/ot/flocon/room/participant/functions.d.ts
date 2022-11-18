import { State, TwoWayOperation, UpOperation } from '../../../generator';
import { RequestedBy } from '../../../requestedBy';
import { ServerTransform } from '../../../util/type';
import { template } from './types';
export declare const toClientState: (source: State<typeof template>) => State<typeof template>;
export declare const serverTransform: ({ requestedBy, participantKey, }: {
    requestedBy: RequestedBy;
    participantKey: string;
}) => ServerTransform<State<typeof template>, TwoWayOperation<typeof template>, UpOperation<typeof template>>;
//# sourceMappingURL=functions.d.ts.map