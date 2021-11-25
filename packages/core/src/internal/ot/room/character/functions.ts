import { mapRecordOperationElement } from '../../util/recordOperationElement';
import * as TextOperation from '../../util/textOperation';
import * as Piece from '../../piece/functions';
import * as PieceTypes from '../../piece/types';
import * as BoardPosition from '../../boardPosition/functions';
import * as BoardPositionTypes from '../../boardPosition/types';
import * as ReplaceOperation from '../../util/replaceOperation';
import * as RecordOperation from '../../util/recordOperation';
import * as ParamRecordOperation from '../../util/paramRecordOperation';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    DownError,
    Restore,
    ScalarError,
    ServerTransform,
    TwoWayError,
    UpError,
} from '../../util/type';
import * as BoolParamTypes from './boolParam/types';
import * as Command from './command/functions';
import * as CommandTypes from './command/types';
import * as NumParamTypes from './numParam/types';
import * as StrParam from './strParam/functions';
import * as StrParamType from './strParam/types';
import * as SimpleValueParam from './simpleValueParam/functions';
import { isIdRecord } from '../../util/record';
import { Result } from '@kizahasi/result';
import { chooseRecord } from '@flocon-trpg/utils';
import { Maybe } from '../../../maybe';
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';
import * as Room from '../types';
import {
    RequestedBy,
    isBoardVisible,
    isOwner,
    none,
    canChangeOwnerParticipantId,
} from '../../util/requestedBy';

const defaultBoolParamState: BoolParamTypes.State = {
    $v: 2,
    $r: 1,
    isValuePrivate: false,
    value: undefined,
    overriddenParameterName: undefined,
};

const defaultNumParamState: NumParamTypes.State = {
    $v: 2,
    $r: 1,
    isValuePrivate: false,
    value: undefined,
    overriddenParameterName: undefined,
};

const defaultStrParamState: StrParamType.State = {
    $v: 2,
    $r: 1,
    isValuePrivate: false,
    value: '',
    overriddenParameterName: undefined,
};

