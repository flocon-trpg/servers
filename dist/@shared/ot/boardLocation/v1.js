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
const operation_1 = require("../room/util/operation");
const record_1 = require("../room/util/record");
const ReplaceOperation = __importStar(require("../room/util/replaceOperation"));
const numberDownOperation = t.type({ oldValue: t.number });
const booleanDownOperation = t.type({ oldValue: t.boolean });
const numberUpOperation = t.type({ newValue: t.number });
const booleanUpOperation = t.type({ newValue: t.boolean });
exports.state = t.type({
    $version: t.literal(1),
    h: t.number,
    isPrivate: t.boolean,
    w: t.number,
    x: t.number,
    y: t.number,
});
exports.downOperation = operation_1.operation(1, {
    h: numberDownOperation,
    isPrivate: booleanDownOperation,
    w: numberDownOperation,
    x: numberDownOperation,
    y: numberDownOperation,
});
exports.upOperation = operation_1.operation(1, {
    h: numberUpOperation,
    isPrivate: booleanUpOperation,
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
    if (operation.h != null) {
        result.h = operation.h.newValue;
    }
    if (operation.isPrivate != null) {
        result.isPrivate = operation.isPrivate.newValue;
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
            $version: 1,
            h: ReplaceOperation.composeDownOperation(first.h, second.h),
            isPrivate: ReplaceOperation.composeDownOperation(first.isPrivate, second.isPrivate),
            w: ReplaceOperation.composeDownOperation(first.w, second.w),
            x: ReplaceOperation.composeDownOperation(first.x, second.x),
            y: ReplaceOperation.composeDownOperation(first.y, second.y),
        };
        return Result_1.ResultModule.ok(valueProps);
    },
    restore: ({ nextState, downOperation }) => {
        if (downOperation === undefined) {
            return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
        }
        const prevState = Object.assign({}, nextState);
        const twoWayOperation = { $version: 1 };
        if (downOperation.h !== undefined) {
            prevState.h = downOperation.h.oldValue;
            twoWayOperation.h = Object.assign(Object.assign({}, downOperation.h), { newValue: nextState.h });
        }
        if (downOperation.isPrivate !== undefined) {
            prevState.isPrivate = downOperation.isPrivate.oldValue;
            twoWayOperation.isPrivate = Object.assign(Object.assign({}, downOperation.isPrivate), { newValue: nextState.isPrivate });
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
    transform: ({ prevState, clientOperation, serverOperation, currentState }) => {
        if (!createdByMe && currentState.isPrivate) {
            return Result_1.ResultModule.ok(undefined);
        }
        const twoWayOperation = { $version: 1 };
        twoWayOperation.h = ReplaceOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.h,
            second: clientOperation.h,
            prevState: prevState.h,
        });
        twoWayOperation.isPrivate = ReplaceOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.isPrivate,
            second: clientOperation.isPrivate,
            prevState: prevState.isPrivate,
        });
        twoWayOperation.w = ReplaceOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.w,
            second: clientOperation.w,
            prevState: prevState.w,
        });
        twoWayOperation.x = ReplaceOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.x,
            second: clientOperation.x,
            prevState: prevState.x,
        });
        twoWayOperation.y = ReplaceOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.y,
            second: clientOperation.y,
            prevState: prevState.y,
        });
        if (record_1.isIdRecord(twoWayOperation)) {
            return Result_1.ResultModule.ok(undefined);
        }
        return Result_1.ResultModule.ok(twoWayOperation);
    },
    diff: ({ prevState, nextState }) => {
        const resultType = { $version: 1 };
        if (prevState.h !== nextState.h) {
            resultType.h = { oldValue: prevState.h, newValue: nextState.h };
        }
        if (prevState.isPrivate !== nextState.isPrivate) {
            resultType.isPrivate = { oldValue: prevState.isPrivate, newValue: nextState.isPrivate };
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
    },
    applyBack: ({ downOperation, nextState }) => {
        const result = Object.assign({}, nextState);
        if (downOperation.h !== undefined) {
            result.h = downOperation.h.oldValue;
        }
        if (downOperation.isPrivate !== undefined) {
            result.isPrivate = downOperation.isPrivate.oldValue;
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
    protectedValuePolicy: {
        cancelRemove: ({ nextState }) => !createdByMe && nextState.isPrivate,
    }
});
exports.transformerFactory = transformerFactory;
