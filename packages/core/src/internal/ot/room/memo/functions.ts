import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../generator';
import { isIdRecord } from '../../util/record';
import * as ReplaceOperation from '../../util/replaceOperation';
import * as TextOperation from '../../util/textOperation';
import { ServerTransform } from '../../util/type';
import { template } from './types';

export const toClientState = (source: State<typeof template>): State<typeof template> => source;

export const serverTransform: ServerTransform<
    State<typeof template>,
    TwoWayOperation<typeof template>,
    UpOperation<typeof template>
> = ({ prevState, clientOperation, serverOperation }) => {
    const twoWayOperation: TwoWayOperation<typeof template> = { $v: 1, $r: 1 };

    // 暫定的にディレクトリの深さは1までとしている
    if ((clientOperation.dir?.newValue.length ?? 0) <= 1) {
        twoWayOperation.dir = ReplaceOperation.serverTransform({
            first: serverOperation?.dir,
            second: clientOperation.dir,
            prevState: prevState.dir,
        });
    }

    const name = TextOperation.serverTransform({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: prevState.name,
    });
    if (name.isError) {
        return name;
    }
    twoWayOperation.name = name.value;

    const text = TextOperation.serverTransform({
        first: serverOperation?.text,
        second: clientOperation.text,
        prevState: prevState.text,
    });
    if (text.isError) {
        return text;
    }
    twoWayOperation.text = text.value;

    twoWayOperation.textType = ReplaceOperation.serverTransform({
        first: serverOperation?.textType,
        second: clientOperation.textType,
        prevState: prevState.textType,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok({ ...twoWayOperation });
};
