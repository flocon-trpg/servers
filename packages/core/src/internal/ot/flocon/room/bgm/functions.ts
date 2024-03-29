import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../generator/types';
import { isIdRecord } from '../../../record';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { ServerTransform } from '../../../util/type';
import { template } from './types';

export const toClientState = (source: State<typeof template>): State<typeof template> => source;

export const serverTransform: ServerTransform<
    State<typeof template>,
    TwoWayOperation<typeof template>,
    UpOperation<typeof template>
> = ({ stateBeforeServerOperation, clientOperation, serverOperation }) => {
    const twoWayOperation: TwoWayOperation<typeof template> = { $v: 1, $r: 1 };

    twoWayOperation.isPaused = ReplaceOperation.serverTransform({
        first: serverOperation?.isPaused,
        second: clientOperation.isPaused,
        prevState: stateBeforeServerOperation.isPaused,
    });
    twoWayOperation.files = ReplaceOperation.serverTransform({
        first: serverOperation?.files,
        second: clientOperation.files,
        prevState: stateBeforeServerOperation.files,
    });
    twoWayOperation.volume = ReplaceOperation.serverTransform({
        first: serverOperation?.volume,
        second: clientOperation.volume,
        prevState: stateBeforeServerOperation.volume,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};
