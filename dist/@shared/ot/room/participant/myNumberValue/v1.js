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
const Result_1 = require("../../../../Result");
const utils_1 = require("../../../../utils");
const DualKeyRecordOperation = __importStar(require("../../util/dualKeyRecordOperation"));
const Piece = __importStar(require("../../../piece/v1"));
const recordOperationElement_1 = require("../../util/recordOperationElement");
const ReplaceOperation = __importStar(require("../../util/replaceOperation"));
const operation_1 = require("../../util/operation");
const record_1 = require("../../util/record");
exports.state = t.type({
    $version: t.literal(1),
    isValuePrivate: t.boolean,
    value: t.number,
    pieces: t.record(t.string, t.record(t.string, Piece.state)),
});
exports.downOperation = operation_1.operation(1, {
    isValuePrivate: t.type({ oldValue: t.boolean }),
    value: t.type({ oldValue: t.number }),
    pieces: t.record(t.string, t.record(t.string, recordOperationElement_1.recordDownOperationElementFactory(Piece.state, Piece.downOperation))),
});
exports.upOperation = operation_1.operation(1, {
    isValuePrivate: t.type({ newValue: t.boolean }),
    value: t.type({ newValue: t.number }),
    pieces: t.record(t.string, t.record(t.string, recordOperationElement_1.recordUpOperationElementFactory(Piece.state, Piece.upOperation))),
});
const toClientState = (createdByMe) => (source) => {
    return Object.assign(Object.assign({}, source), { value: source.isValuePrivate && !createdByMe ? 0 : source.value, pieces: utils_1.chooseDualKeyRecord(source.pieces, state => Piece.toClientState(state)) });
};
exports.toClientState = toClientState;
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
const toDownOperation = (source) => {
    return source;
};
exports.toDownOperation = toDownOperation;
const toUpOperation = (source) => {
    return source;
};
exports.toUpOperation = toUpOperation;
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
const applyBack = ({ state, operation }) => {
    const result = Object.assign({}, state);
    if (operation.isValuePrivate != null) {
        result.isValuePrivate = operation.isValuePrivate.oldValue;
    }
    if (operation.value != null) {
        result.value = operation.value.oldValue;
    }
    const pieces = DualKeyRecordOperation.applyBack({
        nextState: state.pieces, operation: operation.pieces, innerApplyBack: ({ state: nextState, operation }) => {
            return Piece.applyBack({ state: nextState, operation });
        }
    });
    if (pieces.isError) {
        return pieces;
    }
    result.pieces = pieces.value;
    return Result_1.ResultModule.ok(result);
};
exports.applyBack = applyBack;
const composeUpOperation = ({ first, second }) => {
    var _a, _b, _c, _d;
    const pieces = DualKeyRecordOperation.composeUpOperation({
        first: first.pieces,
        second: second.pieces,
        innerApply: ({ state, operation }) => {
            return Piece.apply({ state, operation });
        },
        innerCompose: params => Piece.composeUpOperation(params),
    });
    if (pieces.isError) {
        return pieces;
    }
    const valueProps = {
        $version: 1,
        isValuePrivate: ReplaceOperation.composeUpOperation((_a = first.isValuePrivate) !== null && _a !== void 0 ? _a : undefined, (_b = second.isValuePrivate) !== null && _b !== void 0 ? _b : undefined),
        value: ReplaceOperation.composeUpOperation((_c = first.value) !== null && _c !== void 0 ? _c : undefined, (_d = second.value) !== null && _d !== void 0 ? _d : undefined),
        pieces: pieces.value,
    };
    return Result_1.ResultModule.ok(valueProps);
};
exports.composeUpOperation = composeUpOperation;
const composeDownOperation = ({ first, second }) => {
    var _a, _b, _c, _d;
    const pieces = DualKeyRecordOperation.composeDownOperation({
        first: first.pieces,
        second: second.pieces,
        innerApplyBack: ({ state, operation }) => {
            return Piece.applyBack({ state, operation });
        },
        innerCompose: params => Piece.composeDownOperation(params),
    });
    if (pieces.isError) {
        return pieces;
    }
    const valueProps = {
        $version: 1,
        isValuePrivate: ReplaceOperation.composeDownOperation((_a = first.isValuePrivate) !== null && _a !== void 0 ? _a : undefined, (_b = second.isValuePrivate) !== null && _b !== void 0 ? _b : undefined),
        value: ReplaceOperation.composeDownOperation((_c = first.value) !== null && _c !== void 0 ? _c : undefined, (_d = second.value) !== null && _d !== void 0 ? _d : undefined),
        pieces: pieces.value,
    };
    return Result_1.ResultModule.ok(valueProps);
};
exports.composeDownOperation = composeDownOperation;
const restore = ({ nextState, downOperation }) => {
    if (downOperation === undefined) {
        return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
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
    const prevState = Object.assign(Object.assign({}, nextState), { pieces: pieces.value.prevState });
    const twoWayOperation = { $version: 1, pieces: pieces.value.twoWayOperation };
    if (downOperation.isValuePrivate != null) {
        prevState.isValuePrivate = downOperation.isValuePrivate.oldValue;
        twoWayOperation.isValuePrivate = Object.assign(Object.assign({}, downOperation.isValuePrivate), { newValue: nextState.isValuePrivate });
    }
    if (downOperation.value != null) {
        prevState.value = downOperation.value.oldValue;
        twoWayOperation.value = Object.assign(Object.assign({}, downOperation.value), { newValue: nextState.value });
    }
    return Result_1.ResultModule.ok({ prevState, nextState, twoWayOperation });
};
exports.restore = restore;
const diff = ({ prevState, nextState }) => {
    const pieces = DualKeyRecordOperation.diff({
        prevState: prevState.pieces,
        nextState: nextState.pieces,
        innerDiff: params => Piece.diff(params),
    });
    const resultType = {
        $version: 1,
        pieces,
    };
    if (prevState.isValuePrivate !== nextState.isValuePrivate) {
        resultType.isValuePrivate = { oldValue: prevState.isValuePrivate, newValue: nextState.isValuePrivate };
    }
    if (prevState.value !== nextState.value) {
        resultType.value = { oldValue: prevState.value, newValue: nextState.value };
    }
    if (record_1.isIdRecord(resultType)) {
        return undefined;
    }
    return Object.assign({}, resultType);
};
exports.diff = diff;
const serverTransform = (createdByMe) => ({ prevState, currentState, clientOperation, serverOperation }) => {
    var _a, _b, _c, _d;
    if (!createdByMe) {
        return Result_1.ResultModule.ok(undefined);
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
    const twoWayOperation = { $version: 1, pieces: pieces.value };
    twoWayOperation.isValuePrivate = ReplaceOperation.serverTransform({
        first: (_a = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.isValuePrivate) !== null && _a !== void 0 ? _a : undefined,
        second: (_b = clientOperation.isValuePrivate) !== null && _b !== void 0 ? _b : undefined,
        prevState: prevState.isValuePrivate,
    });
    twoWayOperation.value = ReplaceOperation.serverTransform({
        first: (_c = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.value) !== null && _c !== void 0 ? _c : undefined,
        second: (_d = clientOperation.value) !== null && _d !== void 0 ? _d : undefined,
        prevState: prevState.value,
    });
    if (record_1.isIdRecord(twoWayOperation)) {
        return Result_1.ResultModule.ok(undefined);
    }
    return Result_1.ResultModule.ok(Object.assign({}, twoWayOperation));
};
exports.serverTransform = serverTransform;
const clientTransform = ({ first, second }) => {
    const pieces = DualKeyRecordOperation.clientTransform({
        first: first.pieces,
        second: second.pieces,
        innerTransform: params => Piece.clientTransform(params),
        innerDiff: params => Piece.diff(params),
    });
    if (pieces.isError) {
        return pieces;
    }
    const isValuePrivate = ReplaceOperation.clientTransform({
        first: first.isValuePrivate,
        second: second.isValuePrivate,
    });
    const value = ReplaceOperation.clientTransform({
        first: first.value,
        second: second.value,
    });
    const firstPrime = {
        $version: 1,
        pieces: pieces.value.firstPrime,
        isValuePrivate: isValuePrivate.firstPrime,
        value: value.firstPrime,
    };
    const secondPrime = {
        $version: 1,
        pieces: pieces.value.secondPrime,
        isValuePrivate: isValuePrivate.secondPrime,
        value: value.secondPrime,
    };
    return Result_1.ResultModule.ok({
        firstPrime: record_1.isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: record_1.isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
exports.clientTransform = clientTransform;
