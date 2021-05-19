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
const Result_1 = require("../../../Result");
const ReplaceValueOperation = __importStar(require("../util/replaceOperation"));
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
    if (operation.files != null) {
        result.files = operation.files.newValue;
    }
    if (operation.volume != null) {
        result.volume = operation.volume.newValue;
    }
    return Result_1.ResultModule.ok(result);
};
exports.apply = apply;
exports.transformerFactory = ({
    composeLoose: ({ first, second }) => {
        const valueProps = {
            $version: 1,
            files: ReplaceValueOperation.composeDownOperation(first.files, second.files),
            volume: ReplaceValueOperation.composeDownOperation(first.volume, second.volume),
        };
        return Result_1.ResultModule.ok(valueProps);
    },
    restore: ({ nextState, downOperation }) => {
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
    },
    transform: ({ prevState, clientOperation, serverOperation }) => {
        const twoWayOperation = { $version: 1 };
        twoWayOperation.files = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.files,
            second: clientOperation.files,
            prevState: prevState.files,
        });
        twoWayOperation.volume = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.volume,
            second: clientOperation.volume,
            prevState: prevState.volume,
        });
        if (record_1.isIdRecord(twoWayOperation)) {
            return Result_1.ResultModule.ok(undefined);
        }
        return Result_1.ResultModule.ok(Object.assign({}, twoWayOperation));
    },
    diff: ({ prevState, nextState }) => {
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
        return Object.assign({}, resultType);
    },
    applyBack: ({ downOperation, nextState }) => {
        const result = Object.assign({}, nextState);
        if (downOperation.files !== undefined) {
            result.files = downOperation.files.oldValue;
        }
        if (downOperation.volume !== undefined) {
            result.volume = downOperation.volume.oldValue;
        }
        return Result_1.ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    protectedValuePolicy: {}
});
