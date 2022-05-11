import { Result } from '@kizahasi/result';
import { isIdRecord } from '../../../../util/record';
import * as ReplaceOperation from '../../../../util/replaceOperation';
import { ServerTransform } from '../../../../util/type';
import * as BoardPositionBase from '../../../boardPositionBase/functions';
import { template } from './types';
import { State, TwoWayOperation, UpOperation } from '../../../../generator';

export const toClientState = (source: State<typeof template>): State<typeof template> => {
    return source;
};

export const serverTransform: ServerTransform<
    State<typeof template>,
    TwoWayOperation<typeof template>,
    UpOperation<typeof template>
> = ({ prevState, currentState, clientOperation, serverOperation }) => {
    const boardPosition = BoardPositionBase.serverTransform({
        prevState: { ...prevState, $v: undefined, $r: undefined },
        currentState: { ...currentState, $v: undefined, $r: undefined },
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
        prevState: prevState.isPrivate,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};
