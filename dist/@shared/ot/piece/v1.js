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
const Result_1 = require("../../Result");
const operation_1 = require("../room/util/operation");
const record_1 = require("../room/util/record");
const ReplaceOperation = __importStar(require("../room/util/replaceOperation"));
const numberDownOperation = t.type({ oldValue: t.number });
const booleanDownOperation = t.type({ oldValue: t.boolean });
const numberUpOperation = t.type({ newValue: t.number });
const booleanUpOperation = t.type({ newValue: t.boolean });
exports.state = t.type({
    $version: t.literal(1),
    cellH: t.number,
    cellW: t.number,
    cellX: t.number,
    cellY: t.number,
    h: t.number,
    isCellMode: t.boolean,
    w: t.number,
    x: t.number,
    y: t.number,
});
exports.downOperation = operation_1.operation(1, {
    cellH: numberDownOperation,
    cellW: numberDownOperation,
    cellX: numberDownOperation,
    cellY: numberDownOperation,
    h: numberDownOperation,
    isCellMode: booleanDownOperation,
    w: numberDownOperation,
    x: numberDownOperation,
    y: numberDownOperation,
});
exports.upOperation = operation_1.operation(1, {
    cellH: numberUpOperation,
    cellW: numberUpOperation,
    cellX: numberUpOperation,
    cellY: numberUpOperation,
    h: numberUpOperation,
    isCellMode: booleanUpOperation,
    w: numberUpOperation,
    x: numberUpOperation,
    y: numberUpOperation,
});
const toClientState = (source) => {
    return source;
};
exports.toClientState = toClientState;
const toClientOperation = ({ diff }) => {
    return diff;
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
    if (operation.cellH != null) {
        result.cellH = operation.cellH.newValue;
    }
    if (operation.cellW != null) {
        result.cellW = operation.cellW.newValue;
    }
    if (operation.cellX != null) {
        result.cellX = operation.cellX.newValue;
    }
    if (operation.cellY != null) {
        result.cellY = operation.cellY.newValue;
    }
    if (operation.h != null) {
        result.h = operation.h.newValue;
    }
    if (operation.isCellMode != null) {
        result.isCellMode = operation.isCellMode.newValue;
    }
    if (operation.w != null) {
        result.w = operation.w.newValue;
    }
    if (operation.x != null) {
        result.x = operation.x.newValue;
    }
    if (operation.y != null) {
        result.y = operation.y.newValue;
    }
    return Result_1.ResultModule.ok(result);
};
exports.apply = apply;
const applyBack = ({ state, operation }) => {
    const result = Object.assign({}, state);
    if (operation.cellH !== undefined) {
        result.cellH = operation.cellH.oldValue;
    }
    if (operation.cellW !== undefined) {
        result.cellW = operation.cellW.oldValue;
    }
    if (operation.cellX !== undefined) {
        result.cellX = operation.cellX.oldValue;
    }
    if (operation.cellY !== undefined) {
        result.cellY = operation.cellY.oldValue;
    }
    if (operation.h !== undefined) {
        result.h = operation.h.oldValue;
    }
    if (operation.isCellMode !== undefined) {
        result.isCellMode = operation.isCellMode.oldValue;
    }
    if (operation.w !== undefined) {
        result.w = operation.w.oldValue;
    }
    if (operation.x !== undefined) {
        result.x = operation.x.oldValue;
    }
    if (operation.y !== undefined) {
        result.y = operation.y.oldValue;
    }
    return Result_1.ResultModule.ok(result);
};
exports.applyBack = applyBack;
const composeUpOperation = ({ first, second }) => {
    const valueProps = {
        $version: 1,
        cellH: ReplaceOperation.composeUpOperation(first.cellH, second.cellH),
        cellW: ReplaceOperation.composeUpOperation(first.cellW, second.cellW),
        cellX: ReplaceOperation.composeUpOperation(first.cellX, second.cellX),
        cellY: ReplaceOperation.composeUpOperation(first.cellY, second.cellY),
        h: ReplaceOperation.composeUpOperation(first.h, second.h),
        isCellMode: ReplaceOperation.composeUpOperation(first.isCellMode, second.isCellMode),
        w: ReplaceOperation.composeUpOperation(first.w, second.w),
        x: ReplaceOperation.composeUpOperation(first.x, second.x),
        y: ReplaceOperation.composeUpOperation(first.y, second.y),
    };
    return Result_1.ResultModule.ok(valueProps);
};
exports.composeUpOperation = composeUpOperation;
const composeDownOperation = ({ first, second }) => {
    const valueProps = {
        $version: 1,
        cellH: ReplaceOperation.composeDownOperation(first.cellH, second.cellH),
        cellW: ReplaceOperation.composeDownOperation(first.cellW, second.cellW),
        cellX: ReplaceOperation.composeDownOperation(first.cellX, second.cellX),
        cellY: ReplaceOperation.composeDownOperation(first.cellY, second.cellY),
        h: ReplaceOperation.composeDownOperation(first.h, second.h),
        isCellMode: ReplaceOperation.composeDownOperation(first.isCellMode, second.isCellMode),
        w: ReplaceOperation.composeDownOperation(first.w, second.w),
        x: ReplaceOperation.composeDownOperation(first.x, second.x),
        y: ReplaceOperation.composeDownOperation(first.y, second.y),
    };
    return Result_1.ResultModule.ok(valueProps);
};
exports.composeDownOperation = composeDownOperation;
const restore = ({ nextState, downOperation }) => {
    if (downOperation === undefined) {
        return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
    }
    const prevState = Object.assign({}, nextState);
    const twoWayOperation = { $version: 1 };
    if (downOperation.cellH !== undefined) {
        prevState.cellH = downOperation.cellH.oldValue;
        twoWayOperation.cellH = Object.assign(Object.assign({}, downOperation.cellH), { newValue: nextState.cellH });
    }
    if (downOperation.cellW !== undefined) {
        prevState.cellW = downOperation.cellW.oldValue;
        twoWayOperation.cellW = Object.assign(Object.assign({}, downOperation.cellW), { newValue: nextState.cellW });
    }
    if (downOperation.cellX !== undefined) {
        prevState.cellX = downOperation.cellX.oldValue;
        twoWayOperation.cellX = Object.assign(Object.assign({}, downOperation.cellX), { newValue: nextState.cellX });
    }
    if (downOperation.cellY !== undefined) {
        prevState.cellY = downOperation.cellY.oldValue;
        twoWayOperation.cellY = Object.assign(Object.assign({}, downOperation.cellY), { newValue: nextState.cellY });
    }
    if (downOperation.h !== undefined) {
        prevState.h = downOperation.h.oldValue;
        twoWayOperation.h = Object.assign(Object.assign({}, downOperation.h), { newValue: nextState.h });
    }
    if (downOperation.isCellMode !== undefined) {
        prevState.isCellMode = downOperation.isCellMode.oldValue;
        twoWayOperation.isCellMode = Object.assign(Object.assign({}, downOperation.isCellMode), { newValue: nextState.isCellMode });
    }
    if (downOperation.w !== undefined) {
        prevState.w = downOperation.w.oldValue;
        twoWayOperation.w = Object.assign(Object.assign({}, downOperation.w), { newValue: nextState.w });
    }
    if (downOperation.x !== undefined) {
        prevState.x = downOperation.x.oldValue;
        twoWayOperation.x = Object.assign(Object.assign({}, downOperation.x), { newValue: nextState.x });
    }
    if (downOperation.y !== undefined) {
        prevState.y = downOperation.y.oldValue;
        twoWayOperation.y = Object.assign(Object.assign({}, downOperation.y), { newValue: nextState.y });
    }
    return Result_1.ResultModule.ok({ prevState, twoWayOperation });
};
exports.restore = restore;
const diff = ({ prevState, nextState }) => {
    const resultType = { $version: 1 };
    if (prevState.cellH !== nextState.cellH) {
        resultType.cellH = { oldValue: prevState.cellH, newValue: nextState.cellH };
    }
    if (prevState.cellW !== nextState.cellW) {
        resultType.cellW = { oldValue: prevState.cellW, newValue: nextState.cellW };
    }
    if (prevState.cellX !== nextState.cellX) {
        resultType.cellX = { oldValue: prevState.cellX, newValue: nextState.cellX };
    }
    if (prevState.cellY !== nextState.cellY) {
        resultType.cellY = { oldValue: prevState.cellY, newValue: nextState.cellY };
    }
    if (prevState.h !== nextState.h) {
        resultType.h = { oldValue: prevState.h, newValue: nextState.h };
    }
    if (prevState.isCellMode !== nextState.isCellMode) {
        resultType.isCellMode = { oldValue: prevState.isCellMode, newValue: nextState.isCellMode };
    }
    if (prevState.w !== nextState.w) {
        resultType.w = { oldValue: prevState.w, newValue: nextState.w };
    }
    if (prevState.x !== nextState.x) {
        resultType.x = { oldValue: prevState.x, newValue: nextState.x };
    }
    if (prevState.y !== nextState.y) {
        resultType.y = { oldValue: prevState.y, newValue: nextState.y };
    }
    if (record_1.isIdRecord(resultType)) {
        return undefined;
    }
    return resultType;
};
exports.diff = diff;
const serverTransform = ({ prevState, clientOperation, serverOperation }) => {
    const twoWayOperation = { $version: 1 };
    twoWayOperation.cellH = ReplaceOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellH,
        second: clientOperation.cellH,
        prevState: prevState.cellH,
    });
    twoWayOperation.cellW = ReplaceOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellW,
        second: clientOperation.cellW,
        prevState: prevState.cellW,
    });
    twoWayOperation.cellX = ReplaceOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellX,
        second: clientOperation.cellX,
        prevState: prevState.cellX,
    });
    twoWayOperation.cellY = ReplaceOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellY,
        second: clientOperation.cellY,
        prevState: prevState.cellY,
    });
    twoWayOperation.isCellMode = ReplaceOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.isCellMode,
        second: clientOperation.isCellMode,
        prevState: prevState.isCellMode,
    });
    twoWayOperation.h = ReplaceOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.h,
        second: clientOperation.h,
        prevState: prevState.h,
    });
    twoWayOperation.w = ReplaceOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.w,
        second: clientOperation.w,
        prevState: prevState.w,
    });
    twoWayOperation.x = ReplaceOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.x,
        second: clientOperation.x,
        prevState: prevState.x,
    });
    twoWayOperation.y = ReplaceOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.y,
        second: clientOperation.y,
        prevState: prevState.y,
    });
    if (record_1.isIdRecord(twoWayOperation)) {
        return Result_1.ResultModule.ok(undefined);
    }
    return Result_1.ResultModule.ok(twoWayOperation);
};
exports.serverTransform = serverTransform;
const clientTransform = ({ first, second }) => {
    const cellH = ReplaceOperation.clientTransform({
        first: first.cellH,
        second: second.cellH,
    });
    const cellW = ReplaceOperation.clientTransform({
        first: first.cellW,
        second: second.cellW,
    });
    const cellX = ReplaceOperation.clientTransform({
        first: first.cellX,
        second: second.cellX,
    });
    const cellY = ReplaceOperation.clientTransform({
        first: first.cellY,
        second: second.cellY,
    });
    const isCellMode = ReplaceOperation.clientTransform({
        first: first.isCellMode,
        second: second.isCellMode,
    });
    const h = ReplaceOperation.clientTransform({
        first: first.h,
        second: second.h,
    });
    const w = ReplaceOperation.clientTransform({
        first: first.w,
        second: second.w,
    });
    const x = ReplaceOperation.clientTransform({
        first: first.x,
        second: second.x,
    });
    const y = ReplaceOperation.clientTransform({
        first: first.y,
        second: second.y,
    });
    const firstPrime = {
        $version: 1,
        cellH: cellH.firstPrime,
        cellW: cellW.firstPrime,
        cellX: cellX.firstPrime,
        cellY: cellY.firstPrime,
        h: h.firstPrime,
        isCellMode: isCellMode.firstPrime,
        w: w.firstPrime,
        x: x.firstPrime,
        y: y.firstPrime,
    };
    const secondPrime = {
        $version: 1,
        cellH: cellH.secondPrime,
        cellW: cellW.secondPrime,
        cellX: cellX.secondPrime,
        cellY: cellY.secondPrime,
        h: h.secondPrime,
        isCellMode: isCellMode.secondPrime,
        w: w.secondPrime,
        x: x.secondPrime,
        y: y.secondPrime,
    };
    return Result_1.ResultModule.ok({
        firstPrime: record_1.isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: record_1.isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
exports.clientTransform = clientTransform;
