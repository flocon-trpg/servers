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
const Result_1 = require("../../../Result");
const operation_1 = require("../util/operation");
const record_1 = require("../util/record");
const ReplaceOperation = __importStar(require("../util/replaceOperation"));
exports.state = t.type({
    $version: t.literal(1),
    name: t.string,
});
exports.downOperation = operation_1.operation(1, {
    name: t.type({ oldValue: t.string }),
});
exports.upOperation = operation_1.operation(1, {
    name: t.type({ newValue: t.string }),
});
const toClientState = (source) => source;
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
    if (operation.name != null) {
        result.name = operation.name.newValue;
    }
    return Result_1.ResultModule.ok(result);
};
exports.apply = apply;
const applyBack = ({ state, operation }) => {
    const result = Object.assign({}, state);
    if (operation.name !== undefined) {
        result.name = operation.name.oldValue;
    }
    return Result_1.ResultModule.ok(result);
};
exports.applyBack = applyBack;
const composeUpOperation = ({ first, second }) => {
    const valueProps = {
        $version: 1,
        name: ReplaceOperation.composeUpOperation(first.name, second.name),
    };
    return Result_1.ResultModule.ok(valueProps);
};
exports.composeUpOperation = composeUpOperation;
const composeDownOperation = ({ first, second }) => {
    const valueProps = {
        $version: 1,
        name: ReplaceOperation.composeDownOperation(first.name, second.name),
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
    if (downOperation.name !== undefined) {
        prevState.name = downOperation.name.oldValue;
        twoWayOperation.name = Object.assign(Object.assign({}, downOperation.name), { newValue: nextState.name });
    }
    return Result_1.ResultModule.ok({ prevState, twoWayOperation });
};
exports.restore = restore;
const diff = ({ prevState, nextState }) => {
    const resultType = { $version: 1 };
    if (prevState.name !== nextState.name) {
        resultType.name = { oldValue: prevState.name, newValue: nextState.name };
    }
    if (record_1.isIdRecord(resultType)) {
        return undefined;
    }
    return resultType;
};
exports.diff = diff;
const serverTransform = ({ prevState, clientOperation, serverOperation }) => {
    const twoWayOperation = { $version: 1 };
    twoWayOperation.name = ReplaceOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.name,
        second: clientOperation.name,
        prevState: prevState.name,
    });
    if (record_1.isIdRecord(twoWayOperation)) {
        return Result_1.ResultModule.ok(undefined);
    }
    return Result_1.ResultModule.ok(Object.assign({}, twoWayOperation));
};
exports.serverTransform = serverTransform;
const clientTransform = ({ first, second }) => {
    const name = ReplaceOperation.clientTransform({
        first: first.name,
        second: second.name,
    });
    const firstPrime = {
        $version: 1,
        name: name.firstPrime,
    };
    const secondPrime = {
        $version: 1,
        name: name.secondPrime,
    };
    return Result_1.ResultModule.ok({
        firstPrime: record_1.isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: record_1.isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
exports.clientTransform = clientTransform;
