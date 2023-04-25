import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../../generator/types';
import { isIdRecord } from '../../../../record';
import * as ReplaceOperation from '../../../../util/replaceOperation';
import { ServerTransform } from '../../../../util/type';
import * as BoardPositionBase from '../../../boardPosition/functions';
import { template } from './types';

export const toClientState = (source: State<typeof template>): State<typeof template> => {
    return source;
};

export const serverTransform: ServerTransform<
    State<typeof template>,
    TwoWayOperation<typeof template>,
    UpOperation<typeof template>
> = ({
    stateBeforeServerOperation,
    stateAfterServerOperation,
    clientOperation,
    serverOperation,
}) => {
    const boardPosition = BoardPositionBase.serverTransform({
        stateBeforeServerOperation: { ...stateBeforeServerOperation, $v: undefined, $r: undefined },
        stateAfterServerOperation: { ...stateAfterServerOperation, $v: undefined, $r: undefined },
        clientOperation: { ...clientOperation, $v: undefined, $r: undefined },
        serverOperation: { ...serverOperation, $v: undefined, $r: undefined },
    });
    if (boardPosition.isError) {
        return boardPosition;
    }

    const twoWayOperation: TwoWayOperation<typeof template> = {
        ...boardPosition.value,
        $v: 2,
        $r: 1,
    };

    twoWayOperation.isPrivate = ReplaceOperation.serverTransform({
        first: serverOperation?.isPrivate,
        second: clientOperation.isPrivate,
        prevState: stateBeforeServerOperation.isPrivate,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};
