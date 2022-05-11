import { ServerTransform } from '../../../util/type';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { isIdRecord } from '../../../util/record';
import { Result } from '@kizahasi/result';
import { RequestedBy, admin, isOwner } from '../../../util/requestedBy';
import { template } from './types';
import { State, TwoWayOperation, UpOperation } from '../../../generator';

export const toClientState = (source: State<typeof template>): State<typeof template> => {
    return source;
};

export const serverTransform =
    ({
        requestedBy,
        participantKey,
    }: {
        requestedBy: RequestedBy;
        participantKey: string;
    }): ServerTransform<
        State<typeof template>,
        TwoWayOperation<typeof template>,
        UpOperation<typeof template>
    > =>
    ({ prevState, clientOperation, serverOperation }) => {
        const isAuthorized = isOwner({
            requestedBy,
            ownerParticipantId: participantKey,
        });

        const twoWayOperation: TwoWayOperation<typeof template> = {
            $v: 2,
            $r: 1,
        };

        if (isAuthorized) {
            // CONSIDER: ユーザーがnameをnullishに変更することは禁止すべきかもしれない
            twoWayOperation.name = ReplaceOperation.serverTransform({
                first: serverOperation?.name ?? undefined,
                second: clientOperation.name ?? undefined,
                prevState: prevState.name,
            });
        }

        if (requestedBy.type === admin) {
            twoWayOperation.role = ReplaceOperation.serverTransform({
                first: serverOperation?.role ?? undefined,
                second: clientOperation.role ?? undefined,
                prevState: prevState.role,
            });
        }

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };
