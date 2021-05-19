import * as t from 'io-ts';
import { Maybe, maybe } from '../../../../io-ts';
import { mapRecordOperationElement, recordDownOperationElementFactory, RecordTwoWayOperationElement, recordUpOperationElementFactory } from '../../util/recordOperationElement';
import { FilePath, filePath } from '../../../filePath/v1';
import * as TextOperation from '../../util/textOperation';
import * as Piece from '../../../piece/v1';
import * as BoardLocation from '../../util/boardLocation';
import { TransformerFactory } from '../../util/transformerFactory';
import * as ReplaceValueOperation from '../../util/replaceOperation';
import * as DualKeyRecordOperation from '../../util/dualKeyRecordOperation';
import * as RecordOperation from '../../util/recordOperation';
import * as ParamRecordOperation from '../../util/paramRecordOperation';
import { ResultModule } from '../../../../Result';
import { chooseDualKeyRecord, chooseRecord, undefinedForAll } from '../../../../utils';
import { ApplyError, ComposeAndTransformError, PositiveInt } from '../../../../textOperation';
import { RecordTwoWayOperation } from '../../util/recordOperation';
import { DualKeyRecordTransformer, DualKeyRecordTwoWayOperation } from '../../util/dualKeyRecordOperation';
import { Apply, ToClientOperationParams } from '../../util/type';
import * as BoolParam from './boolParam/v1';
import * as NumParam from './numParam/v1';
import * as StrParam from './strParam/v1';
import { createParamTransformerFactory, ParamRecordTransformer } from '../../util/paramRecordOperation';
import { operation } from '../../util/operation';

