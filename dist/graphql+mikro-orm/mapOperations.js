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
exports.diff = exports.apply = exports.transform = exports.composeDownOperation = exports.applyBack = exports.restore = exports.toGraphQLWithState = exports.toGraphQL = exports.createUpOperationFromGraphQL = exports.createDownOperationFromMikroORM = exports.update = exports.replace = void 0;
const DualKeyMapOperations = __importStar(require("./dualKeyMapOperations"));
const Map_1 = require("../@shared/Map");
const Types_1 = require("../@shared/Types");
const Result_1 = require("../@shared/Result");
const DualKeyMap_1 = require("../@shared/DualKeyMap");
exports.replace = 'replace';
exports.update = 'update';
const dummyFirstKey = '';
const toDualKeyMap = (source) => {
    const resultMap = new Map();
    resultMap.set(dummyFirstKey, source);
    return new DualKeyMap_1.DualKeyMap(resultMap);
};
const get = (source) => {
    if (source.isEmpty) {
        return new Map();
    }
    const result = source.getByFirst(dummyFirstKey);
    if (result == null) {
        throw 'dummyCreatedBy key is missing';
    }
    return result;
};
const createDownOperationFromMikroORM = async ({ toKey, add, remove, update, getState, getOperation, }) => {
    const result = new Map();
    for (const a of await add.loadItems()) {
        const key = toKey(a);
        if (key.isError) {
            return key;
        }
        result.set(key.value, { type: 'replace', operation: { oldValue: undefined } });
    }
    for (const r of await remove.loadItems()) {
        const key = toKey(r);
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
        const key = toKey(u);
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
const createUpOperationFromGraphQL = ({ replace, update, getState, getOperation, createKey, }) => {
    const result = new Map();
    for (const operation of replace) {
        const key = createKey(operation);
        if (key.isError) {
            return key;
        }
        if (result.has(key.value)) {
            return Result_1.ResultModule.error(`${key.value} is duplicate`);
        }
        result.set(key.value, { type: 'replace', operation: { newValue: getState(operation) } });
    }
    for (const operation of update) {
        const key = createKey(operation);
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
    const sourceAsDualKey = toDualKeyMap(source);
    return DualKeyMapOperations.toGraphQL({
        source: sourceAsDualKey,
        toReplaceOperation: ({ prevState, nextState, key: dualKey }) => toReplaceOperation({ prevState, nextState, key: dualKey.second }),
        toUpdateOperation: ({ operation, key: dualKey }) => toUpdateOperation({ operation, key: dualKey.second }),
    });
};
exports.toGraphQL = toGraphQL;
const toGraphQLWithState = ({ source, isPrivate, prevState, nextState, toReplaceOperation, toUpdateOperation, }) => {
    const sourceAsDualKey = toDualKeyMap(source);
    return DualKeyMapOperations.toGraphQLWithState({
        source: sourceAsDualKey,
        isPrivate: (state, key) => isPrivate(state, key.second),
        prevState: toDualKeyMap(prevState),
        nextState: toDualKeyMap(nextState),
        toReplaceOperation: ({ prevState, nextState, key: dualKey }) => toReplaceOperation({ prevState, nextState, key: dualKey.second }),
        toUpdateOperation: ({ operation, key: dualKey, prevState, nextState }) => toUpdateOperation({ operation, key: dualKey.second, prevState, nextState }),
    });
};
exports.toGraphQLWithState = toGraphQLWithState;
const restore = ({ nextState, downOperation, innerRestore, innerDiff }) => {
    const stateMapResult = DualKeyMapOperations.restore({ nextState: toDualKeyMap(nextState), downOperation: toDualKeyMap(downOperation), innerRestore, innerDiff });
    if (stateMapResult.isError) {
        return stateMapResult;
    }
    return Result_1.ResultModule.ok({
        prevState: get(stateMapResult.value.prevState),
        twoWayOperation: get(stateMapResult.value.twoWayOperation),
    });
};
exports.restore = restore;
const applyBack = ({ nextState, downOperation, innerApplyBack }) => {
    const stateMapResult = DualKeyMapOperations.applyBack({ nextState: toDualKeyMap(nextState), downOperation: toDualKeyMap(downOperation), innerApplyBack });
    if (stateMapResult.isError) {
        return stateMapResult;
    }
    return Result_1.ResultModule.ok(get(stateMapResult.value));
};
exports.applyBack = applyBack;
const composeDownOperation = ({ first, second, innerApplyBack, innerCompose }) => {
    const stateMapResult = DualKeyMapOperations.composeDownOperationLoose({
        first: toDualKeyMap(first),
        second: toDualKeyMap(second),
        innerApplyBack,
        innerCompose,
    });
    if (stateMapResult.isError) {
        return stateMapResult;
    }
    return Result_1.ResultModule.ok(get(stateMapResult.value));
};
exports.composeDownOperation = composeDownOperation;
const transform = ({ first, second, prevState, nextState, innerTransform, toServerState, protectedValuePolicy }) => {
    const cancelRemove = protectedValuePolicy.cancelRemove;
    const cancelCreate = protectedValuePolicy.cancelCreate;
    const firstAsDualKey = first === undefined ? undefined : toDualKeyMap(first);
    const secondAsDualKey = toDualKeyMap(second);
    const stateMapResult = DualKeyMapOperations.transform({
        first: firstAsDualKey,
        second: secondAsDualKey,
        prevState: toDualKeyMap(prevState),
        nextState: toDualKeyMap(nextState),
        innerTransform: params => innerTransform(Object.assign(Object.assign({}, params), { key: params.key.second })),
        toServerState: (state, key) => toServerState(state, key.second),
        protectedValuePolicy: {
            cancelRemove: cancelRemove === undefined ? undefined : params => cancelRemove({ key: params.key.second, nextState: params.nextState }),
            cancelCreate: cancelCreate === undefined ? undefined : params => cancelCreate({ key: params.key.second }),
        },
    });
    if (stateMapResult.isError) {
        return stateMapResult;
    }
    return Result_1.ResultModule.ok(get(stateMapResult.value));
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
    const result = new Map();
    for (const [key, value] of Map_1.groupJoin(prev, next)) {
        switch (value.type) {
            case Types_1.left:
                result.set(key, { type: exports.replace, operation: { oldValue: value.left, newValue: undefined } });
                continue;
            case Types_1.right: {
                result.set(key, { type: exports.replace, operation: { oldValue: undefined, newValue: value.right } });
                continue;
            }
            case Types_1.both: {
                const diffResult = innerDiff({ prev: value.left, next: value.right });
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
