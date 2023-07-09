import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../../generator/types';
import { isIdRecord } from '../../../../record';
import {
    RequestedBy,
    anyValue,
    canChangeCharacterValue,
    canChangeOwnerCharacterId,
} from '../../../../requestedBy';
import * as TextOperation from '../../../../textOperation';
import * as ReplaceOperation from '../../../../util/replaceOperation';
import { ServerTransform } from '../../../../util/type';
import * as Piece from '../../../piece/functions';
import * as Room from '../../types';
import { template } from './types';

export const toClientState =
    (requestedBy: RequestedBy, currentRoomState: State<typeof Room.template>) =>
    (source: State<typeof template>): State<typeof template> => {
        const isAuthorized = canChangeCharacterValue({
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
    ({
        stateBeforeServerOperation,
        stateAfterServerOperation,
        clientOperation,
        serverOperation,
    }) => {
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
            canChangeOwnerCharacterId({
                requestedBy,
                currentOwnerCharacter: stateAfterServerOperation,
                currentRoomState,
            })
        ) {
            twoWayOperation.ownerCharacterId = ReplaceOperation.serverTransform({
                first: serverOperation?.ownerCharacterId,
                second: clientOperation.ownerCharacterId,
                prevState: stateBeforeServerOperation.ownerCharacterId,
            });
        }

        twoWayOperation.isValuePrivate = ReplaceOperation.serverTransform({
            first: serverOperation?.isValuePrivate ?? undefined,
            second: clientOperation.isValuePrivate ?? undefined,
            prevState: stateBeforeServerOperation.isValuePrivate,
        });

        // !isAuthorized の場合は最初の方ですべて弾いているため、isValuePrivateのチェックをする必要はない。
        const valueResult = TextOperation.serverTransform({
            first: serverOperation?.value ?? undefined,
            second: clientOperation.value ?? undefined,
            prevState: stateBeforeServerOperation.value,
        });
        if (valueResult.isError) {
            return valueResult;
        }
        twoWayOperation.value = valueResult.value;

        twoWayOperation.valueInputType = ReplaceOperation.serverTransform({
            first: serverOperation?.valueInputType ?? undefined,
            second: clientOperation.valueInputType ?? undefined,
            prevState: stateBeforeServerOperation.valueInputType,
        });

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };
