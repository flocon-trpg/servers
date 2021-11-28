import * as RoomTypes from './types';
import * as RecordOperation from '../util/recordOperation';
import { replace } from '../util/recordOperationElement';
import { recordForEach } from '@flocon-trpg/utils';
import * as DicePieceValue from './dicePieceValue/functions';
import * as DicePieceValueTypes from './dicePieceValue/types';
import * as DicePieceValueLog from './dicePieceValue/log';
import * as StringPieceValue from './stringPieceValue/functions';
import * as StringPieceValueTypes from './stringPieceValue/types';
import * as StringPieceValueLog from './stringPieceValue/log';
import { createType, deleteType } from '../piece/log';
import { restrict } from '../util/requestedBy';

type DicePieceValueLogType = {
    stateId: string;
    value: DicePieceValueLog.Type;
};

type StringPieceValueLogType = {
    stateId: string;
    value: StringPieceValueLog.Type;
};

export const createLogs = ({
    prevState,
    nextState,
}: {
    prevState: RoomTypes.State;
    nextState: RoomTypes.State;
}) => {
    const dicePieceValuesDiff = RecordOperation.diff<
        DicePieceValueTypes.State,
        DicePieceValueTypes.TwoWayOperation
    >({
        prevState: prevState.dicePieceValues,
        nextState: nextState.dicePieceValues,
        innerDiff: params => DicePieceValue.diff(params),
    });

    const stringPieceValuesDiff = RecordOperation.diff<
        StringPieceValueTypes.State,
        StringPieceValueTypes.TwoWayOperation
    >({
        prevState: prevState.stringPieceValues,
        nextState: nextState.stringPieceValues,
        innerDiff: params => StringPieceValue.diff(params),
    });

    const dicePieceValueLogs: DicePieceValueLogType[] = [];
    recordForEach(dicePieceValuesDiff ?? {}, (value, stateId) => {
        if (value.type === replace) {
            if (value.replace.newValue == null) {
                if (value.replace.oldValue != null) {
                    dicePieceValueLogs.push({
                        stateId,
                        value: {
                            $v: 2,
                            $r: 1,
                            type: deleteType,
                            value: DicePieceValue.toClientState(
                                { type: restrict },
                                prevState
                            )(value.replace.oldValue),
                        },
                    });
                }
                return;
            }
            dicePieceValueLogs.push({
                stateId,
                value: {
                    $v: 2,
                    $r: 1,
                    type: createType,
                    value: DicePieceValue.toClientState(
                        { type: restrict },
                        nextState
                    )(value.replace.newValue),
                },
            });
            return;
        }

        const nextDicePieceValue = nextState.dicePieceValues[stateId];
        if (nextDicePieceValue == null) {
            throw new Error('this should not happen. Character.diff may have some bugs?');
        }
        dicePieceValueLogs.push({
            stateId,
            value: DicePieceValueLog.ofOperation(value.update, nextDicePieceValue),
        });
    });

    const stringPieceValueLogs: StringPieceValueLogType[] = [];
    recordForEach(stringPieceValuesDiff ?? {}, (value, stateId) => {
        if (value.type === replace) {
            if (value.replace.newValue == null) {
                if (value.replace.oldValue != null) {
                    stringPieceValueLogs.push({
                        stateId,
                        value: {
                            $v: 2,
                            $r: 1,
                            type: deleteType,
                            value: StringPieceValue.toClientState(
                                { type: restrict },
                                prevState
                            )(value.replace.oldValue),
                        },
                    });
                }
                return;
            }
            stringPieceValueLogs.push({
                stateId,
                value: {
                    $v: 2,
                    $r: 1,
                    type: createType,
                    value: StringPieceValue.toClientState(
                        { type: restrict },
                        nextState
                    )(value.replace.newValue),
                },
            });
            return;
        }

        const nextStringPieceValue = nextState.stringPieceValues[stateId];
        if (nextStringPieceValue == null) {
            throw new Error('this should not happen. Character.diff may have some bugs?');
        }
        stringPieceValueLogs.push({
            stateId,
            value: StringPieceValueLog.ofOperation(value.update, nextStringPieceValue),
        });
    });

    return {
        dicePieceValueLogs,
        stringPieceValueLogs,
    };
};