export const state = t.type({
    version: t.literal(1),

    image: maybe(filePath),
    isPrivate: t.boolean,
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

export const upOperation = operation(1,{
    image: t.type({ newValue: maybe(filePath) }),
    isPrivate: t.type({ newValue: t.boolean }),
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
    version: 1;

    image?: ReplaceValueOperation.ReplaceValueTwoWayOperation<Maybe<FilePath>>;
    isPrivate?: ReplaceValueOperation.ReplaceValueTwoWayOperation<boolean>;
    name?: ReplaceValueOperation.ReplaceValueTwoWayOperation<string>;
    privateCommands?: RecordTwoWayOperation<string, TextOperation.TwoWayOperation>;
    privateVarToml?: TextOperation.TwoWayOperation;
    tachieImage?: ReplaceValueOperation.ReplaceValueTwoWayOperation<Maybe<FilePath>>;

    boolParams?: Record<string, BoolParam.TwoWayOperation>;
    numParams?: Record<string, NumParam.TwoWayOperation>;
    numMaxParams?: Record<string, NumParam.TwoWayOperation>;
    strParams?: Record<string, StrParam.TwoWayOperation>;
    pieces?: DualKeyRecordTwoWayOperation<Piece.State, Piece.TwoWayOperation>;
    tachieLocations?: DualKeyRecordTwoWayOperation<BoardLocation.State, BoardLocation.TwoWayOperation>;
}

export const toClientState = (createdByMe: boolean) => (source: State): State => {
    return {
        ...source,
        privateCommands: createdByMe ? source.privateCommands : {},
        privateVarToml: createdByMe ? source.privateVarToml : '',
        boolParams: RecordOperation.toClientState({
            serverState: source.boolParams,
            isPrivate: () => false,
            toClientState: ({ state }) => BoolParam.toClientState(createdByMe)(state),
        }),
        numParams: RecordOperation.toClientState({
            serverState: source.numParams,
            isPrivate: () => false,
            toClientState: ({ state }) => NumParam.toClientState(createdByMe)(state),
        }),
        numMaxParams: RecordOperation.toClientState({
            serverState: source.numMaxParams,
            isPrivate: () => false,
            toClientState: ({ state }) => NumParam.toClientState(createdByMe)(state),
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

export const toServerOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        privateCommands: source.privateCommands == null ? undefined : chooseRecord(source.privateCommands, operation => mapRecordOperationElement({ source: operation, mapReplace: x => x, mapOperation: x => TextOperation.toDownOperation(x) })),
        privateVarToml: source.privateVarToml == null ? undefined : TextOperation.toDownOperation(source.privateVarToml),
        boolParams: source.boolParams == null ? undefined : chooseRecord(source.boolParams, BoolParam.toServerOperation),
        numParams: source.numParams == null ? undefined : chooseRecord(source.numParams, NumParam.toServerOperation),
        numMaxParams: source.numMaxParams == null ? undefined : chooseRecord(source.numMaxParams, NumParam.toServerOperation),
        strParams: source.strParams == null ? undefined : chooseRecord(source.strParams, StrParam.toServerOperation),
        pieces: source.pieces == null ? undefined : chooseDualKeyRecord(source.pieces, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Piece.toServerOperation,
        })),
        tachieLocations: source.tachieLocations == null ? undefined : chooseDualKeyRecord(source.tachieLocations, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: BoardLocation.toServerOperation,
        })),
    };
};

export const toClientOperation = (createdByMe: boolean) => ({ prevState, nextState, diff }: ToClientOperationParams<State, TwoWayOperation>): UpOperation => {
    return {
        ...diff,
        privateCommands: diff.privateCommands == null ? undefined : chooseRecord(diff.privateCommands, operation => mapRecordOperationElement({ source: operation, mapReplace: x => x, mapOperation: x => TextOperation.toUpOperation(x) })),
        privateVarToml: diff.privateVarToml == null ? undefined : TextOperation.toUpOperation(diff.privateVarToml),
        boolParams: diff.boolParams == null ? undefined : ParamRecordOperation.toClientOperation({
            diff: diff.boolParams,
            prevState: prevState.boolParams,
            nextState: nextState.boolParams,
            toClientOperation: (params) => BoolParam.toClientOperation(createdByMe)(params),
        }),
        numParams: diff.numParams == null ? undefined : ParamRecordOperation.toClientOperation({
            diff: diff.numParams,
            prevState: prevState.numParams,
            nextState: nextState.numParams,
            toClientOperation: (params) => NumParam.toClientOperation(createdByMe)(params),
        }),
        numMaxParams: diff.numMaxParams == null ? undefined : ParamRecordOperation.toClientOperation({
            diff: diff.numMaxParams,
            prevState: prevState.numMaxParams,
            nextState: nextState.numMaxParams,
            toClientOperation: (params) => NumParam.toClientOperation(createdByMe)(params),
        }),
        strParams: diff.strParams == null ? undefined : ParamRecordOperation.toClientOperation({
            diff: diff.strParams,
            prevState: prevState.strParams,
            nextState: nextState.strParams,
            toClientOperation: (params) => StrParam.toClientOperation(createdByMe)(params),
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

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.image != null) {
        result.image = operation.image.newValue;
    }
    if (operation.isPrivate != null) {
        result.isPrivate = operation.isPrivate.newValue;
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
        prevState: state.boolParams, operation: operation.boolParams, innerApply: ({ prevState, upOperation }) => {
            return BoolParam.apply({ state: prevState, operation: upOperation });
        }
    });
    if (boolParams.isError) {
        return boolParams;
    }
    result.boolParams = boolParams.value;

    const numParams = ParamRecordOperation.apply<NumParam.State, NumParam.UpOperation | NumParam.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.numParams, operation: operation.numParams, innerApply: ({ prevState, upOperation }) => {
            return NumParam.apply({ state: prevState, operation: upOperation });
        }
    });
    if (numParams.isError) {
        return numParams;
    }
    result.numParams = numParams.value;

    const numMaxParams = ParamRecordOperation.apply<NumParam.State, NumParam.UpOperation | NumParam.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.numMaxParams, operation: operation.numMaxParams, innerApply: ({ prevState, upOperation }) => {
            return NumParam.apply({ state: prevState, operation: upOperation });
        }
    });
    if (numMaxParams.isError) {
        return numMaxParams;
    }
    result.numMaxParams = numMaxParams.value;

    const strParams = ParamRecordOperation.apply<StrParam.State, StrParam.UpOperation | StrParam.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.strParams, operation: operation.strParams, innerApply: ({ prevState, upOperation }) => {
            return StrParam.apply({ state: prevState, operation: upOperation });
        }
    });
    if (strParams.isError) {
        return strParams;
    }
    result.strParams = strParams.value;

    const pieces = DualKeyRecordOperation.apply<Piece.State,Piece.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.pieces, operation: operation.pieces, innerApply: ({ prevState, operation: upOperation }) => {
            return Piece.apply({ state: prevState, operation: upOperation });
        }
    });
    if (pieces.isError) {
        return pieces;
    }
    result.pieces = pieces.value;
    
    const tachieLocations = DualKeyRecordOperation.apply<BoardLocation.State,BoardLocation.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.tachieLocations, operation: operation.tachieLocations, innerApply: ({ prevState, operation: upOperation }) => {
            return BoardLocation.apply({ state: prevState, operation: upOperation });
        }
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }
    result.tachieLocations = tachieLocations.value;

    return ResultModule.ok(result);
};

