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
import * as StringPieceValue from './participant/character/stringPieceValue/functions';
import * as StringPieceValueLog from './participant/character/stringPieceValue/log';
import { createType, deleteType } from '../piece/log';

type DicePieceValueLogType = {
    characterKey: CompositeKey;
    stateId: string;
    value: DicePieceValueLog.Type;
};

type StringPieceValueLogType = {
    characterKey: CompositeKey;
    stateId: string;
    value: StringPieceValueLog.Type;
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
    const stringPieceValueLogs: StringPieceValueLogType[] = [];

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

            recordForEach(diff.replace.oldValue?.stringPieceValues ?? {}, (value, stateId) => {
                stringPieceValueLogs.push({
                    characterKey,
                    stateId,
                    value: {
                        $v: 1,
                        type: deleteType,
                        value: StringPieceValue.toClientState(
                            false,
                            { type: restrict },
                            null
                        )(value),
                    },
                });
            });
            recordForEach(diff.replace.newValue?.stringPieceValues ?? {}, (value, stateId) => {
                stringPieceValueLogs.push({
                    characterKey,
                    stateId,
                    value: {
                        $v: 1,
                        type: createType,
                        value: StringPieceValue.toClientState(
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

        recordForEach(diff.update.stringPieceValues ?? {}, (operation, stateId) => {
            if (operation.type === replace) {
                if (operation.replace.oldValue != null) {
                    stringPieceValueLogs.push({
                        characterKey,
                        stateId,
                        value: {
                            $v: 1,
                            type: deleteType,
                            value: StringPieceValue.toClientState(
                                false,
                                { type: restrict },
                                null
                            )(operation.replace.oldValue),
                        },
                    });
                }
                if (operation.replace.newValue != null) {
                    stringPieceValueLogs.push({
                        characterKey,
                        stateId,
                        value: {
                            $v: 1,
                            type: createType,
                            value: StringPieceValue.toClientState(
                                false,
                                { type: restrict },
                                null
                            )(operation.replace.newValue),
                        },
                    });
                }

                return;
            }

            const nextStringPieceValue = nextCharacter.stringPieceValues[stateId];
            if (nextStringPieceValue == null) {
                throw new Error('this should not happen');
            }
            stringPieceValueLogs.push({
                characterKey,
                stateId,
                value: StringPieceValueLog.ofOperation(operation.update, nextStringPieceValue),
            });
        });
    });

    return {
        dicePieceValueLogs,
        stringPieceValueLogs,
    };
};
