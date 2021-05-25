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
exports.diff = exports.clientTransform = exports.serverTransform = exports.composeDownOperation = exports.composeUpOperation = exports.applyBack = exports.apply = exports.restore = exports.toClientOperation = exports.toClientState = exports.dualKeyMapUpOperationFactory = exports.dualKeyMapDownOperationFactory = exports.dualKeyMapStateFactory = void 0;
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
const applyBack = ({ nextState, operation: operation, innerApplyBack }) => {
    if (operation == null) {
        return Result_1.ResultModule.ok(nextState);
    }
    const prevState = DualKeyMap_1.DualKeyMap.ofRecord(nextState);
    for (const [key, value] of DualKeyMap_1.DualKeyMap.ofRecord(operation)) {
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
                const oldValue = innerApplyBack({ key, operation: value.update, state: nextStateElement });
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
const composeUpOperation = ({ first, second, innerApply, innerCompose }) => {
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
                switch (groupJoined.right.type) {
                    case 'replace':
                        switch (groupJoined.left.type) {
                            case 'replace': {
                                const right = groupJoined.right.replace.newValue;
                                result.set(key, { type: 'replace', replace: { newValue: right } });
                                continue;
                            }
                        }
                        result.set(key, { type: 'replace', replace: groupJoined.right.replace });
                        continue;
                    case 'update':
                        switch (groupJoined.left.type) {
                            case 'replace': {
                                if (groupJoined.left.replace.newValue === undefined) {
                                    return Result_1.ResultModule.error(`second is update, but first.newValue is null. the key is "${key}".`);
                                }
                                const secondNewValue = innerApply({ key, operation: groupJoined.right.update, state: groupJoined.left.replace.newValue });
                                if (secondNewValue.isError) {
                                    return secondNewValue;
                                }
                                result.set(key, { type: 'replace', replace: { newValue: secondNewValue.value } });
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
exports.composeUpOperation = composeUpOperation;
const composeDownOperation = ({ first, second, innerApplyBack, innerCompose }) => {
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
                                const firstOldValue = innerApplyBack({ key, operation: groupJoined.left.update, state: groupJoined.right.replace.oldValue });
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
exports.composeDownOperation = composeDownOperation;
const serverTransform = ({ first, second, prevState, nextState, innerTransform, toServerState, cancellationPolicy, }) => {
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
                    if (cancellationPolicy.cancelRemove) {
                        if (cancellationPolicy.cancelRemove({ key, nextState: innerNextState })) {
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
                if (cancellationPolicy.cancelCreate) {
                    if (cancellationPolicy.cancelCreate({ key })) {
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
                if (cancellationPolicy.cancelUpdate) {
                    if (cancellationPolicy.cancelUpdate({ key, prevState: innerPrevState, nextState: innerNextState })) {
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
exports.serverTransform = serverTransform;
const transformElement = ({ first, second, innerTransform, innerDiff }) => {
    switch (first.type) {
        case recordOperationElement_1.replace:
            switch (second.type) {
                case recordOperationElement_1.replace:
                    if (first.replace.newValue !== undefined && second.replace.newValue !== undefined) {
                        const diffResult = innerDiff({ nextState: first.replace.newValue, prevState: second.replace.newValue });
                        if (diffResult === undefined) {
                            return Result_1.ResultModule.ok({
                                firstPrime: undefined,
                                secondPrime: undefined
                            });
                        }
                        return Result_1.ResultModule.ok({
                            firstPrime: { type: recordOperationElement_1.update, update: diffResult },
                            secondPrime: undefined
                        });
                    }
                    return Result_1.ResultModule.ok({
                        firstPrime: undefined,
                        secondPrime: undefined
                    });
                case recordOperationElement_1.update:
                    return Result_1.ResultModule.ok({
                        firstPrime: first,
                        secondPrime: undefined,
                    });
            }
            break;
        case recordOperationElement_1.update:
            switch (second.type) {
                case recordOperationElement_1.replace: {
                    if (second.replace.newValue !== undefined) {
                        throw 'Tried to add an element, but already exists another value.';
                    }
                    return Result_1.ResultModule.ok({
                        firstPrime: undefined,
                        secondPrime: {
                            type: recordOperationElement_1.replace,
                            replace: {
                                newValue: undefined,
                            },
                        },
                    });
                }
                case recordOperationElement_1.update: {
                    const xform = innerTransform({ first: first.update, second: second.update });
                    if (xform.isError) {
                        return xform;
                    }
                    return Result_1.ResultModule.ok({
                        firstPrime: xform.value.firstPrime == null ? undefined : {
                            type: recordOperationElement_1.update,
                            update: xform.value.firstPrime,
                        },
                        secondPrime: xform.value.secondPrime == null ? undefined : {
                            type: recordOperationElement_1.update,
                            update: xform.value.secondPrime,
                        },
                    });
                }
            }
            break;
    }
};
const clientTransform = ({ first, second, innerTransform, innerDiff, }) => {
    if (first == null || second == null) {
        return Result_1.ResultModule.ok({
            firstPrime: first,
            secondPrime: second,
        });
    }
    const firstPrime = new DualKeyMap_1.DualKeyMap();
    const secondPrime = new DualKeyMap_1.DualKeyMap();
    let error = undefined;
    DualKeyMap_1.groupJoin(utils_1.recordToDualKeyMap(first), utils_1.recordToDualKeyMap(second)).forEach((group, key) => {
        if (error != null) {
            return;
        }
        switch (group.type) {
            case Types_1.left: {
                firstPrime.set(key, group.left);
                return;
            }
            case Types_1.right: {
                secondPrime.set(key, group.right);
                return;
            }
            case Types_1.both: {
                const xform = transformElement({ first: group.left, second: group.right, innerTransform, innerDiff });
                if (xform.isError) {
                    error = { error: xform.error };
                    return;
                }
                if (xform.value.firstPrime !== undefined) {
                    firstPrime.set(key, xform.value.firstPrime);
                }
                if (xform.value.secondPrime !== undefined) {
                    secondPrime.set(key, xform.value.secondPrime);
                }
                return;
            }
        }
    });
    if (error != null) {
        return Result_1.ResultModule.error(error.error);
    }
    return Result_1.ResultModule.ok({
        firstPrime: firstPrime.isEmpty ? undefined : firstPrime.toStringRecord(x => x, x => x),
        secondPrime: secondPrime.isEmpty ? undefined : secondPrime.toStringRecord(x => x, x => x),
    });
};
exports.clientTransform = clientTransform;
const diff = ({ prevState, nextState, innerDiff, }) => {
    const result = new DualKeyMap_1.DualKeyMap();
    for (const [key, value] of DualKeyMap_1.groupJoin(DualKeyMap_1.DualKeyMap.ofRecord(prevState), DualKeyMap_1.DualKeyMap.ofRecord(nextState))) {
        switch (value.type) {
            case Types_1.left:
                result.set(key, { type: recordOperationElement_1.replace, replace: { oldValue: value.left, newValue: undefined } });
                continue;
            case Types_1.right: {
                result.set(key, { type: recordOperationElement_1.replace, replace: { oldValue: undefined, newValue: value.right } });
                continue;
            }
            case Types_1.both: {
                const diffResult = innerDiff({ key, prevState: value.left, nextState: value.right });
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
