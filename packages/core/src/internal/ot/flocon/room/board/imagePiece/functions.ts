import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../../generator';
import { isIdRecord } from '../../../../record';
import {
    RequestedBy,
    anyValue,
    canChangeOwnerParticipantId,
    isOwner,
} from '../../../../requestedBy';
import * as ReplaceOperation from '../../../../util/replaceOperation';
import { ServerTransform } from '../../../../util/type';
import * as Piece from '../../../piece/functions';
import { template } from './types';

export const toClientState = (source: State<typeof template>): State<typeof template> => {
    return source;
};

export const serverTransform =
    (
        requestedBy: RequestedBy
    ): ServerTransform<
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
        const isAuthorized = isOwner({
            requestedBy,
            ownerParticipantId: stateAfterServerOperation.ownerParticipantId ?? anyValue,
        });
        if (!isAuthorized) {
            // 自分以外はどのプロパティも編集できない。
            return Result.ok(undefined);
        }

        const piece = Piece.serverTransform({
            stateBeforeServerOperation: {
                ...stateBeforeServerOperation,
                $v: undefined,
                $r: undefined,
            },
            stateAfterServerOperation: {
                ...stateAfterServerOperation,
                $v: undefined,
                $r: undefined,
            },
            clientOperation: { ...clientOperation, $v: undefined, $r: undefined },
            serverOperation: { ...serverOperation, $v: undefined, $r: undefined },
        });
        if (piece.isError) {
            return piece;
        }

        const twoWayOperation: TwoWayOperation<typeof template> = {
            $v: 2,
            $r: 1,
            ...piece.value,
        };

        if (
            canChangeOwnerParticipantId({
                requestedBy,
                currentOwnerParticipant: stateAfterServerOperation,
            })
        ) {
            twoWayOperation.ownerParticipantId = ReplaceOperation.serverTransform({
                first: serverOperation?.ownerParticipantId,
                second: clientOperation.ownerParticipantId,
                prevState: stateBeforeServerOperation.ownerParticipantId,
            });
        }

        twoWayOperation.image = ReplaceOperation.serverTransform({
            first: serverOperation?.image,
            second: clientOperation.image,
            prevState: stateBeforeServerOperation.image,
        });

        twoWayOperation.isPrivate = ReplaceOperation.serverTransform({
            first: serverOperation?.isPrivate,
            second: clientOperation.isPrivate,
            prevState: stateBeforeServerOperation.isPrivate,
        });

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };
