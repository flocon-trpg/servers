import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../generator/types';
import { isIdRecord } from '../../../record';
import * as TextOperation from '../../../textOperation';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { ServerTransform } from '../../../util/type';
import { template } from './types';

export const toClientState = (source: State<typeof template>): State<typeof template> => source;

export const serverTransform: ServerTransform<
    State<typeof template>,
    TwoWayOperation<typeof template>,
    UpOperation<typeof template>
> = ({ stateBeforeServerOperation, clientOperation, serverOperation }) => {
    const twoWayOperation: TwoWayOperation<typeof template> = { $v: 1, $r: 1 };

    // 暫定的にディレクトリの深さは1までとしている
    if ((clientOperation.dir?.newValue.length ?? 0) <= 1) {
        twoWayOperation.dir = ReplaceOperation.serverTransform({
            first: serverOperation?.dir,
            second: clientOperation.dir,
            prevState: stateBeforeServerOperation.dir,
        });
    }

    const name = TextOperation.serverTransform({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: stateBeforeServerOperation.name,
    });
    if (name.isError) {
        return name;
    }
    twoWayOperation.name = name.value;

    const text = TextOperation.serverTransform({
        first: serverOperation?.text,
        second: clientOperation.text,
        prevState: stateBeforeServerOperation.text,
    });
    if (text.isError) {
        return text;
    }
    twoWayOperation.text = text.value;

    twoWayOperation.textType = ReplaceOperation.serverTransform({
        first: serverOperation?.textType,
        second: clientOperation.textType,
        prevState: stateBeforeServerOperation.textType,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok({ ...twoWayOperation });
};
