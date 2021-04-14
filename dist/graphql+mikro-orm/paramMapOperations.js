"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diff = exports.apply = exports.transform = exports.composeDownOperation = exports.applyBack = exports.restore = exports.toGraphQLWithState = exports.toGraphQL = exports.createUpOperationFromGraphQL = exports.createDownOperationFromMikroORM = void 0;
const Map_1 = require("../@shared/Map");
const Result_1 = require("../@shared/Result");
const Types_1 = require("../@shared/Types");
const createDownOperationFromMikroORM = async ({ toKey, update, getOperation, }) => {
    const result = new Map();
    for (const u of await update.loadItems()) {
        const key = toKey(u);
        if (key.isError) {
            return key;
        }
        const converted = await getOperation(u);
        if (converted.isError) {
            return converted;
        }
        result.set(key.value, converted.value);
    }
    return Result_1.ResultModule.ok(result);
};
exports.createDownOperationFromMikroORM = createDownOperationFromMikroORM;
const createUpOperationFromGraphQL = ({ update, getOperation, createKey, }) => {
    const result = new Map();
    for (const operation of update) {
        const key = createKey(operation);
        if (key.isError) {
            return key;
        }
        result.set(key.value, getOperation(operation));
    }
    return Result_1.ResultModule.ok(result);
};
exports.createUpOperationFromGraphQL = createUpOperationFromGraphQL;
const toGraphQL = ({ source, toUpdateOperation, }) => {
    const updates = [];
    source.forEach((serverOperation, key) => {
        const newValueResult = toUpdateOperation({
            operation: serverOperation,
            key,
        });
        updates.push(newValueResult);
    });
    return updates;
};
exports.toGraphQL = toGraphQL;
const toGraphQLWithState = ({ source, prevState, nextState, toUpdateOperation, defaultState, }) => {
    const updates = [];
    source.forEach((serverOperation, key) => {
        let prevStateElement = prevState.get(key);
        if (prevStateElement === undefined) {
            prevStateElement = defaultState;
        }
        let nextStateElement = nextState.get(key);
        if (nextStateElement === undefined) {
            nextStateElement = defaultState;
        }
        const clientOperation = toUpdateOperation({
            operation: serverOperation,
            key,
            prevState: prevStateElement,
            nextState: nextStateElement,
        });
        if (clientOperation == null) {
            return;
        }
        updates.push(clientOperation);
    });
    return updates;
};
exports.toGraphQLWithState = toGraphQLWithState;
const restore = ({ nextState, downOperation, innerRestore, }) => {
    const prevState = new Map(nextState);
    const twoWayOperation = new Map();
    for (const [key, value] of downOperation) {
        const nextCharacterState = nextState.get(key);
        if (nextCharacterState === undefined) {
            return Result_1.ResultModule.error(`tried to update "${key}", but nextState does not have such a key`);
        }
        const restored = innerRestore({ downOperation: value, nextState: nextCharacterState, key });
        if (restored.isError) {
            return restored;
        }
        if (restored.value === undefined) {
            continue;
        }
        prevState.set(key, restored.value.prevState);
        if (restored.value.twoWayOperation !== undefined) {
            twoWayOperation.set(key, restored.value.twoWayOperation);
        }
        break;
    }
    return Result_1.ResultModule.ok({ prevState, twoWayOperation });
};
exports.restore = restore;
const applyBack = ({ nextState, downOperation, innerApplyBack }) => {
    const prevState = new Map(nextState);
    for (const [key, value] of downOperation) {
        const nextCharacterState = nextState.get(key);
        if (nextCharacterState === undefined) {
            return Result_1.ResultModule.error(`tried to update "${key}", but nextState does not have such a key`);
        }
        const oldValue = innerApplyBack({ downOperation: value, nextState: nextCharacterState, key });
        if (oldValue.isError) {
            return oldValue;
        }
        prevState.set(key, oldValue.value);
        break;
    }
    return Result_1.ResultModule.ok(prevState);
};
exports.applyBack = applyBack;
const composeDownOperation = ({ first, second, innerCompose }) => {
    const result = new Map();
    for (const [key, groupJoined] of Map_1.groupJoin(first, second)) {
        switch (groupJoined.type) {
            case Types_1.left:
                result.set(key, groupJoined.left);
                continue;
            case Types_1.right:
                result.set(key, groupJoined.right);
                continue;
            case Types_1.both:
                {
                    const update = innerCompose({ first: groupJoined.left, second: groupJoined.right, key });
                    if (update.isError) {
                        return update;
                    }
                    if (update.value !== undefined) {
                        result.set(key, update.value);
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
    const result = new Map();
    for (const [key, operation] of second) {
        const innerPrevState = prevState.get(key);
        const innerNextState = nextState.get(key);
        const innerFirst = first === null || first === void 0 ? void 0 : first.get(key);
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
            result.set(key, transformedUpdate);
        }
    }
    return Result_1.ResultModule.ok(result);
};
exports.transform = transform;
const apply = async (params) => {
    const stateAsMap = new Map();
    (await params.state.loadItems()).forEach(s => {
        stateAsMap.set(params.toKey(s), s);
    });
    for (const [key, value] of Map_1.groupJoin(stateAsMap, params.operation)) {
        switch (value.type) {
            case Types_1.left:
                continue;
            case Types_1.right: {
                const created = await params.create({ key, operation: value.right });
                if (created !== undefined) {
                    params.state.add(created);
                }
                continue;
            }
            case Types_1.both: {
                await params.update({ key, state: value.left, operation: value.right });
                continue;
            }
        }
    }
};
exports.apply = apply;
const diff = ({ prev, next, innerDiff, }) => {
    const result = new Map();
    for (const [key, value] of Map_1.groupJoin(prev, next)) {
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
        result.set(key, diffResult);
        continue;
    }
    return result;
};
exports.diff = diff;
