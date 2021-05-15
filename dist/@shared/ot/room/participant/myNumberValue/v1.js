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
const Result_1 = require("../../../../Result");
const utils_1 = require("../../../../utils");
const dualKeyRecordOperation_1 = require("../../util/dualKeyRecordOperation");
const DualKeyRecordOperation = __importStar(require("../../util/dualKeyRecordOperation"));
const Piece = __importStar(require("../../../piece/v1"));
const recordOperationElement_1 = require("../../util/recordOperationElement");
const ReplaceOperation = __importStar(require("../../util/replaceOperation"));
exports.state = t.type({
    isValuePrivate: t.boolean,
    value: t.number,
    pieces: t.record(t.string, t.record(t.string, Piece.state)),
});
exports.downOperation = t.partial({
    isValuePrivate: t.type({ oldValue: t.boolean }),
    value: t.type({ oldValue: t.number }),
    pieces: t.record(t.string, t.record(t.string, recordOperationElement_1.recordDownOperationElementFactory(Piece.state, Piece.downOperation))),
});
exports.upOperation = t.partial({
    isValuePrivate: t.type({ newValue: t.boolean }),
    value: t.type({ newValue: t.number }),
    pieces: t.record(t.string, t.record(t.string, recordOperationElement_1.recordUpOperationElementFactory(Piece.state, Piece.upOperation))),
});
const toClientState = (createdByMe) => (source) => {
    return Object.assign(Object.assign({}, source), { value: source.isValuePrivate && !createdByMe ? 0 : source.value, pieces: utils_1.chooseDualKeyRecord(source.pieces, state => Piece.toClientState(state)) });
};
exports.toClientState = toClientState;
const toServerOperation = (source) => {
    return source;
};
exports.toServerOperation = toServerOperation;
const toClientOperation = (createdByMe) => ({ prevState, nextState, diff }) => {
    return Object.assign(Object.assign({}, diff), { value: ReplaceOperation.toPrivateClientOperation({
            oldValue: {
                value: prevState.value,
                isValuePrivate: prevState.isValuePrivate,
            },
            newValue: {
                value: nextState.value,
                isValuePrivate: nextState.isValuePrivate,
            },
            defaultState: 0,
            createdByMe,
        }), pieces: diff.pieces == null ? undefined : DualKeyRecordOperation.toClientOperation({
            diff: diff.pieces,
            isPrivate: () => false,
            prevState: prevState.pieces,
            nextState: nextState.pieces,
            toClientState: ({ nextState }) => Piece.toClientState(nextState),
            toClientOperation: params => Piece.toClientOperation(params),
        }) });
};
exports.toClientOperation = toClientOperation;
const apply = ({ state, operation }) => {
    const result = Object.assign({}, state);
    if (operation.isValuePrivate != null) {
        result.isValuePrivate = operation.isValuePrivate.newValue;
    }
    if (operation.value != null) {
        result.value = operation.value.newValue;
    }
    const pieces = DualKeyRecordOperation.apply({
        prevState: state.pieces, operation: operation.pieces, innerApply: ({ prevState, operation: upOperation }) => {
            return Piece.apply({ state: prevState, operation: upOperation });
        }
    });
    if (pieces.isError) {
        return pieces;
    }
    result.pieces = pieces.value;
    return Result_1.ResultModule.ok(result);
};
exports.apply = apply;
const createPieceTransformer = (createdByMe) => Piece.transformerFactory(createdByMe);
const createPiecesTransformer = (createdByMe) => new dualKeyRecordOperation_1.DualKeyRecordTransformer(createPieceTransformer(createdByMe));
const transformerFactory = (createdByMe) => ({
    composeLoose: ({ first, second }) => {
        var _a, _b, _c, _d;
        const piecesTransformer = createPiecesTransformer(createdByMe);
        const pieces = piecesTransformer.composeLoose({
            first: first.pieces,
            second: second.pieces,
        });
        if (pieces.isError) {
            return pieces;
        }
        const valueProps = {
            isValuePrivate: ReplaceOperation.composeDownOperation((_a = first.isValuePrivate) !== null && _a !== void 0 ? _a : undefined, (_b = second.isValuePrivate) !== null && _b !== void 0 ? _b : undefined),
            value: ReplaceOperation.composeDownOperation((_c = first.value) !== null && _c !== void 0 ? _c : undefined, (_d = second.value) !== null && _d !== void 0 ? _d : undefined),
            pieces: pieces.value,
        };
        return Result_1.ResultModule.ok(valueProps);
    },
    restore: ({ nextState, downOperation }) => {
        if (downOperation === undefined) {
            return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
        }
        const piecesTransformer = createPiecesTransformer(createdByMe);
        const pieces = piecesTransformer.restore({
            nextState: nextState.pieces,
            downOperation: downOperation.pieces,
        });
        if (pieces.isError) {
            return pieces;
        }
        const prevState = Object.assign(Object.assign({}, nextState), { pieces: pieces.value.prevState });
        const twoWayOperation = { pieces: pieces.value.twoWayOperation };
        if (downOperation.isValuePrivate != null) {
            prevState.isValuePrivate = downOperation.isValuePrivate.oldValue;
            twoWayOperation.isValuePrivate = Object.assign(Object.assign({}, downOperation.isValuePrivate), { newValue: nextState.isValuePrivate });
        }
        if (downOperation.value != null) {
            prevState.value = downOperation.value.oldValue;
            twoWayOperation.value = Object.assign(Object.assign({}, downOperation.value), { newValue: nextState.value });
        }
        return Result_1.ResultModule.ok({ prevState, nextState, twoWayOperation });
    },
    transform: ({ prevState, clientOperation, serverOperation, currentState }) => {
        var _a, _b, _c, _d;
        if (!createdByMe) {
            return Result_1.ResultModule.ok(undefined);
        }
        const piecesTransformer = createPiecesTransformer(createdByMe);
        const pieces = piecesTransformer.transform({
            prevState: prevState.pieces,
            currentState: currentState.pieces,
            clientOperation: clientOperation.pieces,
            serverOperation: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.pieces,
        });
        if (pieces.isError) {
            return pieces;
        }
        const twoWayOperation = { pieces: pieces.value };
        twoWayOperation.isValuePrivate = ReplaceOperation.transform({
            first: (_a = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.isValuePrivate) !== null && _a !== void 0 ? _a : undefined,
            second: (_b = clientOperation.isValuePrivate) !== null && _b !== void 0 ? _b : undefined,
            prevState: prevState.isValuePrivate,
        });
        twoWayOperation.value = ReplaceOperation.transform({
            first: (_c = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.value) !== null && _c !== void 0 ? _c : undefined,
            second: (_d = clientOperation.value) !== null && _d !== void 0 ? _d : undefined,
            prevState: prevState.value,
        });
        if (utils_1.undefinedForAll(twoWayOperation)) {
            return Result_1.ResultModule.ok(undefined);
        }
        return Result_1.ResultModule.ok(Object.assign({}, twoWayOperation));
    },
    diff: ({ prevState, nextState }) => {
        const piecesTransformer = createPiecesTransformer(createdByMe);
        const pieces = piecesTransformer.diff({
            prevState: prevState.pieces,
            nextState: nextState.pieces,
        });
        const resultType = {
            pieces,
        };
        if (prevState.isValuePrivate !== nextState.isValuePrivate) {
            resultType.isValuePrivate = { oldValue: prevState.isValuePrivate, newValue: nextState.isValuePrivate };
        }
        if (prevState.value !== nextState.value) {
            resultType.value = { oldValue: prevState.value, newValue: nextState.value };
        }
        if (utils_1.undefinedForAll(resultType)) {
            return undefined;
        }
        return Object.assign({}, resultType);
    },
    applyBack: ({ downOperation, nextState }) => {
        const piecesTransformer = createPiecesTransformer(createdByMe);
        const pieces = piecesTransformer.applyBack({
            downOperation: downOperation.pieces,
            nextState: nextState.pieces,
        });
        if (pieces.isError) {
            return pieces;
        }
        const result = Object.assign(Object.assign({}, nextState), { pieces: pieces.value });
        if (downOperation.isValuePrivate != null) {
            result.isValuePrivate = downOperation.isValuePrivate.oldValue;
        }
        if (downOperation.value != null) {
            result.value = downOperation.value.oldValue;
        }
        return Result_1.ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    protectedValuePolicy: {
        cancelRemove: () => !createdByMe,
        cancelCreate: () => !createdByMe,
    },
});
exports.transformerFactory = transformerFactory;
