import * as t from 'io-ts';
import { Maybe, maybe } from '../../../../io-ts';
import { mapRecordOperationElement, recordDownOperationElementFactory, recordUpOperationElementFactory } from '../../util/recordOperationElement';
import { FilePath, filePath } from '../../../filePath/v1';
import * as TextOperation from '../../util/textOperation';
import * as Piece from '../../../piece/v1';
import * as BoardLocation from '../../../boardLocation/v1';
import * as ReplaceOperation from '../../util/replaceOperation';
import * as DualKeyRecordOperation from '../../util/dualKeyRecordOperation';
import * as RecordOperation from '../../util/recordOperation';
import * as ParamRecordOperation from '../../util/paramRecordOperation';
import { ResultModule } from '../../../../Result';
import { chooseDualKeyRecord, chooseRecord } from '../../../../utils';
import { ApplyError, ComposeAndTransformError, PositiveInt } from '../../../../textOperation';
import { RecordTwoWayOperation } from '../../util/recordOperation';
import { DualKeyRecordTwoWayOperation } from '../../util/dualKeyRecordOperation';
import { Apply, ClientTransform, Compose, Diff, Restore, server, ServerTransform, ToClientOperationParams } from '../../util/type';
import * as BoolParam from './boolParam/v1';
import * as NumParam from './numParam/v1';
import * as StrParam from './strParam/v1';
import * as SimpleValueParam from './simpleValueParam/v1';
import { operation } from '../../util/operation';
import { isIdRecord } from '../../util/record';

export const state = t.type({
    $version: t.literal(1),

    image: maybe(filePath),
    isPrivate: t.boolean,
    memo: t.string,
    name: t.string,
    privateCommands: t.record(t.string, t.string),
    privateVarToml: t.string,
    tachieImage: maybe(filePath),

    boolParams: t.record(t.string, BoolParam.state),
    numParams: t.record(t.string, NumParam.state),
    numMaxParams: t.record(t.string, NumParam.state),
    strParams: t.record(t.string, StrParam.state),
    pieces: t.record(t.string, t.record(t.string, Piece.state)),
    tachieLocations: t.record(t.string, t.record(t.string, BoardLocation.state)),
});

export type State = t.TypeOf<typeof state>;

