import * as RoomTypes from './types';
import * as RecordOperation from '../util/recordOperation';
import { replace } from '../util/recordOperationElement';
import { recordForEach } from '@flocon-trpg/utils';
import * as BoardTypes from './board/types';
import * as DicePiece from './board/dicePiece/functions';
import * as DicePieceLog from './board/dicePiece/log';
import * as StringPiece from './board/stringPiece/functions';
import * as StringPieceLog from './board/stringPiece/log';
import { createType, deleteType } from '../pieceBase/log';
import { restrict } from '../util/requestedBy';
import { State, TwoWayOperation, diff } from '../generator';

type DicePieceLogType = {
    boardId: string;
    stateId: string;
    value: DicePieceLog.Type;
};

type StringPieceLogType = {
    boardId: string;
    stateId: string;
    value: StringPieceLog.Type;
};

export const createLogs = ({
    prevState,
    nextState,
}: {
    prevState: State<typeof RoomTypes.template>;
    nextState: State<typeof RoomTypes.template>;
}) => {
    const boardsDiff = RecordOperation.diff<
        State<typeof BoardTypes.template>,
        TwoWayOperation<typeof BoardTypes.template>
    >({
        prevState: prevState.boards,
        nextState: nextState.boards,
        innerDiff: params => diff(BoardTypes.template)(params),
    });
    if (boardsDiff == null) {
        return undefined;
    }

    const dicePieceLogs: DicePieceLogType[] = [];
    const stringPieceLogs: StringPieceLogType[] = [];

    recordForEach(boardsDiff, (diff, boardId) => {
        if (diff.type === replace) {
            recordForEach(diff.replace.oldValue?.dicePieces ?? {}, (value, stateId) => {
                dicePieceLogs.push({
                    boardId,
                    stateId,
                    value: {
                        $v: 2,
                        $r: 1,
                        type: deleteType,
                        value: DicePiece.toClientState({ type: restrict }, prevState)(value),
                    },
                });
            });
            recordForEach(diff.replace.newValue?.dicePieces ?? {}, (value, stateId) => {
                dicePieceLogs.push({
                    boardId,
                    stateId,
                    value: {
                        $v: 2,
                        $r: 1,
                        type: createType,
                        value: DicePiece.toClientState({ type: restrict }, prevState)(value),
                    },
                });
            });

            recordForEach(diff.replace.oldValue?.stringPieces ?? {}, (value, stateId) => {
                stringPieceLogs.push({
                    boardId,
                    stateId,
                    value: {
                        $v: 2,
                        $r: 1,
                        type: deleteType,
                        value: StringPiece.toClientState({ type: restrict }, prevState)(value),
                    },
                });
            });
            recordForEach(diff.replace.newValue?.stringPieces ?? {}, (value, stateId) => {
                stringPieceLogs.push({
                    boardId,
                    stateId,
                    value: {
                        $v: 2,
                        $r: 1,
                        type: createType,
                        value: StringPiece.toClientState({ type: restrict }, prevState)(value),
                    },
                });
            });

            return;
        }

        const nextBoard = nextState.boards[boardId];
        if (nextBoard == null) {
            throw new Error('this should not happen. Board.diff has some bugs?');
        }

        recordForEach(diff.update.dicePieces ?? {}, (operation, stateId) => {
            if (operation.type === replace) {
                if (operation.replace.oldValue != null) {
                    dicePieceLogs.push({
                        boardId,
                        stateId,
                        value: {
                            $v: 2,
                            $r: 1,
                            type: deleteType,
                            value: DicePiece.toClientState(
                                { type: restrict },
                                prevState
                            )(operation.replace.oldValue),
                        },
                    });
                }
                if (operation.replace.newValue != null) {
                    dicePieceLogs.push({
                        boardId,
                        stateId,
                        value: {
                            $v: 2,
                            $r: 1,
                            type: createType,
                            value: DicePiece.toClientState(
                                { type: restrict },
                                prevState
                            )(operation.replace.newValue),
                        },
                    });
                }

                return;
            }

            const nextDicePiece = nextBoard.dicePieces[stateId];
            if (nextDicePiece == null) {
                throw new Error('this should not happen');
            }
            dicePieceLogs.push({
                boardId,
                stateId,
                value: DicePieceLog.ofOperation(operation.update, nextDicePiece),
            });
        });

        recordForEach(diff.update.stringPieces ?? {}, (operation, stateId) => {
            if (operation.type === replace) {
                if (operation.replace.oldValue != null) {
                    stringPieceLogs.push({
                        boardId,
                        stateId,
                        value: {
                            $v: 2,
                            $r: 1,
                            type: deleteType,
                            value: StringPiece.toClientState(
                                { type: restrict },
                                prevState
                            )(operation.replace.oldValue),
                        },
                    });
                }
                if (operation.replace.newValue != null) {
                    stringPieceLogs.push({
                        boardId,
                        stateId,
                        value: {
                            $v: 2,
                            $r: 1,
                            type: createType,
                            value: StringPiece.toClientState(
                                { type: restrict },
                                prevState
                            )(operation.replace.newValue),
                        },
                    });
                }

                return;
            }

            const nextStringPiece = nextBoard.stringPieces[stateId];
            if (nextStringPiece == null) {
                throw new Error('this should not happen');
            }
            stringPieceLogs.push({
                boardId,
                stateId,
                value: StringPieceLog.ofOperation(operation.update, nextStringPiece),
            });
        });
    });

    return {
        dicePieceLogs,
        stringPieceLogs,
    };
};
