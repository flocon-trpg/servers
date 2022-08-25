import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../generator';
import { ServerTransform } from '../../../util/type';
import { template } from './types';

export const toClientState = (source: State<typeof template>): State<typeof template> => {
    return source;
};

export const serverTransform: ServerTransform<
    State<typeof template>,
    TwoWayOperation<typeof template>,
    UpOperation<typeof template>
> = () => {
    // ignores all operations
    return Result.ok(undefined);
};
