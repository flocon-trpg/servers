import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../generator';
import { isIdRecord } from '../../record';
import * as ReplaceOperation from '../../util/replaceOperation';
import { ServerTransform } from '../../util/type';
import * as BoardPosition from '../boardPosition/functions';
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
    const boardPosition = BoardPosition.serverTransform({
        stateBeforeServerOperation: stateBeforeServerOperation,
        stateAfterServerOperation: stateAfterServerOperation,
        clientOperation,
        serverOperation,
    });
    if (boardPosition.isError) {
        return boardPosition;
    }

    const twoWayOperation: TwoWayOperation<typeof template> = {
        ...boardPosition.value,
        $v: undefined,
        $r: undefined,
    };

    twoWayOperation.cellH = ReplaceOperation.serverTransform({
        first: serverOperation?.cellH,
        second: clientOperation.cellH,
        prevState: stateBeforeServerOperation.cellH,
    });
    twoWayOperation.cellW = ReplaceOperation.serverTransform({
        first: serverOperation?.cellW,
        second: clientOperation.cellW,
        prevState: stateBeforeServerOperation.cellW,
    });
    twoWayOperation.cellX = ReplaceOperation.serverTransform({
        first: serverOperation?.cellX,
        second: clientOperation.cellX,
        prevState: stateBeforeServerOperation.cellX,
    });
    twoWayOperation.cellY = ReplaceOperation.serverTransform({
        first: serverOperation?.cellY,
        second: clientOperation.cellY,
        prevState: stateBeforeServerOperation.cellY,
    });
    twoWayOperation.isCellMode = ReplaceOperation.serverTransform({
        first: serverOperation?.isCellMode,
        second: clientOperation.isCellMode,
        prevState: stateBeforeServerOperation.isCellMode,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};