export const downOperation = operation(1, {
    image: t.type({ oldValue: maybe(filePath) }),
    isPrivate: t.type({ oldValue: t.boolean }),
    memo: TextOperation.downOperation,
    name: t.type({ oldValue: t.string }),
    privateCommands: t.record(t.string, recordDownOperationElementFactory(t.string, TextOperation.downOperation)),
    privateVarToml: TextOperation.downOperation,
    tachieImage: t.type({ oldValue: maybe(filePath) }),

    boolParams: t.record(t.string, BoolParam.downOperation),
    numParams: t.record(t.string, NumParam.downOperation),
    numMaxParams: t.record(t.string, NumParam.downOperation),
    strParams: t.record(t.string, StrParam.downOperation),
    pieces: t.record(t.string, t.record(t.string, recordDownOperationElementFactory(Piece.state, Piece.downOperation))),
    tachieLocations: t.record(t.string, t.record(t.string, recordDownOperationElementFactory(BoardLocation.state, BoardLocation.downOperation))),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = operation(1, {
    image: t.type({ newValue: maybe(filePath) }),
    isPrivate: t.type({ newValue: t.boolean }),
    memo: TextOperation.upOperation,
    name: t.type({ newValue: t.string }),
    privateCommands: t.record(t.string, recordUpOperationElementFactory(t.string, TextOperation.upOperation)),
    privateVarToml: TextOperation.upOperation,
    tachieImage: t.type({ newValue: maybe(filePath) }),

    boolParams: t.record(t.string, BoolParam.upOperation),
    numParams: t.record(t.string, NumParam.upOperation),
    numMaxParams: t.record(t.string, NumParam.upOperation),
    strParams: t.record(t.string, StrParam.upOperation),
    pieces: t.record(t.string, t.record(t.string, recordUpOperationElementFactory(Piece.state, Piece.upOperation))),
    tachieLocations: t.record(t.string, t.record(t.string, recordUpOperationElementFactory(BoardLocation.state, BoardLocation.upOperation))),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $version: 1;

    image?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<FilePath>>;
    isPrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    memo?: TextOperation.TwoWayOperation;
    name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    privateCommands?: RecordTwoWayOperation<string, TextOperation.TwoWayOperation>;
    privateVarToml?: TextOperation.TwoWayOperation;
    tachieImage?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<FilePath>>;

    boolParams?: Record<string, BoolParam.TwoWayOperation>;
    numParams?: Record<string, NumParam.TwoWayOperation>;
    numMaxParams?: Record<string, NumParam.TwoWayOperation>;
    strParams?: Record<string, StrParam.TwoWayOperation>;
    pieces?: DualKeyRecordTwoWayOperation<Piece.State, Piece.TwoWayOperation>;
    tachieLocations?: DualKeyRecordTwoWayOperation<BoardLocation.State, BoardLocation.TwoWayOperation>;
}

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

export const toClientState = (createdByMe: boolean) => (source: State): State => {
    return {
        ...source,
        privateCommands: createdByMe ? source.privateCommands : {},
        privateVarToml: createdByMe ? source.privateVarToml : '',
        boolParams: RecordOperation.toClientState({
            serverState: source.boolParams,
            isPrivate: () => false,
            toClientState: ({ state }) => SimpleValueParam.toClientState<Maybe<boolean>>(createdByMe, null)(state),
        }),
        numParams: RecordOperation.toClientState({
            serverState: source.numParams,
            isPrivate: () => false,
            toClientState: ({ state }) => SimpleValueParam.toClientState<Maybe<number>>(createdByMe, null)(state),
        }),
        numMaxParams: RecordOperation.toClientState({
            serverState: source.numMaxParams,
            isPrivate: () => false,
            toClientState: ({ state }) => SimpleValueParam.toClientState<Maybe<number>>(createdByMe, null)(state),
        }),
        strParams: RecordOperation.toClientState({
            serverState: source.strParams,
            isPrivate: () => false,
            toClientState: ({ state }) => StrParam.toClientState(createdByMe)(state),
        }),
        pieces: DualKeyRecordOperation.toClientState<Piece.State, Piece.State>({
            serverState: source.pieces,
            isPrivate: () => false,
            toClientState: ({ state }) => Piece.toClientState(state),
        }),
        tachieLocations: DualKeyRecordOperation.toClientState<BoardLocation.State, BoardLocation.State>({
            serverState: source.tachieLocations,
            isPrivate: () => false,
            toClientState: ({ state }) => BoardLocation.toClientState(state),
        }),
    };
};

export const toClientOperation = (createdByMe: boolean) => ({ prevState, nextState, diff }: ToClientOperationParams<State, TwoWayOperation>): UpOperation => {
    return {
        ...diff,
        memo: diff.memo == null ? undefined : TextOperation.toUpOperation(diff.memo),
        privateCommands: diff.privateCommands == null ? undefined : chooseRecord(diff.privateCommands, operation => mapRecordOperationElement({ source: operation, mapReplace: x => x, mapOperation: x => TextOperation.toUpOperation(x) })),
        privateVarToml: diff.privateVarToml == null ? undefined : TextOperation.toUpOperation(diff.privateVarToml),
        boolParams: diff.boolParams == null ? undefined : ParamRecordOperation.toClientOperation({
            diff: diff.boolParams,
            prevState: prevState.boolParams,
            nextState: nextState.boolParams,
            toClientOperation: (params) => SimpleValueParam.toClientOperation<Maybe<boolean>>(createdByMe, null)(params),
            defaultState: defaultBoolParamState,
        }),
        numParams: diff.numParams == null ? undefined : ParamRecordOperation.toClientOperation({
            diff: diff.numParams,
            prevState: prevState.numParams,
            nextState: nextState.numParams,
            toClientOperation: (params) => SimpleValueParam.toClientOperation<Maybe<number>>(createdByMe, null)(params),
            defaultState: defaultNumParamState,
        }),
        numMaxParams: diff.numMaxParams == null ? undefined : ParamRecordOperation.toClientOperation({
            diff: diff.numMaxParams,
            prevState: prevState.numMaxParams,
            nextState: nextState.numMaxParams,
            toClientOperation: (params) => SimpleValueParam.toClientOperation<Maybe<number>>(createdByMe, null)(params),
            defaultState: defaultNumParamState,
        }),
        strParams: diff.strParams == null ? undefined : ParamRecordOperation.toClientOperation({
            diff: diff.strParams,
            prevState: prevState.strParams,
            nextState: nextState.strParams,
            toClientOperation: (params) => StrParam.toClientOperation(createdByMe)(params),
            defaultState: defaultStrParamState,

        }),
        pieces: diff.pieces == null ? undefined : DualKeyRecordOperation.toClientOperation({
            diff: diff.pieces,
            prevState: prevState.pieces,
            nextState: nextState.pieces,
            toClientState: ({ nextState }) => Piece.toClientState(nextState),
            toClientOperation: (params) => Piece.toClientOperation(params),
            isPrivate: () => false,
        }),
        tachieLocations: diff.tachieLocations == null ? undefined : DualKeyRecordOperation.toClientOperation({
            diff: diff.tachieLocations,
            prevState: prevState.tachieLocations,
            nextState: nextState.tachieLocations,
            toClientState: ({ nextState }) => BoardLocation.toClientState(nextState),
            toClientOperation: (params) => BoardLocation.toClientOperation(params),
            isPrivate: () => false,
        }),
    };
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        memo: source.memo == null ? undefined : TextOperation.toDownOperation(source.memo),
        privateCommands: source.privateCommands == null ? undefined : chooseRecord(source.privateCommands, operation => mapRecordOperationElement({ source: operation, mapReplace: x => x, mapOperation: x => TextOperation.toDownOperation(x) })),
        privateVarToml: source.privateVarToml == null ? undefined : TextOperation.toDownOperation(source.privateVarToml),
        boolParams: source.boolParams == null ? undefined : chooseRecord(source.boolParams, SimpleValueParam.toDownOperation),
        numParams: source.numParams == null ? undefined : chooseRecord(source.numParams, SimpleValueParam.toDownOperation),
        numMaxParams: source.numMaxParams == null ? undefined : chooseRecord(source.numMaxParams, SimpleValueParam.toDownOperation),
        strParams: source.strParams == null ? undefined : chooseRecord(source.strParams, StrParam.toDownOperation),
        pieces: source.pieces == null ? undefined : chooseDualKeyRecord(source.pieces, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Piece.toDownOperation,
        })),
        tachieLocations: source.tachieLocations == null ? undefined : chooseDualKeyRecord(source.tachieLocations, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: BoardLocation.toDownOperation,
        })),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        memo: source.memo == null ? undefined : TextOperation.toUpOperation(source.memo),
        privateCommands: source.privateCommands == null ? undefined : chooseRecord(source.privateCommands, operation => mapRecordOperationElement({ source: operation, mapReplace: x => x, mapOperation: x => TextOperation.toUpOperation(x) })),
        privateVarToml: source.privateVarToml == null ? undefined : TextOperation.toUpOperation(source.privateVarToml),
        boolParams: source.boolParams == null ? undefined : chooseRecord(source.boolParams, SimpleValueParam.toUpOperation),
        numParams: source.numParams == null ? undefined : chooseRecord(source.numParams, SimpleValueParam.toUpOperation),
        numMaxParams: source.numMaxParams == null ? undefined : chooseRecord(source.numMaxParams, SimpleValueParam.toUpOperation),
        strParams: source.strParams == null ? undefined : chooseRecord(source.strParams, StrParam.toUpOperation),
        pieces: source.pieces == null ? undefined : chooseDualKeyRecord(source.pieces, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Piece.toUpOperation,
        })),
        tachieLocations: source.tachieLocations == null ? undefined : chooseDualKeyRecord(source.tachieLocations, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: BoardLocation.toUpOperation,
        })),
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

    const privateCommandsResult = RecordOperation.apply<string, TextOperation.UpOperation | TextOperation.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.privateCommands, operation: operation.privateCommands, innerApply: ({ prevState, operation }) => {
            return TextOperation.apply(prevState, operation);
        }
    });
    if (privateCommandsResult.isError) {
        return privateCommandsResult;
    }
    result.privateCommands = privateCommandsResult.value;

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

    const boolParams = ParamRecordOperation.apply<BoolParam.State, BoolParam.UpOperation | BoolParam.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.boolParams,
        operation: operation.boolParams,
        innerApply: ({ prevState, operation }) => {
            return SimpleValueParam.apply<Maybe<boolean>>()({ state: prevState, operation });
        },
        defaultState: defaultBoolParamState,
    });
    if (boolParams.isError) {
        return boolParams;
    }
    result.boolParams = boolParams.value;

    const numParams = ParamRecordOperation.apply<NumParam.State, NumParam.UpOperation | NumParam.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.numParams,
        operation: operation.numParams,
        innerApply: ({ prevState, operation }) => {
            return SimpleValueParam.apply<Maybe<number>>()({ state: prevState, operation });
        },
        defaultState: defaultNumParamState,
    });
    if (numParams.isError) {
        return numParams;
    }
    result.numParams = numParams.value;

    const numMaxParams = ParamRecordOperation.apply<NumParam.State, NumParam.UpOperation | NumParam.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.numMaxParams,
        operation: operation.numMaxParams,
        innerApply: ({ prevState, operation }) => {
            return SimpleValueParam.apply<Maybe<number>>()({ state: prevState, operation });
        },
        defaultState: defaultNumParamState,
    });
    if (numMaxParams.isError) {
        return numMaxParams;
    }
    result.numMaxParams = numMaxParams.value;

    const strParams = ParamRecordOperation.apply<StrParam.State, StrParam.UpOperation | StrParam.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
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

    const pieces = DualKeyRecordOperation.apply<Piece.State, Piece.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.pieces, operation: operation.pieces, innerApply: ({ prevState, operation }) => {
            return Piece.apply({ state: prevState, operation });
        }
    });
    if (pieces.isError) {
        return pieces;
    }
    result.pieces = pieces.value;

    const tachieLocations = DualKeyRecordOperation.apply<BoardLocation.State, BoardLocation.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.tachieLocations, operation: operation.tachieLocations, innerApply: ({ prevState, operation }) => {
            return BoardLocation.apply({ state: prevState, operation });
        }
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }
    result.tachieLocations = tachieLocations.value;

    return ResultModule.ok(result);
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

    const privateCommandsResult = RecordOperation.applyBack<string, TextOperation.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        nextState: state.privateCommands, operation: operation.privateCommands, innerApplyBack: ({ state: nextState, operation }) => {
            return TextOperation.applyBack(nextState, operation);
        }
    });
    if (privateCommandsResult.isError) {
        return privateCommandsResult;
    }
    result.privateCommands = privateCommandsResult.value;

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

    const boolParams = ParamRecordOperation.applyBack<BoolParam.State, BoolParam.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        nextState: state.boolParams,
        operation: operation.boolParams,
        innerApplyBack: ({ nextState, operation }) => {
            return SimpleValueParam.applyBack<Maybe<boolean>>()({ state: nextState, operation });
        },
        defaultState: defaultBoolParamState,
    });
    if (boolParams.isError) {
        return boolParams;
    }
    result.boolParams = boolParams.value;

    const numParams = ParamRecordOperation.applyBack<NumParam.State, NumParam.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        nextState: state.numParams,
        operation: operation.numParams,
        innerApplyBack: ({ nextState, operation }) => {
            return SimpleValueParam.applyBack<Maybe<number>>()({ state: nextState, operation });
        },
        defaultState: defaultNumParamState,
    });
    if (numParams.isError) {
        return numParams;
    }
    result.numParams = numParams.value;

    const numMaxParams = ParamRecordOperation.applyBack<NumParam.State, NumParam.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        nextState: state.numMaxParams,
        operation: operation.numMaxParams,
        innerApplyBack: ({ nextState, operation }) => {
            return SimpleValueParam.applyBack<Maybe<number>>()({ state: nextState, operation });
        },
        defaultState: defaultNumParamState,
    });
    if (numMaxParams.isError) {
        return numMaxParams;
    }
    result.numMaxParams = numMaxParams.value;

    const strParams = ParamRecordOperation.applyBack<StrParam.State, StrParam.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
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

    const pieces = DualKeyRecordOperation.applyBack<Piece.State, Piece.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        nextState: state.pieces, operation: operation.pieces, innerApplyBack: ({ state: nextState, operation }) => {
            return Piece.applyBack({ state: nextState, operation });
        }
    });
    if (pieces.isError) {
        return pieces;
    }
    result.pieces = pieces.value;

    const tachieLocations = DualKeyRecordOperation.applyBack<BoardLocation.State, BoardLocation.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        nextState: state.tachieLocations, operation: operation.tachieLocations, innerApplyBack: ({ state: nextState, operation }) => {
            return BoardLocation.applyBack({ state: nextState, operation });
        }
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }
    result.tachieLocations = tachieLocations.value;

    return ResultModule.ok(result);
};

