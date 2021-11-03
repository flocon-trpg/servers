import { mapRecordOperationElement } from '../../../util/recordOperationElement';
import * as TextOperation from '../../../util/textOperation';
import * as Piece from '../../../piece/functions';
import * as PieceTypes from '../../../piece/types';
import * as BoardLocation from '../../../boardLocation/functions';
import * as BoardLocationTypes from '../../../boardLocation/types';
import * as DicePieceValue from './dicePieceValue/functions';
import * as DicePieceValueTypes from './dicePieceValue/types';
import * as StringPieceValue from './stringPieceValue/functions';
import * as StringPieceValueTypes from './stringPieceValue/types';
import * as ReplaceOperation from '../../../util/replaceOperation';
import * as DualKeyRecordOperation from '../../../util/dualKeyRecordOperation';
import * as RecordOperation from '../../../util/recordOperation';
import * as ParamRecordOperation from '../../../util/paramRecordOperation';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    RequestedBy,
    Restore,
    ServerTransform,
} from '../../../util/type';
import * as BoolParamTypes from './boolParam/types';
import * as Command from './command/functions';
import * as CommandTypes from './command/types';
import * as NumParamTypes from './numParam/types';
import * as StrParam from './strParam/functions';
import * as StrParamType from './strParam/types';
import * as SimpleValueParam from './simpleValueParam/functions';
import { isIdRecord } from '../../../util/record';
import { Result } from '@kizahasi/result';
import { ApplyError, ComposeAndTransformError, PositiveInt } from '@kizahasi/ot-string';
import { chooseDualKeyRecord, chooseRecord, CompositeKey } from '@kizahasi/util';
import { Maybe } from '../../../../maybe';
import { isBoardVisible } from '../../../util/isBoardVisible';
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';

// privateCommandは無効化しているが、コードは大部分残している

const defaultBoolParamState: BoolParamTypes.State = {
    $v: 1,
    $r: 1,
    isValuePrivate: false,
    value: null,
};

const defaultNumParamState: NumParamTypes.State = {
    $v: 1,
    $r: 1,
    isValuePrivate: false,
    value: null,
};

const defaultStrParamState: StrParamType.State = {
    $v: 1,
    $r: 1,
    isValuePrivate: false,
    value: '',
};

