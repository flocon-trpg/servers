import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../generator/types';
import * as NullableTextOperation from '../../nullableTextOperation';
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
    const twoWayOperation: TwoWayOperation<typeof template> = { $v: undefined, $r: undefined };

    twoWayOperation.h = ReplaceOperation.serverTransform({
        first: serverOperation?.h,
        second: clientOperation.h,
        prevState: stateBeforeServerOperation.h,
    });

    twoWayOperation.isPositionLocked = ReplaceOperation.serverTransform({
        first: serverOperation?.isPositionLocked,
        second: clientOperation.isPositionLocked,
        prevState: stateBeforeServerOperation.isPositionLocked,
    });

    const transformedMemo = NullableTextOperation.serverTransform({
        first: serverOperation?.memo,
        second: clientOperation.memo,
        prevState: stateBeforeServerOperation.memo,
    });
    if (transformedMemo.isError) {
        return transformedMemo;
    }
    twoWayOperation.memo = transformedMemo.value;

    const transformedName = NullableTextOperation.serverTransform({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: stateBeforeServerOperation.name,
    });
    if (transformedName.isError) {
        return transformedName;
    }
    twoWayOperation.name = transformedName.value;

    twoWayOperation.opacity = ReplaceOperation.serverTransform({
        first: serverOperation?.opacity,
        second: clientOperation.opacity,
        prevState: stateBeforeServerOperation.opacity,
    });

    twoWayOperation.w = ReplaceOperation.serverTransform({
        first: serverOperation?.w,
        second: clientOperation.w,
        prevState: stateBeforeServerOperation.w,
    });

    twoWayOperation.x = ReplaceOperation.serverTransform({
        first: serverOperation?.x,
        second: clientOperation.x,
        prevState: stateBeforeServerOperation.x,
    });

    twoWayOperation.y = ReplaceOperation.serverTransform({
        first: serverOperation?.y,
        second: clientOperation.y,
        prevState: stateBeforeServerOperation.y,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};
