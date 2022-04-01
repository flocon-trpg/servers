import * as ReplaceOperation from '../../../util/replaceOperation';
import { ServerTransform } from '../../../util/type';
import { isIdRecord } from '../../../util/record';
import { Result } from '@kizahasi/result';
import * as Piece from '../../../pieceBase/functions';
import {
    anyValue,
    canChangeOwnerParticipantId,
    isOwner,
    RequestedBy,
} from '../../../util/requestedBy';
import { template } from './types';
import { State, UpOperation, TwoWayOperation } from '../../../generator';

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
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        const isAuthorized = isOwner({
            requestedBy,
            ownerParticipantId: currentState.ownerParticipantId ?? anyValue,
        });
        if (!isAuthorized) {
            // 自分以外はどのプロパティも編集できない。
            return Result.ok(undefined);
        }

        const piece = Piece.serverTransform({
            prevState: { ...prevState, $v: undefined, $r: undefined },
            currentState: { ...currentState, $v: undefined, $r: undefined },
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
                currentOwnerParticipant: currentState,
            })
        ) {
            twoWayOperation.ownerParticipantId = ReplaceOperation.serverTransform({
                first: serverOperation?.ownerParticipantId,
                second: clientOperation.ownerParticipantId,
                prevState: prevState.ownerParticipantId,
            });
        }

        twoWayOperation.image = ReplaceOperation.serverTransform({
            first: serverOperation?.image,
            second: clientOperation.image,
            prevState: prevState.image,
        });

        twoWayOperation.isPrivate = ReplaceOperation.serverTransform({
            first: serverOperation?.isPrivate,
            second: clientOperation.isPrivate,
            prevState: prevState.isPrivate,
        });

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };
