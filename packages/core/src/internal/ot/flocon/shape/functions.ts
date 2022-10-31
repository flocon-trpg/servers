import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../generator';
import { isIdRecord } from '../../record';
import * as ReplaceOperation from '../../util/replaceOperation';
import { ServerTransform } from '../../util/type';
import { template } from './types';

export const toClientState = (source: State<typeof template>): State<typeof template> => {
    return source;
};

export const serverTransform: ServerTransform<
    State<typeof template>,
    TwoWayOperation<typeof template>,
    UpOperation<typeof template>
> = ({ stateBeforeServerOperation, clientOperation, serverOperation }) => {
    const twoWayOperation: TwoWayOperation<typeof template> = {
        $v: 1,
        $r: 1,
    };

    twoWayOperation.shape = ReplaceOperation.serverTransform({
        first: serverOperation?.shape,
        second: clientOperation.shape,
        prevState: stateBeforeServerOperation.shape,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};