export const transformerFactory = (createdByMe: boolean): TransformerFactory<string, State, State, DownOperation, UpOperation, TwoWayOperation, ApplyError<PositiveInt> | ComposeAndTransformError> => ({
    composeLoose: ({ key, first, second }) => {
        const boolParamTransformer = createParamTransformerFactory<Maybe<boolean>>(createdByMe);
        const boolParamsTransformer = new ParamRecordTransformer(boolParamTransformer);
        const boolParams = boolParamsTransformer.composeLoose({
            first: first.boolParams,
            second: second.boolParams,
        });
        if (boolParams.isError) {
            return boolParams;
        }

        const numParamTransformer = createParamTransformerFactory<Maybe<number>>(createdByMe);
        const numParamsTransformer = new ParamRecordTransformer(numParamTransformer);
        const numParams = numParamsTransformer.composeLoose({
            first: first.numParams,
            second: second.numParams,
        });
        if (numParams.isError) {
            return numParams;
        }

        const numMaxParams = numParamsTransformer.composeLoose({
            first: first.numMaxParams,
            second: second.numMaxParams,
        });
        if (numMaxParams.isError) {
            return numMaxParams;
        }

        const strParamTransformer = StrParam.createTransformerFactory(createdByMe);
        const strParamsTransformer = new ParamRecordTransformer(strParamTransformer);
        const strParams = strParamsTransformer.composeLoose({
            first: first.strParams,
            second: second.strParams,
        });
        if (strParams.isError) {
            return strParams;
        }

        const pieceTransformer = Piece.transformerFactory(createdByMe);
        const piecesTransformer = new DualKeyRecordTransformer(pieceTransformer);
        const pieces = piecesTransformer.composeLoose({
            first: first.pieces,
            second: second.pieces,
        });
        if (pieces.isError) {
            return pieces;
        }

        const tachieLocationTransformer = BoardLocation.transformerFactory(createdByMe);
        const tachieLocationsTransformer = new DualKeyRecordTransformer(tachieLocationTransformer);
        const tachieLocations = tachieLocationsTransformer.composeLoose({
            first: first.tachieLocations,
            second: second.tachieLocations,
        });
        if (tachieLocations.isError) {
            return tachieLocations;
        }

        const privateVarToml = TextOperation.composeDownOperation(first.privateVarToml, second.privateVarToml);
        if (privateVarToml.isError) {
            return privateVarToml;
        }

        const valueProps: DownOperation = {
            version: 1,

            isPrivate: ReplaceValueOperation.composeDownOperation(first.isPrivate, second.isPrivate),
            name: ReplaceValueOperation.composeDownOperation(first.name, second.name),
            privateVarToml: privateVarToml.value,
            image: ReplaceValueOperation.composeDownOperation(first.image, second.image),
            tachieImage: ReplaceValueOperation.composeDownOperation(first.tachieImage, second.tachieImage),
            boolParams: boolParams.value,
            numParams: numParams.value,
            numMaxParams: numMaxParams.value,
            strParams: strParams.value,
            pieces: pieces.value,
            tachieLocations: tachieLocations.value,
        };
        return ResultModule.ok(valueProps);
    },
    restore: ({ key, nextState, downOperation }) => {
        if (downOperation === undefined) {
            return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
        }

        const boolParamTransformer = createParamTransformerFactory<Maybe<boolean>>(createdByMe);
        const boolParamsTransformer = new ParamRecordTransformer(boolParamTransformer);
        const boolParams = boolParamsTransformer.restore({
            nextState: nextState.boolParams,
            downOperation: downOperation.boolParams,
        });
        if (boolParams.isError) {
            return boolParams;
        }

        const numParamTransformer = createParamTransformerFactory<Maybe<number>>(createdByMe);
        const numParamsTransformer = new ParamRecordTransformer(numParamTransformer);
        const numParams = numParamsTransformer.restore({
            nextState: nextState.numParams,
            downOperation: downOperation.numParams,
        });
        if (numParams.isError) {
            return numParams;
        }

        const numMaxParams = numParamsTransformer.restore({
            nextState: nextState.numMaxParams,
            downOperation: downOperation.numMaxParams,
        });
        if (numMaxParams.isError) {
            return numMaxParams;
        }

        const strParamTransformer = StrParam.createTransformerFactory(createdByMe);
        const strParamsTransformer = new ParamRecordTransformer(strParamTransformer);
        const strParams = strParamsTransformer.restore({
            nextState: nextState.strParams,
            downOperation: downOperation.strParams,
        });
        if (strParams.isError) {
            return strParams;
        }

        const pieceTransformer = Piece.transformerFactory(createdByMe);
        const piecesTransformer = new DualKeyRecordTransformer(pieceTransformer);
        const pieces = piecesTransformer.restore({
            nextState: nextState.pieces,
            downOperation: downOperation.pieces,
        });
        if (pieces.isError) {
            return pieces;
        }

        const tachieLocationTransformer = BoardLocation.transformerFactory(createdByMe);
        const tachieLocationsTransformer = new DualKeyRecordTransformer(tachieLocationTransformer);
        const tachieLocations = tachieLocationsTransformer.restore({
            nextState: nextState.tachieLocations,
            downOperation: downOperation.tachieLocations,
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
            version: 1,
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
    },
    transform: ({ key, prevState, currentState, clientOperation, serverOperation }) => {
        if (!createdByMe && currentState.isPrivate) {
            return ResultModule.ok(undefined);
        }

        const boolParamTransformer = createParamTransformerFactory<Maybe<boolean>>(createdByMe);
        const boolParamsTransformer = new ParamRecordTransformer(boolParamTransformer);
        const boolParams = boolParamsTransformer.transform({
            prevState: prevState.boolParams,
            currentState: currentState.boolParams,
            clientOperation: clientOperation.boolParams,
            serverOperation: serverOperation?.boolParams,
        });
        if (boolParams.isError) {
            return boolParams;
        }

        const numParamTransformer = createParamTransformerFactory<Maybe<number>>(createdByMe);
        const numParamsTransformer = new ParamRecordTransformer(numParamTransformer);
        const numParams = numParamsTransformer.transform({
            prevState: prevState.numParams,
            currentState: currentState.numParams,
            clientOperation: clientOperation.numParams,
            serverOperation: serverOperation?.numParams,
        });
        if (numParams.isError) {
            return numParams;
        }

        const numMaxParams = numParamsTransformer.transform({
            prevState: prevState.numMaxParams,
            currentState: currentState.numMaxParams,
            clientOperation: clientOperation.numMaxParams,
            serverOperation: serverOperation?.numMaxParams,
        });
        if (numMaxParams.isError) {
            return numMaxParams;
        }

        const strParamTransformer = StrParam.createTransformerFactory(createdByMe);
        const strParamsTransformer = new ParamRecordTransformer(strParamTransformer);
        const strParams = strParamsTransformer.transform({
            prevState: prevState.strParams,
            currentState: currentState.strParams,
            clientOperation: clientOperation.strParams,
            serverOperation: serverOperation?.strParams,
        });
        if (strParams.isError) {
            return strParams;
        }

        const pieceTransformer = Piece.transformerFactory(createdByMe);
        const piecesTransformer = new DualKeyRecordTransformer(pieceTransformer);
        const pieces = piecesTransformer.transform({
            prevState: prevState.pieces,
            currentState: currentState.pieces,
            clientOperation: clientOperation.pieces,
            serverOperation: serverOperation?.pieces,
        });
        if (pieces.isError) {
            return pieces;
        }

        const tachieLocationTransformer = BoardLocation.transformerFactory(createdByMe);
        const tachieLocationsTransformer = new DualKeyRecordTransformer(tachieLocationTransformer);
        const tachieLocations = tachieLocationsTransformer.transform({
            prevState: prevState.tachieLocations,
            currentState: currentState.tachieLocations,
            clientOperation: clientOperation.tachieLocations,
            serverOperation: serverOperation?.tachieLocations,
        });
        if (tachieLocations.isError) {
            return tachieLocations;
        }

        const twoWayOperation: TwoWayOperation = {
            version: 1,
            boolParams: boolParams.value,
            numParams: numParams.value,
            numMaxParams: numMaxParams.value,
            strParams: strParams.value,
            pieces: pieces.value,
            tachieLocations: tachieLocations.value,
        };

        twoWayOperation.image = ReplaceValueOperation.transform({
            first: serverOperation?.image,
            second: clientOperation.image,
            prevState: prevState.image,
        });
        twoWayOperation.tachieImage = ReplaceValueOperation.transform({
            first: serverOperation?.tachieImage,
            second: clientOperation.tachieImage,
            prevState: prevState.tachieImage,
        });
        twoWayOperation.isPrivate = ReplaceValueOperation.transform({
            first: serverOperation?.isPrivate,
            second: clientOperation.isPrivate,
            prevState: prevState.isPrivate,
        });
        twoWayOperation.name = ReplaceValueOperation.transform({
            first: serverOperation?.name,
            second: clientOperation.name,
            prevState: prevState.name,
        });
        if (createdByMe) {
            const transformed = TextOperation.transform({ first: serverOperation?.privateVarToml, second: clientOperation.privateVarToml, prevState: prevState.privateVarToml });
            if (transformed.isError) {
                return transformed;
            }
            twoWayOperation.privateVarToml = transformed.value.secondPrime;
        }

        if (undefinedForAll(twoWayOperation)) {
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
    },
    diff: ({ key, prevState, nextState }): TwoWayOperation | undefined => {
        const boolParamTransformer = createParamTransformerFactory<Maybe<boolean>>(createdByMe);
        const boolParamsTransformer = new ParamRecordTransformer(boolParamTransformer);
        const boolParams = boolParamsTransformer.diff({
            prevState: prevState.boolParams,
            nextState: nextState.boolParams,
        });
        const numParamTransformer = createParamTransformerFactory<Maybe<number>>(createdByMe);
        const numParamsTransformer = new ParamRecordTransformer(numParamTransformer);
        const numParams = numParamsTransformer.diff({
            prevState: prevState.numParams,
            nextState: nextState.numParams,
        });
        const numMaxParams = numParamsTransformer.diff({
            prevState: prevState.numMaxParams,
            nextState: nextState.numMaxParams,
        });
        const strParamTransformer = StrParam.createTransformerFactory(createdByMe);
        const strParamsTransformer = new ParamRecordTransformer(strParamTransformer);
        const strParams = strParamsTransformer.diff({
            prevState: prevState.strParams,
            nextState: nextState.strParams,
        });
        const pieceTransformer = Piece.transformerFactory(createdByMe);
        const piecesTransformer = new DualKeyRecordTransformer(pieceTransformer);
        const pieces = piecesTransformer.diff({
            prevState: prevState.pieces,
            nextState: nextState.pieces,
        });
        const tachieLocationTransformer = BoardLocation.transformerFactory(createdByMe);
        const tachieLocationsTransformer = new DualKeyRecordTransformer(tachieLocationTransformer);
        const tachieLocations = tachieLocationsTransformer.diff({
            prevState: prevState.tachieLocations,
            nextState: nextState.tachieLocations,
        });
        const resultType: TwoWayOperation = {version:1};
        if (prevState.image !== nextState.image) {
            resultType.image = { oldValue: prevState.image, newValue: nextState.image };
        }
        if (prevState.tachieImage !== nextState.tachieImage) {
            resultType.tachieImage = { oldValue: prevState.tachieImage, newValue: nextState.tachieImage };
        }
        if (prevState.isPrivate !== nextState.isPrivate) {
            resultType.isPrivate = { oldValue: prevState.isPrivate, newValue: nextState.isPrivate };
        }
        if (prevState.name !== nextState.name) {
            resultType.name = { oldValue: prevState.name, newValue: nextState.name };
        }
        if (prevState.privateVarToml !== nextState.privateVarToml) {
            resultType.privateVarToml = TextOperation.diff({ prev: prevState.privateVarToml, next: nextState.privateVarToml });
        }
        if (undefinedForAll(resultType)) {
            return undefined;
        }
        return { ...resultType, boolParams, numParams, numMaxParams, strParams, pieces, tachieLocations };
    },
    applyBack: ({ key, downOperation, nextState }) => {
        const boolParamTransformer = createParamTransformerFactory<Maybe<boolean>>(createdByMe);
        const boolParamsTransformer = new ParamRecordTransformer(boolParamTransformer);
        const boolParams = boolParamsTransformer.applyBack({
            downOperation: downOperation.boolParams,
            nextState: nextState.boolParams,
        });
        if (boolParams.isError) {
            return boolParams;
        }

        const numParamTransformer = createParamTransformerFactory<Maybe<number>>(createdByMe);
        const numParamsTransformer = new ParamRecordTransformer(numParamTransformer);
        const numParams = numParamsTransformer.applyBack({
            downOperation: downOperation.numParams,
            nextState: nextState.numParams,
        });
        if (numParams.isError) {
            return numParams;
        }

        const numMaxParams = numParamsTransformer.applyBack({
            downOperation: downOperation.numMaxParams,
            nextState: nextState.numMaxParams,
        });
        if (numMaxParams.isError) {
            return numMaxParams;
        }

        const strParamTransformer = StrParam.createTransformerFactory(createdByMe);
        const strParamsTransformer = new ParamRecordTransformer(strParamTransformer);
        const strParams = strParamsTransformer.applyBack({
            downOperation: downOperation.strParams,
            nextState: nextState.strParams,
        });
        if (strParams.isError) {
            return strParams;
        }

        const pieceTransformer = Piece.transformerFactory(createdByMe);
        const piecesTransformer = new DualKeyRecordTransformer(pieceTransformer);
        const pieces = piecesTransformer.applyBack({
            downOperation: downOperation.pieces,
            nextState: nextState.pieces,
        });
        if (pieces.isError) {
            return pieces;
        }

        const tachieLocationTransformer = BoardLocation.transformerFactory(createdByMe);
        const tachieLocationsTransformer = new DualKeyRecordTransformer(tachieLocationTransformer);
        const tachieLocations = tachieLocationsTransformer.applyBack({
            downOperation: downOperation.tachieLocations,
            nextState: nextState.tachieLocations,
        });
        if (tachieLocations.isError) {
            return tachieLocations;
        }

        const result: State = {
            ...nextState,
            boolParams: boolParams.value,
            numParams: numParams.value,
            numMaxParams: numMaxParams.value,
            strParams: strParams.value,
            pieces: pieces.value,
            tachieLocations: tachieLocations.value,
        };

        if (downOperation.image !== undefined) {
            result.image = downOperation.image.oldValue ?? undefined;
        }
        if (downOperation.tachieImage !== undefined) {
            result.tachieImage = downOperation.tachieImage.oldValue ?? undefined;
        }
        if (downOperation.isPrivate !== undefined) {
            result.isPrivate = downOperation.isPrivate.oldValue;
        }
        if (downOperation.name !== undefined) {
            result.name = downOperation.name.oldValue;
        }
        if (downOperation.privateVarToml !== undefined) {
            const prevValue = TextOperation.applyBack(nextState.privateVarToml, downOperation.privateVarToml);
            if (prevValue.isError) {
                return prevValue;
            }
            result.privateVarToml = prevValue.value;
        }

        return ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    protectedValuePolicy: {
        cancelRemove: ({ nextState }) => !createdByMe && nextState.isPrivate,
    }
});