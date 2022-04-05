import * as DieValue from './dieValue/functions';
import * as DieValueTypes from './dieValue/types';
import * as Piece from '../../../pieceBase/functions';
import { ServerTransform, TwoWayError } from '../../../../util/type';
import { isIdRecord } from '../../../../util/record';
import { Result } from '@kizahasi/result';
import { chooseRecord } from '@flocon-trpg/utils';
import * as RecordOperation from '../../../../util/recordOperation';
import * as ReplaceOperation from '../../../../util/replaceOperation';
import { dicePieceStrIndexes, template } from './types';
import * as Room from '../../types';
import {
    anyValue,
    RequestedBy,
    isCharacterOwner,
    canChangeOwnerCharacterId,
} from '../../../../util/requestedBy';
import * as NullableTextOperation from '../../../../util/nullableTextOperation';
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
            dice: chooseRecord(source.dice, state => DieValue.toClientState(isAuthorized)(state)),
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

        const dice = RecordOperation.serverTransform<
            State<typeof DieValueTypes.template>,
            State<typeof DieValueTypes.template>,
            TwoWayOperation<typeof DieValueTypes.template>,
            UpOperation<typeof DieValueTypes.template>,
            TwoWayError
        >({
            prevState: prevState.dice,
            nextState: currentState.dice,
            first: serverOperation?.dice,
            second: clientOperation.dice,
            innerTransform: ({ prevState, nextState, first, second }) =>
                DieValue.serverTransform(true)({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ key }) =>
                    !isAuthorized || dicePieceStrIndexes.every(x => x !== key),
                cancelRemove: () => !isAuthorized,
                cancelUpdate: () => !isAuthorized,
            },
        });
        if (dice.isError) {
            return dice;
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
            dice: dice.value,
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

        const transformedMemo = NullableTextOperation.serverTransform({
            first: serverOperation?.memo,
            second: clientOperation.memo,
            prevState: prevState.memo,
        });
        if (transformedMemo.isError) {
            return transformedMemo;
        }
        twoWayOperation.memo = transformedMemo.value;

        const transformedName = NullableTextOperation.serverTransform({
            first: serverOperation?.name,
            second: clientOperation.name,
            prevState: prevState.name,
        });
        if (transformedName.isError) {
            return transformedName;
        }
        twoWayOperation.name = transformedName.value;

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };
