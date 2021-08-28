import * as t from 'io-ts';
import {
    mapRecordOperationElement,
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../../../util/recordOperationElement';
import { FilePath, filePath } from '../../../filePath/v1';
import * as TextOperation from '../../../util/textOperation';
import * as Piece from '../../../piece/v1';
import * as BoardLocation from '../../../boardLocation/v1';
import * as DicePieceValue from './dicePieceValue/v1';
import * as NumberPieceValue from './numberPieceValue/v1';
import * as ReplaceOperation from '../../../util/replaceOperation';
import * as DualKeyRecordOperation from '../../../util/dualKeyRecordOperation';
import * as RecordOperation from '../../../util/recordOperation';
import * as ParamRecordOperation from '../../../util/paramRecordOperation';
import { RecordTwoWayOperation } from '../../../util/recordOperation';
import { DualKeyRecordTwoWayOperation } from '../../../util/dualKeyRecordOperation';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    RequestedBy,
    Restore,
    ServerTransform,
} from '../../../util/type';
import * as BoolParam from './boolParam/v1';
import * as Command from './command/v1';
import * as NumParam from './numParam/v1';
import * as StrParam from './strParam/v1';
import * as SimpleValueParam from './simpleValueParam/v1';
import { createOperation } from '../../../util/createOperation';
import { isIdRecord, record, StringKeyRecord } from '../../../util/record';
import { Result } from '@kizahasi/result';
import { ApplyError, ComposeAndTransformError, PositiveInt } from '@kizahasi/ot-string';
import { chooseDualKeyRecord, chooseRecord, CompositeKey } from '@kizahasi/util';
import { Maybe, maybe } from '../../../../maybe';

// privateCommandは無効化しているが、コードは大部分残している

