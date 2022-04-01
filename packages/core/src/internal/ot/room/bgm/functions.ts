import * as ReplaceOperation from '../../util/replaceOperation';
import { ServerTransform } from '../../util/type';
import { isIdRecord } from '../../util/record';
import { Result } from '@kizahasi/result';
import { template } from './types';
import { State, TwoWayOperation, UpOperation } from '../../generator';

export const toClientState = (source: State<typeof template>): State<typeof template> => source;

export const serverTransform: ServerTransform<
    State<typeof template>,
    TwoWayOperation<typeof template>,
    UpOperation<typeof template>
> = ({ prevState, clientOperation, serverOperation }) => {
    const twoWayOperation: TwoWayOperation<typeof template> = { $v: 1, $r: 1 };

    twoWayOperation.isPaused = ReplaceOperation.serverTransform({
        first: serverOperation?.isPaused,
        second: clientOperation.isPaused,
        prevState: prevState.isPaused,
    });
    twoWayOperation.files = ReplaceOperation.serverTransform({
        first: serverOperation?.files,
        second: clientOperation.files,
        prevState: prevState.files,
    });
    twoWayOperation.volume = ReplaceOperation.serverTransform({
        first: serverOperation?.volume,
        second: clientOperation.volume,
        prevState: prevState.volume,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};