export const toClientState =
    (isAuthorized: boolean, requestedBy: RequestedBy, activeBoardKey: CompositeKey | null) =>
    (source: State): State => {
        return {
            ...source,
            chatPalette: isAuthorized ? source.chatPalette : '',
            privateCommand: isAuthorized ? source.privateCommand : '',
            privateVarToml: isAuthorized ? source.privateVarToml : '',
            boolParams: RecordOperation.toClientState({
                serverState: source.boolParams,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    SimpleValueParam.toClientState<Maybe<boolean>>(isAuthorized, null)(state),
            }),
            numParams: RecordOperation.toClientState({
                serverState: source.numParams,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    SimpleValueParam.toClientState<Maybe<number>>(isAuthorized, null)(state),
            }),
            numMaxParams: RecordOperation.toClientState({
                serverState: source.numMaxParams,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    SimpleValueParam.toClientState<Maybe<number>>(isAuthorized, null)(state),
            }),
            strParams: RecordOperation.toClientState({
                serverState: source.strParams,
                isPrivate: () => false,
                toClientState: ({ state }) => StrParam.toClientState(isAuthorized)(state),
            }),
            pieces: Piece.toClientStateMany(requestedBy, activeBoardKey)(source.pieces),
            privateCommands: RecordOperation.toClientState<CommandTypes.State, CommandTypes.State>({
                serverState: source.privateCommands,
                isPrivate: () => !isAuthorized,
                toClientState: ({ state }) => Command.toClientState(state),
            }),
            tachieLocations: DualKeyRecordOperation.toClientState<
                BoardLocationTypes.State,
                BoardLocationTypes.State
            >({
                serverState: source.tachieLocations,
                isPrivate: state =>
                    !isBoardVisible({
                        requestedBy,
                        activeBoardKey,
                        boardKey: state.boardKey,
                    }),
                toClientState: ({ state }) => BoardLocation.toClientState(state),
            }),
            dicePieceValues: RecordOperation.toClientState<
                DicePieceValueTypes.State,
                DicePieceValueTypes.State
            >({
                serverState: source.dicePieceValues,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    DicePieceValue.toClientState(isAuthorized, requestedBy, activeBoardKey)(state),
            }),
            stringPieceValues: RecordOperation.toClientState<
                StringPieceValueTypes.State,
                StringPieceValueTypes.State
            >({
                serverState: source.stringPieceValues,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    StringPieceValue.toClientState(
                        isAuthorized,
                        requestedBy,
                        activeBoardKey
                    )(state),
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
        privateCommand:
            source.privateCommand == null
                ? undefined
                : TextOperation.toDownOperation(source.privateCommand),
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
                : chooseDualKeyRecord(source.pieces, operation =>
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
                : chooseDualKeyRecord(source.tachieLocations, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: BoardLocation.toDownOperation,
                      })
                  ),
        dicePieceValues:
            source.dicePieceValues == null
                ? undefined
                : chooseRecord(source.dicePieceValues, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: DicePieceValue.toDownOperation,
                      })
                  ),
        stringPieceValues:
            source.stringPieceValues == null
                ? undefined
                : chooseRecord(source.stringPieceValues, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: StringPieceValue.toDownOperation,
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
        privateCommand:
            source.privateCommand == null
                ? undefined
                : TextOperation.toUpOperation(source.privateCommand),
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
                : chooseDualKeyRecord(source.pieces, operation =>
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
                : chooseDualKeyRecord(source.tachieLocations, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: BoardLocation.toUpOperation,
                      })
                  ),
        dicePieceValues:
            source.dicePieceValues == null
                ? undefined
                : chooseRecord(source.dicePieceValues, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: DicePieceValue.toUpOperation,
                      })
                  ),
        stringPieceValues:
            source.stringPieceValues == null
                ? undefined
                : chooseRecord(source.stringPieceValues, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: StringPieceValue.toUpOperation,
                      })
                  ),
    };
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };
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
    if (operation.privateCommand != null) {
        const valueResult = TextOperation.apply(state.privateCommand, operation.privateCommand);
        if (valueResult.isError) {
            return valueResult;
        }
        result.privateCommand = valueResult.value;
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
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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

    const pieces = DualKeyRecordOperation.apply<
        PieceTypes.State,
        PieceTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
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
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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

    const tachieLocations = DualKeyRecordOperation.apply<
        BoardLocationTypes.State,
        BoardLocationTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: state.tachieLocations,
        operation: operation.tachieLocations,
        innerApply: ({ prevState, operation }) => {
            return BoardLocation.apply({ state: prevState, operation });
        },
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }
    result.tachieLocations = tachieLocations.value;

    const dicePieceValues = RecordOperation.apply<
        DicePieceValueTypes.State,
        DicePieceValueTypes.UpOperation | DicePieceValueTypes.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: state.dicePieceValues,
        operation: operation.dicePieceValues,
        innerApply: ({ prevState, operation: upOperation }) => {
            return DicePieceValue.apply({
                state: prevState,
                operation: upOperation,
            });
        },
    });
    if (dicePieceValues.isError) {
        return dicePieceValues;
    }
    result.dicePieceValues = dicePieceValues.value;

    const stringPieceValues = RecordOperation.apply<
        StringPieceValueTypes.State,
        StringPieceValueTypes.UpOperation | StringPieceValueTypes.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: state.stringPieceValues,
        operation: operation.stringPieceValues,
        innerApply: ({ prevState, operation: upOperation }) => {
            return StringPieceValue.apply({
                state: prevState,
                operation: upOperation,
            });
        },
    });
    if (stringPieceValues.isError) {
        return stringPieceValues;
    }
    result.stringPieceValues = stringPieceValues.value;

    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result: State = { ...state };
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
    if (operation.privateCommand != null) {
        const valueResult = TextOperation.applyBack(state.privateCommand, operation.privateCommand);
        if (valueResult.isError) {
            return valueResult;
        }
        result.privateCommand = valueResult.value;
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
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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

    const pieces = DualKeyRecordOperation.applyBack<
        PieceTypes.State,
        PieceTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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

    const tachieLocations = DualKeyRecordOperation.applyBack<
        BoardLocationTypes.State,
        BoardLocationTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: state.tachieLocations,
        operation: operation.tachieLocations,
        innerApplyBack: ({ state: nextState, operation }) => {
            return BoardLocation.applyBack({ state: nextState, operation });
        },
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }
    result.tachieLocations = tachieLocations.value;

    const dicePieceValues = RecordOperation.applyBack<
        DicePieceValueTypes.State,
        DicePieceValueTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: state.dicePieceValues,
        operation: operation.dicePieceValues,
        innerApplyBack: ({ state, operation }) => {
            return DicePieceValue.applyBack({ state, operation });
        },
    });
    if (dicePieceValues.isError) {
        return dicePieceValues;
    }
    result.dicePieceValues = dicePieceValues.value;

    const stringPieceValues = RecordOperation.applyBack<
        StringPieceValueTypes.State,
        StringPieceValueTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: state.stringPieceValues,
        operation: operation.stringPieceValues,
        innerApplyBack: ({ state, operation }) => {
            return StringPieceValue.applyBack({ state, operation });
        },
    });
    if (stringPieceValues.isError) {
        return stringPieceValues;
    }
    result.stringPieceValues = stringPieceValues.value;

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation> = ({ first, second }) => {
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

    const pieces = DualKeyRecordOperation.composeDownOperation<
        PieceTypes.State,
        PieceTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.privateCommands,
        second: second.privateCommands,
        innerApplyBack: ({ state, operation }) => Command.applyBack({ state, operation }),
        innerCompose: params => Command.composeDownOperation(params),
    });
    if (privateCommands.isError) {
        return privateCommands;
    }

    const tachieLocations = DualKeyRecordOperation.composeDownOperation<
        BoardLocationTypes.State,
        BoardLocationTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.tachieLocations,
        second: second.tachieLocations,
        innerApplyBack: ({ state, operation }) => BoardLocation.applyBack({ state, operation }),
        innerCompose: params => BoardLocation.composeDownOperation(params),
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }

    const dicePieceValues = RecordOperation.composeDownOperation<
        DicePieceValueTypes.State,
        DicePieceValueTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.dicePieceValues,
        second: second.dicePieceValues,
        innerApplyBack: params => DicePieceValue.applyBack(params),
        innerCompose: params => DicePieceValue.composeDownOperation(params),
    });
    if (dicePieceValues.isError) {
        return dicePieceValues;
    }

    const stringPieceValues = RecordOperation.composeDownOperation<
        StringPieceValueTypes.State,
        StringPieceValueTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.stringPieceValues,
        second: second.stringPieceValues,
        innerApplyBack: params => StringPieceValue.applyBack(params),
        innerCompose: params => StringPieceValue.composeDownOperation(params),
    });
    if (stringPieceValues.isError) {
        return stringPieceValues;
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
    const privateCommand = TextOperation.composeDownOperation(
        first.privateCommand,
        second.privateCommand
    );
    if (privateCommand.isError) {
        return privateCommand;
    }
    const privateVarToml = TextOperation.composeDownOperation(
        first.privateVarToml,
        second.privateVarToml
    );
    if (privateVarToml.isError) {
        return privateVarToml;
    }

    const valueProps: DownOperation = {
        $v: 1,
        $r: 2,

        isPrivate: ReplaceOperation.composeDownOperation(first.isPrivate, second.isPrivate),
        memo: memo.value,
        name: name.value,
        chatPalette: chatPalette.value,
        privateCommand: privateCommand.value,
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
        dicePieceValues: dicePieceValues.value,
        stringPieceValues: stringPieceValues.value,
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

    const pieces = DualKeyRecordOperation.restore<
        PieceTypes.State,
        PieceTypes.DownOperation,
        PieceTypes.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: nextState.privateCommands,
        downOperation: downOperation.privateCommands,
        innerDiff: params => Command.diff(params),
        innerRestore: params => Command.restore(params),
    });
    if (privateCommands.isError) {
        return privateCommands;
    }

    const tachieLocations = DualKeyRecordOperation.restore<
        BoardLocationTypes.State,
        BoardLocationTypes.DownOperation,
        BoardLocationTypes.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: nextState.tachieLocations,
        downOperation: downOperation.tachieLocations,
        innerDiff: params => BoardLocation.diff(params),
        innerRestore: params => BoardLocation.restore(params),
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }

    const dicePieceValues = RecordOperation.restore<
        DicePieceValueTypes.State,
        DicePieceValueTypes.DownOperation,
        DicePieceValueTypes.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: nextState.dicePieceValues,
        downOperation: downOperation.dicePieceValues,
        innerDiff: params => DicePieceValue.diff(params),
        innerRestore: params => DicePieceValue.restore(params),
    });
    if (dicePieceValues.isError) {
        return dicePieceValues;
    }

    const stringPieceValues = RecordOperation.restore<
        StringPieceValueTypes.State,
        StringPieceValueTypes.DownOperation,
        StringPieceValueTypes.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: nextState.stringPieceValues,
        downOperation: downOperation.stringPieceValues,
        innerDiff: params => StringPieceValue.diff(params),
        innerRestore: params => StringPieceValue.restore(params),
    });
    if (stringPieceValues.isError) {
        return stringPieceValues;
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
        dicePieceValues: dicePieceValues.value.prevState,
        stringPieceValues: stringPieceValues.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = {
        $v: 1,
        $r: 2,
        boolParams: boolParams.value.twoWayOperation,
        numParams: numParams.value.twoWayOperation,
        numMaxParams: numMaxParams.value.twoWayOperation,
        strParams: strParams.value.twoWayOperation,
        pieces: pieces.value.twoWayOperation,
        privateCommands: privateCommands.value.twoWayOperation,
        tachieLocations: tachieLocations.value.twoWayOperation,
        dicePieceValues: dicePieceValues.value.twoWayOperation,
        stringPieceValues: stringPieceValues.value.twoWayOperation,
    };

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
    if (downOperation.privateCommand !== undefined) {
        const restored = TextOperation.restore({
            nextState: nextState.privateCommand,
            downOperation: downOperation.privateCommand,
        });
        if (restored.isError) {
            return restored;
        }
        prevState.privateCommand = restored.value.prevState;
        twoWayOperation.privateCommand = restored.value.twoWayOperation;
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
                prevState: prevState ?? {
                    $v: 1,
                    $r: 1,
                    isValuePrivate: false,
                    value: null,
                },
                nextState: nextState ?? {
                    $v: 1,
                    $r: 1,
                    isValuePrivate: false,
                    value: null,
                },
            }),
    });
    const numParams = ParamRecordOperation.diff({
        prevState: prevState.numParams,
        nextState: nextState.numParams,
        innerDiff: ({ prevState, nextState }) =>
            SimpleValueParam.diff<Maybe<number>>()({
                prevState: prevState ?? {
                    $v: 1,
                    $r: 1,
                    isValuePrivate: false,
                    value: null,
                },
                nextState: nextState ?? {
                    $v: 1,
                    $r: 1,
                    isValuePrivate: false,
                    value: null,
                },
            }),
    });
    const numMaxParams = ParamRecordOperation.diff({
        prevState: prevState.numMaxParams,
        nextState: nextState.numMaxParams,
        innerDiff: ({ prevState, nextState }) =>
            SimpleValueParam.diff<Maybe<number>>()({
                prevState: prevState ?? {
                    $v: 1,
                    $r: 1,
                    isValuePrivate: false,
                    value: null,
                },
                nextState: nextState ?? {
                    $v: 1,
                    $r: 1,
                    isValuePrivate: false,
                    value: null,
                },
            }),
    });
    const strParams = ParamRecordOperation.diff({
        prevState: prevState.strParams,
        nextState: nextState.strParams,
        innerDiff: ({ prevState, nextState }) =>
            StrParam.diff({
                prevState: prevState ?? {
                    $v: 1,
                    $r: 1,
                    isValuePrivate: false,
                    value: '',
                },
                nextState: nextState ?? {
                    $v: 1,
                    $r: 1,
                    isValuePrivate: false,
                    value: '',
                },
            }),
    });
    const pieces = DualKeyRecordOperation.diff<PieceTypes.State, PieceTypes.TwoWayOperation>({
        prevState: prevState.pieces,
        nextState: nextState.pieces,
        innerDiff: params => Piece.diff(params),
    });
    const privateCommands = RecordOperation.diff<CommandTypes.State, CommandTypes.TwoWayOperation>({
        prevState: prevState.privateCommands,
        nextState: nextState.privateCommands,
        innerDiff: params => Command.diff(params),
    });
    const tachieLocations = DualKeyRecordOperation.diff<
        BoardLocationTypes.State,
        BoardLocationTypes.TwoWayOperation
    >({
        prevState: prevState.tachieLocations,
        nextState: nextState.tachieLocations,
        innerDiff: params => BoardLocation.diff(params),
    });
    const dicePieceValues = RecordOperation.diff<
        DicePieceValueTypes.State,
        DicePieceValueTypes.TwoWayOperation
    >({
        prevState: prevState.dicePieceValues,
        nextState: nextState.dicePieceValues,
        innerDiff: params => DicePieceValue.diff(params),
    });
    const stringPieceValues = RecordOperation.diff<
        StringPieceValueTypes.State,
        StringPieceValueTypes.TwoWayOperation
    >({
        prevState: prevState.stringPieceValues,
        nextState: nextState.stringPieceValues,
        innerDiff: params => StringPieceValue.diff(params),
    });
    const result: TwoWayOperation = {
        $v: 1,
        $r: 2,
        boolParams,
        numParams,
        numMaxParams,
        strParams,
        pieces,
        privateCommands,
        tachieLocations,
        dicePieceValues,
        stringPieceValues,
    };
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
    if (prevState.privateCommand !== nextState.privateCommand) {
        result.privateCommand = TextOperation.diff({
            prev: prevState.privateCommand,
            next: nextState.privateCommand,
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
        activeBoardKey: CompositeKey | null
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

        const pieces = DualKeyRecordOperation.serverTransform<
            PieceTypes.State,
            PieceTypes.State,
            PieceTypes.TwoWayOperation,
            PieceTypes.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
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
                cancelCreate: ({ key, newState }) =>
                    !isBoardVisible({ requestedBy, activeBoardKey, boardKey: newState.boardKey }) ||
                    !RequestedBy.isAuthorized({ requestedBy, userUid: key.first }),
                cancelRemove: params => {
                    if (
                        !isBoardVisible({
                            requestedBy,
                            activeBoardKey,
                            boardKey: params.state.boardKey,
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
                            activeBoardKey,
                            boardKey: params.prevState.boardKey,
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
            string | ApplyError<PositiveInt> | ComposeAndTransformError
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

        const tachieLocations = DualKeyRecordOperation.serverTransform<
            BoardLocationTypes.State,
            BoardLocationTypes.State,
            BoardLocationTypes.TwoWayOperation,
            BoardLocationTypes.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
        >({
            prevState: prevState.tachieLocations,
            nextState: currentState.tachieLocations,
            first: serverOperation?.tachieLocations,
            second: clientOperation.tachieLocations,
            innerTransform: ({ prevState, nextState, first, second }) =>
                BoardLocation.serverTransform({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ key, newState }) =>
                    !isBoardVisible({ requestedBy, activeBoardKey, boardKey: newState.boardKey }) ||
                    !RequestedBy.isAuthorized({ requestedBy, userUid: key.first }),
                cancelRemove: params => {
                    if (
                        !isBoardVisible({
                            requestedBy,
                            activeBoardKey,
                            boardKey: params.state.boardKey,
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
                            activeBoardKey,
                            boardKey: params.prevState.boardKey,
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

        const dicePieceValues = RecordOperation.serverTransform<
            DicePieceValueTypes.State,
            DicePieceValueTypes.State,
            DicePieceValueTypes.TwoWayOperation,
            DicePieceValueTypes.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
        >({
            first: serverOperation?.dicePieceValues,
            second: clientOperation.dicePieceValues,
            prevState: prevState.dicePieceValues,
            nextState: currentState.dicePieceValues,
            innerTransform: ({ first, second, prevState, nextState }) =>
                DicePieceValue.serverTransform(isAuthorized)({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: () => !isAuthorized,
                cancelUpdate: () => !isAuthorized,
                cancelRemove: () => !isAuthorized,
            },
        });
        if (dicePieceValues.isError) {
            return dicePieceValues;
        }

        const stringPieceValues = RecordOperation.serverTransform<
            StringPieceValueTypes.State,
            StringPieceValueTypes.State,
            StringPieceValueTypes.TwoWayOperation,
            StringPieceValueTypes.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
        >({
            first: serverOperation?.stringPieceValues,
            second: clientOperation.stringPieceValues,
            prevState: prevState.stringPieceValues,
            nextState: currentState.stringPieceValues,
            innerTransform: ({ first, second, prevState, nextState }) =>
                StringPieceValue.serverTransform(isAuthorized)({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: () => !isAuthorized,
                cancelUpdate: () => !isAuthorized,
                cancelRemove: () => !isAuthorized,
            },
        });
        if (stringPieceValues.isError) {
            return stringPieceValues;
        }

        const twoWayOperation: TwoWayOperation = {
            $v: 1,
            $r: 2,
            boolParams: boolParams.value,
            numParams: numParams.value,
            numMaxParams: numMaxParams.value,
            strParams: strParams.value,
            pieces: pieces.value,
            privateCommands: privateCommands.value,
            tachieLocations: tachieLocations.value,
            dicePieceValues: dicePieceValues.value,
            stringPieceValues: stringPieceValues.value,
        };

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
        twoWayOperation.memo = transformedMemo.value.secondPrime;
        const transformedName = TextOperation.serverTransform({
            first: serverOperation?.name,
            second: clientOperation.name,
            prevState: prevState.name,
        });
        if (transformedName.isError) {
            return transformedName;
        }
        twoWayOperation.name = transformedName.value.secondPrime;
        if (isAuthorized) {
            const transformedChatPalette = TextOperation.serverTransform({
                first: serverOperation?.chatPalette,
                second: clientOperation.chatPalette,
                prevState: prevState.chatPalette,
            });
            if (transformedChatPalette.isError) {
                return transformedChatPalette;
            }
            twoWayOperation.chatPalette = transformedChatPalette.value.secondPrime;

            // const transformedPrivateCommand = TextOperation.serverTransform({
            //     first: serverOperation?.privateCommand,
            //     second: clientOperation.privateCommand,
            //     prevState: prevState.privateCommand,
            // });
            // if (transformedPrivateCommand.isError) {
            //     return transformedPrivateCommand;
            // }
            // twoWayOperation.privateCommand = transformedPrivateCommand.value.secondPrime;
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
            twoWayOperation.privateVarToml = transformed.value.secondPrime;
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

    const pieces = DualKeyRecordOperation.clientTransform<
        PieceTypes.State,
        PieceTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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
        string | ApplyError<PositiveInt> | ComposeAndTransformError
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

    const tachieLocations = DualKeyRecordOperation.clientTransform<
        BoardLocationTypes.State,
        BoardLocationTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.tachieLocations,
        second: second.tachieLocations,
        innerTransform: params => BoardLocation.clientTransform(params),
        innerDiff: params => BoardLocation.diff(params),
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }

    const dicePieceValues = RecordOperation.clientTransform<
        DicePieceValueTypes.State,
        DicePieceValueTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.dicePieceValues,
        second: second.dicePieceValues,
        innerTransform: params => DicePieceValue.clientTransform(params),
        innerDiff: params => {
            const diff = DicePieceValue.diff(params);
            if (diff == null) {
                return diff;
            }
            return DicePieceValue.toUpOperation(diff);
        },
    });
    if (dicePieceValues.isError) {
        return dicePieceValues;
    }

    const stringPieceValues = RecordOperation.clientTransform<
        StringPieceValueTypes.State,
        StringPieceValueTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.stringPieceValues,
        second: second.stringPieceValues,
        innerTransform: params => StringPieceValue.clientTransform(params),
        innerDiff: params => {
            const diff = StringPieceValue.diff(params);
            if (diff == null) {
                return diff;
            }
            return StringPieceValue.toUpOperation(diff);
        },
    });
    if (stringPieceValues.isError) {
        return stringPieceValues;
    }

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

    const privateCommand = TextOperation.clientTransform({
        first: first.privateCommand,
        second: second.privateCommand,
    });
    if (privateCommand.isError) {
        return privateCommand;
    }

    const privateVarToml = TextOperation.clientTransform({
        first: first.privateVarToml,
        second: second.privateVarToml,
    });
    if (privateVarToml.isError) {
        return privateVarToml;
    }

    const firstPrime: UpOperation = {
        $v: 1,
        $r: 2,
        boolParams: boolParams.value.firstPrime,
        dicePieceValues: dicePieceValues.value.firstPrime,
        stringPieceValues: stringPieceValues.value.firstPrime,
        numParams: numParams.value.firstPrime,
        numMaxParams: numMaxParams.value.firstPrime,
        pieces: pieces.value.firstPrime,
        privateCommands: privateCommands.value.firstPrime,
        strParams: strParams.value.firstPrime,
        tachieLocations: tachieLocations.value.firstPrime,

        isPrivate: isPrivate.firstPrime,
        image: image.firstPrime,
        memo: memo.value.firstPrime,
        name: name.value.firstPrime,
        chatPalette: chatPalette.value.firstPrime,
        privateCommand: privateCommand.value.firstPrime,
        privateVarToml: privateVarToml.value.firstPrime,
        tachieImage: tachieImage.firstPrime,
    };
    const secondPrime: UpOperation = {
        $v: 1,
        $r: 2,
        boolParams: boolParams.value.secondPrime,
        dicePieceValues: dicePieceValues.value.secondPrime,
        stringPieceValues: stringPieceValues.value.secondPrime,
        numParams: numParams.value.secondPrime,
        numMaxParams: numMaxParams.value.secondPrime,
        pieces: pieces.value.secondPrime,
        privateCommands: privateCommands.value.secondPrime,
        strParams: strParams.value.secondPrime,
        tachieLocations: tachieLocations.value.secondPrime,

        isPrivate: isPrivate.secondPrime,
        image: image.secondPrime,
        memo: memo.value.secondPrime,
        name: name.value.secondPrime,
        chatPalette: chatPalette.value.secondPrime,
        privateCommand: privateCommand.value.secondPrime,
        privateVarToml: privateVarToml.value.secondPrime,
        tachieImage: tachieImage.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
