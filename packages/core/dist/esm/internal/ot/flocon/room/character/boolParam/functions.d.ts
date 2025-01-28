import { State, TwoWayOperation, UpOperation } from '../../../../generator/types';
import { ServerTransform } from '../../../../util/type';
import { template } from './types';
export declare const toClientState: (isAuthorized: boolean, defaultValue: boolean | undefined) => (source: State<typeof template>) => State<typeof template>;
export declare const serverTransform: (isAuthorized: boolean) => ServerTransform<State<typeof template>, TwoWayOperation<typeof template>, UpOperation<typeof template>>;
//# sourceMappingURL=functions.d.ts.map