export const composeUpOperation: Compose<UpOperation> = ({ first, second }) => {
    const boolParams = ParamRecordOperation.compose({
        first: first.boolParams,
        second: second.boolParams,
        innerCompose: params => SimpleValueParam.composeUpOperation<Maybe<boolean>>()(params)
    });
    if (boolParams.isError) {
        return boolParams;
    }

    const numParams = ParamRecordOperation.compose({
        first: first.numParams,
        second: second.numParams,
        innerCompose: params => SimpleValueParam.composeUpOperation<Maybe<number>>()(params)
    });
    if (numParams.isError) {
        return numParams;
    }

    const numMaxParams = ParamRecordOperation.compose({
        first: first.numMaxParams,
        second: second.numMaxParams,
        innerCompose: params => SimpleValueParam.composeUpOperation<Maybe<number>>()(params)
    });
    if (numMaxParams.isError) {
        return numMaxParams;
    }

    const strParams = ParamRecordOperation.compose({
        first: first.strParams,
        second: second.strParams,
        innerCompose: params => StrParam.composeUpOperation(params)
    });
    if (strParams.isError) {
        return strParams;
    }

    const pieces = DualKeyRecordOperation.composeUpOperation<Piece.State, Piece.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        first: first.pieces,
        second: second.pieces,
        innerApply: ({ state, operation }) => Piece.apply({ state, operation }),
        innerCompose: params => Piece.composeUpOperation(params)
    });
    if (pieces.isError) {
        return pieces;
    }

    const tachieLocations = DualKeyRecordOperation.composeUpOperation<BoardLocation.State, BoardLocation.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        first: first.tachieLocations,
        second: second.tachieLocations,
        innerApply: ({ state, operation }) => BoardLocation.apply({ state, operation }),
        innerCompose: params => BoardLocation.composeUpOperation(params)
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }

    const memo = TextOperation.composeUpOperation(first.memo, second.memo);
    if (memo.isError) {
        return memo;
    }

    const privateVarToml = TextOperation.composeUpOperation(first.privateVarToml, second.privateVarToml);
    if (privateVarToml.isError) {
        return privateVarToml;
    }

    const valueProps: UpOperation = {
        $version: 1,

        isPrivate: ReplaceOperation.composeUpOperation(first.isPrivate, second.isPrivate),
        memo: memo.value,
        name: ReplaceOperation.composeUpOperation(first.name, second.name),
        privateVarToml: privateVarToml.value,
        image: ReplaceOperation.composeUpOperation(first.image, second.image),
        tachieImage: ReplaceOperation.composeUpOperation(first.tachieImage, second.tachieImage),
        boolParams: boolParams.value,
        numParams: numParams.value,
        numMaxParams: numMaxParams.value,
        strParams: strParams.value,
        pieces: pieces.value,
        tachieLocations: tachieLocations.value,
    };
    return ResultModule.ok(valueProps);
};