export const toClientState =
    (isAuthorized: boolean, requestedBy: RequestedBy, currentRoomState: Room.State) =>
    (source: State): State => {
        return {
            ...source,
            chatPalette: isAuthorized ? source.chatPalette : '',
            privateVarToml: isAuthorized ? source.privateVarToml : '',
            boolParams: RecordOperation.toClientState({
                serverState: source.boolParams,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    SimpleValueParam.toClientState<Maybe<boolean>>(isAuthorized, undefined)(state),
            }),
            numParams: RecordOperation.toClientState({
                serverState: source.numParams,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    SimpleValueParam.toClientState<Maybe<number>>(isAuthorized, undefined)(state),
            }),
            numMaxParams: RecordOperation.toClientState({
                serverState: source.numMaxParams,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    SimpleValueParam.toClientState<Maybe<number>>(isAuthorized, undefined)(state),
            }),
            strParams: RecordOperation.toClientState({
                serverState: source.strParams,
                isPrivate: () => false,
                toClientState: ({ state }) => StrParam.toClientState(isAuthorized)(state),
            }),
            pieces: Piece.toClientStateMany(requestedBy, currentRoomState)(source.pieces),
            privateCommands: RecordOperation.toClientState<CommandTypes.State, CommandTypes.State>({
                serverState: source.privateCommands,
                isPrivate: () => !isAuthorized,
                toClientState: ({ state }) => Command.toClientState(state),
            }),
            tachieLocations: RecordOperation.toClientState<
                BoardPositionTypes.State,
                BoardPositionTypes.State
            >({
                serverState: source.tachieLocations,
                isPrivate: state =>
                    !isBoardVisible({
                        requestedBy,
                        boardId: state.boardId,
                        currentRoomState,
                    }),
                toClientState: ({ state }) => BoardPosition.toClientState(state),
            }),
        };
    };

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        memo: source.memo == null ? undefined : TextOperation.toDownOperation(source.memo),
        name: source.name == null ? undefined : TextOperation.toDownOperation(source.name),
        chatPalette:
            source.chatPalette == null
                ? undefined
                : TextOperation.toDownOperation(source.chatPalette),
        privateVarToml:
            source.privateVarToml == null
                ? undefined
                : TextOperation.toDownOperation(source.privateVarToml),
        boolParams:
            source.boolParams == null
                ? undefined
                : chooseRecord(source.boolParams, SimpleValueParam.toDownOperation),
        numParams:
            source.numParams == null
                ? undefined
                : chooseRecord(source.numParams, SimpleValueParam.toDownOperation),
        numMaxParams:
            source.numMaxParams == null
                ? undefined
                : chooseRecord(source.numMaxParams, SimpleValueParam.toDownOperation),
        strParams:
            source.strParams == null
                ? undefined
                : chooseRecord(source.strParams, StrParam.toDownOperation),
        pieces:
            source.pieces == null
                ? undefined
                : chooseRecord(source.pieces, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Piece.toDownOperation,
                      })
                  ),
        privateCommands:
            source.privateCommands == null
                ? undefined
                : chooseRecord(source.privateCommands, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Command.toDownOperation,
                      })
                  ),
        tachieLocations:
            source.tachieLocations == null
                ? undefined
                : chooseRecord(source.tachieLocations, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: BoardPosition.toDownOperation,
                      })
                  ),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        memo: source.memo == null ? undefined : TextOperation.toUpOperation(source.memo),
        name: source.name == null ? undefined : TextOperation.toUpOperation(source.name),
        chatPalette:
            source.chatPalette == null
                ? undefined
                : TextOperation.toUpOperation(source.chatPalette),
        privateVarToml:
            source.privateVarToml == null
                ? undefined
                : TextOperation.toUpOperation(source.privateVarToml),
        boolParams:
            source.boolParams == null
                ? undefined
                : chooseRecord(source.boolParams, SimpleValueParam.toUpOperation),
        numParams:
            source.numParams == null
                ? undefined
                : chooseRecord(source.numParams, SimpleValueParam.toUpOperation),
        numMaxParams:
            source.numMaxParams == null
                ? undefined
                : chooseRecord(source.numMaxParams, SimpleValueParam.toUpOperation),
        strParams:
            source.strParams == null
                ? undefined
                : chooseRecord(source.strParams, StrParam.toUpOperation),
        pieces:
            source.pieces == null
                ? undefined
                : chooseRecord(source.pieces, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Piece.toUpOperation,
                      })
                  ),
        privateCommands:
            source.privateCommands == null
                ? undefined
                : chooseRecord(source.privateCommands, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Command.toUpOperation,
                      })
                  ),
        tachieLocations:
            source.tachieLocations == null
                ? undefined
                : chooseRecord(source.tachieLocations, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: BoardPosition.toUpOperation,
                      })
                  ),
    };
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.ownerParticipantId != null) {
        result.ownerParticipantId = operation.ownerParticipantId.newValue;
    }
    if (operation.image != null) {
        result.image = operation.image.newValue;
    }
    if (operation.isPrivate != null) {
        result.isPrivate = operation.isPrivate.newValue;
    }
    if (operation.memo != null) {
        const valueResult = TextOperation.apply(state.memo, operation.memo);
        if (valueResult.isError) {
            return valueResult;
        }
        result.memo = valueResult.value;
    }
    if (operation.name != null) {
        const valueResult = TextOperation.apply(state.name, operation.name);
        if (valueResult.isError) {
            return valueResult;
        }
        result.name = valueResult.value;
    }

    if (operation.chatPalette != null) {
        const valueResult = TextOperation.apply(state.chatPalette, operation.chatPalette);
        if (valueResult.isError) {
            return valueResult;
        }
        result.chatPalette = valueResult.value;
    }
    if (operation.privateVarToml != null) {
        const valueResult = TextOperation.apply(state.privateVarToml, operation.privateVarToml);
        if (valueResult.isError) {
            return valueResult;
        }
        result.privateVarToml = valueResult.value;
    }
    if (operation.tachieImage != null) {
        result.tachieImage = operation.tachieImage.newValue;
    }

    const boolParams = ParamRecordOperation.apply<
        BoolParamTypes.State,
        BoolParamTypes.UpOperation | BoolParamTypes.TwoWayOperation,
        ScalarError
    >({
        prevState: state.boolParams,
        operation: operation.boolParams,
        innerApply: ({ prevState, operation }) => {
            return SimpleValueParam.apply<Maybe<boolean>>()({
                state: prevState,
                operation,
            });
        },
        defaultState: defaultBoolParamState,
    });
    if (boolParams.isError) {
        return boolParams;
    }
    result.boolParams = boolParams.value;

    const numParams = ParamRecordOperation.apply<
        NumParamTypes.State,
        NumParamTypes.UpOperation | NumParamTypes.TwoWayOperation,
        ScalarError
    >({
        prevState: state.numParams,
        operation: operation.numParams,
        innerApply: ({ prevState, operation }) => {
            return SimpleValueParam.apply<Maybe<number>>()({
                state: prevState,
                operation,
            });
        },
        defaultState: defaultNumParamState,
    });
    if (numParams.isError) {
        return numParams;
    }
    result.numParams = numParams.value;

    const numMaxParams = ParamRecordOperation.apply<
        NumParamTypes.State,
        NumParamTypes.UpOperation | NumParamTypes.TwoWayOperation,
        ScalarError
    >({
        prevState: state.numMaxParams,
        operation: operation.numMaxParams,
        innerApply: ({ prevState, operation }) => {
            return SimpleValueParam.apply<Maybe<number>>()({
                state: prevState,
                operation,
            });
        },
        defaultState: defaultNumParamState,
    });
    if (numMaxParams.isError) {
        return numMaxParams;
    }
    result.numMaxParams = numMaxParams.value;

    const strParams = ParamRecordOperation.apply<
        StrParamType.State,
        StrParamType.UpOperation | StrParamType.TwoWayOperation,
        ScalarError
    >({
        prevState: state.strParams,
        operation: operation.strParams,
        innerApply: ({ prevState, operation }) => {
            return StrParam.apply({ state: prevState, operation });
        },
        defaultState: defaultStrParamState,
    });
    if (strParams.isError) {
        return strParams;
    }
    result.strParams = strParams.value;

    const pieces = RecordOperation.apply<PieceTypes.State, PieceTypes.UpOperation, ScalarError>({
        prevState: state.pieces,
        operation: operation.pieces,
        innerApply: ({ prevState, operation }) => {
            return Piece.apply({ state: prevState, operation });
        },
    });
    if (pieces.isError) {
        return pieces;
    }
    result.pieces = pieces.value;

    const privateCommandsResult = RecordOperation.apply<
        CommandTypes.State,
        CommandTypes.UpOperation | CommandTypes.TwoWayOperation,
        ScalarError
    >({
        prevState: state.privateCommands,
        operation: operation.privateCommands,
        innerApply: ({ prevState, operation }) => {
            return Command.apply({ state: prevState, operation });
        },
    });
    if (privateCommandsResult.isError) {
        return privateCommandsResult;
    }
    result.privateCommands = privateCommandsResult.value;

    const tachieLocations = RecordOperation.apply<
        BoardPositionTypes.State,
        BoardPositionTypes.UpOperation,
        ScalarError
    >({
        prevState: state.tachieLocations,
        operation: operation.tachieLocations,
        innerApply: ({ prevState, operation }) => {
            return BoardPosition.apply({ state: prevState, operation });
        },
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }
    result.tachieLocations = tachieLocations.value;

    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.ownerParticipantId != null) {
        result.ownerParticipantId = operation.ownerParticipantId.oldValue;
    }
    if (operation.image != null) {
        result.image = operation.image.oldValue;
    }
    if (operation.isPrivate != null) {
        result.isPrivate = operation.isPrivate.oldValue;
    }
    if (operation.memo != null) {
        const valueResult = TextOperation.applyBack(state.memo, operation.memo);
        if (valueResult.isError) {
            return valueResult;
        }
        result.memo = valueResult.value;
    }
    if (operation.name != null) {
        const valueResult = TextOperation.applyBack(state.name, operation.name);
        if (valueResult.isError) {
            return valueResult;
        }
        result.name = valueResult.value;
    }
    if (operation.chatPalette != null) {
        const valueResult = TextOperation.applyBack(state.chatPalette, operation.chatPalette);
        if (valueResult.isError) {
            return valueResult;
        }
        result.chatPalette = valueResult.value;
    }
    if (operation.privateVarToml != null) {
        const valueResult = TextOperation.applyBack(state.privateVarToml, operation.privateVarToml);
        if (valueResult.isError) {
            return valueResult;
        }
        result.privateVarToml = valueResult.value;
    }
    if (operation.tachieImage != null) {
        result.tachieImage = operation.tachieImage.oldValue;
    }

    const boolParams = ParamRecordOperation.applyBack<
        BoolParamTypes.State,
        BoolParamTypes.DownOperation,
        ScalarError
    >({
        nextState: state.boolParams,
        operation: operation.boolParams,
        innerApplyBack: ({ nextState, operation }) => {
            return SimpleValueParam.applyBack<Maybe<boolean>>()({
                state: nextState,
                operation,
            });
        },
        defaultState: defaultBoolParamState,
    });
    if (boolParams.isError) {
        return boolParams;
    }
    result.boolParams = boolParams.value;

    const numParams = ParamRecordOperation.applyBack<
        NumParamTypes.State,
        NumParamTypes.DownOperation,
        ScalarError
    >({
        nextState: state.numParams,
        operation: operation.numParams,
        innerApplyBack: ({ nextState, operation }) => {
            return SimpleValueParam.applyBack<Maybe<number>>()({
                state: nextState,
                operation,
            });
        },
        defaultState: defaultNumParamState,
    });
    if (numParams.isError) {
        return numParams;
    }
    result.numParams = numParams.value;

    const numMaxParams = ParamRecordOperation.applyBack<
        NumParamTypes.State,
        NumParamTypes.DownOperation,
        ScalarError
    >({
        nextState: state.numMaxParams,
        operation: operation.numMaxParams,
        innerApplyBack: ({ nextState, operation }) => {
            return SimpleValueParam.applyBack<Maybe<number>>()({
                state: nextState,
                operation,
            });
        },
        defaultState: defaultNumParamState,
    });
    if (numMaxParams.isError) {
        return numMaxParams;
    }
    result.numMaxParams = numMaxParams.value;

    const strParams = ParamRecordOperation.applyBack<
        StrParamType.State,
        StrParamType.DownOperation,
        ScalarError
    >({
        nextState: state.strParams,
        operation: operation.strParams,
        innerApplyBack: ({ nextState, operation }) => {
            return StrParam.applyBack({ state: nextState, operation });
        },
        defaultState: defaultStrParamState,
    });
    if (strParams.isError) {
        return strParams;
    }
    result.strParams = strParams.value;

    const pieces = RecordOperation.applyBack<
        PieceTypes.State,
        PieceTypes.DownOperation,
        ScalarError
    >({
        nextState: state.pieces,
        operation: operation.pieces,
        innerApplyBack: ({ state: nextState, operation }) => {
            return Piece.applyBack({ state: nextState, operation });
        },
    });
    if (pieces.isError) {
        return pieces;
    }
    result.pieces = pieces.value;

    const privateCommandsResult = RecordOperation.applyBack<
        CommandTypes.State,
        CommandTypes.DownOperation,
        ScalarError
    >({
        nextState: state.privateCommands,
        operation: operation.privateCommands,
        innerApplyBack: params => {
            return Command.applyBack(params);
        },
    });
    if (privateCommandsResult.isError) {
        return privateCommandsResult;
    }
    result.privateCommands = privateCommandsResult.value;

    const tachieLocations = RecordOperation.applyBack<
        BoardPositionTypes.State,
        BoardPositionTypes.DownOperation,
        ScalarError
    >({
        nextState: state.tachieLocations,
        operation: operation.tachieLocations,
        innerApplyBack: ({ state: nextState, operation }) => {
            return BoardPosition.applyBack({ state: nextState, operation });
        },
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }
    result.tachieLocations = tachieLocations.value;

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation, DownError> = ({ first, second }) => {
    const boolParams = ParamRecordOperation.compose({
        first: first.boolParams,
        second: second.boolParams,
        innerCompose: params => SimpleValueParam.composeDownOperation<Maybe<boolean>>()(params),
    });
    if (boolParams.isError) {
        return boolParams;
    }

    const numParams = ParamRecordOperation.compose({
        first: first.numParams,
        second: second.numParams,
        innerCompose: params => SimpleValueParam.composeDownOperation<Maybe<number>>()(params),
    });
    if (numParams.isError) {
        return numParams;
    }

    const numMaxParams = ParamRecordOperation.compose({
        first: first.numMaxParams,
        second: second.numMaxParams,
        innerCompose: params => SimpleValueParam.composeDownOperation<Maybe<number>>()(params),
    });
    if (numMaxParams.isError) {
        return numMaxParams;
    }

    const strParams = ParamRecordOperation.compose({
        first: first.strParams,
        second: second.strParams,
        innerCompose: params => StrParam.composeDownOperation(params),
    });
    if (strParams.isError) {
        return strParams;
    }

    const pieces = RecordOperation.composeDownOperation<
        PieceTypes.State,
        PieceTypes.DownOperation,
        DownError
    >({
        first: first.pieces,
        second: second.pieces,
        innerApplyBack: ({ state, operation }) => Piece.applyBack({ state, operation }),
        innerCompose: params => Piece.composeDownOperation(params),
    });
    if (pieces.isError) {
        return pieces;
    }

    const privateCommands = RecordOperation.composeDownOperation<
        CommandTypes.State,
        CommandTypes.DownOperation,
        DownError
    >({
        first: first.privateCommands,
        second: second.privateCommands,
        innerApplyBack: ({ state, operation }) => Command.applyBack({ state, operation }),
        innerCompose: params => Command.composeDownOperation(params),
    });
    if (privateCommands.isError) {
        return privateCommands;
    }

    const tachieLocations = RecordOperation.composeDownOperation<
        BoardPositionTypes.State,
        BoardPositionTypes.DownOperation,
        DownError
    >({
        first: first.tachieLocations,
        second: second.tachieLocations,
        innerApplyBack: ({ state, operation }) => BoardPosition.applyBack({ state, operation }),
        innerCompose: params => BoardPosition.composeDownOperation(params),
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }

    const memo = TextOperation.composeDownOperation(first.memo, second.memo);
    if (memo.isError) {
        return memo;
    }
    const name = TextOperation.composeDownOperation(first.name, second.name);
    if (name.isError) {
        return name;
    }
    const chatPalette = TextOperation.composeDownOperation(first.chatPalette, second.chatPalette);
    if (chatPalette.isError) {
        return chatPalette;
    }
    const privateVarToml = TextOperation.composeDownOperation(
        first.privateVarToml,
        second.privateVarToml
    );
    if (privateVarToml.isError) {
        return privateVarToml;
    }

    const valueProps: DownOperation = {
        $v: 2,
        $r: 1,

        ownerParticipantId: ReplaceOperation.composeDownOperation(
            first.ownerParticipantId,
            second.ownerParticipantId
        ),
        isPrivate: ReplaceOperation.composeDownOperation(first.isPrivate, second.isPrivate),
        memo: memo.value,
        name: name.value,
        chatPalette: chatPalette.value,
        privateVarToml: privateVarToml.value,
        image: ReplaceOperation.composeDownOperation(first.image, second.image),
        tachieImage: ReplaceOperation.composeDownOperation(first.tachieImage, second.tachieImage),
        boolParams: boolParams.value,
        numParams: numParams.value,
        numMaxParams: numMaxParams.value,
        strParams: strParams.value,
        pieces: pieces.value,
        privateCommands: privateCommands.value,
        tachieLocations: tachieLocations.value,
    };
    return Result.ok(valueProps);
};

export const restore: Restore<State, DownOperation, TwoWayOperation> = ({
    nextState,
    downOperation,
}) => {
    if (downOperation === undefined) {
        return Result.ok({ prevState: nextState, twoWayOperation: undefined });
    }

    const boolParams = ParamRecordOperation.restore({
        nextState: nextState.boolParams,
        downOperation: downOperation.boolParams,
        innerRestore: params => SimpleValueParam.restore<Maybe<boolean>>()(params),
    });
    if (boolParams.isError) {
        return boolParams;
    }

    const numParams = ParamRecordOperation.restore({
        nextState: nextState.numParams,
        downOperation: downOperation.numParams,
        innerRestore: params => SimpleValueParam.restore<Maybe<number>>()(params),
    });
    if (numParams.isError) {
        return numParams;
    }

    const numMaxParams = ParamRecordOperation.restore({
        nextState: nextState.numMaxParams,
        downOperation: downOperation.numMaxParams,
        innerRestore: params => SimpleValueParam.restore<Maybe<number>>()(params),
    });
    if (numMaxParams.isError) {
        return numMaxParams;
    }

    const strParams = ParamRecordOperation.restore({
        nextState: nextState.strParams,
        downOperation: downOperation.strParams,
        innerRestore: params => StrParam.restore(params),
    });
    if (strParams.isError) {
        return strParams;
    }

    const pieces = RecordOperation.restore<
        PieceTypes.State,
        PieceTypes.DownOperation,
        PieceTypes.TwoWayOperation,
        ScalarError
    >({
        nextState: nextState.pieces,
        downOperation: downOperation.pieces,
        innerDiff: params => Piece.diff(params),
        innerRestore: params => Piece.restore(params),
    });
    if (pieces.isError) {
        return pieces;
    }

    const privateCommands = RecordOperation.restore<
        CommandTypes.State,
        CommandTypes.DownOperation,
        CommandTypes.TwoWayOperation,
        ScalarError
    >({
        nextState: nextState.privateCommands,
        downOperation: downOperation.privateCommands,
        innerDiff: params => Command.diff(params),
        innerRestore: params => Command.restore(params),
    });
    if (privateCommands.isError) {
        return privateCommands;
    }

    const tachieLocations = RecordOperation.restore<
        BoardPositionTypes.State,
        BoardPositionTypes.DownOperation,
        BoardPositionTypes.TwoWayOperation,
        ScalarError
    >({
        nextState: nextState.tachieLocations,
        downOperation: downOperation.tachieLocations,
        innerDiff: params => BoardPosition.diff(params),
        innerRestore: params => BoardPosition.restore(params),
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }

    const prevState: State = {
        ...nextState,
        boolParams: boolParams.value.prevState,
        numParams: numParams.value.prevState,
        numMaxParams: numMaxParams.value.prevState,
        strParams: strParams.value.prevState,
        pieces: pieces.value.prevState,
        privateCommands: privateCommands.value.prevState,
        tachieLocations: tachieLocations.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = {
        $v: 2,
        $r: 1,
        boolParams: boolParams.value.twoWayOperation,
        numParams: numParams.value.twoWayOperation,
        numMaxParams: numMaxParams.value.twoWayOperation,
        strParams: strParams.value.twoWayOperation,
        pieces: pieces.value.twoWayOperation,
        privateCommands: privateCommands.value.twoWayOperation,
        tachieLocations: tachieLocations.value.twoWayOperation,
    };

    if (downOperation.ownerParticipantId !== undefined) {
        prevState.ownerParticipantId = downOperation.ownerParticipantId.oldValue ?? undefined;
        twoWayOperation.ownerParticipantId = {
            oldValue: downOperation.ownerParticipantId.oldValue ?? undefined,
            newValue: nextState.ownerParticipantId,
        };
    }
    if (downOperation.image !== undefined) {
        prevState.image = downOperation.image.oldValue ?? undefined;
        twoWayOperation.image = {
            oldValue: downOperation.image.oldValue ?? undefined,
            newValue: nextState.image,
        };
    }
    if (downOperation.tachieImage !== undefined) {
        prevState.tachieImage = downOperation.tachieImage.oldValue ?? undefined;
        twoWayOperation.tachieImage = {
            oldValue: downOperation.tachieImage.oldValue ?? undefined,
            newValue: nextState.tachieImage,
        };
    }
    if (downOperation.isPrivate !== undefined) {
        prevState.isPrivate = downOperation.isPrivate.oldValue;
        twoWayOperation.isPrivate = {
            ...downOperation.isPrivate,
            newValue: nextState.isPrivate,
        };
    }
    if (downOperation.memo !== undefined) {
        const restored = TextOperation.restore({
            nextState: nextState.memo,
            downOperation: downOperation.memo,
        });
        if (restored.isError) {
            return restored;
        }
        prevState.memo = restored.value.prevState;
        twoWayOperation.memo = restored.value.twoWayOperation;
    }
    if (downOperation.name !== undefined) {
        const restored = TextOperation.restore({
            nextState: nextState.name,
            downOperation: downOperation.name,
        });
        if (restored.isError) {
            return restored;
        }
        prevState.name = restored.value.prevState;
        twoWayOperation.name = restored.value.twoWayOperation;
    }
    if (downOperation.chatPalette !== undefined) {
        const restored = TextOperation.restore({
            nextState: nextState.chatPalette,
            downOperation: downOperation.chatPalette,
        });
        if (restored.isError) {
            return restored;
        }
        prevState.chatPalette = restored.value.prevState;
        twoWayOperation.chatPalette = restored.value.twoWayOperation;
    }
    if (downOperation.privateVarToml !== undefined) {
        const restored = TextOperation.restore({
            nextState: nextState.privateVarToml,
            downOperation: downOperation.privateVarToml,
        });
        if (restored.isError) {
            return restored;
        }
        prevState.privateVarToml = restored.value.prevState;
        twoWayOperation.privateVarToml = restored.value.twoWayOperation;
    }

    return Result.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const boolParams = ParamRecordOperation.diff({
        prevState: prevState.boolParams,
        nextState: nextState.boolParams,
        innerDiff: ({ prevState, nextState }) =>
            SimpleValueParam.diff<Maybe<boolean>>()({
                prevState: prevState ?? defaultBoolParamState,
                nextState: nextState ?? defaultBoolParamState,
            }),
    });
    const numParams = ParamRecordOperation.diff({
        prevState: prevState.numParams,
        nextState: nextState.numParams,
        innerDiff: ({ prevState, nextState }) =>
            SimpleValueParam.diff<Maybe<number>>()({
                prevState: prevState ?? defaultNumParamState,
                nextState: nextState ?? defaultNumParamState,
            }),
    });
    const numMaxParams = ParamRecordOperation.diff({
        prevState: prevState.numMaxParams,
        nextState: nextState.numMaxParams,
        innerDiff: ({ prevState, nextState }) =>
            SimpleValueParam.diff<Maybe<number>>()({
                prevState: prevState ?? defaultNumParamState,
                nextState: nextState ?? defaultNumParamState,
            }),
    });
    const strParams = ParamRecordOperation.diff({
        prevState: prevState.strParams,
        nextState: nextState.strParams,
        innerDiff: ({ prevState, nextState }) =>
            StrParam.diff({
                prevState: prevState ?? defaultStrParamState,
                nextState: nextState ?? defaultStrParamState,
            }),
    });
    const pieces = RecordOperation.diff<PieceTypes.State, PieceTypes.TwoWayOperation>({
        prevState: prevState.pieces,
        nextState: nextState.pieces,
        innerDiff: params => Piece.diff(params),
    });
    const privateCommands = RecordOperation.diff<CommandTypes.State, CommandTypes.TwoWayOperation>({
        prevState: prevState.privateCommands,
        nextState: nextState.privateCommands,
        innerDiff: params => Command.diff(params),
    });
    const tachieLocations = RecordOperation.diff<
        BoardPositionTypes.State,
        BoardPositionTypes.TwoWayOperation
    >({
        prevState: prevState.tachieLocations,
        nextState: nextState.tachieLocations,
        innerDiff: params => BoardPosition.diff(params),
    });
    const result: TwoWayOperation = {
        $v: 2,
        $r: 1,
        boolParams,
        numParams,
        numMaxParams,
        strParams,
        pieces,
        privateCommands,
        tachieLocations,
    };
    if (prevState.ownerParticipantId !== nextState.ownerParticipantId) {
        result.ownerParticipantId = {
            oldValue: prevState.ownerParticipantId,
            newValue: nextState.ownerParticipantId,
        };
    }
    if (prevState.image !== nextState.image) {
        result.image = { oldValue: prevState.image, newValue: nextState.image };
    }
    if (prevState.tachieImage !== nextState.tachieImage) {
        result.tachieImage = {
            oldValue: prevState.tachieImage,
            newValue: nextState.tachieImage,
        };
    }
    if (prevState.isPrivate !== nextState.isPrivate) {
        result.isPrivate = {
            oldValue: prevState.isPrivate,
            newValue: nextState.isPrivate,
        };
    }
    if (prevState.memo !== nextState.memo) {
        result.memo = TextOperation.diff({
            prev: prevState.memo,
            next: nextState.memo,
        });
    }
    if (prevState.name !== nextState.name) {
        result.name = TextOperation.diff({
            prev: prevState.name,
            next: nextState.name,
        });
    }
    if (prevState.chatPalette !== nextState.chatPalette) {
        result.chatPalette = TextOperation.diff({
            prev: prevState.chatPalette,
            next: nextState.chatPalette,
        });
    }
    if (prevState.privateVarToml !== nextState.privateVarToml) {
        result.privateVarToml = TextOperation.diff({
            prev: prevState.privateVarToml,
            next: nextState.privateVarToml,
        });
    }
    if (isIdRecord(result)) {
        return undefined;
    }
    return result;
};

export const serverTransform =
    (
        isAuthorized: boolean,
        requestedBy: RequestedBy,
        currentRoomState: Room.State
    ): ServerTransform<State, TwoWayOperation, UpOperation> =>
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        if (!isAuthorized && currentState.isPrivate) {
            return Result.ok(undefined);
        }

        const boolParams = ParamRecordOperation.serverTransform({
            prevState: prevState.boolParams,
            nextState: currentState.boolParams,
            first: serverOperation?.boolParams,
            second: clientOperation.boolParams,
            innerTransform: ({ prevState, nextState, first, second }) =>
                SimpleValueParam.serverTransform<Maybe<boolean>>(isAuthorized)({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            defaultState: defaultBoolParamState,
        });
        if (boolParams.isError) {
            return boolParams;
        }

        const numParams = ParamRecordOperation.serverTransform({
            prevState: prevState.numParams,
            nextState: currentState.numParams,
            first: serverOperation?.numParams,
            second: clientOperation.numParams,
            innerTransform: ({ prevState, nextState, first, second }) =>
                SimpleValueParam.serverTransform<Maybe<number>>(isAuthorized)({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            defaultState: defaultNumParamState,
        });
        if (numParams.isError) {
            return numParams;
        }

        const numMaxParams = ParamRecordOperation.serverTransform({
            prevState: prevState.numMaxParams,
            nextState: currentState.numMaxParams,
            first: serverOperation?.numMaxParams,
            second: clientOperation.numMaxParams,
            innerTransform: ({ prevState, nextState, first, second }) =>
                SimpleValueParam.serverTransform<Maybe<number>>(isAuthorized)({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            defaultState: defaultNumParamState,
        });
        if (numMaxParams.isError) {
            return numMaxParams;
        }

        const strParams = ParamRecordOperation.serverTransform({
            prevState: prevState.strParams,
            nextState: currentState.strParams,
            first: serverOperation?.strParams,
            second: clientOperation.strParams,
            innerTransform: ({ prevState, nextState, first, second }) =>
                StrParam.serverTransform(isAuthorized)({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            defaultState: defaultStrParamState,
        });
        if (strParams.isError) {
            return strParams;
        }

        const pieces = RecordOperation.serverTransform<
            PieceTypes.State,
            PieceTypes.State,
            PieceTypes.TwoWayOperation,
            PieceTypes.UpOperation,
            TwoWayError
        >({
            prevState: prevState.pieces,
            nextState: currentState.pieces,
            first: serverOperation?.pieces,
            second: clientOperation.pieces,
            innerTransform: ({ prevState, nextState, first, second }) =>
                Piece.serverTransform({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ newState }) =>
                    !isBoardVisible({
                        requestedBy,
                        currentRoomState,
                        boardId: newState.boardId,
                    }) ||
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: currentState.ownerParticipantId ?? none,
                    }),
                cancelRemove: params => {
                    if (
                        !isBoardVisible({
                            requestedBy,
                            currentRoomState,
                            boardId: params.state.boardId,
                        })
                    ) {
                        return true;
                    }
                    return !isAuthorized && params.state.isPrivate;
                },
                cancelUpdate: params => {
                    if (
                        !isBoardVisible({
                            requestedBy,
                            currentRoomState,
                            boardId: params.nextState.boardId,
                        })
                    ) {
                        return true;
                    }
                    return !isAuthorized && params.nextState.isPrivate;
                },
            },
        });
        if (pieces.isError) {
            return pieces;
        }

        const privateCommands = RecordOperation.serverTransform<
            CommandTypes.State,
            CommandTypes.State,
            CommandTypes.TwoWayOperation,
            CommandTypes.UpOperation,
            TwoWayError
        >({
            prevState: prevState.privateCommands,
            nextState: currentState.privateCommands,
            first: serverOperation?.privateCommands,
            second: clientOperation.privateCommands,
            innerTransform: ({ prevState, nextState, first, second }) =>
                Command.serverTransform({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: () => !isAuthorized,
                cancelRemove: () => !isAuthorized,
                cancelUpdate: () => !isAuthorized,
            },
        });
        if (privateCommands.isError) {
            return privateCommands;
        }

        const tachieLocations = RecordOperation.serverTransform<
            BoardPositionTypes.State,
            BoardPositionTypes.State,
            BoardPositionTypes.TwoWayOperation,
            BoardPositionTypes.UpOperation,
            TwoWayError
        >({
            prevState: prevState.tachieLocations,
            nextState: currentState.tachieLocations,
            first: serverOperation?.tachieLocations,
            second: clientOperation.tachieLocations,
            innerTransform: ({ prevState, nextState, first, second }) =>
                BoardPosition.serverTransform({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ newState }) =>
                    !isBoardVisible({
                        requestedBy,
                        currentRoomState,
                        boardId: newState.boardId,
                    }) ||
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: currentState.ownerParticipantId ?? none,
                    }),
                cancelRemove: params => {
                    if (
                        !isBoardVisible({
                            requestedBy,
                            currentRoomState,
                            boardId: params.state.boardId,
                        })
                    ) {
                        return true;
                    }
                    return !isAuthorized && params.state.isPrivate;
                },
                cancelUpdate: params => {
                    if (
                        !isBoardVisible({
                            requestedBy,
                            currentRoomState,
                            boardId: params.nextState.boardId,
                        })
                    ) {
                        return true;
                    }
                    return !isAuthorized && params.nextState.isPrivate;
                },
            },
        });
        if (tachieLocations.isError) {
            return tachieLocations;
        }

        const twoWayOperation: TwoWayOperation = {
            $v: 2,
            $r: 1,
            boolParams: boolParams.value,
            numParams: numParams.value,
            numMaxParams: numMaxParams.value,
            strParams: strParams.value,
            pieces: pieces.value,
            privateCommands: privateCommands.value,
            tachieLocations: tachieLocations.value,
        };

        if (canChangeOwnerParticipantId({ requestedBy, currentOwnerParticipant: currentState })) {
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
        twoWayOperation.tachieImage = ReplaceOperation.serverTransform({
            first: serverOperation?.tachieImage,
            second: clientOperation.tachieImage,
            prevState: prevState.tachieImage,
        });
        twoWayOperation.isPrivate = ReplaceOperation.serverTransform({
            first: serverOperation?.isPrivate,
            second: clientOperation.isPrivate,
            prevState: prevState.isPrivate,
        });
        const transformedMemo = TextOperation.serverTransform({
            first: serverOperation?.memo,
            second: clientOperation.memo,
            prevState: prevState.memo,
        });
        if (transformedMemo.isError) {
            return transformedMemo;
        }
        twoWayOperation.memo = transformedMemo.value;
        const transformedName = TextOperation.serverTransform({
            first: serverOperation?.name,
            second: clientOperation.name,
            prevState: prevState.name,
        });
        if (transformedName.isError) {
            return transformedName;
        }
        twoWayOperation.name = transformedName.value;
        if (isAuthorized) {
            const transformedChatPalette = TextOperation.serverTransform({
                first: serverOperation?.chatPalette,
                second: clientOperation.chatPalette,
                prevState: prevState.chatPalette,
            });
            if (transformedChatPalette.isError) {
                return transformedChatPalette;
            }
            twoWayOperation.chatPalette = transformedChatPalette.value;
        }
        if (isAuthorized) {
            const transformed = TextOperation.serverTransform({
                first: serverOperation?.privateVarToml,
                second: clientOperation.privateVarToml,
                prevState: prevState.privateVarToml,
            });
            if (transformed.isError) {
                return transformed;
            }
            twoWayOperation.privateVarToml = transformed.value;
        }

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const boolParams = ParamRecordOperation.clientTransform({
        first: first.boolParams,
        second: second.boolParams,
        innerTransform: params => SimpleValueParam.clientTransform<Maybe<boolean>>()(params),
    });
    if (boolParams.isError) {
        return boolParams;
    }

    const numParams = ParamRecordOperation.clientTransform({
        first: first.numParams,
        second: second.numParams,
        innerTransform: params => SimpleValueParam.clientTransform<Maybe<number>>()(params),
    });
    if (numParams.isError) {
        return numParams;
    }

    const numMaxParams = ParamRecordOperation.clientTransform({
        first: first.numMaxParams,
        second: second.numMaxParams,
        innerTransform: params => SimpleValueParam.clientTransform<Maybe<number>>()(params),
    });
    if (numMaxParams.isError) {
        return numMaxParams;
    }

    const strParams = ParamRecordOperation.clientTransform({
        first: first.strParams,
        second: second.strParams,
        innerTransform: params => StrParam.clientTransform(params),
    });
    if (strParams.isError) {
        return strParams;
    }

    const pieces = RecordOperation.clientTransform<
        PieceTypes.State,
        PieceTypes.UpOperation,
        UpError
    >({
        first: first.pieces,
        second: second.pieces,
        innerTransform: params => Piece.clientTransform(params),
        innerDiff: params => Piece.diff(params),
    });
    if (pieces.isError) {
        return pieces;
    }

    const privateCommands = RecordOperation.clientTransform<
        CommandTypes.State,
        CommandTypes.UpOperation,
        UpError
    >({
        first: first.privateCommands,
        second: second.privateCommands,
        innerTransform: params => Command.clientTransform(params),
        innerDiff: params => {
            const diff = Command.diff(params);
            if (diff == null) {
                return diff;
            }
            return Command.toUpOperation(diff);
        },
    });
    if (privateCommands.isError) {
        return privateCommands;
    }

    const tachieLocations = RecordOperation.clientTransform<
        BoardPositionTypes.State,
        BoardPositionTypes.UpOperation,
        UpError
    >({
        first: first.tachieLocations,
        second: second.tachieLocations,
        innerTransform: params => BoardPosition.clientTransform(params),
        innerDiff: params => BoardPosition.diff(params),
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }

    const ownerParticipantId = ReplaceOperation.clientTransform({
        first: first.ownerParticipantId,
        second: second.ownerParticipantId,
    });

    const image = ReplaceOperation.clientTransform({
        first: first.image,
        second: second.image,
    });

    const tachieImage = ReplaceOperation.clientTransform({
        first: first.tachieImage,
        second: second.tachieImage,
    });

    const isPrivate = ReplaceOperation.clientTransform({
        first: first.isPrivate,
        second: second.isPrivate,
    });

    const memo = TextOperation.clientTransform({
        first: first.memo,
        second: second.memo,
    });
    if (memo.isError) {
        return memo;
    }

    const name = TextOperation.clientTransform({
        first: first.name,
        second: second.name,
    });
    if (name.isError) {
        return name;
    }

    const chatPalette = TextOperation.clientTransform({
        first: first.chatPalette,
        second: second.chatPalette,
    });
    if (chatPalette.isError) {
        return chatPalette;
    }

    const privateVarToml = TextOperation.clientTransform({
        first: first.privateVarToml,
        second: second.privateVarToml,
    });
    if (privateVarToml.isError) {
        return privateVarToml;
    }

    const firstPrime: UpOperation = {
        $v: 2,
        $r: 1,

        boolParams: boolParams.value.firstPrime,
        numParams: numParams.value.firstPrime,
        numMaxParams: numMaxParams.value.firstPrime,
        pieces: pieces.value.firstPrime,
        privateCommands: privateCommands.value.firstPrime,
        strParams: strParams.value.firstPrime,
        tachieLocations: tachieLocations.value.firstPrime,

        ownerParticipantId: ownerParticipantId.firstPrime,
        isPrivate: isPrivate.firstPrime,
        image: image.firstPrime,
        memo: memo.value.firstPrime,
        name: name.value.firstPrime,
        chatPalette: chatPalette.value.firstPrime,
        privateVarToml: privateVarToml.value.firstPrime,
        tachieImage: tachieImage.firstPrime,
    };
    const secondPrime: UpOperation = {
        $v: 2,
        $r: 1,
        boolParams: boolParams.value.secondPrime,
        numParams: numParams.value.secondPrime,
        numMaxParams: numMaxParams.value.secondPrime,
        pieces: pieces.value.secondPrime,
        privateCommands: privateCommands.value.secondPrime,
        strParams: strParams.value.secondPrime,
        tachieLocations: tachieLocations.value.secondPrime,

        ownerParticipantId: ownerParticipantId.secondPrime,
        isPrivate: isPrivate.secondPrime,
        image: image.secondPrime,
        memo: memo.value.secondPrime,
        name: name.value.secondPrime,
        chatPalette: chatPalette.value.secondPrime,
        privateVarToml: privateVarToml.value.secondPrime,
        tachieImage: tachieImage.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
