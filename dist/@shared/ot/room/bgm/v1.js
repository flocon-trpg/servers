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
const ReplaceOperation = __importStar(require("../util/replaceOperation"));
const v1_1 = require("../../filePath/v1");
const operation_1 = require("../util/operation");
const record_1 = require("../util/record");
exports.state = t.type({
    $version: t.literal(1),
    files: t.array(v1_1.filePath),
    volume: t.number,
});
exports.downOperation = operation_1.operation(1, {
    files: t.type({ oldValue: t.array(v1_1.filePath) }),
    volume: t.type({ oldValue: t.number }),
});
exports.upOperation = operation_1.operation(1, {
    files: t.type({ newValue: t.array(v1_1.filePath) }),
    volume: t.type({ newValue: t.number }),
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
    if (operation.files != null) {
        result.files = operation.files.newValue;
    }
    if (operation.volume != null) {
        result.volume = operation.volume.newValue;
    }
    return Result_1.ResultModule.ok(result);
};
exports.apply = apply;
const applyBack = ({ state, operation }) => {
    const result = Object.assign({}, state);
    if (operation.files != null) {
        result.files = operation.files.oldValue;
    }
    if (operation.volume != null) {
        result.volume = operation.volume.oldValue;
    }
    return Result_1.ResultModule.ok(result);
};
exports.applyBack = applyBack;
const composeUpOperation = ({ first, second }) => {
    const valueProps = {
        $version: 1,
        files: ReplaceOperation.composeUpOperation(first.files, second.files),
        volume: ReplaceOperation.composeUpOperation(first.volume, second.volume),
    };
    return Result_1.ResultModule.ok(valueProps);
};
exports.composeUpOperation = composeUpOperation;
const composeDownOperation = ({ first, second }) => {
    const valueProps = {
        $version: 1,
        files: ReplaceOperation.composeDownOperation(first.files, second.files),
        volume: ReplaceOperation.composeDownOperation(first.volume, second.volume),
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
    if (downOperation.files !== undefined) {
        prevState.files = downOperation.files.oldValue;
        twoWayOperation.files = Object.assign(Object.assign({}, downOperation.files), { newValue: nextState.files });
    }
    if (downOperation.volume !== undefined) {
        prevState.volume = downOperation.volume.oldValue;
        twoWayOperation.volume = Object.assign(Object.assign({}, downOperation.volume), { newValue: nextState.volume });
    }
    return Result_1.ResultModule.ok({ prevState, twoWayOperation: record_1.isIdRecord(twoWayOperation) ? undefined : twoWayOperation });
};
exports.restore = restore;
const diff = ({ prevState, nextState }) => {
    const resultType = { $version: 1 };
    if (prevState.files !== nextState.files) {
        resultType.files = { oldValue: prevState.files, newValue: nextState.files };
    }
    if (prevState.volume !== nextState.volume) {
        resultType.volume = { oldValue: prevState.volume, newValue: nextState.volume };
    }
    if (record_1.isIdRecord(resultType)) {
        return undefined;
    }
    return resultType;
};
exports.diff = diff;
const serverTransform = ({ prevState, clientOperation, serverOperation }) => {
    const twoWayOperation = { $version: 1 };
    twoWayOperation.files = ReplaceOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.files,
        second: clientOperation.files,
        prevState: prevState.files,
    });
    twoWayOperation.volume = ReplaceOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.volume,
        second: clientOperation.volume,
        prevState: prevState.volume,
    });
    if (record_1.isIdRecord(twoWayOperation)) {
        return Result_1.ResultModule.ok(undefined);
    }
    return Result_1.ResultModule.ok(Object.assign({}, twoWayOperation));
};
exports.serverTransform = serverTransform;
const clientTransform = ({ first, second }) => {
    const files = ReplaceOperation.clientTransform({
        first: first.files,
        second: second.files,
    });
    const volume = ReplaceOperation.clientTransform({
        first: first.volume,
        second: second.volume,
    });
    const firstPrime = {
        $version: 1,
        files: files.firstPrime,
        volume: volume.firstPrime,
    };
    const secondPrime = {
        $version: 1,
        files: files.secondPrime,
        volume: volume.secondPrime,
    };
    return Result_1.ResultModule.ok({
        firstPrime: record_1.isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: record_1.isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
exports.clientTransform = clientTransform;
