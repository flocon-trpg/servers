import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../generator/types';
import { isIdRecord } from '../../../record';
import * as RecordOperation from '../../../recordOperation';
import { RequestedBy, admin, isAuthorized } from '../../../requestedBy';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { ServerTransform } from '../../../util/type';
import { isOpenRollCall } from './isOpenRollCall';
import * as Participant from './rollCallParticipant/functions';
import { template } from './types';

export const toClientState = (source: State<typeof template>): State<typeof template> => {
    return {
        ...source,
        participants: RecordOperation.toClientState({
            serverState: source.participants,
            isPrivate: () => false,
            toClientState: ({ state }) => Participant.toClientState(state),
        }),
    };
};

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
    ({
        stateBeforeServerOperation,
        stateAfterServerOperation,
        clientOperation,
        serverOperation,
    }) => {
        const isOpenRollCallValue = isOpenRollCall(stateAfterServerOperation);
        const isAdmin = requestedBy.type === admin;

        const participants = RecordOperation.serverTransform({
            stateBeforeFirst: stateBeforeServerOperation.participants ?? {},
            stateAfterFirst: stateAfterServerOperation.participants ?? {},
            first: serverOperation?.participants,
            second: clientOperation.participants,
            innerTransform: ({ prevState, nextState, first, second }) =>
                Participant.serverTransform({
                    requestedBy,
                })({
                    stateBeforeServerOperation: prevState,
                    stateAfterServerOperation: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                // Master および Player は自分の userUid であれば追加できる。
                // Spectator は Operate Mutation を実行しても無視されるため、Spectator を弾く処理は必要ない。
                cancelCreate: ({ key }) =>
                    !(isOpenRollCallValue && isAuthorized({ requestedBy, participantId: key })),
                cancelRemove: () => !isAdmin,
            },
        });
        if (participants.isError) {
            return participants;
        }

        const twoWayOperation: TwoWayOperation<typeof template> = {
            $v: 1,
            $r: 1,
            participants: participants.value,
        };

        if (isAdmin) {
            twoWayOperation.closeStatus = ReplaceOperation.serverTransform({
                first: serverOperation?.closeStatus,
                second: clientOperation.closeStatus,
                prevState: stateBeforeServerOperation.closeStatus,
            });

            twoWayOperation.createdAt = ReplaceOperation.serverTransform({
                first: serverOperation?.createdAt,
                second: clientOperation.createdAt,
                prevState: stateBeforeServerOperation.createdAt,
            });

            twoWayOperation.createdBy = ReplaceOperation.serverTransform({
                first: serverOperation?.createdBy,
                second: clientOperation.createdBy,
                prevState: stateBeforeServerOperation.createdBy,
            });
        }

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };
