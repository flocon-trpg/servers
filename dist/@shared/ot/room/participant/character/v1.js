"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformerFactory = exports.apply = exports.toClientOperation = exports.toServerOperation = exports.toClientState = exports.upOperation = exports.downOperation = exports.state = void 0;
const t = __importStar(require("io-ts"));
const io_ts_1 = require("../../../../io-ts");
const recordOperationElement_1 = require("../../util/recordOperationElement");
const v1_1 = require("../../../filePath/v1");
const TextOperation = __importStar(require("../../util/textOperation"));
const Piece = __importStar(require("../../../piece/v1"));
const BoardLocation = __importStar(require("../../util/boardLocation"));
const ReplaceValueOperation = __importStar(require("../../util/replaceOperation"));
const DualKeyRecordOperation = __importStar(require("../../util/dualKeyRecordOperation"));
const RecordOperation = __importStar(require("../../util/recordOperation"));
const ParamRecordOperation = __importStar(require("../../util/paramRecordOperation"));
const Result_1 = require("../../../../Result");
const utils_1 = require("../../../../utils");
const dualKeyRecordOperation_1 = require("../../util/dualKeyRecordOperation");
const BoolParam = __importStar(require("./boolParam/v1"));
const NumParam = __importStar(require("./numParam/v1"));
const StrParam = __importStar(require("./strParam/v1"));
const paramRecordOperation_1 = require("../../util/paramRecordOperation");
const operation_1 = require("../../util/operation");
exports.state = t.type({
    version: t.literal(1),
    image: io_ts_1.maybe(v1_1.filePath),
    isPrivate: t.boolean,
    name: t.string,
    privateCommands: t.record(t.string, t.string),
    privateVarToml: t.string,
    tachieImage: io_ts_1.maybe(v1_1.filePath),
    boolParams: t.record(t.string, BoolParam.state),
    numParams: t.record(t.string, NumParam.state),
    numMaxParams: t.record(t.string, NumParam.state),
    strParams: t.record(t.string, StrParam.state),
    pieces: t.record(t.string, t.record(t.string, Piece.state)),
    tachieLocations: t.record(t.string, t.record(t.string, BoardLocation.state)),
});
exports.downOperation = operation_1.operation(1, {
    image: t.type({ oldValue: io_ts_1.maybe(v1_1.filePath) }),
    isPrivate: t.type({ oldValue: t.boolean }),
    name: t.type({ oldValue: t.string }),
    privateCommands: t.record(t.string, recordOperationElement_1.recordDownOperationElementFactory(t.string, TextOperation.downOperation)),
    privateVarToml: TextOperation.downOperation,
    tachieImage: t.type({ oldValue: io_ts_1.maybe(v1_1.filePath) }),
    boolParams: t.record(t.string, BoolParam.downOperation),
    numParams: t.record(t.string, NumParam.downOperation),
    numMaxParams: t.record(t.string, NumParam.downOperation),
    strParams: t.record(t.string, StrParam.downOperation),
    pieces: t.record(t.string, t.record(t.string, recordOperationElement_1.recordDownOperationElementFactory(Piece.state, Piece.downOperation))),
    tachieLocations: t.record(t.string, t.record(t.string, recordOperationElement_1.recordDownOperationElementFactory(BoardLocation.state, BoardLocation.downOperation))),
});
exports.upOperation = operation_1.operation(1, {
    image: t.type({ newValue: io_ts_1.maybe(v1_1.filePath) }),
    isPrivate: t.type({ newValue: t.boolean }),
    name: t.type({ newValue: t.string }),
    privateCommands: t.record(t.string, recordOperationElement_1.recordUpOperationElementFactory(t.string, TextOperation.upOperation)),
    privateVarToml: TextOperation.upOperation,
    tachieImage: t.type({ newValue: io_ts_1.maybe(v1_1.filePath) }),
    boolParams: t.record(t.string, BoolParam.upOperation),
    numParams: t.record(t.string, NumParam.upOperation),
    numMaxParams: t.record(t.string, NumParam.upOperation),
    strParams: t.record(t.string, StrParam.upOperation),
    pieces: t.record(t.string, t.record(t.string, recordOperationElement_1.recordUpOperationElementFactory(Piece.state, Piece.upOperation))),
    tachieLocations: t.record(t.string, t.record(t.string, recordOperationElement_1.recordUpOperationElementFactory(BoardLocation.state, BoardLocation.upOperation))),
});
const toClientState = (createdByMe) => (source) => {
    return Object.assign(Object.assign({}, source), { privateCommands: createdByMe ? source.privateCommands : {}, privateVarToml: createdByMe ? source.privateVarToml : '', boolParams: RecordOperation.toClientState({
            serverState: source.boolParams,
            isPrivate: () => false,
            toClientState: ({ state }) => BoolParam.toClientState(createdByMe)(state),
        }), numParams: RecordOperation.toClientState({
            serverState: source.numParams,
            isPrivate: () => false,
            toClientState: ({ state }) => NumParam.toClientState(createdByMe)(state),
        }), numMaxParams: RecordOperation.toClientState({
            serverState: source.numMaxParams,
            isPrivate: () => false,
            toClientState: ({ state }) => NumParam.toClientState(createdByMe)(state),
        }), strParams: RecordOperation.toClientState({
            serverState: source.strParams,
            isPrivate: () => false,
            toClientState: ({ state }) => StrParam.toClientState(createdByMe)(state),
        }), pieces: DualKeyRecordOperation.toClientState({
            serverState: source.pieces,
            isPrivate: () => false,
            toClientState: ({ state }) => Piece.toClientState(state),
        }), tachieLocations: DualKeyRecordOperation.toClientState({
            serverState: source.tachieLocations,
            isPrivate: () => false,
            toClientState: ({ state }) => BoardLocation.toClientState(state),
        }) });
};
exports.toClientState = toClientState;
const toServerOperation = (source) => {
    return Object.assign(Object.assign({}, source), { privateCommands: source.privateCommands == null ? undefined : utils_1.chooseRecord(source.privateCommands, operation => recordOperationElement_1.mapRecordOperationElement({ source: operation, mapReplace: x => x, mapOperation: x => TextOperation.toDownOperation(x) })), privateVarToml: source.privateVarToml == null ? undefined : TextOperation.toDownOperation(source.privateVarToml), boolParams: source.boolParams == null ? undefined : utils_1.chooseRecord(source.boolParams, BoolParam.toServerOperation), numParams: source.numParams == null ? undefined : utils_1.chooseRecord(source.numParams, NumParam.toServerOperation), numMaxParams: source.numMaxParams == null ? undefined : utils_1.chooseRecord(source.numMaxParams, NumParam.toServerOperation), strParams: source.strParams == null ? undefined : utils_1.chooseRecord(source.strParams, StrParam.toServerOperation), pieces: source.pieces == null ? undefined : utils_1.chooseDualKeyRecord(source.pieces, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Piece.toServerOperation,
        })), tachieLocations: source.tachieLocations == null ? undefined : utils_1.chooseDualKeyRecord(source.tachieLocations, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: BoardLocation.toServerOperation,
        })) });
};
exports.toServerOperation = toServerOperation;
const toClientOperation = (createdByMe) => ({ prevState, nextState, diff }) => {
    return Object.assign(Object.assign({}, diff), { privateCommands: diff.privateCommands == null ? undefined : utils_1.chooseRecord(diff.privateCommands, operation => recordOperationElement_1.mapRecordOperationElement({ source: operation, mapReplace: x => x, mapOperation: x => TextOperation.toUpOperation(x) })), privateVarToml: diff.privateVarToml == null ? undefined : TextOperation.toUpOperation(diff.privateVarToml), boolParams: diff.boolParams == null ? undefined : ParamRecordOperation.toClientOperation({
            diff: diff.boolParams,
            prevState: prevState.boolParams,
            nextState: nextState.boolParams,
            toClientOperation: (params) => BoolParam.toClientOperation(createdByMe)(params),
        }), numParams: diff.numParams == null ? undefined : ParamRecordOperation.toClientOperation({
            diff: diff.numParams,
            prevState: prevState.numParams,
            nextState: nextState.numParams,
            toClientOperation: (params) => NumParam.toClientOperation(createdByMe)(params),
        }), numMaxParams: diff.numMaxParams == null ? undefined : ParamRecordOperation.toClientOperation({
            diff: diff.numMaxParams,
            prevState: prevState.numMaxParams,
            nextState: nextState.numMaxParams,
            toClientOperation: (params) => NumParam.toClientOperation(createdByMe)(params),
        }), strParams: diff.strParams == null ? undefined : ParamRecordOperation.toClientOperation({
            diff: diff.strParams,
            prevState: prevState.strParams,
            nextState: nextState.strParams,
            toClientOperation: (params) => StrParam.toClientOperation(createdByMe)(params),
        }), pieces: diff.pieces == null ? undefined : DualKeyRecordOperation.toClientOperation({
            diff: diff.pieces,
            prevState: prevState.pieces,
            nextState: nextState.pieces,
            toClientState: ({ nextState }) => Piece.toClientState(nextState),
            toClientOperation: (params) => Piece.toClientOperation(params),
            isPrivate: () => false,
        }), tachieLocations: diff.tachieLocations == null ? undefined : DualKeyRecordOperation.toClientOperation({
            diff: diff.tachieLocations,
            prevState: prevState.tachieLocations,
            nextState: nextState.tachieLocations,
            toClientState: ({ nextState }) => BoardLocation.toClientState(nextState),
            toClientOperation: (params) => BoardLocation.toClientOperation(params),
            isPrivate: () => false,
        }) });
};
exports.toClientOperation = toClientOperation;
const apply = ({ state, operation }) => {
    const result = Object.assign({}, state);
    if (operation.image != null) {
        result.image = operation.image.newValue;
    }
    if (operation.isPrivate != null) {
        result.isPrivate = operation.isPrivate.newValue;
    }
    if (operation.name != null) {
        result.name = operation.name.newValue;
    }
    const privateCommandsResult = RecordOperation.apply({
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
    const boolParams = ParamRecordOperation.apply({
        prevState: state.boolParams, operation: operation.boolParams, innerApply: ({ prevState, upOperation }) => {
            return BoolParam.apply({ state: prevState, operation: upOperation });
        }
    });
    if (boolParams.isError) {
        return boolParams;
    }
    result.boolParams = boolParams.value;
    const numParams = ParamRecordOperation.apply({
        prevState: state.numParams, operation: operation.numParams, innerApply: ({ prevState, upOperation }) => {
            return NumParam.apply({ state: prevState, operation: upOperation });
        }
    });
    if (numParams.isError) {
        return numParams;
    }
    result.numParams = numParams.value;
    const numMaxParams = ParamRecordOperation.apply({
        prevState: state.numMaxParams, operation: operation.numMaxParams, innerApply: ({ prevState, upOperation }) => {
            return NumParam.apply({ state: prevState, operation: upOperation });
        }
    });
    if (numMaxParams.isError) {
        return numMaxParams;
    }
    result.numMaxParams = numMaxParams.value;
    const strParams = ParamRecordOperation.apply({
        prevState: state.strParams, operation: operation.strParams, innerApply: ({ prevState, upOperation }) => {
            return StrParam.apply({ state: prevState, operation: upOperation });
        }
    });
    if (strParams.isError) {
        return strParams;
    }
    result.strParams = strParams.value;
    const pieces = DualKeyRecordOperation.apply({
        prevState: state.pieces, operation: operation.pieces, innerApply: ({ prevState, operation: upOperation }) => {
            return Piece.apply({ state: prevState, operation: upOperation });
        }
    });
    if (pieces.isError) {
        return pieces;
    }
    result.pieces = pieces.value;
    const tachieLocations = DualKeyRecordOperation.apply({
        prevState: state.tachieLocations, operation: operation.tachieLocations, innerApply: ({ prevState, operation: upOperation }) => {
            return BoardLocation.apply({ state: prevState, operation: upOperation });
        }
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }
    result.tachieLocations = tachieLocations.value;
    return Result_1.ResultModule.ok(result);
};
exports.apply = apply;
const transformerFactory = (createdByMe) => ({
    composeLoose: ({ key, first, second }) => {
        const boolParamTransformer = paramRecordOperation_1.createParamTransformerFactory(createdByMe);
        const boolParamsTransformer = new paramRecordOperation_1.ParamRecordTransformer(boolParamTransformer);
        const boolParams = boolParamsTransformer.composeLoose({
            first: first.boolParams,
            second: second.boolParams,
        });
        if (boolParams.isError) {
            return boolParams;
        }
        const numParamTransformer = paramRecordOperation_1.createParamTransformerFactory(createdByMe);
        const numParamsTransformer = new paramRecordOperation_1.ParamRecordTransformer(numParamTransformer);
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
        const strParamsTransformer = new paramRecordOperation_1.ParamRecordTransformer(strParamTransformer);
        const strParams = strParamsTransformer.composeLoose({
            first: first.strParams,
            second: second.strParams,
        });
        if (strParams.isError) {
            return strParams;
        }
        const pieceTransformer = Piece.transformerFactory(createdByMe);
        const piecesTransformer = new dualKeyRecordOperation_1.DualKeyRecordTransformer(pieceTransformer);
        const pieces = piecesTransformer.composeLoose({
            first: first.pieces,
            second: second.pieces,
        });
        if (pieces.isError) {
            return pieces;
        }
        const tachieLocationTransformer = BoardLocation.transformerFactory(createdByMe);
        const tachieLocationsTransformer = new dualKeyRecordOperation_1.DualKeyRecordTransformer(tachieLocationTransformer);
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
        const valueProps = {
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
        return Result_1.ResultModule.ok(valueProps);
    },
    restore: ({ key, nextState, downOperation }) => {
        var _a, _b, _c, _d;
        if (downOperation === undefined) {
            return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
        }
        const boolParamTransformer = paramRecordOperation_1.createParamTransformerFactory(createdByMe);
        const boolParamsTransformer = new paramRecordOperation_1.ParamRecordTransformer(boolParamTransformer);
        const boolParams = boolParamsTransformer.restore({
            nextState: nextState.boolParams,
            downOperation: downOperation.boolParams,
        });
        if (boolParams.isError) {
            return boolParams;
        }
        const numParamTransformer = paramRecordOperation_1.createParamTransformerFactory(createdByMe);
        const numParamsTransformer = new paramRecordOperation_1.ParamRecordTransformer(numParamTransformer);
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
        const strParamsTransformer = new paramRecordOperation_1.ParamRecordTransformer(strParamTransformer);
        const strParams = strParamsTransformer.restore({
            nextState: nextState.strParams,
            downOperation: downOperation.strParams,
        });
        if (strParams.isError) {
            return strParams;
        }
        const pieceTransformer = Piece.transformerFactory(createdByMe);
        const piecesTransformer = new dualKeyRecordOperation_1.DualKeyRecordTransformer(pieceTransformer);
        const pieces = piecesTransformer.restore({
            nextState: nextState.pieces,
            downOperation: downOperation.pieces,
        });
        if (pieces.isError) {
            return pieces;
        }
        const tachieLocationTransformer = BoardLocation.transformerFactory(createdByMe);
        const tachieLocationsTransformer = new dualKeyRecordOperation_1.DualKeyRecordTransformer(tachieLocationTransformer);
        const tachieLocations = tachieLocationsTransformer.restore({
            nextState: nextState.tachieLocations,
            downOperation: downOperation.tachieLocations,
        });
        if (tachieLocations.isError) {
            return tachieLocations;
        }
        const prevState = Object.assign(Object.assign({}, nextState), { boolParams: boolParams.value.prevState, numParams: numParams.value.prevState, numMaxParams: numMaxParams.value.prevState, strParams: strParams.value.prevState, pieces: pieces.value.prevState, tachieLocations: tachieLocations.value.prevState });
        const twoWayOperation = {
            version: 1,
            boolParams: boolParams.value.twoWayOperation,
            numParams: numParams.value.twoWayOperation,
            numMaxParams: numMaxParams.value.twoWayOperation,
            strParams: strParams.value.twoWayOperation,
            pieces: pieces.value.twoWayOperation,
            tachieLocations: tachieLocations.value.twoWayOperation,
        };
        if (downOperation.image !== undefined) {
            prevState.image = (_a = downOperation.image.oldValue) !== null && _a !== void 0 ? _a : undefined;
            twoWayOperation.image = { oldValue: (_b = downOperation.image.oldValue) !== null && _b !== void 0 ? _b : undefined, newValue: nextState.image };
        }
        if (downOperation.tachieImage !== undefined) {
            prevState.tachieImage = (_c = downOperation.tachieImage.oldValue) !== null && _c !== void 0 ? _c : undefined;
            twoWayOperation.tachieImage = { oldValue: (_d = downOperation.tachieImage.oldValue) !== null && _d !== void 0 ? _d : undefined, newValue: nextState.tachieImage };
        }
        if (downOperation.isPrivate !== undefined) {
            prevState.isPrivate = downOperation.isPrivate.oldValue;
            twoWayOperation.isPrivate = Object.assign(Object.assign({}, downOperation.isPrivate), { newValue: nextState.isPrivate });
        }
        if (downOperation.name !== undefined) {
            prevState.name = downOperation.name.oldValue;
            twoWayOperation.name = Object.assign(Object.assign({}, downOperation.name), { newValue: nextState.name });
        }
        if (downOperation.privateVarToml !== undefined) {
            const restored = TextOperation.restore({ nextState: nextState.privateVarToml, downOperation: downOperation.privateVarToml });
            if (restored.isError) {
                return restored;
            }
            prevState.privateVarToml = restored.value.prevState;
            twoWayOperation.privateVarToml = restored.value.twoWayOperation;
        }
        return Result_1.ResultModule.ok({ prevState, twoWayOperation });
    },
    transform: ({ key, prevState, currentState, clientOperation, serverOperation }) => {
        if (!createdByMe && currentState.isPrivate) {
            return Result_1.ResultModule.ok(undefined);
        }
        const boolParamTransformer = paramRecordOperation_1.createParamTransformerFactory(createdByMe);
        const boolParamsTransformer = new paramRecordOperation_1.ParamRecordTransformer(boolParamTransformer);
        const boolParams = boolParamsTransformer.transform({
            prevState: prevState.boolParams,
            currentState: currentState.boolParams,
            clientOperation: clientOperation.boolParams,
            serverOperation: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.boolParams,
        });
        if (boolParams.isError) {
            return boolParams;
        }
        const numParamTransformer = paramRecordOperation_1.createParamTransformerFactory(createdByMe);
        const numParamsTransformer = new paramRecordOperation_1.ParamRecordTransformer(numParamTransformer);
        const numParams = numParamsTransformer.transform({
            prevState: prevState.numParams,
            currentState: currentState.numParams,
            clientOperation: clientOperation.numParams,
            serverOperation: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.numParams,
        });
        if (numParams.isError) {
            return numParams;
        }
        const numMaxParams = numParamsTransformer.transform({
            prevState: prevState.numMaxParams,
            currentState: currentState.numMaxParams,
            clientOperation: clientOperation.numMaxParams,
            serverOperation: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.numMaxParams,
        });
        if (numMaxParams.isError) {
            return numMaxParams;
        }
        const strParamTransformer = StrParam.createTransformerFactory(createdByMe);
        const strParamsTransformer = new paramRecordOperation_1.ParamRecordTransformer(strParamTransformer);
        const strParams = strParamsTransformer.transform({
            prevState: prevState.strParams,
            currentState: currentState.strParams,
            clientOperation: clientOperation.strParams,
            serverOperation: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.strParams,
        });
        if (strParams.isError) {
            return strParams;
        }
        const pieceTransformer = Piece.transformerFactory(createdByMe);
        const piecesTransformer = new dualKeyRecordOperation_1.DualKeyRecordTransformer(pieceTransformer);
        const pieces = piecesTransformer.transform({
            prevState: prevState.pieces,
            currentState: currentState.pieces,
            clientOperation: clientOperation.pieces,
            serverOperation: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.pieces,
        });
        if (pieces.isError) {
            return pieces;
        }
        const tachieLocationTransformer = BoardLocation.transformerFactory(createdByMe);
        const tachieLocationsTransformer = new dualKeyRecordOperation_1.DualKeyRecordTransformer(tachieLocationTransformer);
        const tachieLocations = tachieLocationsTransformer.transform({
            prevState: prevState.tachieLocations,
            currentState: currentState.tachieLocations,
            clientOperation: clientOperation.tachieLocations,
            serverOperation: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.tachieLocations,
        });
        if (tachieLocations.isError) {
            return tachieLocations;
        }
        const twoWayOperation = {
            version: 1,
            boolParams: boolParams.value,
            numParams: numParams.value,
            numMaxParams: numMaxParams.value,
            strParams: strParams.value,
            pieces: pieces.value,
            tachieLocations: tachieLocations.value,
        };
        twoWayOperation.image = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.image,
            second: clientOperation.image,
            prevState: prevState.image,
        });
        twoWayOperation.tachieImage = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.tachieImage,
            second: clientOperation.tachieImage,
            prevState: prevState.tachieImage,
        });
        twoWayOperation.isPrivate = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.isPrivate,
            second: clientOperation.isPrivate,
            prevState: prevState.isPrivate,
        });
        twoWayOperation.name = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.name,
            second: clientOperation.name,
            prevState: prevState.name,
        });
        if (createdByMe) {
            const transformed = TextOperation.transform({ first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.privateVarToml, second: clientOperation.privateVarToml, prevState: prevState.privateVarToml });
            if (transformed.isError) {
                return transformed;
            }
            twoWayOperation.privateVarToml = transformed.value.secondPrime;
        }
        if (utils_1.undefinedForAll(twoWayOperation)) {
            return Result_1.ResultModule.ok(undefined);
        }
        return Result_1.ResultModule.ok(Object.assign(Object.assign({}, twoWayOperation), { boolParams: boolParams.value, numParams: numParams.value, numMaxParams: numMaxParams.value, strParams: strParams.value, pieces: pieces.value, tachieLocations: tachieLocations.value }));
    },
    diff: ({ key, prevState, nextState }) => {
        const boolParamTransformer = paramRecordOperation_1.createParamTransformerFactory(createdByMe);
        const boolParamsTransformer = new paramRecordOperation_1.ParamRecordTransformer(boolParamTransformer);
        const boolParams = boolParamsTransformer.diff({
            prevState: prevState.boolParams,
            nextState: nextState.boolParams,
        });
        const numParamTransformer = paramRecordOperation_1.createParamTransformerFactory(createdByMe);
        const numParamsTransformer = new paramRecordOperation_1.ParamRecordTransformer(numParamTransformer);
        const numParams = numParamsTransformer.diff({
            prevState: prevState.numParams,
            nextState: nextState.numParams,
        });
        const numMaxParams = numParamsTransformer.diff({
            prevState: prevState.numMaxParams,
            nextState: nextState.numMaxParams,
        });
        const strParamTransformer = StrParam.createTransformerFactory(createdByMe);
        const strParamsTransformer = new paramRecordOperation_1.ParamRecordTransformer(strParamTransformer);
        const strParams = strParamsTransformer.diff({
            prevState: prevState.strParams,
            nextState: nextState.strParams,
        });
        const pieceTransformer = Piece.transformerFactory(createdByMe);
        const piecesTransformer = new dualKeyRecordOperation_1.DualKeyRecordTransformer(pieceTransformer);
        const pieces = piecesTransformer.diff({
            prevState: prevState.pieces,
            nextState: nextState.pieces,
        });
        const tachieLocationTransformer = BoardLocation.transformerFactory(createdByMe);
        const tachieLocationsTransformer = new dualKeyRecordOperation_1.DualKeyRecordTransformer(tachieLocationTransformer);
        const tachieLocations = tachieLocationsTransformer.diff({
            prevState: prevState.tachieLocations,
            nextState: nextState.tachieLocations,
        });
        const resultType = { version: 1 };
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
        if (utils_1.undefinedForAll(resultType)) {
            return undefined;
        }
        return Object.assign(Object.assign({}, resultType), { boolParams, numParams, numMaxParams, strParams, pieces, tachieLocations });
    },
    applyBack: ({ key, downOperation, nextState }) => {
        var _a, _b;
        const boolParamTransformer = paramRecordOperation_1.createParamTransformerFactory(createdByMe);
        const boolParamsTransformer = new paramRecordOperation_1.ParamRecordTransformer(boolParamTransformer);
        const boolParams = boolParamsTransformer.applyBack({
            downOperation: downOperation.boolParams,
            nextState: nextState.boolParams,
        });
        if (boolParams.isError) {
            return boolParams;
        }
        const numParamTransformer = paramRecordOperation_1.createParamTransformerFactory(createdByMe);
        const numParamsTransformer = new paramRecordOperation_1.ParamRecordTransformer(numParamTransformer);
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
        const strParamsTransformer = new paramRecordOperation_1.ParamRecordTransformer(strParamTransformer);
        const strParams = strParamsTransformer.applyBack({
            downOperation: downOperation.strParams,
            nextState: nextState.strParams,
        });
        if (strParams.isError) {
            return strParams;
        }
        const pieceTransformer = Piece.transformerFactory(createdByMe);
        const piecesTransformer = new dualKeyRecordOperation_1.DualKeyRecordTransformer(pieceTransformer);
        const pieces = piecesTransformer.applyBack({
            downOperation: downOperation.pieces,
            nextState: nextState.pieces,
        });
        if (pieces.isError) {
            return pieces;
        }
        const tachieLocationTransformer = BoardLocation.transformerFactory(createdByMe);
        const tachieLocationsTransformer = new dualKeyRecordOperation_1.DualKeyRecordTransformer(tachieLocationTransformer);
        const tachieLocations = tachieLocationsTransformer.applyBack({
            downOperation: downOperation.tachieLocations,
            nextState: nextState.tachieLocations,
        });
        if (tachieLocations.isError) {
            return tachieLocations;
        }
        const result = Object.assign(Object.assign({}, nextState), { boolParams: boolParams.value, numParams: numParams.value, numMaxParams: numMaxParams.value, strParams: strParams.value, pieces: pieces.value, tachieLocations: tachieLocations.value });
        if (downOperation.image !== undefined) {
            result.image = (_a = downOperation.image.oldValue) !== null && _a !== void 0 ? _a : undefined;
        }
        if (downOperation.tachieImage !== undefined) {
            result.tachieImage = (_b = downOperation.tachieImage.oldValue) !== null && _b !== void 0 ? _b : undefined;
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
        return Result_1.ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    protectedValuePolicy: {
        cancelRemove: ({ nextState }) => !createdByMe && nextState.isPrivate,
    }
});
exports.transformerFactory = transformerFactory;
