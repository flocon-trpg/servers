"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diff = exports.clientTransform = exports.serverTransform = exports.compose = exports.applyBack = exports.apply = exports.restore = exports.toClientOperation = void 0;
const Map_1 = require("../../../Map");
const Result_1 = require("../../../Result");
const Types_1 = require("../../../Types");
const utils_1 = require("../../../utils");
const toClientOperation = ({ diff, prevState, nextState, toClientOperation, defaultState, }) => {
    const result = {};
    utils_1.recordForEach(diff, (value, key) => {
        var _a, _b;
        const prevStateElement = (_a = prevState[key]) !== null && _a !== void 0 ? _a : defaultState;
        const nextStateElement = (_b = nextState[key]) !== null && _b !== void 0 ? _b : defaultState;
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
const apply = ({ prevState, operation, innerApply, defaultState }) => {
    var _a;
    if (operation == null) {
        return Result_1.ResultModule.ok(prevState);
    }
    const nextState = Object.assign({}, prevState);
    for (const [key, value] of utils_1.recordToMap(operation)) {
        const prevStateElement = (_a = prevState[key]) !== null && _a !== void 0 ? _a : defaultState;
        const newValue = innerApply({ operation: value, prevState: prevStateElement, key });
        if (newValue.isError) {
            return newValue;
        }
        nextState[key] = newValue.value;
        break;
    }
    return Result_1.ResultModule.ok(nextState);
};
exports.apply = apply;
const applyBack = ({ nextState, operation, innerApplyBack, defaultState }) => {
    var _a;
    if (operation == null) {
        return Result_1.ResultModule.ok(nextState);
    }
    const prevState = Object.assign({}, nextState);
    for (const [key, value] of utils_1.recordToMap(operation)) {
        const nextStateElement = (_a = nextState[key]) !== null && _a !== void 0 ? _a : defaultState;
        const oldValue = innerApplyBack({ operation: value, nextState: nextStateElement, key });
        if (oldValue.isError) {
            return oldValue;
        }
        prevState[key] = oldValue.value;
        break;
    }
    return Result_1.ResultModule.ok(prevState);
};
exports.applyBack = applyBack;
const compose = ({ first, second, innerCompose }) => {
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
exports.compose = compose;
const serverTransform = ({ first, second, prevState, nextState, innerTransform, defaultState, }) => {
    var _a, _b;
    if (second === undefined) {
        return Result_1.ResultModule.ok(undefined);
    }
    const result = {};
    for (const [key, operation] of utils_1.recordToMap(second)) {
        const innerPrevState = (_a = prevState[key]) !== null && _a !== void 0 ? _a : defaultState;
        const innerNextState = (_b = nextState[key]) !== null && _b !== void 0 ? _b : defaultState;
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
exports.serverTransform = serverTransform;
const clientTransform = ({ first, second, innerTransform, }) => {
    if (first === undefined || second === undefined) {
        return Result_1.ResultModule.ok({
            firstPrime: first,
            secondPrime: second,
        });
    }
    const firstPrime = new Map();
    const secondPrime = new Map();
    let error = undefined;
    Map_1.groupJoin(utils_1.recordToMap(first), utils_1.recordToMap(second)).forEach((group, key) => {
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
                const xform = innerTransform({ first: group.left, second: group.right });
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
        firstPrime: firstPrime.size === 0 ? undefined : utils_1.mapToRecord(firstPrime),
        secondPrime: secondPrime.size === 0 ? undefined : utils_1.mapToRecord(secondPrime),
    });
};
exports.clientTransform = clientTransform;
const diff = ({ prevState, nextState, innerDiff, }) => {
    const result = {};
    for (const [key, value] of Map_1.groupJoin(utils_1.recordToMap(prevState), utils_1.recordToMap(nextState))) {
        let prevState = undefined;
        let nextState = undefined;
        switch (value.type) {
            case Types_1.left:
                prevState = value.left;
                break;
            case Types_1.right: {
                nextState = value.right;
                break;
            }
            case Types_1.both: {
                prevState = value.left;
                nextState = value.right;
                break;
            }
        }
        const diffResult = innerDiff({ prevState, nextState, key });
        if (diffResult === undefined) {
            continue;
        }
        result[key] = diffResult;
        continue;
    }
    return result;
};
exports.diff = diff;
