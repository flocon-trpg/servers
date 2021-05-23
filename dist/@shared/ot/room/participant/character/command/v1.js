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
const TextOperation = __importStar(require("../../../util/textOperation"));
const Result_1 = require("../../../../../Result");
const operation_1 = require("../../../util/operation");
const record_1 = require("../../../util/record");
exports.state = t.type({
    $version: t.literal(1),
    value: t.string
});
exports.downOperation = operation_1.operation(1, {
    value: TextOperation.downOperation,
});
exports.upOperation = operation_1.operation(1, {
    value: TextOperation.upOperation,
});
const toClientState = (source) => {
    return source;
};
exports.toClientState = toClientState;
const toClientOperation = ({ diff }) => {
    return Object.assign(Object.assign({}, diff), { value: diff.value == null ? undefined : TextOperation.toUpOperation(diff.value) });
};
exports.toClientOperation = toClientOperation;
const toDownOperation = (source) => {
    return Object.assign(Object.assign({}, source), { value: source.value == null ? undefined : TextOperation.toDownOperation(source.value) });
};
exports.toDownOperation = toDownOperation;
const toUpOperation = (source) => {
    return Object.assign(Object.assign({}, source), { value: source.value == null ? undefined : TextOperation.toUpOperation(source.value) });
};
exports.toUpOperation = toUpOperation;
const apply = ({ state, operation }) => {
    const result = Object.assign({}, state);
    if (operation.value != null) {
        const valueResult = TextOperation.apply(state.value, operation.value);
        if (valueResult.isError) {
            return valueResult;
        }
        result.value = valueResult.value;
    }
    return Result_1.ResultModule.ok(result);
};
exports.apply = apply;
const applyBack = ({ state, operation }) => {
    const result = Object.assign({}, state);
    if (operation.value !== undefined) {
        const prevValue = TextOperation.applyBack(state.value, operation.value);
        if (prevValue.isError) {
            return prevValue;
        }
        result.value = prevValue.value;
    }
    return Result_1.ResultModule.ok(result);
};
exports.applyBack = applyBack;
const composeUpOperation = ({ first, second }) => {
    const value = TextOperation.composeUpOperation(first.value, second.value);
    if (value.isError) {
        return value;
    }
    const valueProps = {
        $version: 1,
        value: value.value,
    };
    return Result_1.ResultModule.ok(valueProps);
};
exports.composeUpOperation = composeUpOperation;
const composeDownOperation = ({ first, second }) => {
    const value = TextOperation.composeDownOperation(first.value, second.value);
    if (value.isError) {
        return value;
    }
    const valueProps = {
        $version: 1,
        value: value.value,
    };
    return Result_1.ResultModule.ok(valueProps);
};
exports.composeDownOperation = composeDownOperation;
const restore = ({ nextState, downOperation }) => {
    if (downOperation === undefined) {
        return Result_1.ResultModule.ok({ prevState: nextState, nextState, twoWayOperation: undefined });
    }
    const prevState = Object.assign({}, nextState);
    const twoWayOperation = { $version: 1 };
    if (downOperation.value !== undefined) {
        const restored = TextOperation.restore({ nextState: nextState.value, downOperation: downOperation.value });
        if (restored.isError) {
            return restored;
        }
        prevState.value = restored.value.prevState;
        twoWayOperation.value = restored.value.twoWayOperation;
    }
    return Result_1.ResultModule.ok({ prevState, nextState, twoWayOperation });
};
exports.restore = restore;
const diff = ({ prevState, nextState }) => {
    const resultType = { $version: 1 };
    if (prevState.value !== nextState.value) {
        resultType.value = TextOperation.diff({ prev: prevState.value, next: nextState.value });
    }
    if (record_1.isIdRecord(resultType)) {
        return undefined;
    }
    return resultType;
};
exports.diff = diff;
const serverTransform = ({ prevState, currentState, clientOperation, serverOperation }) => {
    const twoWayOperation = { $version: 1 };
    const transformed = TextOperation.serverTransform({ first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.value, second: clientOperation.value, prevState: prevState.value });
    if (transformed.isError) {
        return transformed;
    }
    twoWayOperation.value = transformed.value.secondPrime;
    if (record_1.isIdRecord(twoWayOperation)) {
        return Result_1.ResultModule.ok(undefined);
    }
    return Result_1.ResultModule.ok(twoWayOperation);
};
exports.serverTransform = serverTransform;
const clientTransform = ({ first, second }) => {
    const value = TextOperation.clientTransform({
        first: first.value,
        second: second.value,
    });
    if (value.isError) {
        return value;
    }
    const firstPrime = {
        $version: 1,
        value: value.value.firstPrime,
    };
    const secondPrime = {
        $version: 1,
        value: value.value.secondPrime,
    };
    return Result_1.ResultModule.ok({
        firstPrime: record_1.isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: record_1.isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
exports.clientTransform = clientTransform;