export const state = t.type({
    $version: t.literal(1),

    image: maybe(filePath),
    isPrivate: t.boolean,
    memo: t.string,
    name: t.string,
    chatPalette: t.string,
    privateCommand: t.string,
    privateVarToml: t.string,
    tachieImage: maybe(filePath),

    boolParams: record(t.string, BoolParam.state),
    numParams: record(t.string, NumParam.state),
    numMaxParams: record(t.string, NumParam.state),
    strParams: record(t.string, StrParam.state),
    pieces: record(t.string, record(t.string, Piece.state)),
    privateCommands: record(t.string, Command.state),
    tachieLocations: record(t.string, record(t.string, BoardLocation.state)),
    dicePieceValues: record(t.string, DicePieceValue.state),
    numberPieceValues: record(t.string, NumberPieceValue.state),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, {
    image: t.type({ oldValue: maybe(filePath) }),
    isPrivate: t.type({ oldValue: t.boolean }),
    memo: TextOperation.downOperation,
    name: t.type({ oldValue: t.string }),
    chatPalette: TextOperation.downOperation,
    privateCommand: TextOperation.downOperation,
    privateVarToml: TextOperation.downOperation,
    tachieImage: t.type({ oldValue: maybe(filePath) }),

    boolParams: record(t.string, BoolParam.downOperation),
    numParams: record(t.string, NumParam.downOperation),
    numMaxParams: record(t.string, NumParam.downOperation),
    strParams: record(t.string, StrParam.downOperation),
    pieces: record(
        t.string,
        record(t.string, recordDownOperationElementFactory(Piece.state, Piece.downOperation))
    ),
    privateCommands: record(
        t.string,
        recordDownOperationElementFactory(Command.state, Command.downOperation)
    ),
    tachieLocations: record(
        t.string,
        record(
            t.string,
            recordDownOperationElementFactory(BoardLocation.state, BoardLocation.downOperation)
        )
    ),
    dicePieceValues: record(
        t.string,
        recordDownOperationElementFactory(DicePieceValue.state, DicePieceValue.downOperation)
    ),
    numberPieceValues: record(
        t.string,
        recordDownOperationElementFactory(NumberPieceValue.state, NumberPieceValue.downOperation)
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, {
    image: t.type({ newValue: maybe(filePath) }),
    isPrivate: t.type({ newValue: t.boolean }),
    memo: TextOperation.upOperation,
    name: t.type({ newValue: t.string }),
    chatPalette: TextOperation.upOperation,
    privateCommand: TextOperation.upOperation,
    privateVarToml: TextOperation.upOperation,
    tachieImage: t.type({ newValue: maybe(filePath) }),

    boolParams: record(t.string, BoolParam.upOperation),
    numParams: record(t.string, NumParam.upOperation),
    numMaxParams: record(t.string, NumParam.upOperation),
    strParams: record(t.string, StrParam.upOperation),
    pieces: record(
        t.string,
        record(t.string, recordUpOperationElementFactory(Piece.state, Piece.upOperation))
    ),
    privateCommands: record(
        t.string,
        recordUpOperationElementFactory(Command.state, Command.upOperation)
    ),
    tachieLocations: record(
        t.string,
        record(
            t.string,
            recordUpOperationElementFactory(BoardLocation.state, BoardLocation.upOperation)
        )
    ),
    dicePieceValues: record(
        t.string,
        recordUpOperationElementFactory(DicePieceValue.state, DicePieceValue.upOperation)
    ),
    numberPieceValues: record(
        t.string,
        recordUpOperationElementFactory(NumberPieceValue.state, NumberPieceValue.upOperation)
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $version: 1;

    image?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<FilePath>>;
    isPrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    memo?: TextOperation.TwoWayOperation;
    name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    chatPalette?: TextOperation.TwoWayOperation;
    privateCommand?: TextOperation.TwoWayOperation;
    privateVarToml?: TextOperation.TwoWayOperation;
    tachieImage?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<FilePath>>;

    boolParams?: StringKeyRecord<BoolParam.TwoWayOperation>;
    numParams?: StringKeyRecord<NumParam.TwoWayOperation>;
    numMaxParams?: StringKeyRecord<NumParam.TwoWayOperation>;
    strParams?: StringKeyRecord<StrParam.TwoWayOperation>;
    pieces?: DualKeyRecordTwoWayOperation<Piece.State, Piece.TwoWayOperation>;
    privateCommands?: RecordTwoWayOperation<Command.State, Command.TwoWayOperation>;
    tachieLocations?: DualKeyRecordTwoWayOperation<
        BoardLocation.State,
        BoardLocation.TwoWayOperation
    >;
    dicePieceValues?: RecordOperation.RecordTwoWayOperation<
        DicePieceValue.State,
        DicePieceValue.TwoWayOperation
    >;
    numberPieceValues?: RecordOperation.RecordTwoWayOperation<
        NumberPieceValue.State,
        NumberPieceValue.TwoWayOperation
    >;
};

const defaultBoolParamState: BoolParam.State = {
    $version: 1,
    isValuePrivate: false,
    value: null,
};

const defaultNumParamState: NumParam.State = {
    $version: 1,
    isValuePrivate: false,
    value: null,
};

const defaultStrParamState: StrParam.State = {
    $version: 1,
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
            privateCommands: RecordOperation.toClientState<Command.State, Command.State>({
                serverState: source.privateCommands,
                isPrivate: () => !isAuthorized,
                toClientState: ({ state }) => Command.toClientState(state),
            }),
            tachieLocations: DualKeyRecordOperation.toClientState<
                BoardLocation.State,
                BoardLocation.State
            >({
                serverState: source.tachieLocations,
                isPrivate: () => false,
                toClientState: ({ state }) => BoardLocation.toClientState(state),
            }),
            dicePieceValues: RecordOperation.toClientState<
                DicePieceValue.State,
                DicePieceValue.State
            >({
                serverState: source.dicePieceValues,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    DicePieceValue.toClientState(isAuthorized, requestedBy, activeBoardKey)(state),
            }),
            numberPieceValues: RecordOperation.toClientState<
                NumberPieceValue.State,
                NumberPieceValue.State
            >({
                serverState: source.numberPieceValues,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    NumberPieceValue.toClientState(
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
        numberPieceValues:
            source.numberPieceValues == null
                ? undefined
                : chooseRecord(source.numberPieceValues, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: NumberPieceValue.toDownOperation,
                      })
                  ),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        memo: source.memo == null ? undefined : TextOperation.toUpOperation(source.memo),
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
        numberPieceValues:
            source.numberPieceValues == null
                ? undefined
                : chooseRecord(source.numberPieceValues, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: NumberPieceValue.toUpOperation,
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
        result.name = operation.name.newValue;
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
        BoolParam.State,
        BoolParam.UpOperation | BoolParam.TwoWayOperation,
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
        NumParam.State,
        NumParam.UpOperation | NumParam.TwoWayOperation,
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
        NumParam.State,
        NumParam.UpOperation | NumParam.TwoWayOperation,
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
        StrParam.State,
        StrParam.UpOperation | StrParam.TwoWayOperation,
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
        Piece.State,
        Piece.UpOperation,
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
        Command.State,
        Command.UpOperation | Command.TwoWayOperation,
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
        BoardLocation.State,
        BoardLocation.UpOperation,
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
        DicePieceValue.State,
        DicePieceValue.UpOperation | DicePieceValue.TwoWayOperation,
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

    const numberPieceValues = RecordOperation.apply<
        NumberPieceValue.State,
        NumberPieceValue.UpOperation | NumberPieceValue.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: state.numberPieceValues,
        operation: operation.numberPieceValues,
        innerApply: ({ prevState, operation: upOperation }) => {
            return NumberPieceValue.apply({
                state: prevState,
                operation: upOperation,
            });
        },
    });
    if (numberPieceValues.isError) {
        return numberPieceValues;
    }
    result.numberPieceValues = numberPieceValues.value;

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
        result.name = operation.name.oldValue;
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
        BoolParam.State,
        BoolParam.DownOperation,
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
        NumParam.State,
        NumParam.DownOperation,
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
        NumParam.State,
        NumParam.DownOperation,
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
        StrParam.State,
        StrParam.DownOperation,
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
        Piece.State,
        Piece.DownOperation,
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
        Command.State,
        Command.DownOperation,
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
        BoardLocation.State,
        BoardLocation.DownOperation,
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
        DicePieceValue.State,
        DicePieceValue.DownOperation,
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

    const numberPieceValues = RecordOperation.applyBack<
        NumberPieceValue.State,
        NumberPieceValue.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: state.numberPieceValues,
        operation: operation.numberPieceValues,
        innerApplyBack: ({ state, operation }) => {
            return NumberPieceValue.applyBack({ state, operation });
        },
    });
    if (numberPieceValues.isError) {
        return numberPieceValues;
    }
    result.numberPieceValues = numberPieceValues.value;

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
        Piece.State,
        Piece.DownOperation,
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
        Command.State,
        Command.DownOperation,
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
        BoardLocation.State,
        BoardLocation.DownOperation,
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
        DicePieceValue.State,
        DicePieceValue.DownOperation,
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

    const numberPieceValues = RecordOperation.composeDownOperation<
        NumberPieceValue.State,
        NumberPieceValue.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.numberPieceValues,
        second: second.numberPieceValues,
        innerApplyBack: params => NumberPieceValue.applyBack(params),
        innerCompose: params => NumberPieceValue.composeDownOperation(params),
    });
    if (numberPieceValues.isError) {
        return numberPieceValues;
    }

    const memo = TextOperation.composeDownOperation(first.memo, second.memo);
    if (memo.isError) {
        return memo;
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
        $version: 1,

        isPrivate: ReplaceOperation.composeDownOperation(first.isPrivate, second.isPrivate),
        memo: memo.value,
        name: ReplaceOperation.composeDownOperation(first.name, second.name),
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
        numberPieceValues: numberPieceValues.value,
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
        Piece.State,
        Piece.DownOperation,
        Piece.TwoWayOperation,
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
        Command.State,
        Command.DownOperation,
        Command.TwoWayOperation,
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
        BoardLocation.State,
        BoardLocation.DownOperation,
        BoardLocation.TwoWayOperation,
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
        DicePieceValue.State,
        DicePieceValue.DownOperation,
        DicePieceValue.TwoWayOperation,
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

    const numberPieceValues = RecordOperation.restore<
        NumberPieceValue.State,
        NumberPieceValue.DownOperation,
        NumberPieceValue.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: nextState.numberPieceValues,
        downOperation: downOperation.numberPieceValues,
        innerDiff: params => NumberPieceValue.diff(params),
        innerRestore: params => NumberPieceValue.restore(params),
    });
    if (numberPieceValues.isError) {
        return numberPieceValues;
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
        numberPieceValues: numberPieceValues.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = {
        $version: 1,
        boolParams: boolParams.value.twoWayOperation,
        numParams: numParams.value.twoWayOperation,
        numMaxParams: numMaxParams.value.twoWayOperation,
        strParams: strParams.value.twoWayOperation,
        pieces: pieces.value.twoWayOperation,
        privateCommands: privateCommands.value.twoWayOperation,
        tachieLocations: tachieLocations.value.twoWayOperation,
        dicePieceValues: dicePieceValues.value.twoWayOperation,
        numberPieceValues: numberPieceValues.value.twoWayOperation,
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
        prevState.name = downOperation.name.oldValue;
        twoWayOperation.name = {
            ...downOperation.name,
            newValue: nextState.name,
        };
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
                    $version: 1,
                    isValuePrivate: false,
                    value: null,
                },
                nextState: nextState ?? {
                    $version: 1,
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
                    $version: 1,
                    isValuePrivate: false,
                    value: null,
                },
                nextState: nextState ?? {
                    $version: 1,
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
                    $version: 1,
                    isValuePrivate: false,
                    value: null,
                },
                nextState: nextState ?? {
                    $version: 1,
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
                    $version: 1,
                    isValuePrivate: false,
                    value: '',
                },
                nextState: nextState ?? {
                    $version: 1,
                    isValuePrivate: false,
                    value: '',
                },
            }),
    });
    const pieces = DualKeyRecordOperation.diff<Piece.State, Piece.TwoWayOperation>({
        prevState: prevState.pieces,
        nextState: nextState.pieces,
        innerDiff: params => Piece.diff(params),
    });
    const privateCommands = RecordOperation.diff<Command.State, TwoWayOperation>({
        prevState: prevState.privateCommands,
        nextState: nextState.privateCommands,
        innerDiff: params => Command.diff(params),
    });
    const tachieLocations = DualKeyRecordOperation.diff<
        BoardLocation.State,
        BoardLocation.TwoWayOperation
    >({
        prevState: prevState.tachieLocations,
        nextState: nextState.tachieLocations,
        innerDiff: params => BoardLocation.diff(params),
    });
    const dicePieceValues = RecordOperation.diff<
        DicePieceValue.State,
        DicePieceValue.TwoWayOperation
    >({
        prevState: prevState.dicePieceValues,
        nextState: nextState.dicePieceValues,
        innerDiff: params => DicePieceValue.diff(params),
    });
    const numberPieceValues = RecordOperation.diff<
        NumberPieceValue.State,
        NumberPieceValue.TwoWayOperation
    >({
        prevState: prevState.numberPieceValues,
        nextState: nextState.numberPieceValues,
        innerDiff: params => NumberPieceValue.diff(params),
    });
    const result: TwoWayOperation = {
        $version: 1,
        boolParams,
        numParams,
        numMaxParams,
        strParams,
        pieces,
        privateCommands,
        tachieLocations,
        dicePieceValues,
        numberPieceValues,
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
        result.name = { oldValue: prevState.name, newValue: nextState.name };
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
    (isAuthorized: boolean): ServerTransform<State, TwoWayOperation, UpOperation> =>
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
            Piece.State,
            Piece.State,
            Piece.TwoWayOperation,
            Piece.UpOperation,
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
                cancelRemove: params => !isAuthorized && params.nextState.isPrivate,
                cancelUpdate: params => !isAuthorized && params.nextState.isPrivate,
            },
        });
        if (pieces.isError) {
            return pieces;
        }

        const privateCommands = RecordOperation.serverTransform<
            Command.State,
            Command.State,
            Command.TwoWayOperation,
            Command.UpOperation,
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
            BoardLocation.State,
            BoardLocation.State,
            BoardLocation.TwoWayOperation,
            BoardLocation.UpOperation,
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
            cancellationPolicy: {},
        });
        if (tachieLocations.isError) {
            return tachieLocations;
        }

        const dicePieceValues = RecordOperation.serverTransform<
            DicePieceValue.State,
            DicePieceValue.State,
            DicePieceValue.TwoWayOperation,
            DicePieceValue.UpOperation,
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

        const numberPieceValues = RecordOperation.serverTransform<
            NumberPieceValue.State,
            NumberPieceValue.State,
            NumberPieceValue.TwoWayOperation,
            NumberPieceValue.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
        >({
            first: serverOperation?.numberPieceValues,
            second: clientOperation.numberPieceValues,
            prevState: prevState.numberPieceValues,
            nextState: currentState.numberPieceValues,
            innerTransform: ({ first, second, prevState, nextState }) =>
                NumberPieceValue.serverTransform(isAuthorized)({
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
        if (numberPieceValues.isError) {
            return numberPieceValues;
        }

        const twoWayOperation: TwoWayOperation = {
            $version: 1,
            boolParams: boolParams.value,
            numParams: numParams.value,
            numMaxParams: numMaxParams.value,
            strParams: strParams.value,
            pieces: pieces.value,
            privateCommands: privateCommands.value,
            tachieLocations: tachieLocations.value,
            dicePieceValues: dicePieceValues.value,
            numberPieceValues: numberPieceValues.value,
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
        twoWayOperation.name = ReplaceOperation.serverTransform({
            first: serverOperation?.name,
            second: clientOperation.name,
            prevState: prevState.name,
        });
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
        Piece.State,
        Piece.UpOperation,
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
        Command.State,
        Command.UpOperation,
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
        BoardLocation.State,
        BoardLocation.UpOperation,
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
        DicePieceValue.State,
        DicePieceValue.UpOperation,
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

    const numberPieceValues = RecordOperation.clientTransform<
        NumberPieceValue.State,
        NumberPieceValue.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.numberPieceValues,
        second: second.numberPieceValues,
        innerTransform: params => NumberPieceValue.clientTransform(params),
        innerDiff: params => {
            const diff = NumberPieceValue.diff(params);
            if (diff == null) {
                return diff;
            }
            return NumberPieceValue.toUpOperation(diff);
        },
    });
    if (numberPieceValues.isError) {
        return numberPieceValues;
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

    const name = ReplaceOperation.clientTransform({
        first: first.name,
        second: second.name,
    });

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
        $version: 1,
        boolParams: boolParams.value.firstPrime,
        dicePieceValues: dicePieceValues.value.firstPrime,
        numberPieceValues: numberPieceValues.value.firstPrime,
        numParams: numParams.value.firstPrime,
        numMaxParams: numMaxParams.value.firstPrime,
        pieces: pieces.value.firstPrime,
        privateCommands: privateCommands.value.firstPrime,
        strParams: strParams.value.firstPrime,
        tachieLocations: tachieLocations.value.firstPrime,

        isPrivate: isPrivate.firstPrime,
        image: image.firstPrime,
        memo: memo.value.firstPrime,
        name: name.firstPrime,
        chatPalette: chatPalette.value.firstPrime,
        privateCommand: privateCommand.value.firstPrime,
        privateVarToml: privateVarToml.value.firstPrime,
        tachieImage: tachieImage.firstPrime,
    };
    const secondPrime: UpOperation = {
        $version: 1,
        boolParams: boolParams.value.secondPrime,
        dicePieceValues: dicePieceValues.value.secondPrime,
        numberPieceValues: numberPieceValues.value.secondPrime,
        numParams: numParams.value.secondPrime,
        numMaxParams: numMaxParams.value.secondPrime,
        pieces: pieces.value.secondPrime,
        privateCommands: privateCommands.value.secondPrime,
        strParams: strParams.value.secondPrime,
        tachieLocations: tachieLocations.value.secondPrime,

        isPrivate: isPrivate.secondPrime,
        image: image.secondPrime,
        memo: memo.value.secondPrime,
        name: name.secondPrime,
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
