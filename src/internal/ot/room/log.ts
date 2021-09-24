import * as Character from './participant/character/functions';
import * as CharacterTypes from './participant/character/types';
import * as RoomTypes from './types';
import * as DualKeyRecordOperation from '../util/dualKeyRecordOperation';
import { RecordTwoWayOperationElement, replace } from '../util/recordOperationElement';
import { restrict } from '../util/type';
import { CompositeKey } from '../compositeKey/types';
import { recordForEach, dualKeyRecordForEach } from '@kizahasi/util';
import * as DicePieceValue from './participant/character/dicePieceValue/functions';
import * as DicePieceValueLog from './participant/character/dicePieceValue/log';
import * as NumberPieceValue from './participant/character/numberPieceValue/functions';
import * as NumberPieceValueLog from './participant/character/numberPieceValue/log';
import { createType, deleteType } from '../piece/log';

type DicePieceValueLogType = {
    characterKey: CompositeKey;
    stateId: string;
    value: DicePieceValueLog.Type;
};

type NumberPieceValueLogType = {
    characterKey: CompositeKey;
    stateId: string;
    value: NumberPieceValueLog.Type;
};

const charactersAsDualKeyRecord = (room: RoomTypes.State) => {
    const result: Record<string, Record<string, CharacterTypes.State | undefined>> = {};
    recordForEach(room.participants, (participant, participantKey) => {
        result[participantKey] = participant.characters;
    });
    return result;
};

export const createLogs = ({
    prevState,
    nextState,
}: {
    prevState: RoomTypes.State;
    nextState: RoomTypes.State;
}) => {
    const charactersDiff = DualKeyRecordOperation.diff<
        CharacterTypes.State,
        CharacterTypes.TwoWayOperation
    >({
        prevState: charactersAsDualKeyRecord(prevState),
        nextState: charactersAsDualKeyRecord(nextState),
        innerDiff: params => Character.diff(params),
    });
    if (charactersDiff == null) {
        return undefined;
    }

    const dicePieceValueLogs: DicePieceValueLogType[] = [];
    const numberPieceValueLogs: NumberPieceValueLogType[] = [];

    dualKeyRecordForEach<
        RecordTwoWayOperationElement<CharacterTypes.State, CharacterTypes.TwoWayOperation>
    >(charactersDiff, (diff, characterDualKey) => {
        const characterKey: CompositeKey = {
            createdBy: characterDualKey.first,
            id: characterDualKey.second,
        };

        if (diff.type === replace) {
            recordForEach(diff.replace.oldValue?.dicePieceValues ?? {}, (value, stateId) => {
                dicePieceValueLogs.push({
                    characterKey,
                    stateId,
                    value: {
                        $v: 1,
                        type: deleteType,
                        value: DicePieceValue.toClientState(false, { type: restrict }, null)(value),
                    },
                });
            });
            recordForEach(diff.replace.newValue?.dicePieceValues ?? {}, (value, stateId) => {
                dicePieceValueLogs.push({
                    characterKey,
                    stateId,
                    value: {
                        $v: 1,
                        type: createType,
                        value: DicePieceValue.toClientState(false, { type: restrict }, null)(value),
                    },
                });
            });

            recordForEach(diff.replace.oldValue?.numberPieceValues ?? {}, (value, stateId) => {
                numberPieceValueLogs.push({
                    characterKey,
                    stateId,
                    value: {
                        $v: 1,
                        type: deleteType,
                        value: NumberPieceValue.toClientState(
                            false,
                            { type: restrict },
                            null
                        )(value),
                    },
                });
            });
            recordForEach(diff.replace.newValue?.numberPieceValues ?? {}, (value, stateId) => {
                numberPieceValueLogs.push({
                    characterKey,
                    stateId,
                    value: {
                        $v: 1,
                        type: createType,
                        value: NumberPieceValue.toClientState(
                            false,
                            { type: restrict },
                            null
                        )(value),
                    },
                });
            });

            return;
        }

        const nextCharacter =
            nextState.participants[characterDualKey.first]?.characters[characterDualKey.second];
        if (nextCharacter == null) {
            throw new Error('this should not happen. Character.diff has some bugs?');
        }

        recordForEach(diff.update.dicePieceValues ?? {}, (operation, stateId) => {
            if (operation.type === replace) {
                if (operation.replace.oldValue != null) {
                    dicePieceValueLogs.push({
                        characterKey,
                        stateId,
                        value: {
                            $v: 1,
                            type: deleteType,
                            value: DicePieceValue.toClientState(
                                false,
                                { type: restrict },
                                null
                            )(operation.replace.oldValue),
                        },
                    });
                }
                if (operation.replace.newValue != null) {
                    dicePieceValueLogs.push({
                        characterKey,
                        stateId,
                        value: {
                            $v: 1,
                            type: createType,
                            value: DicePieceValue.toClientState(
                                false,
                                { type: restrict },
                                null
                            )(operation.replace.newValue),
                        },
                    });
                }

                return;
            }

            const nextDicePieceValue = nextCharacter.dicePieceValues[stateId];
            if (nextDicePieceValue == null) {
                throw new Error('this should not happen');
            }
            dicePieceValueLogs.push({
                characterKey,
                stateId,
                value: DicePieceValueLog.ofOperation(operation.update, nextDicePieceValue),
            });
        });

        recordForEach(diff.update.numberPieceValues ?? {}, (operation, stateId) => {
            if (operation.type === replace) {
                if (operation.replace.oldValue != null) {
                    numberPieceValueLogs.push({
                        characterKey,
                        stateId,
                        value: {
                            $v: 1,
                            type: deleteType,
                            value: NumberPieceValue.toClientState(
                                false,
                                { type: restrict },
                                null
                            )(operation.replace.oldValue),
                        },
                    });
                }
                if (operation.replace.newValue != null) {
                    numberPieceValueLogs.push({
                        characterKey,
                        stateId,
                        value: {
                            $v: 1,
                            type: createType,
                            value: NumberPieceValue.toClientState(
                                false,
                                { type: restrict },
                                null
                            )(operation.replace.newValue),
                        },
                    });
                }

                return;
            }

            const nextNumberPieceValue = nextCharacter.numberPieceValues[stateId];
            if (nextNumberPieceValue == null) {
                throw new Error('this should not happen');
            }
            numberPieceValueLogs.push({
                characterKey,
                stateId,
                value: NumberPieceValueLog.ofOperation(operation.update, nextNumberPieceValue),
            });
        });
    });

    return {
        dicePieceValueLogs,
        numberPieceValueLogs,
    };
};
