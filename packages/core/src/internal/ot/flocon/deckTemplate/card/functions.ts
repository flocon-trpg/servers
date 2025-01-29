import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../generator/types';
import * as NullableTextOperation from '../../../nullableTextOperation';
import { isIdRecord } from '../../../record';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { ServerTransform } from '../../../util/type';
import { template } from './types';

export const serverTransform: ServerTransform<
    State<typeof template>,
    TwoWayOperation<typeof template>,
    UpOperation<typeof template>
> = ({ stateBeforeServerOperation, clientOperation, serverOperation }) => {
    const twoWayOperation: TwoWayOperation<typeof template> = {
        $v: 1,
        $r: 1,
    };

    twoWayOperation.back = ReplaceOperation.serverTransform({
        first: serverOperation?.back,
        second: clientOperation.back,
        prevState: stateBeforeServerOperation.back,
    });

    const description = NullableTextOperation.serverTransform({
        first: serverOperation?.description,
        second: clientOperation.description,
        prevState: stateBeforeServerOperation.description,
    });
    if (description.error) {
        return description;
    }
    twoWayOperation.description = description.value;

    twoWayOperation.face = ReplaceOperation.serverTransform({
        first: serverOperation?.face,
        second: clientOperation.face,
        prevState: stateBeforeServerOperation.face,
    });

    const name = NullableTextOperation.serverTransform({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: stateBeforeServerOperation.name,
    });
    if (name.error) {
        return name;
    }
    twoWayOperation.name = name.value;

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};
