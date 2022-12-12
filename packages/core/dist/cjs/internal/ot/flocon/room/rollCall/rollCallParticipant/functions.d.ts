import { State, TwoWayOperation, UpOperation } from '../../../../generator';
import { ServerTransform } from '../../../../util/type';
import { template } from './types';
import { RequestedBy } from '@/ot/requestedBy';
export declare const toClientState: (source: State<typeof template>) => State<typeof template>;
export declare const serverTransform: ({ requestedBy, }: {
    requestedBy: RequestedBy;
}) => ServerTransform<State<typeof template>, TwoWayOperation<typeof template>, UpOperation<typeof template>>;
//# sourceMappingURL=functions.d.ts.map