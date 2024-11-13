import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../generator/types';
import { isIdRecord } from '../../../record';
import * as TextOperation from '../../../textOperation';
import { ServerTransform } from '../../../util/type';
import { template } from './types';

export const toClientState = (source: State<typeof template>): State<typeof template> => source;

export const serverTransform: ServerTransform<
    State<typeof template>,
    TwoWayOperation<typeof template>,
    UpOperation<typeof template>
> = ({ stateBeforeServerOperation, clientOperation, serverOperation }) => {
    const twoWayOperation: TwoWayOperation<typeof template> = { $v: 1, $r: 1 };

    const name = TextOperation.serverTransform({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: stateBeforeServerOperation.name,
    });
    if (name.isError) {
        return name;
    }
    twoWayOperation.name = name.value;

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok({ ...twoWayOperation });
};
