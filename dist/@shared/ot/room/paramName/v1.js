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
const utils_1 = require("../../../utils");
const ReplaceValueOperation = __importStar(require("../util/replaceOperation"));
exports.state = t.type({
    name: t.string,
});
exports.downOperation = t.partial({
    name: t.type({ oldValue: t.string }),
});
exports.upOperation = t.partial({
    name: t.type({ newValue: t.string }),
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
    if (operation.name != null) {
        result.name = operation.name.newValue;
    }
    return Result_1.ResultModule.ok(result);
};
exports.apply = apply;
exports.transformerFactory = ({
    composeLoose: ({ first, second }) => {
        const valueProps = {
            name: ReplaceValueOperation.composeDownOperation(first.name, second.name),
        };
        return Result_1.ResultModule.ok(valueProps);
    },
    restore: ({ nextState, downOperation }) => {
        if (downOperation === undefined) {
            return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
        }
        const prevState = Object.assign({}, nextState);
        const twoWayOperation = {};
        if (downOperation.name !== undefined) {
            prevState.name = downOperation.name.oldValue;
            twoWayOperation.name = Object.assign(Object.assign({}, downOperation.name), { newValue: nextState.name });
        }
        return Result_1.ResultModule.ok({ prevState, twoWayOperation });
    },
    transform: ({ prevState, clientOperation, serverOperation }) => {
        const twoWayOperation = {};
        twoWayOperation.name = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.name,
            second: clientOperation.name,
            prevState: prevState.name,
        });
        if (utils_1.undefinedForAll(twoWayOperation)) {
            return Result_1.ResultModule.ok(undefined);
        }
        return Result_1.ResultModule.ok(Object.assign({}, twoWayOperation));
    },
    diff: ({ prevState, nextState }) => {
        const resultType = {};
        if (prevState.name !== nextState.name) {
            resultType.name = { oldValue: prevState.name, newValue: nextState.name };
        }
        if (utils_1.undefinedForAll(resultType)) {
            return undefined;
        }
        return Object.assign({}, resultType);
    },
    applyBack: ({ downOperation, nextState }) => {
        const result = Object.assign({}, nextState);
        if (downOperation.name !== undefined) {
            result.name = downOperation.name.oldValue;
        }
        return Result_1.ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    protectedValuePolicy: {}
});
