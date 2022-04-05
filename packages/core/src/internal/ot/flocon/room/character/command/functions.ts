import * as TextOperation from '../../../../util/textOperation';
import { ServerTransform } from '../../../../util/type';
import { isIdRecord } from '../../../../util/record';
import { Result } from '@kizahasi/result';
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
    const twoWayOperation: TwoWayOperation<typeof template> = {
        $v: 1,
        $r: 1,
    };

    const name = TextOperation.serverTransform({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: prevState.name,
    });
    if (name.isError) {
        return name;
    }
    twoWayOperation.name = name.value;

    const value = TextOperation.serverTransform({
        first: serverOperation?.value,
        second: clientOperation.value,
        prevState: prevState.value,
    });
    if (value.isError) {
        return value;
    }
    twoWayOperation.value = value.value;

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};
