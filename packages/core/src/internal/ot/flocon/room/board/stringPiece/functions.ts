import * as ReplaceOperation from '../../../../util/replaceOperation';
import { ServerTransform } from '../../../../util/type';
import { isIdRecord } from '../../../../util/record';
import { Result } from '@kizahasi/result';
import * as TextOperation from '../../../../util/textOperation';
import * as Room from '../../types';
import {
    RequestedBy,
    isCharacterOwner,
    anyValue,
    canChangeOwnerCharacterId,
} from '../../../../util/requestedBy';
import * as Piece from '../../../pieceBase/functions';
import { template } from './types';
import { State, TwoWayOperation, UpOperation } from '../../../../generator';

export const toClientState =
    (requestedBy: RequestedBy, currentRoomState: State<typeof Room.template>) =>
    (source: State<typeof template>): State<typeof template> => {
        const isAuthorized = isCharacterOwner({
            requestedBy,
            characterId: source.ownerCharacterId ?? anyValue,
            currentRoomState,
        });
        return {
            ...source,
            value: source.isValuePrivate && !isAuthorized ? '' : source.value,
        };
    };

export const serverTransform =
    (
        requestedBy: RequestedBy,
        currentRoomState: State<typeof Room.template>
    ): ServerTransform<
        State<typeof template>,
        TwoWayOperation<typeof template>,
        UpOperation<typeof template>
    > =>
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        const isAuthorized = isCharacterOwner({
            requestedBy,
            characterId: currentState.ownerCharacterId ?? anyValue,
            currentRoomState,
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
            canChangeOwnerCharacterId({
                requestedBy,
                currentOwnerCharacter: currentState,
                currentRoomState,
            })
        ) {
            twoWayOperation.ownerCharacterId = ReplaceOperation.serverTransform({
                first: serverOperation?.ownerCharacterId,
                second: clientOperation.ownerCharacterId,
                prevState: prevState.ownerCharacterId,
            });
        }

        twoWayOperation.isValuePrivate = ReplaceOperation.serverTransform({
            first: serverOperation?.isValuePrivate ?? undefined,
            second: clientOperation.isValuePrivate ?? undefined,
            prevState: prevState.isValuePrivate,
        });

        // !isAuthorized の場合は最初の方ですべて弾いているため、isValuePrivateのチェックをする必要はない。
        const valueResult = TextOperation.serverTransform({
            first: serverOperation?.value ?? undefined,
            second: clientOperation.value ?? undefined,
            prevState: prevState.value,
        });
        if (valueResult.isError) {
            return valueResult;
        }
        twoWayOperation.value = valueResult.value;

        twoWayOperation.valueInputType = ReplaceOperation.serverTransform({
            first: serverOperation?.valueInputType ?? undefined,
            second: clientOperation.valueInputType ?? undefined,
            prevState: prevState.valueInputType,
        });

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };
