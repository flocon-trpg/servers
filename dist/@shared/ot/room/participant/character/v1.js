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
exports.clientTransform = exports.serverTransform = exports.diff = exports.restore = exports.composeDownOperation = exports.composeUpOperation = exports.applyBack = exports.apply = exports.toUpOperation = exports.toDownOperation = exports.toClientOperation = exports.toClientState = exports.upOperation = exports.downOperation = exports.state = void 0;
const t = __importStar(require("io-ts"));
const io_ts_1 = require("../../../../io-ts");
const recordOperationElement_1 = require("../../util/recordOperationElement");
const v1_1 = require("../../../filePath/v1");
const TextOperation = __importStar(require("../../util/textOperation"));
const Piece = __importStar(require("../../../piece/v1"));
const BoardLocation = __importStar(require("../../../boardLocation/v1"));
const ReplaceOperation = __importStar(require("../../util/replaceOperation"));
const DualKeyRecordOperation = __importStar(require("../../util/dualKeyRecordOperation"));
const RecordOperation = __importStar(require("../../util/recordOperation"));
const ParamRecordOperation = __importStar(require("../../util/paramRecordOperation"));
const Result_1 = require("../../../../Result");
const utils_1 = require("../../../../utils");
const BoolParam = __importStar(require("./boolParam/v1"));
const NumParam = __importStar(require("./numParam/v1"));
const StrParam = __importStar(require("./strParam/v1"));
const SimpleValueParam = __importStar(require("./simpleValueParam/v1"));
const operation_1 = require("../../util/operation");
const record_1 = require("../../util/record");
exports.state = t.type({
    $version: t.literal(1),
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
            toClientState: ({ state }) => SimpleValueParam.toClientState(createdByMe, null)(state),
        }), numParams: RecordOperation.toClientState({
            serverState: source.numParams,
            isPrivate: () => false,
            toClientState: ({ state }) => SimpleValueParam.toClientState(createdByMe, null)(state),
        }), numMaxParams: RecordOperation.toClientState({
            serverState: source.numMaxParams,
            isPrivate: () => false,
            toClientState: ({ state }) => SimpleValueParam.toClientState(createdByMe, null)(state),
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
const toClientOperation = (createdByMe) => ({ prevState, nextState, diff }) => {
    return Object.assign(Object.assign({}, diff), { privateCommands: diff.privateCommands == null ? undefined : utils_1.chooseRecord(diff.privateCommands, operation => recordOperationElement_1.mapRecordOperationElement({ source: operation, mapReplace: x => x, mapOperation: x => TextOperation.toUpOperation(x) })), privateVarToml: diff.privateVarToml == null ? undefined : TextOperation.toUpOperation(diff.privateVarToml), boolParams: diff.boolParams == null ? undefined : ParamRecordOperation.toClientOperation({
            diff: diff.boolParams,
            prevState: prevState.boolParams,
            nextState: nextState.boolParams,
            toClientOperation: (params) => SimpleValueParam.toClientOperation(createdByMe, null)(params),
        }), numParams: diff.numParams == null ? undefined : ParamRecordOperation.toClientOperation({
            diff: diff.numParams,
            prevState: prevState.numParams,
            nextState: nextState.numParams,
            toClientOperation: (params) => SimpleValueParam.toClientOperation(createdByMe, null)(params),
        }), numMaxParams: diff.numMaxParams == null ? undefined : ParamRecordOperation.toClientOperation({
            diff: diff.numMaxParams,
            prevState: prevState.numMaxParams,
            nextState: nextState.numMaxParams,
            toClientOperation: (params) => SimpleValueParam.toClientOperation(createdByMe, null)(params),
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
const toDownOperation = (source) => {
    return Object.assign(Object.assign({}, source), { privateCommands: source.privateCommands == null ? undefined : utils_1.chooseRecord(source.privateCommands, operation => recordOperationElement_1.mapRecordOperationElement({ source: operation, mapReplace: x => x, mapOperation: x => TextOperation.toDownOperation(x) })), privateVarToml: source.privateVarToml == null ? undefined : TextOperation.toDownOperation(source.privateVarToml), boolParams: source.boolParams == null ? undefined : utils_1.chooseRecord(source.boolParams, SimpleValueParam.toDownOperation), numParams: source.numParams == null ? undefined : utils_1.chooseRecord(source.numParams, SimpleValueParam.toDownOperation), numMaxParams: source.numMaxParams == null ? undefined : utils_1.chooseRecord(source.numMaxParams, SimpleValueParam.toDownOperation), strParams: source.strParams == null ? undefined : utils_1.chooseRecord(source.strParams, StrParam.toDownOperation), pieces: source.pieces == null ? undefined : utils_1.chooseDualKeyRecord(source.pieces, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Piece.toDownOperation,
        })), tachieLocations: source.tachieLocations == null ? undefined : utils_1.chooseDualKeyRecord(source.tachieLocations, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: BoardLocation.toDownOperation,
        })) });
};
exports.toDownOperation = toDownOperation;
const toUpOperation = (source) => {
    return Object.assign(Object.assign({}, source), { privateCommands: source.privateCommands == null ? undefined : utils_1.chooseRecord(source.privateCommands, operation => recordOperationElement_1.mapRecordOperationElement({ source: operation, mapReplace: x => x, mapOperation: x => TextOperation.toUpOperation(x) })), privateVarToml: source.privateVarToml == null ? undefined : TextOperation.toUpOperation(source.privateVarToml), boolParams: source.boolParams == null ? undefined : utils_1.chooseRecord(source.boolParams, SimpleValueParam.toUpOperation), numParams: source.numParams == null ? undefined : utils_1.chooseRecord(source.numParams, SimpleValueParam.toUpOperation), numMaxParams: source.numMaxParams == null ? undefined : utils_1.chooseRecord(source.numMaxParams, SimpleValueParam.toUpOperation), strParams: source.strParams == null ? undefined : utils_1.chooseRecord(source.strParams, StrParam.toUpOperation), pieces: source.pieces == null ? undefined : utils_1.chooseDualKeyRecord(source.pieces, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Piece.toUpOperation,
        })), tachieLocations: source.tachieLocations == null ? undefined : utils_1.chooseDualKeyRecord(source.tachieLocations, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: BoardLocation.toUpOperation,
        })) });
};
exports.toUpOperation = toUpOperation;
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
        prevState: state.boolParams, operation: operation.boolParams,
        innerApply: ({ prevState, operation: upOperation }) => {
            return SimpleValueParam.apply()({ state: prevState, operation: upOperation });
        }
    });
    if (boolParams.isError) {
        return boolParams;
    }
    result.boolParams = boolParams.value;
    const numParams = ParamRecordOperation.apply({
        prevState: state.numParams, operation: operation.numParams,
        innerApply: ({ prevState, operation: upOperation }) => {
            return SimpleValueParam.apply()({ state: prevState, operation: upOperation });
        }
    });
    if (numParams.isError) {
        return numParams;
    }
    result.numParams = numParams.value;
    const numMaxParams = ParamRecordOperation.apply({
        prevState: state.numMaxParams, operation: operation.numMaxParams,
        innerApply: ({ prevState, operation: upOperation }) => {
            return SimpleValueParam.apply()({ state: prevState, operation: upOperation });
        }
    });
    if (numMaxParams.isError) {
        return numMaxParams;
    }
    result.numMaxParams = numMaxParams.value;
    const strParams = ParamRecordOperation.apply({
        prevState: state.strParams, operation: operation.strParams, innerApply: ({ prevState, operation: upOperation }) => {
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
const applyBack = ({ state, operation }) => {
    const result = Object.assign({}, state);
    if (operation.image != null) {
        result.image = operation.image.oldValue;
    }
    if (operation.isPrivate != null) {
        result.isPrivate = operation.isPrivate.oldValue;
    }
    if (operation.name != null) {
        result.name = operation.name.oldValue;
    }
    const privateCommandsResult = RecordOperation.applyBack({
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
    const boolParams = ParamRecordOperation.applyBack({
        nextState: state.boolParams, operation: operation.boolParams,
        innerApplyBack: ({ nextState, operation }) => {
            return SimpleValueParam.applyBack()({ state: nextState, operation });
        }
    });
    if (boolParams.isError) {
        return boolParams;
    }
    result.boolParams = boolParams.value;
    const numParams = ParamRecordOperation.applyBack({
        nextState: state.numParams, operation: operation.numParams,
        innerApplyBack: ({ nextState, operation }) => {
            return SimpleValueParam.applyBack()({ state: nextState, operation });
        }
    });
    if (numParams.isError) {
        return numParams;
    }
    result.numParams = numParams.value;
    const numMaxParams = ParamRecordOperation.applyBack({
        nextState: state.numMaxParams, operation: operation.numMaxParams,
        innerApplyBack: ({ nextState, operation }) => {
            return SimpleValueParam.applyBack()({ state: nextState, operation });
        }
    });
    if (numMaxParams.isError) {
        return numMaxParams;
    }
    result.numMaxParams = numMaxParams.value;
    const strParams = ParamRecordOperation.applyBack({
        nextState: state.strParams, operation: operation.strParams, innerApplyBack: ({ nextState, operation }) => {
            return StrParam.applyBack({ state: nextState, operation });
        }
    });
    if (strParams.isError) {
        return strParams;
    }
    result.strParams = strParams.value;
    const pieces = DualKeyRecordOperation.applyBack({
        nextState: state.pieces, operation: operation.pieces, innerApplyBack: ({ state: nextState, operation }) => {
            return Piece.applyBack({ state: nextState, operation });
        }
    });
    if (pieces.isError) {
        return pieces;
    }
    result.pieces = pieces.value;
    const tachieLocations = DualKeyRecordOperation.applyBack({
        nextState: state.tachieLocations, operation: operation.tachieLocations, innerApplyBack: ({ state: nextState, operation }) => {
            return BoardLocation.applyBack({ state: nextState, operation });
        }
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }
    result.tachieLocations = tachieLocations.value;
    return Result_1.ResultModule.ok(result);
};
exports.applyBack = applyBack;
const composeUpOperation = ({ first, second }) => {
    const boolParams = ParamRecordOperation.compose({
        first: first.boolParams,
        second: second.boolParams,
        innerCompose: params => SimpleValueParam.composeUpOperation()(params)
    });
    if (boolParams.isError) {
        return boolParams;
    }
    const numParams = ParamRecordOperation.compose({
        first: first.numParams,
        second: second.numParams,
        innerCompose: params => SimpleValueParam.composeUpOperation()(params)
    });
    if (numParams.isError) {
        return numParams;
    }
    const numMaxParams = ParamRecordOperation.compose({
        first: first.numMaxParams,
        second: second.numMaxParams,
        innerCompose: params => SimpleValueParam.composeUpOperation()(params)
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
    const pieces = DualKeyRecordOperation.composeUpOperation({
        first: first.pieces,
        second: second.pieces,
        innerApply: ({ state, operation }) => Piece.apply({ state, operation }),
        innerCompose: params => Piece.composeUpOperation(params)
    });
    if (pieces.isError) {
        return pieces;
    }
    const tachieLocations = DualKeyRecordOperation.composeUpOperation({
        first: first.tachieLocations,
        second: second.tachieLocations,
        innerApply: ({ state, operation }) => BoardLocation.apply({ state, operation }),
        innerCompose: params => BoardLocation.composeUpOperation(params)
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }
    const privateVarToml = TextOperation.composeUpOperation(first.privateVarToml, second.privateVarToml);
    if (privateVarToml.isError) {
        return privateVarToml;
    }
    const valueProps = {
        $version: 1,
        isPrivate: ReplaceOperation.composeUpOperation(first.isPrivate, second.isPrivate),
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
    return Result_1.ResultModule.ok(valueProps);
};
exports.composeUpOperation = composeUpOperation;
const composeDownOperation = ({ first, second }) => {
    const boolParams = ParamRecordOperation.compose({
        first: first.boolParams,
        second: second.boolParams,
        innerCompose: params => SimpleValueParam.composeDownOperationLoose()(params)
    });
    if (boolParams.isError) {
        return boolParams;
    }
    const numParams = ParamRecordOperation.compose({
        first: first.numParams,
        second: second.numParams,
        innerCompose: params => SimpleValueParam.composeDownOperationLoose()(params)
    });
    if (numParams.isError) {
        return numParams;
    }
    const numMaxParams = ParamRecordOperation.compose({
        first: first.numMaxParams,
        second: second.numMaxParams,
        innerCompose: params => SimpleValueParam.composeDownOperationLoose()(params)
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
    const pieces = DualKeyRecordOperation.composeDownOperation({
        first: first.pieces,
        second: second.pieces,
        innerApplyBack: ({ state, operation }) => Piece.applyBack({ state, operation }),
        innerCompose: params => Piece.composeDownOperation(params)
    });
    if (pieces.isError) {
        return pieces;
    }
    const tachieLocations = DualKeyRecordOperation.composeDownOperation({
        first: first.tachieLocations,
        second: second.tachieLocations,
        innerApplyBack: ({ state, operation }) => BoardLocation.applyBack({ state, operation }),
        innerCompose: params => BoardLocation.composeDownOperation(params)
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }
    const privateVarToml = TextOperation.composeDownOperation(first.privateVarToml, second.privateVarToml);
    if (privateVarToml.isError) {
        return privateVarToml;
    }
    const valueProps = {
        $version: 1,
        isPrivate: ReplaceOperation.composeDownOperation(first.isPrivate, second.isPrivate),
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
    return Result_1.ResultModule.ok(valueProps);
};
exports.composeDownOperation = composeDownOperation;
const restore = ({ nextState, downOperation }) => {
    var _a, _b, _c, _d;
    if (downOperation === undefined) {
        return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
    }
    const boolParams = ParamRecordOperation.restore({
        nextState: nextState.boolParams,
        downOperation: downOperation.boolParams,
        innerRestore: params => SimpleValueParam.restore()(params)
    });
    if (boolParams.isError) {
        return boolParams;
    }
    const numParams = ParamRecordOperation.restore({
        nextState: nextState.numParams,
        downOperation: downOperation.numParams,
        innerRestore: params => SimpleValueParam.restore()(params)
    });
    if (numParams.isError) {
        return numParams;
    }
    const numMaxParams = ParamRecordOperation.restore({
        nextState: nextState.numMaxParams,
        downOperation: downOperation.numMaxParams,
        innerRestore: params => SimpleValueParam.restore()(params)
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
    const pieces = DualKeyRecordOperation.restore({
        nextState: nextState.pieces,
        downOperation: downOperation.pieces,
        innerDiff: params => Piece.diff(params),
        innerRestore: params => Piece.restore(params),
    });
    if (pieces.isError) {
        return pieces;
    }
    const tachieLocations = DualKeyRecordOperation.restore({
        nextState: nextState.tachieLocations,
        downOperation: downOperation.tachieLocations,
        innerDiff: params => BoardLocation.diff(params),
        innerRestore: params => BoardLocation.restore(params),
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }
    const prevState = Object.assign(Object.assign({}, nextState), { boolParams: boolParams.value.prevState, numParams: numParams.value.prevState, numMaxParams: numMaxParams.value.prevState, strParams: strParams.value.prevState, pieces: pieces.value.prevState, tachieLocations: tachieLocations.value.prevState });
    const twoWayOperation = {
        $version: 1,
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
};
exports.restore = restore;
const diff = ({ prevState, nextState }) => {
    const boolParams = ParamRecordOperation.diff({
        prevState: prevState.boolParams,
        nextState: nextState.boolParams,
        innerDiff: ({ prevState, nextState }) => SimpleValueParam.diff()({
            prevState: prevState !== null && prevState !== void 0 ? prevState : {
                $version: 1,
                isValuePrivate: false,
                value: null,
            },
            nextState: nextState !== null && nextState !== void 0 ? nextState : {
                $version: 1,
                isValuePrivate: false,
                value: null,
            },
        }),
    });
    const numParams = ParamRecordOperation.diff({
        prevState: prevState.numParams,
        nextState: nextState.numParams,
        innerDiff: ({ prevState, nextState }) => SimpleValueParam.diff()({
            prevState: prevState !== null && prevState !== void 0 ? prevState : {
                $version: 1,
                isValuePrivate: false,
                value: null,
            },
            nextState: nextState !== null && nextState !== void 0 ? nextState : {
                $version: 1,
                isValuePrivate: false,
                value: null,
            },
        }),
    });
    const numMaxParams = ParamRecordOperation.diff({
        prevState: prevState.numMaxParams,
        nextState: nextState.numMaxParams,
        innerDiff: ({ prevState, nextState }) => SimpleValueParam.diff()({
            prevState: prevState !== null && prevState !== void 0 ? prevState : {
                $version: 1,
                isValuePrivate: false,
                value: null,
            },
            nextState: nextState !== null && nextState !== void 0 ? nextState : {
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
            prevState: prevState !== null && prevState !== void 0 ? prevState : {
                $version: 1,
                isValuePrivate: false,
                value: '',
            },
            nextState: nextState !== null && nextState !== void 0 ? nextState : {
                $version: 1,
                isValuePrivate: false,
                value: '',
            },
        }),
    });
    const pieces = DualKeyRecordOperation.diff({
        prevState: prevState.pieces,
        nextState: nextState.pieces,
        innerDiff: params => Piece.diff(params),
    });
    const tachieLocations = DualKeyRecordOperation.diff({
        prevState: prevState.tachieLocations,
        nextState: nextState.tachieLocations,
        innerDiff: params => BoardLocation.diff(params),
    });
    const result = {
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
    if (prevState.name !== nextState.name) {
        result.name = { oldValue: prevState.name, newValue: nextState.name };
    }
    if (prevState.privateVarToml !== nextState.privateVarToml) {
        result.privateVarToml = TextOperation.diff({ prev: prevState.privateVarToml, next: nextState.privateVarToml });
    }
    if (record_1.isIdRecord(result)) {
        return undefined;
    }
    return result;
};
exports.diff = diff;
const serverTransform = (createdByMe) => ({ prevState, currentState, clientOperation, serverOperation }) => {
    if (!createdByMe && currentState.isPrivate) {
        return Result_1.ResultModule.ok(undefined);
    }
    const boolParams = ParamRecordOperation.serverTransform({
        prevState: prevState.boolParams,
        nextState: currentState.boolParams,
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.boolParams,
        second: clientOperation.boolParams,
        innerTransform: ({ prevState, nextState, first, second }) => SimpleValueParam.serverTransform(createdByMe)({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
    });
    if (boolParams.isError) {
        return boolParams;
    }
    const numParams = ParamRecordOperation.serverTransform({
        prevState: prevState.numParams,
        nextState: currentState.numParams,
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.numParams,
        second: clientOperation.numParams,
        innerTransform: ({ prevState, nextState, first, second }) => SimpleValueParam.serverTransform(createdByMe)({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
    });
    if (numParams.isError) {
        return numParams;
    }
    const numMaxParams = ParamRecordOperation.serverTransform({
        prevState: prevState.numMaxParams,
        nextState: currentState.numMaxParams,
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.numMaxParams,
        second: clientOperation.numMaxParams,
        innerTransform: ({ prevState, nextState, first, second }) => SimpleValueParam.serverTransform(createdByMe)({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
    });
    if (numMaxParams.isError) {
        return numMaxParams;
    }
    const strParams = ParamRecordOperation.serverTransform({
        prevState: prevState.strParams,
        nextState: currentState.strParams,
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.strParams,
        second: clientOperation.strParams,
        innerTransform: ({ prevState, nextState, first, second }) => StrParam.serverTransform(createdByMe)({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
    });
    if (strParams.isError) {
        return strParams;
    }
    const pieces = DualKeyRecordOperation.serverTransform({
        prevState: prevState.pieces,
        nextState: currentState.pieces,
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.pieces,
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
    const tachieLocations = DualKeyRecordOperation.serverTransform({
        prevState: prevState.tachieLocations,
        nextState: currentState.tachieLocations,
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.tachieLocations,
        second: clientOperation.tachieLocations,
        innerTransform: ({ prevState, nextState, first, second }) => BoardLocation.serverTransform({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        protectedValuePolicy: {},
    });
    if (tachieLocations.isError) {
        return tachieLocations;
    }
    const twoWayOperation = {
        $version: 1,
        boolParams: boolParams.value,
        numParams: numParams.value,
        numMaxParams: numMaxParams.value,
        strParams: strParams.value,
        pieces: pieces.value,
        tachieLocations: tachieLocations.value,
    };
    twoWayOperation.image = ReplaceOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.image,
        second: clientOperation.image,
        prevState: prevState.image,
    });
    twoWayOperation.tachieImage = ReplaceOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.tachieImage,
        second: clientOperation.tachieImage,
        prevState: prevState.tachieImage,
    });
    twoWayOperation.isPrivate = ReplaceOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.isPrivate,
        second: clientOperation.isPrivate,
        prevState: prevState.isPrivate,
    });
    twoWayOperation.name = ReplaceOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.name,
        second: clientOperation.name,
        prevState: prevState.name,
    });
    if (createdByMe) {
        const transformed = TextOperation.serverTransform({ first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.privateVarToml, second: clientOperation.privateVarToml, prevState: prevState.privateVarToml });
        if (transformed.isError) {
            return transformed;
        }
        twoWayOperation.privateVarToml = transformed.value.secondPrime;
    }
    if (record_1.isIdRecord(twoWayOperation)) {
        return Result_1.ResultModule.ok(undefined);
    }
    return Result_1.ResultModule.ok(Object.assign(Object.assign({}, twoWayOperation), { boolParams: boolParams.value, numParams: numParams.value, numMaxParams: numMaxParams.value, strParams: strParams.value, pieces: pieces.value, tachieLocations: tachieLocations.value }));
};
exports.serverTransform = serverTransform;
const clientTransform = ({ first, second }) => {
    const boolParams = ParamRecordOperation.clientTransform({
        first: first.boolParams,
        second: second.boolParams,
        innerTransform: params => SimpleValueParam.clientTransform()(params),
    });
    if (boolParams.isError) {
        return boolParams;
    }
    const numParams = ParamRecordOperation.clientTransform({
        first: first.numParams,
        second: second.numParams,
        innerTransform: params => SimpleValueParam.clientTransform()(params),
    });
    if (numParams.isError) {
        return numParams;
    }
    const numMaxParams = ParamRecordOperation.clientTransform({
        first: first.numMaxParams,
        second: second.numMaxParams,
        innerTransform: params => SimpleValueParam.clientTransform()(params),
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
    const pieces = DualKeyRecordOperation.clientTransform({
        first: first.pieces,
        second: second.pieces,
        innerTransform: params => Piece.clientTransform(params),
        innerDiff: params => Piece.diff(params),
    });
    if (pieces.isError) {
        return pieces;
    }
    const tachieLocations = DualKeyRecordOperation.clientTransform({
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
    const firstPrime = {
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
    const secondPrime = {
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
    return Result_1.ResultModule.ok({
        firstPrime: record_1.isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: record_1.isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
exports.clientTransform = clientTransform;
