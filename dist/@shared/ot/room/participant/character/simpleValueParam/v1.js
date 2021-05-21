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
exports.clientTransform = exports.serverTransform = exports.diff = exports.restore = exports.composeDownOperationLoose = exports.composeUpOperation = exports.applyBack = exports.apply = exports.toUpOperation = exports.toDownOperation = exports.toClientOperation = exports.toClientState = void 0;
const Result_1 = require("../../../../../Result");
const ReplaceValueOperation = __importStar(require("../../../util/replaceOperation"));
const record_1 = require("../../../util/record");
const ReplaceOperation = __importStar(require("../../../util/replaceOperation"));
const toClientState = (createdByMe, defaultValue) => (source) => {
    return Object.assign(Object.assign({}, source), { value: source.isValuePrivate && !createdByMe ? defaultValue : source.value });
};
exports.toClientState = toClientState;
const toClientOperation = (createdByMe, defaultValue) => ({ prevState, nextState, diff }) => {
    return Object.assign(Object.assign({}, diff), { value: ReplaceOperation.toPrivateClientOperation({
            oldValue: {
                value: prevState.value,
                isValuePrivate: prevState.isValuePrivate,
            },
            newValue: {
                value: nextState.value,
                isValuePrivate: nextState.isValuePrivate,
            },
            defaultState: defaultValue,
            createdByMe,
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
const apply = () => ({ state, operation }) => {
    const result = Object.assign({}, state);
    if (operation.isValuePrivate != null) {
        result.isValuePrivate = operation.isValuePrivate.newValue;
    }
    if (operation.value != null) {
        result.value = operation.value.newValue;
    }
    return Result_1.ResultModule.ok(result);
};
exports.apply = apply;
const applyBack = () => ({ state, operation }) => {
    const result = Object.assign({}, state);
    if (operation.isValuePrivate != null) {
        result.isValuePrivate = operation.isValuePrivate.oldValue;
    }
    if (operation.value != null) {
        result.value = operation.value.oldValue;
    }
    return Result_1.ResultModule.ok(result);
};
exports.applyBack = applyBack;
const composeUpOperation = () => ({ first, second }) => {
    const valueProps = {
        $version: 1,
        isValuePrivate: ReplaceValueOperation.composeUpOperation(first.isValuePrivate, second.isValuePrivate),
        value: ReplaceValueOperation.composeUpOperation(first.value, second.value),
    };
    return Result_1.ResultModule.ok(valueProps);
};
exports.composeUpOperation = composeUpOperation;
const composeDownOperationLoose = () => ({ first, second }) => {
    const valueProps = {
        $version: 1,
        isValuePrivate: ReplaceValueOperation.composeDownOperation(first.isValuePrivate, second.isValuePrivate),
        value: ReplaceValueOperation.composeDownOperation(first.value, second.value),
    };
    return Result_1.ResultModule.ok(valueProps);
};
exports.composeDownOperationLoose = composeDownOperationLoose;
const restore = () => ({ nextState, downOperation }) => {
    if (downOperation === undefined) {
        return Result_1.ResultModule.ok({ prevState: nextState, nextState, twoWayOperation: undefined });
    }
    const prevState = Object.assign({}, nextState);
    const twoWayOperation = { $version: 1 };
    if (downOperation.isValuePrivate !== undefined) {
        prevState.isValuePrivate = downOperation.isValuePrivate.oldValue;
        twoWayOperation.isValuePrivate = Object.assign(Object.assign({}, downOperation.isValuePrivate), { newValue: nextState.isValuePrivate });
    }
    if (downOperation.value !== undefined) {
        prevState.value = downOperation.value.oldValue;
        twoWayOperation.value = { oldValue: downOperation.value.oldValue, newValue: nextState.value };
    }
    return Result_1.ResultModule.ok({ prevState, nextState, twoWayOperation });
};
exports.restore = restore;
const diff = () => ({ prevState, nextState }) => {
    const resultType = { $version: 1 };
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
    const twoWayOperation = { $version: 1 };
    if (createdByMe) {
        twoWayOperation.isValuePrivate = ReplaceValueOperation.serverTransform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.isValuePrivate,
            second: clientOperation.isValuePrivate,
            prevState: prevState.isValuePrivate,
        });
    }
    if (createdByMe || !currentState.isValuePrivate) {
        twoWayOperation.value = ReplaceValueOperation.serverTransform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.value,
            second: clientOperation.value,
            prevState: prevState.value,
        });
    }
    if (record_1.isIdRecord(twoWayOperation)) {
        return Result_1.ResultModule.ok(undefined);
    }
    return Result_1.ResultModule.ok(Object.assign({}, twoWayOperation));
};
exports.serverTransform = serverTransform;
const clientTransform = () => ({ first, second }) => {
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
        isValuePrivate: isValuePrivate.firstPrime,
        value: value.firstPrime,
    };
    const secondPrime = {
        $version: 1,
        isValuePrivate: isValuePrivate.secondPrime,
        value: value.secondPrime,
    };
    return Result_1.ResultModule.ok({
        firstPrime: record_1.isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: record_1.isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
exports.clientTransform = clientTransform;
