import { Result } from '@kizahasi/result';
import { isIdRecord } from '../util/record';
import * as ReplaceOperation from '../util/replaceOperation';
import { ServerTransform } from '../util/type';
import * as NullableTextOperation from '../util/nullableTextOperation';
import { template } from './types';
import { State, TwoWayOperation, UpOperation } from '../generator';

export const toClientState = (source: State<typeof template>): State<typeof template> => {
    return source;
};

export const serverTransform: ServerTransform<
    State<typeof template>,
    TwoWayOperation<typeof template>,
    UpOperation<typeof template>
> = ({ prevState, clientOperation, serverOperation }) => {
    const twoWayOperation: TwoWayOperation<typeof template> = { $v: undefined, $r: undefined };

    twoWayOperation.h = ReplaceOperation.serverTransform({
        first: serverOperation?.h,
        second: clientOperation.h,
        prevState: prevState.h,
    });

    twoWayOperation.isPositionLocked = ReplaceOperation.serverTransform({
        first: serverOperation?.isPositionLocked,
        second: clientOperation.isPositionLocked,
        prevState: prevState.isPositionLocked,
    });

    const transformedMemo = NullableTextOperation.serverTransform({
        first: serverOperation?.memo,
        second: clientOperation.memo,
        prevState: prevState.memo,
    });
    if (transformedMemo.isError) {
        return transformedMemo;
    }
    twoWayOperation.memo = transformedMemo.value;

    const transformedName = NullableTextOperation.serverTransform({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: prevState.name,
    });
    if (transformedName.isError) {
        return transformedName;
    }
    twoWayOperation.name = transformedName.value;

    twoWayOperation.opacity = ReplaceOperation.serverTransform({
        first: serverOperation?.opacity,
        second: clientOperation.opacity,
        prevState: prevState.opacity,
    });

    twoWayOperation.w = ReplaceOperation.serverTransform({
        first: serverOperation?.w,
        second: clientOperation.w,
        prevState: prevState.w,
    });

    twoWayOperation.x = ReplaceOperation.serverTransform({
        first: serverOperation?.x,
        second: clientOperation.x,
        prevState: prevState.x,
    });

    twoWayOperation.y = ReplaceOperation.serverTransform({
        first: serverOperation?.y,
        second: clientOperation.y,
        prevState: prevState.y,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};
