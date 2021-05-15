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
exports.createTransformerFactory = exports.apply = exports.toClientOperation = exports.toServerOperation = exports.toClientState = exports.upOperation = exports.downOperation = exports.state = void 0;
const t = __importStar(require("io-ts"));
const TextOperation = __importStar(require("../../../util/textOperation"));
const ReplaceOperation = __importStar(require("../../../util/replaceOperation"));
const Result_1 = require("../../../../../Result");
const utils_1 = require("../../../../../utils");
exports.state = t.type({ isValuePrivate: t.boolean, value: t.string });
exports.downOperation = t.partial({
    isValuePrivate: t.type({ oldValue: t.boolean }),
    value: TextOperation.downOperation,
});
exports.upOperation = t.partial({
    isValuePrivate: t.type({ newValue: t.boolean }),
    value: TextOperation.upOperation,
});
const toClientState = (createdByMe) => (source) => {
    return Object.assign(Object.assign({}, source), { value: source.isValuePrivate && !createdByMe ? '' : source.value });
};
exports.toClientState = toClientState;
const toServerOperation = (source) => {
    return Object.assign(Object.assign({}, source), { value: source.value == null ? undefined : TextOperation.toDownOperation(source.value) });
};
exports.toServerOperation = toServerOperation;
const toClientOperation = (createdByMe) => ({ prevState, nextState, diff }) => {
    return Object.assign(Object.assign({}, diff), { value: TextOperation.toPrivateClientOperation({
            oldValue: {
                value: prevState.value,
                isValuePrivate: prevState.isValuePrivate,
            },
            newValue: {
                value: nextState.value,
                isValuePrivate: nextState.isValuePrivate,
            },
            diff: diff.value,
            createdByMe,
        }) });
};
exports.toClientOperation = toClientOperation;
const apply = ({ state, operation }) => {
    const result = Object.assign({}, state);
    if (operation.isValuePrivate != null) {
        result.isValuePrivate = operation.isValuePrivate.newValue;
    }
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
const createTransformerFactory = (createdByMe) => ({
    composeLoose: ({ first, second }) => {
        const value = TextOperation.composeDownOperation(first.value, second.value);
        if (value.isError) {
            return value;
        }
        const valueProps = {
            isValuePrivate: ReplaceOperation.composeDownOperation(first.isValuePrivate, second.isValuePrivate),
            value: value.value,
        };
        return Result_1.ResultModule.ok(valueProps);
    },
    restore: ({ nextState, downOperation }) => {
        if (downOperation === undefined) {
            return Result_1.ResultModule.ok({ prevState: nextState, nextState, twoWayOperation: undefined });
        }
        const prevState = Object.assign({}, nextState);
        const twoWayOperation = {};
        if (downOperation.isValuePrivate !== undefined) {
            prevState.isValuePrivate = downOperation.isValuePrivate.oldValue;
            twoWayOperation.isValuePrivate = Object.assign(Object.assign({}, downOperation.isValuePrivate), { newValue: nextState.isValuePrivate });
        }
        if (downOperation.value !== undefined) {
            const restored = TextOperation.restore({ nextState: nextState.value, downOperation: downOperation.value });
            if (restored.isError) {
                return restored;
            }
            prevState.value = restored.value.prevState;
            twoWayOperation.value = restored.value.twoWayOperation;
        }
        return Result_1.ResultModule.ok({ prevState, nextState, twoWayOperation });
    },
    transform: ({ prevState, currentState, clientOperation, serverOperation }) => {
        const twoWayOperation = {};
        if (createdByMe) {
            twoWayOperation.isValuePrivate = ReplaceOperation.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.isValuePrivate,
                second: clientOperation.isValuePrivate,
                prevState: prevState.isValuePrivate,
            });
        }
        if (createdByMe || !currentState.isValuePrivate) {
            const transformed = TextOperation.transform({ first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.value, second: clientOperation.value, prevState: prevState.value });
            if (transformed.isError) {
                return transformed;
            }
            twoWayOperation.value = transformed.value.secondPrime;
        }
        if (utils_1.undefinedForAll(twoWayOperation)) {
            return Result_1.ResultModule.ok(undefined);
        }
        return Result_1.ResultModule.ok(twoWayOperation);
    },
    diff: ({ prevState, nextState }) => {
        const resultType = {};
        if (prevState.isValuePrivate !== nextState.isValuePrivate) {
            resultType.isValuePrivate = { oldValue: prevState.isValuePrivate, newValue: nextState.isValuePrivate };
        }
        if (prevState.value !== nextState.value) {
            resultType.value = TextOperation.diff({ prev: prevState.value, next: nextState.value });
        }
        if (utils_1.undefinedForAll(resultType)) {
            return undefined;
        }
        return Object.assign({}, resultType);
    },
    applyBack: ({ downOperation, nextState }) => {
        const result = Object.assign({}, nextState);
        if (downOperation.isValuePrivate !== undefined) {
            result.isValuePrivate = downOperation.isValuePrivate.oldValue;
        }
        if (downOperation.value !== undefined) {
            const prevValue = TextOperation.applyBack(nextState.value, downOperation.value);
            if (prevValue.isError) {
                return prevValue;
            }
            result.value = prevValue.value;
        }
        return Result_1.ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    createDefaultState: () => ({ isValuePrivate: false, value: '' }),
});
exports.createTransformerFactory = createTransformerFactory;
