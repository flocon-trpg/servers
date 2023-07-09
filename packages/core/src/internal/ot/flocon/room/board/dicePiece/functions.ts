import { chooseRecord } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../../generator/types';
import { isIdRecord } from '../../../../record';
import * as RecordOperation from '../../../../recordOperation';
import {
    RequestedBy,
    anyValue,
    canChangeCharacterValue,
    canChangeOwnerCharacterId,
} from '../../../../requestedBy';
import * as ReplaceOperation from '../../../../util/replaceOperation';
import { ServerTransform, TwoWayError } from '../../../../util/type';
import * as Piece from '../../../piece/functions';
import * as Room from '../../types';
import * as DieValue from './dieValue/functions';
import * as DieValueTypes from './dieValue/types';
import { dicePieceStrIndexes, template } from './types';

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
            dice: chooseRecord(source.dice ?? {}, state =>
                DieValue.toClientState(isAuthorized)(state)
            ),
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
        const isAuthorized = canChangeCharacterValue({
            requestedBy,
            characterId: stateAfterServerOperation.ownerCharacterId ?? anyValue,
            currentRoomState,
        });

        const dice = RecordOperation.serverTransform<
            State<typeof DieValueTypes.template>,
            State<typeof DieValueTypes.template>,
            TwoWayOperation<typeof DieValueTypes.template>,
            UpOperation<typeof DieValueTypes.template>,
            TwoWayError
        >({
            stateBeforeFirst: stateBeforeServerOperation.dice ?? {},
            stateAfterFirst: stateAfterServerOperation.dice ?? {},
            first: serverOperation?.dice,
            second: clientOperation.dice,
            innerTransform: ({ prevState, nextState, first, second }) =>
                DieValue.serverTransform(true)({
                    stateBeforeServerOperation: prevState,
                    stateAfterServerOperation: nextState,
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
            dice: dice.value,
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

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };
