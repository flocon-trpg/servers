import { State, TwoWayOperation, UpOperation } from '../../../../generator';
import { ServerTransform } from '../../../../util/type';
import { template } from './types';
export declare const toClientState: (source: State<typeof template>) => State<typeof template>;
export declare const serverTransform: ServerTransform<State<typeof template>, TwoWayOperation<typeof template>, UpOperation<typeof template>>;
//# sourceMappingURL=functions.d.ts.map