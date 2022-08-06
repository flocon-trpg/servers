import * as ReplaceOperation from '../../util/replaceOperation';
import { template } from './types';
import { State, TwoWayOperation, UpOperation } from '../../generator';
import { ServerTransform } from '../../util/type';
import { isIdRecord } from '../../util/record';
import { Result } from '@kizahasi/result';

export const toClientState = (source: State<typeof template>): State<typeof template> => {
    return source;
};

export const serverTransform: ServerTransform<
    State<typeof template>,
    TwoWayOperation<typeof template>,
    UpOperation<typeof template>
> = ({ prevState, clientOperation, serverOperation }) => {
    const twoWayOperation: TwoWayOperation<typeof template> = {
        $v: 1,
        $r: 1,
    };

    twoWayOperation.shape = ReplaceOperation.serverTransform({
        first: serverOperation?.shape,
        second: clientOperation.shape,
        prevState: prevState.shape,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};
