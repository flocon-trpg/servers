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

    twoWayOperation.fill = ReplaceOperation.serverTransform({
        first: serverOperation?.fill,
        second: clientOperation.fill,
        prevState: stateBeforeServerOperation.fill,
    });

    twoWayOperation.shape = ReplaceOperation.serverTransform({
        first: serverOperation?.shape,
        second: clientOperation.shape,
        prevState: stateBeforeServerOperation.shape,
    });

    twoWayOperation.stroke = ReplaceOperation.serverTransform({
        first: serverOperation?.stroke,
        second: clientOperation.stroke,
        prevState: stateBeforeServerOperation.stroke,
    });

    twoWayOperation.strokeWidth = ReplaceOperation.serverTransform({
        first: serverOperation?.strokeWidth,
        second: clientOperation.strokeWidth,
        prevState: stateBeforeServerOperation.strokeWidth,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};
