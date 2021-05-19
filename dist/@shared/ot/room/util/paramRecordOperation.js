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
exports.ParamRecordTransformer = exports.createParamTransformerFactory = exports.diff = exports.transform = exports.composeDownOperation = exports.applyBack = exports.apply = exports.restore = exports.toClientOperation = void 0;
const Map_1 = require("../../../Map");
const Result_1 = require("../../../Result");
const Types_1 = require("../../../Types");
const utils_1 = require("../../../utils");
const ReplaceValueOperation = __importStar(require("./replaceOperation"));
const toClientOperation = ({ diff, prevState, nextState, toClientOperation, }) => {
    const result = {};
    utils_1.recordForEach(diff, (value, key) => {
        const prevStateElement = prevState[key];
        if (prevStateElement === undefined) {
            throw `tried to operate "${key}", but not found in prevState.`;
        }
        const nextStateElement = nextState[key];
        if (nextStateElement === undefined) {
            throw `tried to operate "${key}", but not found in nextState.`;
        }
        const operation = toClientOperation({ diff: value, key, prevState: prevStateElement, nextState: nextStateElement });
        if (operation != null) {
            result[key] = operation;
        }
    });
    return result;
};
exports.toClientOperation = toClientOperation;
const restore = ({ nextState, downOperation, innerRestore, }) => {
    if (downOperation == null) {
        return Result_1.ResultModule.ok({
            prevState: nextState,
            twoWayOperation: undefined,
        });
    }
    const prevState = Object.assign({}, nextState);
    const twoWayOperation = {};
    for (const [key, value] of utils_1.recordToMap(downOperation)) {
        const nextStateElement = nextState[key];
        if (nextStateElement === undefined) {
            return Result_1.ResultModule.error(`tried to update "${key}", but nextState does not have such a key`);
        }
        const restored = innerRestore({ downOperation: value, nextState: nextStateElement, key });
        if (restored.isError) {
            return restored;
        }
        if (restored.value === undefined) {
            continue;
        }
        prevState[key] = restored.value.prevState;
        if (restored.value.twoWayOperation !== undefined) {
            twoWayOperation[key] = restored.value.twoWayOperation;
        }
        break;
    }
    return Result_1.ResultModule.ok({ prevState, twoWayOperation });
};
exports.restore = restore;
const apply = ({ prevState, operation, innerApply }) => {
    if (operation == null) {
        return Result_1.ResultModule.ok(prevState);
    }
    const nextState = Object.assign({}, prevState);
    for (const [key, value] of utils_1.recordToMap(operation)) {
        const prevStateElement = prevState[key];
        if (prevStateElement === undefined) {
            return Result_1.ResultModule.error(`tried to update "${key}", but prevState does not have such a key`);
        }
        const newValue = innerApply({ upOperation: value, prevState: prevStateElement, key });
        if (newValue.isError) {
            return newValue;
        }
        nextState[key] = newValue.value;
        break;
    }
    return Result_1.ResultModule.ok(nextState);
};
exports.apply = apply;
const applyBack = ({ nextState, downOperation, innerApplyBack }) => {
    if (downOperation == null) {
        return Result_1.ResultModule.ok(nextState);
    }
    const prevState = Object.assign({}, nextState);
    for (const [key, value] of utils_1.recordToMap(downOperation)) {
        const nextStateElement = nextState[key];
        if (nextStateElement === undefined) {
            return Result_1.ResultModule.error(`tried to update "${key}", but nextState does not have such a key`);
        }
        const oldValue = innerApplyBack({ downOperation: value, nextState: nextStateElement, key });
        if (oldValue.isError) {
            return oldValue;
        }
        prevState[key] = oldValue.value;
        break;
    }
    return Result_1.ResultModule.ok(prevState);
};
exports.applyBack = applyBack;
const composeDownOperation = ({ first, second, innerCompose }) => {
    if (first == null) {
        return Result_1.ResultModule.ok(second);
    }
    if (second == null) {
        return Result_1.ResultModule.ok(first);
    }
    const result = {};
    for (const [key, groupJoined] of Map_1.groupJoin(utils_1.recordToMap(first), utils_1.recordToMap(second))) {
        switch (groupJoined.type) {
            case Types_1.left:
                result[key] = groupJoined.left;
                continue;
            case Types_1.right:
                result[key] = groupJoined.right;
                continue;
            case Types_1.both:
                {
                    const update = innerCompose({ first: groupJoined.left, second: groupJoined.right, key });
                    if (update.isError) {
                        return update;
                    }
                    if (update.value !== undefined) {
                        result[key] = update.value;
                    }
                    continue;
                }
                break;
        }
    }
    return Result_1.ResultModule.ok(result);
};
exports.composeDownOperation = composeDownOperation;
const transform = ({ first, second, prevState, nextState, innerTransform, }) => {
    if (second === undefined) {
        return Result_1.ResultModule.ok(undefined);
    }
    const result = {};
    for (const [key, operation] of utils_1.recordToMap(second)) {
        const innerPrevState = prevState[key];
        const innerNextState = nextState[key];
        const innerFirst = first == null ? undefined : first[key];
        const transformed = innerTransform({
            first: innerFirst,
            second: operation,
            prevState: innerPrevState,
            nextState: innerNextState,
            key,
        });
        if (transformed.isError) {
            return transformed;
        }
        const transformedUpdate = transformed.value;
        if (transformedUpdate !== undefined) {
            result[key] = transformedUpdate;
        }
    }
    return Result_1.ResultModule.ok(result);
};
exports.transform = transform;
const diff = ({ prev, next, innerDiff, }) => {
    const result = {};
    for (const [key, value] of Map_1.groupJoin(utils_1.recordToMap(prev), utils_1.recordToMap(next))) {
        let prev = undefined;
        let next = undefined;
        switch (value.type) {
            case Types_1.left:
                prev = value.left;
                break;
            case Types_1.right: {
                next = value.right;
                break;
            }
            case Types_1.both: {
                prev = value.left;
                next = value.right;
                break;
            }
        }
        const diffResult = innerDiff({ prev, next, key });
        if (diffResult === undefined) {
            continue;
        }
        result[key] = diffResult;
        continue;
    }
    return result;
};
exports.diff = diff;
const createParamTransformerFactory = (createdByMe) => ({
    composeLoose: ({ first, second }) => {
        const valueProps = {
            version: 1,
            isValuePrivate: ReplaceValueOperation.composeDownOperation(first.isValuePrivate, second.isValuePrivate),
            value: ReplaceValueOperation.composeDownOperation(first.value, second.value),
        };
        return Result_1.ResultModule.ok(valueProps);
    },
    restore: ({ nextState, downOperation }) => {
        var _a, _b;
        if (downOperation === undefined) {
            return Result_1.ResultModule.ok({ prevState: nextState, nextState, twoWayOperation: undefined });
        }
        const prevState = Object.assign({}, nextState);
        const twoWayOperation = { version: 1 };
        if (downOperation.isValuePrivate !== undefined) {
            prevState.isValuePrivate = downOperation.isValuePrivate.oldValue;
            twoWayOperation.isValuePrivate = Object.assign(Object.assign({}, downOperation.isValuePrivate), { newValue: nextState.isValuePrivate });
        }
        if (downOperation.value !== undefined) {
            prevState.value = (_a = downOperation.value.oldValue) !== null && _a !== void 0 ? _a : undefined;
            twoWayOperation.value = { oldValue: (_b = downOperation.value.oldValue) !== null && _b !== void 0 ? _b : undefined, newValue: nextState.value };
        }
        return Result_1.ResultModule.ok({ prevState, nextState, twoWayOperation });
    },
    transform: ({ prevState, currentState, clientOperation, serverOperation }) => {
        const twoWayOperation = { version: 1 };
        if (createdByMe) {
            twoWayOperation.isValuePrivate = ReplaceValueOperation.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.isValuePrivate,
                second: clientOperation.isValuePrivate,
                prevState: prevState.isValuePrivate,
            });
        }
        if (createdByMe || !currentState.isValuePrivate) {
            twoWayOperation.value = ReplaceValueOperation.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.value,
                second: clientOperation.value,
                prevState: prevState.value,
            });
        }
        if (utils_1.undefinedForAll(twoWayOperation)) {
            return Result_1.ResultModule.ok(undefined);
        }
        return Result_1.ResultModule.ok(Object.assign({}, twoWayOperation));
    },
    diff: ({ prevState, nextState }) => {
        const resultType = { version: 1 };
        if (prevState.isValuePrivate !== nextState.isValuePrivate) {
            resultType.isValuePrivate = { oldValue: prevState.isValuePrivate, newValue: nextState.isValuePrivate };
        }
        if (prevState.value !== nextState.value) {
            resultType.value = { oldValue: prevState.value, newValue: nextState.value };
        }
        if (utils_1.undefinedForAll(resultType)) {
            return undefined;
        }
        return Object.assign({}, resultType);
    },
    applyBack: ({ downOperation, nextState }) => {
        var _a;
        const result = Object.assign({}, nextState);
        if (downOperation.isValuePrivate !== undefined) {
            result.isValuePrivate = downOperation.isValuePrivate.oldValue;
        }
        if (downOperation.value !== undefined) {
            result.value = (_a = downOperation.value.oldValue) !== null && _a !== void 0 ? _a : undefined;
        }
        return Result_1.ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    createDefaultState: () => ({ version: 1, isValuePrivate: false, value: undefined }),
});
exports.createParamTransformerFactory = createParamTransformerFactory;
class ParamRecordTransformer {
    constructor(factory) {
        this.factory = factory;
    }
    composeLoose(params) {
        return exports.composeDownOperation(Object.assign(Object.assign({}, params), { innerCompose: params => this.factory.composeLoose(params) }));
    }
    restore({ downOperation, nextState, }) {
        return exports.restore({
            nextState,
            downOperation,
            innerRestore: params => {
                const result = this.factory.restore(params);
                if (result.isError) {
                    return result;
                }
                if (result.value.twoWayOperation === undefined) {
                    return Result_1.ResultModule.ok(undefined);
                }
                return Result_1.ResultModule.ok({
                    prevState: result.value.prevState,
                    twoWayOperation: result.value.twoWayOperation,
                });
            },
        });
    }
    transform({ prevState, currentState, serverOperation, clientOperation, }) {
        return exports.transform({
            first: serverOperation,
            second: clientOperation,
            prevState: prevState,
            nextState: currentState,
            innerTransform: params => {
                var _a, _b;
                return this.factory.transform({
                    key: params.key,
                    prevState: (_a = params.prevState) !== null && _a !== void 0 ? _a : this.factory.createDefaultState({ key: params.key }),
                    currentState: (_b = params.nextState) !== null && _b !== void 0 ? _b : this.factory.createDefaultState({ key: params.key }),
                    serverOperation: params.first,
                    clientOperation: params.second,
                });
            },
        });
    }
    restoreAndTransform({ currentState, serverOperation, clientOperation, }) {
        const restoreResult = this.restore({
            nextState: currentState,
            downOperation: serverOperation,
        });
        if (restoreResult.isError) {
            return restoreResult;
        }
        return this.transform({
            serverOperation: restoreResult.value.twoWayOperation,
            clientOperation,
            prevState: restoreResult.value.prevState,
            currentState,
        });
    }
    diff({ prevState, nextState, }) {
        return exports.diff({
            prev: prevState,
            next: nextState,
            innerDiff: ({ prev, next, key }) => this.factory.diff({
                prevState: prev !== null && prev !== void 0 ? prev : this.factory.createDefaultState({ key }),
                nextState: next !== null && next !== void 0 ? next : this.factory.createDefaultState({ key }),
                key,
            }),
        });
    }
    applyBack({ downOperation, nextState, }) {
        return exports.applyBack({
            nextState,
            downOperation,
            innerApplyBack: params => this.factory.applyBack(params),
        });
    }
    toServerState({ clientState, }) {
        return utils_1.recordCompact(clientState, (value, key) => {
            return this.factory.toServerState({ key, clientState: value });
        });
    }
}
exports.ParamRecordTransformer = ParamRecordTransformer;
