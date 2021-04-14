"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diff = exports.apply = exports.transform = exports.composeDownOperationLoose = exports.applyBack = exports.restore = exports.toGraphQLWithState = exports.toGraphQL = exports.createUpOperationFromGraphQL = exports.createDownOperationFromMikroORM = exports.update = exports.replace = void 0;
const Types_1 = require("../@shared/Types");
const Result_1 = require("../@shared/Result");
const DualKeyMap_1 = require("../@shared/DualKeyMap");
exports.replace = 'replace';
exports.update = 'update';
const createDownOperationFromMikroORM = async ({ toDualKey, add, remove, update, getState, getOperation, }) => {
    const result = new DualKeyMap_1.DualKeyMap();
    for (const a of await add.loadItems()) {
        const key = toDualKey(a);
        if (key.isError) {
            return key;
        }
        result.set(key.value, { type: 'replace', operation: { oldValue: undefined } });
    }
    for (const r of await remove.loadItems()) {
        const key = toDualKey(r);
        if (key.isError) {
            return key;
        }
        if (result.has(key.value)) {
            return Result_1.ResultModule.error(`${key.value} exists on add`);
        }
        const converted = await getState(r);
        if (converted.isError) {
            return converted;
        }
        result.set(key.value, { type: 'replace', operation: { oldValue: converted.value } });
    }
    for (const u of await update.loadItems()) {
        const key = toDualKey(u);
        if (key.isError) {
            return key;
        }
        if (result.has(key.value)) {
            return Result_1.ResultModule.error(`${key.value} exists on add or remove`);
        }
        const converted = await getOperation(u);
        if (converted.isError) {
            return converted;
        }
        if (converted.value === undefined) {
            continue;
        }
        result.set(key.value, { type: 'update', operation: converted.value });
    }
    return Result_1.ResultModule.ok(result);
};
exports.createDownOperationFromMikroORM = createDownOperationFromMikroORM;
const createUpOperationFromGraphQL = ({ replace, update, getState, getOperation, createDualKey, }) => {
    const result = new DualKeyMap_1.DualKeyMap();
    for (const operation of replace) {
        const key = createDualKey(operation);
        if (key.isError) {
            return key;
        }
        if (result.has(key.value)) {
            return Result_1.ResultModule.error(`${key.value} is duplicate`);
        }
        result.set(key.value, { type: 'replace', operation: { newValue: getState(operation) } });
    }
    for (const operation of update) {
        const key = createDualKey(operation);
        if (key.isError) {
            return key;
        }
        if (result.has(key.value)) {
            return Result_1.ResultModule.error(`${key.value} is duplicate`);
        }
        const getOperationResult = getOperation(operation);
        if (getOperationResult.isError) {
            return getOperationResult;
        }
        result.set(key.value, { type: 'update', operation: getOperationResult.value });
    }
    return Result_1.ResultModule.ok(result);
};
exports.createUpOperationFromGraphQL = createUpOperationFromGraphQL;
const toGraphQL = ({ source, toReplaceOperation, toUpdateOperation, }) => {
    const replaces = [];
    source.forEach((serverOperation, key) => {
        if (serverOperation.type !== exports.replace) {
            return;
        }
        const { oldValue, newValue } = serverOperation.operation;
        const toPush = toReplaceOperation({ prevState: oldValue, nextState: newValue, key });
        if (toPush == null) {
            return;
        }
        replaces.push(toPush);
    });
    const updates = [];
    source.forEach((serverOperation, key) => {
        if (serverOperation.type !== exports.update) {
            return;
        }
        const newValueResult = toUpdateOperation({
            operation: serverOperation.operation,
            key,
        });
        updates.push(newValueResult);
    });
    return { replace: replaces, update: updates };
};
exports.toGraphQL = toGraphQL;
const toGraphQLWithState = ({ source, isPrivate, prevState, nextState, toReplaceOperation, toUpdateOperation, }) => {
    const replaces = [];
    source.forEach((serverOperation, key) => {
        if (serverOperation.type !== exports.replace) {
            return;
        }
        const { oldValue, newValue } = serverOperation.operation;
        if (oldValue === undefined || isPrivate(oldValue, key)) {
            if (newValue === undefined || isPrivate(newValue, key)) {
                return;
            }
            const toPush = toReplaceOperation({ nextState: newValue, key });
            if (toPush == null) {
                return;
            }
            replaces.push(toPush);
            return;
        }
        if (newValue === undefined || isPrivate(newValue, key)) {
            const toPush = toReplaceOperation({ prevState: oldValue, key });
            if (toPush == null) {
                return;
            }
            replaces.push(toPush);
            return;
        }
        const toPush = toReplaceOperation({ prevState: oldValue, nextState: newValue, key });
        if (toPush == null) {
            return;
        }
        replaces.push(toPush);
    });
    const updates = [];
    source.forEach((serverOperation, key) => {
        if (serverOperation.type !== exports.update) {
            return;
        }
        const prevStateElement = prevState.get(key);
        if (prevStateElement === undefined) {
            throw `tried to operate "${key}", but not found in prevState.`;
        }
        const nextStateElement = nextState.get(key);
        if (nextStateElement === undefined) {
            throw `tried to operate "${key}", but not found in nextState.`;
        }
        if (isPrivate(prevStateElement, key)) {
            if (isPrivate(nextStateElement, key)) {
                return;
            }
            const toPush = toReplaceOperation({ nextState: nextStateElement, key });
            if (toPush == null) {
                return;
            }
            replaces.push(toPush);
            return;
        }
        if (isPrivate(nextStateElement, key)) {
            const toPush = toReplaceOperation({ prevState: prevStateElement, key });
            if (toPush == null) {
                return;
            }
            replaces.push(toPush);
            return;
        }
        const clientOperation = toUpdateOperation({
            operation: serverOperation.operation,
            key,
            prevState: prevStateElement,
            nextState: nextStateElement,
        });
        if (clientOperation == null) {
            return;
        }
        updates.push(clientOperation);
    });
    return { replace: replaces, update: updates };
};
exports.toGraphQLWithState = toGraphQLWithState;
const restore = ({ nextState, downOperation, innerRestore, innerDiff }) => {
    const prevState = nextState.clone();
    const twoWayOperation = new DualKeyMap_1.DualKeyMap();
    for (const [key, value] of downOperation) {
        switch (value.type) {
            case 'replace': {
                const oldValue = value.operation.oldValue;
                const newValue = nextState.get(key);
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
                    twoWayOperation.set(key, { type: 'replace', operation: { oldValue, newValue } });
                    break;
                }
                if (newValue === undefined) {
                    twoWayOperation.set(key, { type: 'replace', operation: { oldValue, newValue } });
                    break;
                }
                const diff = innerDiff({ key, prevState: oldValue, nextState: newValue });
                if (diff !== undefined) {
                    twoWayOperation.set(key, { type: 'update', operation: diff });
                }
                break;
            }
            case 'update': {
                const nextCharacterState = nextState.get(key);
                if (nextCharacterState === undefined) {
                    return Result_1.ResultModule.error(`tried to update "${DualKeyMap_1.toJSONString(key)}", but nextState does not have such a key`);
                }
                const restored = innerRestore({ key, downOperation: value.operation, nextState: nextCharacterState });
                if (restored.isError) {
                    return restored;
                }
                prevState.set(key, restored.value.prevState);
                if (restored.value.twoWayOperation !== undefined) {
                    twoWayOperation.set(key, { type: 'update', operation: restored.value.twoWayOperation });
                }
                break;
            }
        }
    }
    return Result_1.ResultModule.ok({ prevState, twoWayOperation });
};
exports.restore = restore;
const applyBack = ({ nextState, downOperation, innerApplyBack }) => {
    const prevState = nextState.clone();
    for (const [key, value] of downOperation) {
        switch (value.type) {
            case 'replace': {
                if (value.operation.oldValue === undefined) {
                    prevState.delete(key);
                }
                else {
                    prevState.set(key, value.operation.oldValue);
                }
                break;
            }
            case 'update': {
                const nextCharacterState = nextState.get(key);
                if (nextCharacterState === undefined) {
                    return Result_1.ResultModule.error(`tried to update "${DualKeyMap_1.toJSONString(key)}", but nextState does not have such a key`);
                }
                const oldValue = innerApplyBack({ key, downOperation: value.operation, nextState: nextCharacterState });
                if (oldValue.isError) {
                    return oldValue;
                }
                prevState.set(key, oldValue.value);
                break;
            }
        }
    }
    return Result_1.ResultModule.ok(prevState);
};
exports.applyBack = applyBack;
const composeDownOperationLoose = ({ first, second, innerApplyBack, innerCompose }) => {
    const result = new DualKeyMap_1.DualKeyMap();
    for (const [key, groupJoined] of DualKeyMap_1.groupJoin(first, second)) {
        switch (groupJoined.type) {
            case Types_1.left:
                switch (groupJoined.left.type) {
                    case 'replace':
                        result.set(key, { type: 'replace', operation: groupJoined.left.operation });
                        continue;
                    case 'update':
                        result.set(key, { type: 'update', operation: groupJoined.left.operation });
                        continue;
                }
                break;
            case Types_1.right:
                switch (groupJoined.right.type) {
                    case 'replace':
                        result.set(key, { type: 'replace', operation: groupJoined.right.operation });
                        continue;
                    case 'update':
                        result.set(key, { type: 'update', operation: groupJoined.right.operation });
                        continue;
                }
                break;
            case Types_1.both:
                switch (groupJoined.left.type) {
                    case 'replace':
                        switch (groupJoined.right.type) {
                            case 'replace': {
                                const left = groupJoined.left.operation.oldValue;
                                result.set(key, { type: 'replace', operation: { oldValue: left } });
                                continue;
                            }
                        }
                        result.set(key, { type: 'replace', operation: groupJoined.left.operation });
                        continue;
                    case 'update':
                        switch (groupJoined.right.type) {
                            case 'replace': {
                                if (groupJoined.right.operation.oldValue === undefined) {
                                    return Result_1.ResultModule.error(`first is update, but second.oldValue is undefined. the key is "${key}".`);
                                }
                                const firstOldValue = innerApplyBack({ key, downOperation: groupJoined.left.operation, nextState: groupJoined.right.operation.oldValue });
                                if (firstOldValue.isError) {
                                    return firstOldValue;
                                }
                                result.set(key, { type: 'replace', operation: { oldValue: firstOldValue.value } });
                                continue;
                            }
                            case 'update': {
                                const update = innerCompose({ key, first: groupJoined.left.operation, second: groupJoined.right.operation });
                                if (update.isError) {
                                    return update;
                                }
                                if (update.value === undefined) {
                                    continue;
                                }
                                result.set(key, { type: 'update', operation: update.value });
                                continue;
                            }
                        }
                }
                break;
        }
    }
    return Result_1.ResultModule.ok(result);
};
exports.composeDownOperationLoose = composeDownOperationLoose;
const transform = ({ first, second, prevState, nextState, innerTransform, toServerState, protectedValuePolicy }) => {
    const result = new DualKeyMap_1.DualKeyMap();
    for (const [key, operation] of second) {
        switch (operation.type) {
            case exports.replace: {
                const innerPrevState = prevState.get(key);
                const innerNextState = nextState.get(key);
                if (operation.operation.newValue === undefined) {
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
                    result.set(key, { type: exports.replace, operation: { oldValue: innerNextState, newValue: undefined } });
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
                result.set(key, { type: exports.replace, operation: { oldValue: undefined, newValue: toServerState(operation.operation.newValue, key) } });
                break;
            }
            case exports.update: {
                const innerPrevState = prevState.get(key);
                const innerNextState = nextState.get(key);
                const innerFirst = first === null || first === void 0 ? void 0 : first.get(key);
                if (innerPrevState === undefined) {
                    return Result_1.ResultModule.error(`tried to update "${DualKeyMap_1.toJSONString(key)}", but not found.`);
                }
                if (innerNextState === undefined) {
                    break;
                }
                if (innerFirst !== undefined && innerFirst.type === exports.replace) {
                    break;
                }
                const transformed = innerTransform({
                    first: innerFirst === null || innerFirst === void 0 ? void 0 : innerFirst.operation,
                    second: operation.operation,
                    prevState: innerPrevState,
                    nextState: innerNextState,
                    key,
                });
                if (transformed.isError) {
                    return transformed;
                }
                const transformedUpdate = transformed.value;
                if (transformedUpdate !== undefined) {
                    result.set(key, { type: exports.update, operation: transformedUpdate });
                }
            }
        }
    }
    return Result_1.ResultModule.ok(result);
};
exports.transform = transform;
const apply = async (params) => {
    const stateAsStateMap = new DualKeyMap_1.DualKeyMap();
    (await params.state.loadItems()).forEach(s => {
        stateAsStateMap.set(params.toDualKey(s), s);
    });
    for (const [key, value] of DualKeyMap_1.groupJoin(stateAsStateMap, params.operation)) {
        switch (value.type) {
            case Types_1.left:
                continue;
            case Types_1.right: {
                if (value.right.type === exports.update) {
                    throw 'state == null && operation.type === update';
                }
                if (value.right.operation.newValue === undefined) {
                    throw 'state == null && operation.newValue === undefined';
                }
                const created = await params.create({ key, state: value.right.operation.newValue });
                if (created !== undefined) {
                    params.state.add(created);
                }
                continue;
            }
            case Types_1.both: {
                if (value.right.type === exports.update) {
                    await params.update({ key, state: value.left, operation: value.right.operation });
                    continue;
                }
                if (value.right.operation.newValue !== undefined) {
                    throw 'state != null && operation.newValue !== undefined';
                }
                const deleted = await params.delete({ key });
                if (deleted) {
                    params.state.remove(value.left);
                }
                continue;
            }
        }
    }
};
exports.apply = apply;
const diff = ({ prev, next, innerDiff, }) => {
    const result = new DualKeyMap_1.DualKeyMap();
    for (const [key, value] of DualKeyMap_1.groupJoin(prev, next)) {
        switch (value.type) {
            case Types_1.left:
                result.set(key, { type: exports.replace, operation: { oldValue: value.left, newValue: undefined } });
                continue;
            case Types_1.right: {
                result.set(key, { type: exports.replace, operation: { oldValue: undefined, newValue: value.right } });
                continue;
            }
            case Types_1.both: {
                const diffResult = innerDiff({ key, prev: value.left, next: value.right });
                if (diffResult === undefined) {
                    continue;
                }
                result.set(key, { type: exports.update, operation: diffResult });
                continue;
            }
        }
    }
    return result;
};
exports.diff = diff;
