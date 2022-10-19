import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../../generator';
import { isIdRecord } from '../../../../record';
import * as ReplaceOperation from '../../../../util/replaceOperation';
import { ServerTransform } from '../../../../util/type';
import { template } from './types';

export const toClientState = (source: State<typeof template>): State<typeof template> => source;

export const serverTransform: ServerTransform<
    State<typeof template>,
    TwoWayOperation<typeof template>,
    UpOperation<typeof template>
> = ({ prevState, clientOperation, serverOperation }) => {
    const twoWayOperation: TwoWayOperation<typeof template> = { $v: 1, $r: 1 };

    // TODO: 自分以外でも編集できてしまうのでできれば修正したほうがいい。また、偽の時刻を申告できてしまう。
    twoWayOperation.answeredAt = ReplaceOperation.serverTransform({
        first: serverOperation?.answeredAt,
        second: clientOperation.answeredAt,
        prevState: prevState.answeredAt,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok({ ...twoWayOperation });
};
