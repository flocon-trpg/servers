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
exports.DualKeyRecordTransformer = exports.diff = exports.transform = exports.composeDownOperationLoose = exports.applyBack = exports.apply = exports.restore = exports.toClientOperation = exports.toClientState = exports.dualKeyMapUpOperationFactory = exports.dualKeyMapDownOperationFactory = exports.dualKeyMapStateFactory = void 0;
const t = __importStar(require("io-ts"));
const DualKeyMap_1 = require("../../../DualKeyMap");
const Result_1 = require("../../../Result");
const Types_1 = require("../../../Types");
const utils_1 = require("../../../utils");
const recordOperationElement_1 = require("./recordOperationElement");
const dualKeyMapStateFactory = (key1, key2, state) => t.record(key1, t.record(key2, state));
exports.dualKeyMapStateFactory = dualKeyMapStateFactory;
const dualKeyMapDownOperationFactory = (key1, key2, state, operation) => t.record(key1, t.record(key2, recordOperationElement_1.recordDownOperationElementFactory(state, operation)));
exports.dualKeyMapDownOperationFactory = dualKeyMapDownOperationFactory;
const dualKeyMapUpOperationFactory = (key1, key2, state, operation) => t.record(key1, t.record(key2, recordOperationElement_1.recordUpOperationElementFactory(state, operation)));
exports.dualKeyMapUpOperationFactory = dualKeyMapUpOperationFactory;
const toClientState = ({ serverState, isPrivate, toClientState, }) => {
    const result = new DualKeyMap_1.DualKeyMap();
    utils_1.dualKeyRecordForEach(serverState, (value, key) => {
        if (isPrivate(value, key)) {
            return;
        }
        result.set(key, toClientState({ state: value, key }));
    });
    return result.toStringRecord(x => x, x => x);
};
exports.toClientState = toClientState;
const toClientOperation = ({ diff, isPrivate, prevState, nextState, toClientState, toClientOperation, }) => {
    const result = new DualKeyMap_1.DualKeyMap();
    utils_1.dualKeyRecordForEach(diff, (value, key) => {
        if (value.type === recordOperationElement_1.replace) {
            const { oldValue, newValue } = value.replace;
            if (oldValue === undefined || isPrivate(oldValue, key)) {
                if (newValue === undefined || isPrivate(newValue, key)) {
                    return;
                }
            }
            if (newValue === undefined || isPrivate(newValue, key)) {
                result.set(key, {
                    type: recordOperationElement_1.replace,
                    replace: { newValue: undefined },
                });
                return;
            }
            const clientState = toClientState({ prevState: oldValue, nextState: newValue, key });
            result.set(key, {
                type: recordOperationElement_1.replace,
                replace: { newValue: clientState },
            });
            return;
        }
        const prevStateElement = utils_1.dualKeyRecordFind(prevState, key);
        if (prevStateElement === undefined) {
            throw `tried to operate "${key}", but not found in prevState.`;
        }
        const nextStateElement = utils_1.dualKeyRecordFind(nextState, key);
        if (nextStateElement === undefined) {
            throw `tried to operate "${key}", but not found in nextState.`;
        }
        if (isPrivate(prevStateElement, key)) {
            if (isPrivate(nextStateElement, key)) {
                return;
            }
            result.set(key, {
                type: recordOperationElement_1.replace,
                replace: {
                    newValue: toClientState({ prevState: prevStateElement, nextState: nextStateElement, key }),
                }
            });
            return;
        }
        if (isPrivate(nextStateElement, key)) {
            result.set(key, {
                type: recordOperationElement_1.replace,
                replace: {
                    newValue: undefined,
                }
            });
            return;
        }
        const operation = toClientOperation({ diff: value.update, key, prevState: prevStateElement, nextState: nextStateElement });
        if (operation != null) {
            result.set(key, {
                type: recordOperationElement_1.update,
                update: operation,
            });
        }
    });
    return result.toStringRecord(x => x, x => x);
};
exports.toClientOperation = toClientOperation;
const restore = ({ nextState, downOperation, innerRestore, innerDiff }) => {
    if (downOperation == null) {
        return Result_1.ResultModule.ok({
            prevState: nextState,
            twoWayOperation: undefined,
        });
    }
    const prevState = DualKeyMap_1.DualKeyMap.ofRecord(nextState);
    const twoWayOperation = new DualKeyMap_1.DualKeyMap();
    for (const [key, value] of DualKeyMap_1.DualKeyMap.ofRecord(downOperation)) {
        switch (value.type) {
            case 'replace': {
                const oldValue = value.replace.oldValue;
                const newValue = utils_1.dualKeyRecordFind(nextState, key);
                if (oldValue === undefined) {
                    prevState.delete(key);
                }
                else {
                    prevState.set(key, oldValue);
                }
                if (oldValue === undefined) {
                    if (newValue === undefined) {
                        break;
                    }
                    twoWayOperation.set(key, { type: 'replace', replace: { oldValue, newValue } });
                    break;
                }
                if (newValue === undefined) {
                    twoWayOperation.set(key, { type: 'replace', replace: { oldValue, newValue: undefined } });
                    break;
                }
                const diff = innerDiff({ key, prevState: oldValue, nextState: newValue });
                if (diff !== undefined) {
                    twoWayOperation.set(key, { type: 'update', update: diff });
                }
                break;
            }
            case 'update': {
                const nextStateElement = utils_1.dualKeyRecordFind(nextState, key);
                if (nextStateElement === undefined) {
                    return Result_1.ResultModule.error(`tried to update "${DualKeyMap_1.toJSONString(key)}", but nextState does not have such a key`);
                }
                const restored = innerRestore({ key, downOperation: value.update, nextState: nextStateElement });
                if (restored.isError) {
                    return restored;
                }
                prevState.set(key, restored.value.prevState);
                if (restored.value.twoWayOperation !== undefined) {
                    twoWayOperation.set(key, { type: 'update', update: restored.value.twoWayOperation });
                }
                break;
            }
        }
    }
    return Result_1.ResultModule.ok({
        prevState: prevState.toStringRecord(x => x, x => x),
        twoWayOperation: twoWayOperation.toStringRecord(x => x, x => x)
    });
};
exports.restore = restore;
const apply = ({ prevState, operation, innerApply }) => {
    if (operation == null) {
        return Result_1.ResultModule.ok(prevState);
    }
    const nextState = DualKeyMap_1.DualKeyMap.ofRecord(prevState);
    for (const [key, value] of DualKeyMap_1.DualKeyMap.ofRecord(operation)) {
        switch (value.type) {
            case 'replace': {
                if (value.replace.newValue === undefined) {
                    nextState.delete(key);
                }
                else {
                    nextState.set(key, value.replace.newValue);
                }
                break;
            }
            case 'update': {
                const prevStateElement = utils_1.dualKeyRecordFind(prevState, key);
                if (prevStateElement === undefined) {
                    return Result_1.ResultModule.error(`tried to update "${DualKeyMap_1.toJSONString(key)}", but prevState does not have such a key`);
                }
                const newValue = innerApply({ key, operation: value.update, prevState: prevStateElement });
                if (newValue.isError) {
                    return newValue;
                }
                nextState.set(key, newValue.value);
                break;
            }
        }
    }
    return Result_1.ResultModule.ok(nextState.toStringRecord(x => x, x => x));
};
exports.apply = apply;
const applyBack = ({ nextState, downOperation, innerApplyBack }) => {
    if (downOperation == null) {
        return Result_1.ResultModule.ok(nextState);
    }
    const prevState = DualKeyMap_1.DualKeyMap.ofRecord(nextState);
    for (const [key, value] of DualKeyMap_1.DualKeyMap.ofRecord(downOperation)) {
        switch (value.type) {
            case 'replace': {
                if (value.replace.oldValue === undefined) {
                    prevState.delete(key);
                }
                else {
                    prevState.set(key, value.replace.oldValue);
                }
                break;
            }
            case 'update': {
                const nextStateElement = utils_1.dualKeyRecordFind(nextState, key);
                if (nextStateElement === undefined) {
                    return Result_1.ResultModule.error(`tried to update "${DualKeyMap_1.toJSONString(key)}", but nextState does not have such a key`);
                }
                const oldValue = innerApplyBack({ key, downOperation: value.update, nextState: nextStateElement });
                if (oldValue.isError) {
                    return oldValue;
                }
                prevState.set(key, oldValue.value);
                break;
            }
        }
    }
    return Result_1.ResultModule.ok(prevState.toStringRecord(x => x, x => x));
};
exports.applyBack = applyBack;
const composeDownOperationLoose = ({ first, second, innerApplyBack, innerCompose }) => {
    if (first == null) {
        return Result_1.ResultModule.ok(second);
    }
    if (second == null) {
        return Result_1.ResultModule.ok(first);
    }
    const result = new DualKeyMap_1.DualKeyMap();
    for (const [key, groupJoined] of DualKeyMap_1.groupJoin(DualKeyMap_1.DualKeyMap.ofRecord(first), DualKeyMap_1.DualKeyMap.ofRecord(second))) {
        switch (groupJoined.type) {
            case Types_1.left:
                switch (groupJoined.left.type) {
                    case 'replace':
                        result.set(key, { type: 'replace', replace: groupJoined.left.replace });
                        continue;
                    case 'update':
                        result.set(key, { type: 'update', update: groupJoined.left.update });
                        continue;
                }
                break;
            case Types_1.right:
                switch (groupJoined.right.type) {
                    case 'replace':
                        result.set(key, { type: 'replace', replace: groupJoined.right.replace });
                        continue;
                    case 'update':
                        result.set(key, { type: 'update', update: groupJoined.right.update });
                        continue;
                }
                break;
            case Types_1.both:
                switch (groupJoined.left.type) {
                    case 'replace':
                        switch (groupJoined.right.type) {
                            case 'replace': {
                                const left = groupJoined.left.replace.oldValue;
                                result.set(key, { type: 'replace', replace: { oldValue: left } });
                                continue;
                            }
                        }
                        result.set(key, { type: 'replace', replace: groupJoined.left.replace });
                        continue;
                    case 'update':
                        switch (groupJoined.right.type) {
                            case 'replace': {
                                if (groupJoined.right.replace.oldValue === undefined) {
                                    return Result_1.ResultModule.error(`first is update, but second.oldValue is null. the key is "${key}".`);
                                }
                                const firstOldValue = innerApplyBack({ key, downOperation: groupJoined.left.update, nextState: groupJoined.right.replace.oldValue });
                                if (firstOldValue.isError) {
                                    return firstOldValue;
                                }
                                result.set(key, { type: 'replace', replace: { oldValue: firstOldValue.value } });
                                continue;
                            }
                            case 'update': {
                                const update = innerCompose({ key, first: groupJoined.left.update, second: groupJoined.right.update });
                                if (update.isError) {
                                    return update;
                                }
                                if (update.value === undefined) {
                                    continue;
                                }
                                result.set(key, { type: 'update', update: update.value });
                                continue;
                            }
                        }
                }
                break;
        }
    }
    return Result_1.ResultModule.ok(result.toStringRecord(x => x, x => x));
};
exports.composeDownOperationLoose = composeDownOperationLoose;
const transform = ({ first, second, prevState, nextState, innerTransform, toServerState, protectedValuePolicy }) => {
    if (second === undefined) {
        return Result_1.ResultModule.ok(undefined);
    }
    const result = new DualKeyMap_1.DualKeyMap();
    for (const [key, operation] of DualKeyMap_1.DualKeyMap.ofRecord(second)) {
        switch (operation.type) {
            case recordOperationElement_1.replace: {
                const innerPrevState = utils_1.dualKeyRecordFind(prevState, key);
                const innerNextState = utils_1.dualKeyRecordFind(nextState, key);
                if (operation.replace.newValue === undefined) {
                    if (innerPrevState === undefined) {
                        return Result_1.ResultModule.error(`"${DualKeyMap_1.dualKeyToString(key)}" was not found at requested revision. It is not allowed to try to remove non-existing element.`);
                    }
                    if (innerNextState === undefined) {
                        break;
                    }
                    if (protectedValuePolicy.cancelRemove) {
                        if (protectedValuePolicy.cancelRemove({ key, nextState: innerNextState })) {
                            break;
                        }
                    }
                    result.set(key, { type: recordOperationElement_1.replace, replace: { oldValue: innerNextState, newValue: undefined } });
                    break;
                }
                if (innerPrevState !== undefined) {
                    return Result_1.ResultModule.error(`"${key}" was found at requested revision. When adding a state, old value must be empty.`);
                }
                if (innerNextState !== undefined) {
                    break;
                }
                if (protectedValuePolicy.cancelCreate) {
                    if (protectedValuePolicy.cancelCreate({ key })) {
                        break;
                    }
                }
                result.set(key, { type: recordOperationElement_1.replace, replace: { oldValue: undefined, newValue: toServerState(operation.replace.newValue, key) } });
                break;
            }
            case recordOperationElement_1.update: {
                const innerPrevState = utils_1.dualKeyRecordFind(prevState, key);
                const innerNextState = utils_1.dualKeyRecordFind(nextState, key);
                const innerFirst = utils_1.dualKeyRecordFind(first !== null && first !== void 0 ? first : {}, key);
                if (innerPrevState === undefined) {
                    return Result_1.ResultModule.error(`tried to update "${DualKeyMap_1.toJSONString(key)}", but not found.`);
                }
                if (innerNextState === undefined) {
                    break;
                }
                if (innerFirst !== undefined && innerFirst.type === recordOperationElement_1.replace) {
                    break;
                }
                if (protectedValuePolicy.cancelUpdate) {
                    if (protectedValuePolicy.cancelUpdate({ key, prevState: innerPrevState, nextState: innerNextState })) {
                        break;
                    }
                }
                const transformed = innerTransform({
                    first: innerFirst === null || innerFirst === void 0 ? void 0 : innerFirst.update,
                    second: operation.update,
                    prevState: innerPrevState,
                    nextState: innerNextState,
                    key,
                });
                if (transformed.isError) {
                    return transformed;
                }
                const transformedUpdate = transformed.value;
                if (transformedUpdate !== undefined) {
                    result.set(key, { type: recordOperationElement_1.update, update: transformedUpdate });
                }
            }
        }
    }
    return Result_1.ResultModule.ok(result.toStringRecord(x => x, x => x));
};
exports.transform = transform;
const diff = ({ prev, next, innerDiff, }) => {
    const result = new DualKeyMap_1.DualKeyMap();
    for (const [key, value] of DualKeyMap_1.groupJoin(DualKeyMap_1.DualKeyMap.ofRecord(prev), DualKeyMap_1.DualKeyMap.ofRecord(next))) {
        switch (value.type) {
            case Types_1.left:
                result.set(key, { type: recordOperationElement_1.replace, replace: { oldValue: value.left, newValue: undefined } });
                continue;
            case Types_1.right: {
                result.set(key, { type: recordOperationElement_1.replace, replace: { oldValue: undefined, newValue: value.right } });
                continue;
            }
            case Types_1.both: {
                const diffResult = innerDiff({ key, prev: value.left, next: value.right });
                if (diffResult === undefined) {
                    continue;
                }
                result.set(key, { type: recordOperationElement_1.update, update: diffResult });
                continue;
            }
        }
    }
    return result.toStringRecord(x => x, x => x);
};
exports.diff = diff;
class DualKeyRecordTransformer {
    constructor(factory) {
        this.factory = factory;
    }
    composeLoose(params) {
        return exports.composeDownOperationLoose(Object.assign(Object.assign({}, params), { innerApplyBack: params => this.factory.applyBack(params), innerCompose: params => this.factory.composeLoose(params) }));
    }
    restore({ downOperation, nextState, }) {
        return exports.restore({
            nextState,
            downOperation,
            innerRestore: params => this.factory.restore(params),
            innerDiff: params => this.factory.diff(params),
        });
    }
    transform({ prevState, currentState, serverOperation, clientOperation, }) {
        return exports.transform({
            first: serverOperation,
            second: clientOperation,
            prevState: prevState,
            nextState: currentState,
            innerTransform: params => this.factory.transform({
                key: params.key,
                prevState: params.prevState,
                currentState: params.nextState,
                serverOperation: params.first,
                clientOperation: params.second,
            }),
            toServerState: (state, key) => this.factory.toServerState({
                key,
                clientState: state,
            }),
            protectedValuePolicy: this.factory.protectedValuePolicy,
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
                prevState: prev,
                nextState: next,
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
        return DualKeyMap_1.DualKeyMap.ofRecord(clientState).map((value, key) => this.factory.toServerState({ key, clientState: value })).toStringRecord(x => x, x => x);
    }
}
exports.DualKeyRecordTransformer = DualKeyRecordTransformer;