export const composeDownOperation: Compose<DownOperation> = ({ first, second }) => {
    const boolParams = ParamRecordOperation.compose({
        first: first.boolParams,
        second: second.boolParams,
        innerCompose: params => SimpleValueParam.composeDownOperationLoose<Maybe<boolean>>()(params)
    });
    if (boolParams.isError) {
        return boolParams;
    }

    const numParams = ParamRecordOperation.compose({
        first: first.numParams,
        second: second.numParams,
        innerCompose: params => SimpleValueParam.composeDownOperationLoose<Maybe<number>>()(params)
    });
    if (numParams.isError) {
        return numParams;
    }

    const numMaxParams = ParamRecordOperation.compose({
        first: first.numMaxParams,
        second: second.numMaxParams,
        innerCompose: params => SimpleValueParam.composeDownOperationLoose<Maybe<number>>()(params)
    });
    if (numMaxParams.isError) {
        return numMaxParams;
    }

    const strParams = ParamRecordOperation.compose({
        first: first.strParams,
        second: second.strParams,
        innerCompose: params => StrParam.composeDownOperationLoose(params)
    });
    if (strParams.isError) {
        return strParams;
    }

    const pieces = DualKeyRecordOperation.composeDownOperation<Piece.State, Piece.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        first: first.pieces,
        second: second.pieces,
        innerApplyBack: ({ state, operation }) => Piece.applyBack({ state, operation }),
        innerCompose: params => Piece.composeDownOperation(params)
    });
    if (pieces.isError) {
        return pieces;
    }

    const tachieLocations = DualKeyRecordOperation.composeDownOperation<BoardLocation.State, BoardLocation.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        first: first.tachieLocations,
        second: second.tachieLocations,
        innerApplyBack: ({ state, operation }) => BoardLocation.applyBack({ state, operation }),
        innerCompose: params => BoardLocation.composeDownOperation(params)
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }

    const memo = TextOperation.composeDownOperation(first.memo, second.memo);
    if (memo.isError) {
        return memo;
    }
    const privateVarToml = TextOperation.composeDownOperation(first.privateVarToml, second.privateVarToml);
    if (privateVarToml.isError) {
        return privateVarToml;
    }

    const valueProps: DownOperation = {
        $version: 1,

        isPrivate: ReplaceOperation.composeDownOperation(first.isPrivate, second.isPrivate),
        memo: memo.value,
        name: ReplaceOperation.composeDownOperation(first.name, second.name),
        privateVarToml: privateVarToml.value,
        image: ReplaceOperation.composeDownOperation(first.image, second.image),
        tachieImage: ReplaceOperation.composeDownOperation(first.tachieImage, second.tachieImage),
        boolParams: boolParams.value,
        numParams: numParams.value,
        numMaxParams: numMaxParams.value,
        strParams: strParams.value,
        pieces: pieces.value,
        tachieLocations: tachieLocations.value,
    };
    return ResultModule.ok(valueProps);
};

