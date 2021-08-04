import * as Character from './character/v1';
import * as Room from './v1';
import * as DualKeyRecordOperation from '../util/dualKeyRecordOperation';
import { RecordTwoWayOperationElement, replace } from '../util/recordOperationElement';
import { restrict } from '../util/type';
import { CompositeKey } from '../compositeKey/v1';
import { recordForEach, dualKeyRecordForEach, dualKeyRecordFind } from '@kizahasi/util';
import * as DicePieceValue from './character/dicePieceValue/v1';
import * as DicePieceValueLog from './character/dicePieceValue/log-v1';
import * as NumberPieceValue from './character/numberPieceValue/v1';
import * as NumberPieceValueLog from './character/numberPieceValue/log-v1';
import { createType, deleteType } from '../piece/log-v1';

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

export const createLogs = ({
    prevState,
    nextState,
}: {
    prevState: Room.State;
    nextState: Room.State;
}) => {
    const charactersDiff = DualKeyRecordOperation.diff<Character.State, Character.TwoWayOperation>({
        prevState: prevState.characters,
        nextState: nextState.characters,
        innerDiff: params => Character.diff(params),
    });
    if (charactersDiff == null) {
        return undefined;
    }

    const dicePieceValueLogs: DicePieceValueLogType[] = [];
    const numberPieceValueLogs: NumberPieceValueLogType[] = [];

    dualKeyRecordForEach<RecordTwoWayOperationElement<Character.State, Character.TwoWayOperation>>(
        charactersDiff,
        (diff, characterDualKey) => {
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
                            value: DicePieceValue.toClientState(
                                false,
                                { type: restrict },
                                null
                            )(value),
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
                            value: DicePieceValue.toClientState(
                                false,
                                { type: restrict },
                                null
                            )(value),
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

            const nextCharacter = dualKeyRecordFind<Character.State>(
                nextState.characters,
                characterDualKey
            );
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
        }
    );

    return {
        dicePieceValueLogs,
        numberPieceValueLogs,
    };
};
