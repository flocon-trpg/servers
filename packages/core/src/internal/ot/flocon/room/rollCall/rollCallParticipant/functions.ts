import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../../generator/types';
import { isIdRecord } from '../../../../record';
import { RequestedBy, admin } from '../../../../requestedBy';
import * as ReplaceOperation from '../../../../util/replaceOperation';
import { ServerTransform } from '../../../../util/type';
import { template } from './types';

export const toClientState = (source: State<typeof template>): State<typeof template> => source;

export const serverTransform =
    ({
        requestedBy,
    }: {
        requestedBy: RequestedBy;
    }): ServerTransform<
        State<typeof template>,
        TwoWayOperation<typeof template>,
        UpOperation<typeof template>
    > =>
    ({ stateBeforeServerOperation, serverOperation, clientOperation }) => {
        const isAdmin = requestedBy.type === admin;
        if (!isAdmin) {
            return Result.ok(undefined);
        }

        const twoWayOperation: TwoWayOperation<typeof template> = { $v: 1, $r: 1 };

        twoWayOperation.answeredAt = ReplaceOperation.serverTransform({
            first: serverOperation?.answeredAt,
            second: clientOperation.answeredAt,
            prevState: stateBeforeServerOperation.answeredAt,
        });

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };
