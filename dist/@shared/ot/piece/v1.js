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
const Result_1 = require("../../Result");
const utils_1 = require("../../utils");
const ReplaceValueOperation = __importStar(require("../room/util/replaceOperation"));
const numberDownOperation = t.type({ oldValue: t.number });
const booleanDownOperation = t.type({ oldValue: t.boolean });
const numberUpOperation = t.type({ newValue: t.number });
const booleanUpOperation = t.type({ newValue: t.boolean });
exports.state = t.type({
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
exports.downOperation = t.partial({
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
exports.upOperation = t.partial({
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
const toServerOperation = (source) => {
    return source;
};
exports.toServerOperation = toServerOperation;
const toClientOperation = ({ diff }) => {
    return diff;
};
exports.toClientOperation = toClientOperation;
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
const transformerFactory = (createdByMe) => ({
    composeLoose: ({ first, second }) => {
        const valueProps = {
            cellH: ReplaceValueOperation.composeDownOperation(first.cellH, second.cellH),
            cellW: ReplaceValueOperation.composeDownOperation(first.cellW, second.cellW),
            cellX: ReplaceValueOperation.composeDownOperation(first.cellX, second.cellX),
            cellY: ReplaceValueOperation.composeDownOperation(first.cellY, second.cellY),
            h: ReplaceValueOperation.composeDownOperation(first.h, second.h),
            isCellMode: ReplaceValueOperation.composeDownOperation(first.isCellMode, second.isCellMode),
            w: ReplaceValueOperation.composeDownOperation(first.w, second.w),
            x: ReplaceValueOperation.composeDownOperation(first.x, second.x),
            y: ReplaceValueOperation.composeDownOperation(first.y, second.y),
        };
        return Result_1.ResultModule.ok(valueProps);
    },
    restore: ({ nextState, downOperation }) => {
        if (downOperation === undefined) {
            return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
        }
        const prevState = Object.assign({}, nextState);
        const twoWayOperation = {};
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
    },
    transform: ({ prevState, clientOperation, serverOperation }) => {
        const twoWayOperation = {};
        twoWayOperation.cellH = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellH,
            second: clientOperation.cellH,
            prevState: prevState.cellH,
        });
        twoWayOperation.cellW = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellW,
            second: clientOperation.cellW,
            prevState: prevState.cellW,
        });
        twoWayOperation.cellX = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellX,
            second: clientOperation.cellX,
            prevState: prevState.cellX,
        });
        twoWayOperation.cellY = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellY,
            second: clientOperation.cellY,
            prevState: prevState.cellY,
        });
        twoWayOperation.isCellMode = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.isCellMode,
            second: clientOperation.isCellMode,
            prevState: prevState.isCellMode,
        });
        twoWayOperation.h = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.h,
            second: clientOperation.h,
            prevState: prevState.h,
        });
        twoWayOperation.w = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.w,
            second: clientOperation.w,
            prevState: prevState.w,
        });
        twoWayOperation.x = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.x,
            second: clientOperation.x,
            prevState: prevState.x,
        });
        twoWayOperation.y = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.y,
            second: clientOperation.y,
            prevState: prevState.y,
        });
        if (utils_1.undefinedForAll(twoWayOperation)) {
            return Result_1.ResultModule.ok(undefined);
        }
        return Result_1.ResultModule.ok(twoWayOperation);
    },
    diff: ({ prevState, nextState }) => {
        const resultType = {};
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
        if (utils_1.undefinedForAll(resultType)) {
            return undefined;
        }
        return resultType;
    },
    applyBack: ({ downOperation, nextState }) => {
        const result = Object.assign({}, nextState);
        if (downOperation.cellH !== undefined) {
            result.cellH = downOperation.cellH.oldValue;
        }
        if (downOperation.cellW !== undefined) {
            result.cellW = downOperation.cellW.oldValue;
        }
        if (downOperation.cellX !== undefined) {
            result.cellX = downOperation.cellX.oldValue;
        }
        if (downOperation.cellY !== undefined) {
            result.cellY = downOperation.cellY.oldValue;
        }
        if (downOperation.h !== undefined) {
            result.h = downOperation.h.oldValue;
        }
        if (downOperation.isCellMode !== undefined) {
            result.isCellMode = downOperation.isCellMode.oldValue;
        }
        if (downOperation.w !== undefined) {
            result.w = downOperation.w.oldValue;
        }
        if (downOperation.x !== undefined) {
            result.x = downOperation.x.oldValue;
        }
        if (downOperation.y !== undefined) {
            result.y = downOperation.y.oldValue;
        }
        return Result_1.ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    protectedValuePolicy: {}
});
exports.transformerFactory = transformerFactory;