export const restore: Restore<State, DownOperation, TwoWayOperation> = ({ nextState, downOperation }) => {
    if (downOperation === undefined) {
        return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
    }

    const boolParams = ParamRecordOperation.restore({
        nextState: nextState.boolParams,
        downOperation: downOperation.boolParams,
        innerRestore: params => SimpleValueParam.restore<Maybe<boolean>>()(params)
    });
    if (boolParams.isError) {
        return boolParams;
    }

    const numParams = ParamRecordOperation.restore({
        nextState: nextState.numParams,
        downOperation: downOperation.numParams,
        innerRestore: params => SimpleValueParam.restore<Maybe<number>>()(params)
    });
    if (numParams.isError) {
        return numParams;
    }

    const numMaxParams = ParamRecordOperation.restore({
        nextState: nextState.numMaxParams,
        downOperation: downOperation.numMaxParams,
        innerRestore: params => SimpleValueParam.restore<Maybe<number>>()(params)
    });
    if (numMaxParams.isError) {
        return numMaxParams;
    }

    const strParams = ParamRecordOperation.restore({
        nextState: nextState.strParams,
        downOperation: downOperation.strParams,
        innerRestore: params => StrParam.restore(params)
    });
    if (strParams.isError) {
        return strParams;
    }

    const pieces = DualKeyRecordOperation.restore<Piece.State, Piece.DownOperation, Piece.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        nextState: nextState.pieces,
        downOperation: downOperation.pieces,
        innerDiff: params => Piece.diff(params),
        innerRestore: params => Piece.restore(params),
    });
    if (pieces.isError) {
        return pieces;
    }

    const tachieLocations = DualKeyRecordOperation.restore<BoardLocation.State, BoardLocation.DownOperation, BoardLocation.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        nextState: nextState.tachieLocations,
        downOperation: downOperation.tachieLocations,
        innerDiff: params => BoardLocation.diff(params),
        innerRestore: params => BoardLocation.restore(params),
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
        tachieLocations: tachieLocations.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = {
        $version: 1,
        boolParams: boolParams.value.twoWayOperation,
        numParams: numParams.value.twoWayOperation,
        numMaxParams: numMaxParams.value.twoWayOperation,
        strParams: strParams.value.twoWayOperation,
        pieces: pieces.value.twoWayOperation,
        tachieLocations: tachieLocations.value.twoWayOperation,
    };

    if (downOperation.image !== undefined) {
        prevState.image = downOperation.image.oldValue ?? undefined;
        twoWayOperation.image = { oldValue: downOperation.image.oldValue ?? undefined, newValue: nextState.image };
    }
    if (downOperation.tachieImage !== undefined) {
        prevState.tachieImage = downOperation.tachieImage.oldValue ?? undefined;
        twoWayOperation.tachieImage = { oldValue: downOperation.tachieImage.oldValue ?? undefined, newValue: nextState.tachieImage };
    }
    if (downOperation.isPrivate !== undefined) {
        prevState.isPrivate = downOperation.isPrivate.oldValue;
        twoWayOperation.isPrivate = { ...downOperation.isPrivate, newValue: nextState.isPrivate };
    }
    if (downOperation.memo !== undefined) {
        const restored = TextOperation.restore({ nextState: nextState.memo, downOperation: downOperation.memo });
        if (restored.isError) {
            return restored;
        }
        prevState.memo = restored.value.prevState;
        twoWayOperation.memo = restored.value.twoWayOperation;
    }
    if (downOperation.name !== undefined) {
        prevState.name = downOperation.name.oldValue;
        twoWayOperation.name = { ...downOperation.name, newValue: nextState.name };
    }
    if (downOperation.privateVarToml !== undefined) {
        const restored = TextOperation.restore({ nextState: nextState.privateVarToml, downOperation: downOperation.privateVarToml });
        if (restored.isError) {
            return restored;
        }
        prevState.privateVarToml = restored.value.prevState;
        twoWayOperation.privateVarToml = restored.value.twoWayOperation;
    }

    return ResultModule.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const boolParams = ParamRecordOperation.diff({
        prevState: prevState.boolParams,
        nextState: nextState.boolParams,
        innerDiff: ({ prevState, nextState }) => SimpleValueParam.diff<Maybe<boolean>>()({
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
        innerDiff: ({ prevState, nextState }) => SimpleValueParam.diff<Maybe<number>>()({
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
        innerDiff: ({ prevState, nextState }) => SimpleValueParam.diff<Maybe<number>>()({
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
        innerDiff: ({ prevState, nextState }) => StrParam.diff({
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
    const tachieLocations = DualKeyRecordOperation.diff<BoardLocation.State, BoardLocation.TwoWayOperation>({
        prevState: prevState.tachieLocations,
        nextState: nextState.tachieLocations,
        innerDiff: params => BoardLocation.diff(params),
    });
    const result: TwoWayOperation = {
        $version: 1,
        boolParams,
        numParams,
        numMaxParams,
        strParams,
        pieces,
        tachieLocations,
    };
    if (prevState.image !== nextState.image) {
        result.image = { oldValue: prevState.image, newValue: nextState.image };
    }
    if (prevState.tachieImage !== nextState.tachieImage) {
        result.tachieImage = { oldValue: prevState.tachieImage, newValue: nextState.tachieImage };
    }
    if (prevState.isPrivate !== nextState.isPrivate) {
        result.isPrivate = { oldValue: prevState.isPrivate, newValue: nextState.isPrivate };
    }
    if (prevState.memo !== nextState.memo) {
        result.memo = TextOperation.diff({ prev: prevState.memo, next: nextState.memo });
    }
    if (prevState.name !== nextState.name) {
        result.name = { oldValue: prevState.name, newValue: nextState.name };
    }
    if (prevState.privateVarToml !== nextState.privateVarToml) {
        result.privateVarToml = TextOperation.diff({ prev: prevState.privateVarToml, next: nextState.privateVarToml });
    }
    if (isIdRecord(result)) {
        return undefined;
    }
    return result;
};

export const serverTransform = (createdByMe: boolean): ServerTransform<State, TwoWayOperation, UpOperation> => ({ prevState, currentState, clientOperation, serverOperation }) => {
    if (!createdByMe && currentState.isPrivate) {
        return ResultModule.ok(undefined);
    }

    const boolParams = ParamRecordOperation.serverTransform({
        prevState: prevState.boolParams,
        nextState: currentState.boolParams,
        first: serverOperation?.boolParams,
        second: clientOperation.boolParams,
        innerTransform: ({ prevState, nextState, first, second }) => SimpleValueParam.serverTransform<Maybe<boolean>>(createdByMe)({
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
        innerTransform: ({ prevState, nextState, first, second }) => SimpleValueParam.serverTransform<Maybe<number>>(createdByMe)({
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
        innerTransform: ({ prevState, nextState, first, second }) => SimpleValueParam.serverTransform<Maybe<number>>(createdByMe)({
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
        innerTransform: ({ prevState, nextState, first, second }) => StrParam.serverTransform(createdByMe)({
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

    const pieces = DualKeyRecordOperation.serverTransform<Piece.State, Piece.State, Piece.TwoWayOperation, Piece.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: prevState.pieces,
        nextState: currentState.pieces,
        first: serverOperation?.pieces,
        second: clientOperation.pieces,
        innerTransform: ({ prevState, nextState, first, second }) => Piece.serverTransform({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        protectedValuePolicy: {
            cancelRemove: params => !createdByMe && params.nextState.isPrivate,
            cancelUpdate: params => !createdByMe && params.nextState.isPrivate,
        },
    });
    if (pieces.isError) {
        return pieces;
    }

    const tachieLocations = DualKeyRecordOperation.serverTransform<BoardLocation.State, BoardLocation.State, BoardLocation.TwoWayOperation, BoardLocation.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: prevState.tachieLocations,
        nextState: currentState.tachieLocations,
        first: serverOperation?.tachieLocations,
        second: clientOperation.tachieLocations,
        innerTransform: ({ prevState, nextState, first, second }) => BoardLocation.serverTransform({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        protectedValuePolicy: {
        },
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }

    const twoWayOperation: TwoWayOperation = {
        $version: 1,
        boolParams: boolParams.value,
        numParams: numParams.value,
        numMaxParams: numMaxParams.value,
        strParams: strParams.value,
        pieces: pieces.value,
        tachieLocations: tachieLocations.value,
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
    const transformedMemo = TextOperation.serverTransform({ first: serverOperation?.memo, second: clientOperation.memo, prevState: prevState.memo });
    if (transformedMemo.isError) {
        return transformedMemo;
    }
    twoWayOperation.memo = transformedMemo.value.secondPrime;
    twoWayOperation.name = ReplaceOperation.serverTransform({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: prevState.name,
    });
    if (createdByMe) {
        const transformed = TextOperation.serverTransform({ first: serverOperation?.privateVarToml, second: clientOperation.privateVarToml, prevState: prevState.privateVarToml });
        if (transformed.isError) {
            return transformed;
        }
        twoWayOperation.privateVarToml = transformed.value.secondPrime;
    }

    if (isIdRecord(twoWayOperation)) {
        return ResultModule.ok(undefined);
    }

    return ResultModule.ok({
        ...twoWayOperation,
        boolParams: boolParams.value,
        numParams: numParams.value,
        numMaxParams: numMaxParams.value,
        strParams: strParams.value,
        pieces: pieces.value,
        tachieLocations: tachieLocations.value,
    });
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

    const pieces = DualKeyRecordOperation.clientTransform<Piece.State, Piece.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        first: first.pieces,
        second: second.pieces,
        innerTransform: params => Piece.clientTransform(params),
        innerDiff: params => Piece.diff(params),
    });
    if (pieces.isError) {
        return pieces;
    }

    const tachieLocations = DualKeyRecordOperation.clientTransform<BoardLocation.State, BoardLocation.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        first: first.tachieLocations,
        second: second.tachieLocations,
        innerTransform: params => BoardLocation.clientTransform(params),
        innerDiff: params => BoardLocation.diff(params),
    });
    if (tachieLocations.isError) {
        return tachieLocations;
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
        numParams: numParams.value.firstPrime,
        numMaxParams: numMaxParams.value.firstPrime,
        strParams: strParams.value.firstPrime,
        pieces: pieces.value.firstPrime,
        tachieLocations: tachieLocations.value.firstPrime,
        image: image.firstPrime,
        tachieImage: tachieImage.firstPrime,
        isPrivate: isPrivate.firstPrime,
        name: name.firstPrime,
        privateVarToml: privateVarToml.value.firstPrime,
    };
    const secondPrime: UpOperation = {
        $version: 1,
        boolParams: boolParams.value.secondPrime,
        numParams: numParams.value.secondPrime,
        numMaxParams: numMaxParams.value.secondPrime,
        strParams: strParams.value.secondPrime,
        pieces: pieces.value.secondPrime,
        tachieLocations: tachieLocations.value.secondPrime,
        image: image.secondPrime,
        tachieImage: tachieImage.secondPrime,
        isPrivate: isPrivate.secondPrime,
        name: name.secondPrime,
        privateVarToml: privateVarToml.value.secondPrime,
    };

    return ResultModule.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};