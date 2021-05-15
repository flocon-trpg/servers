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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordTransformer = exports.diff = exports.transform = exports.composeDownOperationLoose = exports.applyBack = exports.apply = exports.restore = exports.toClientOperation = exports.toClientState = exports.upOperationFactory = exports.downOperationFactory = exports.stateFactory = void 0;
const t = __importStar(require("io-ts"));
const DualKeyRecordOperation = __importStar(require("./dualKeyRecordOperation"));
const Result_1 = require("../../../Result");
const recordOperationElement_1 = require("./recordOperationElement");
const stateFactory = (key, state) => t.record(key, state);
exports.stateFactory = stateFactory;
const downOperationFactory = (key, state, operation) => t.record(key, recordOperationElement_1.recordDownOperationElementFactory(state, operation));
exports.downOperationFactory = downOperationFactory;
const upOperationFactory = (key, state, operation) => t.record(key, recordOperationElement_1.recordUpOperationElementFactory(state, operation));
exports.upOperationFactory = upOperationFactory;
const dummyKey = '';
const toClientState = ({ serverState, isPrivate, toClientState, }) => {
    var _a;
    return (_a = DualKeyRecordOperation.toClientState({
        serverState: { [dummyKey]: serverState },
        isPrivate: (state, key) => isPrivate(state, key.second),
        toClientState: ({ state, key }) => toClientState({ state, key: key.second }),
    })[dummyKey]) !== null && _a !== void 0 ? _a : {};
};
exports.toClientState = toClientState;
const toClientOperation = ({ diff, isPrivate, prevState, nextState, toClientState, toClientOperation, }) => {
    var _a;
    return (_a = DualKeyRecordOperation.toClientOperation({
        diff: { [dummyKey]: diff },
        isPrivate: (state, key) => isPrivate(state, key.second),
        prevState: { [dummyKey]: prevState },
        nextState: { [dummyKey]: nextState },
        toClientState: ({ prevState, nextState, key }) => toClientState({ prevState, nextState, key: key.second }),
        toClientOperation: ({ diff, key, prevState, nextState }) => toClientOperation({ diff, key: key.second, prevState, nextState }),
    })[dummyKey]) !== null && _a !== void 0 ? _a : {};
};
exports.toClientOperation = toClientOperation;
const restore = ({ nextState, downOperation, innerRestore, innerDiff }) => {
    var _a;
    const result = DualKeyRecordOperation.restore({
        nextState: { [dummyKey]: nextState },
        downOperation: { [dummyKey]: downOperation },
        innerRestore: (_a) => {
            var { key } = _a, params = __rest(_a, ["key"]);
            return innerRestore(Object.assign(Object.assign({}, params), { key: key.second }));
        },
        innerDiff: (_a) => {
            var { key } = _a, params = __rest(_a, ["key"]);
            return innerDiff(Object.assign(Object.assign({}, params), { key: key.second }));
        },
    });
    if (result.isError) {
        return result;
    }
    return Result_1.ResultModule.ok({
        prevState: (_a = result.value.prevState[dummyKey]) !== null && _a !== void 0 ? _a : {},
        twoWayOperation: result.value.twoWayOperation === undefined ? undefined : result.value.twoWayOperation[dummyKey],
    });
};
exports.restore = restore;
const apply = ({ prevState, operation, innerApply }) => {
    var _a;
    if (operation == null) {
        return Result_1.ResultModule.ok(prevState);
    }
    const result = DualKeyRecordOperation.apply({
        prevState: { [dummyKey]: prevState },
        operation: { [dummyKey]: operation },
        innerApply: (_a) => {
            var { key } = _a, params = __rest(_a, ["key"]);
            return innerApply(Object.assign(Object.assign({}, params), { key: key.second }));
        },
    });
    if (result.isError) {
        return result;
    }
    return Result_1.ResultModule.ok((_a = result.value[dummyKey]) !== null && _a !== void 0 ? _a : {});
};
exports.apply = apply;
const applyBack = ({ nextState, downOperation, innerApplyBack }) => {
    var _a;
    if (downOperation == null) {
        return Result_1.ResultModule.ok(nextState);
    }
    const result = DualKeyRecordOperation.applyBack({
        nextState: { [dummyKey]: nextState },
        downOperation: { [dummyKey]: downOperation },
        innerApplyBack: (_a) => {
            var { key } = _a, params = __rest(_a, ["key"]);
            return innerApplyBack(Object.assign(Object.assign({}, params), { key: key.second }));
        },
    });
    if (result.isError) {
        return result;
    }
    return Result_1.ResultModule.ok((_a = result.value[dummyKey]) !== null && _a !== void 0 ? _a : {});
};
exports.applyBack = applyBack;
const composeDownOperationLoose = ({ first, second, innerApplyBack, innerCompose }) => {
    const result = DualKeyRecordOperation.composeDownOperationLoose({
        first: { [dummyKey]: first },
        second: { [dummyKey]: second },
        innerApplyBack: (_a) => {
            var { key } = _a, params = __rest(_a, ["key"]);
            return innerApplyBack(Object.assign(Object.assign({}, params), { key: key.second }));
        },
        innerCompose: (_a) => {
            var { key } = _a, params = __rest(_a, ["key"]);
            return innerCompose(Object.assign(Object.assign({}, params), { key: key.second }));
        },
    });
    if (result.isError) {
        return result;
    }
    return Result_1.ResultModule.ok(result.value === undefined ? undefined : result.value[dummyKey]);
};
exports.composeDownOperationLoose = composeDownOperationLoose;
const transform = ({ first, second, prevState, nextState, innerTransform, toServerState, protectedValuePolicy }) => {
    var _a;
    if (second === undefined) {
        return Result_1.ResultModule.ok(undefined);
    }
    const cancelCreate = protectedValuePolicy.cancelCreate;
    const cancelUpdate = protectedValuePolicy.cancelUpdate;
    const cancelRemove = protectedValuePolicy.cancelRemove;
    const result = DualKeyRecordOperation.transform({
        first: first === undefined ? undefined : { [dummyKey]: first },
        second: { [dummyKey]: second },
        prevState: { [dummyKey]: prevState },
        nextState: { [dummyKey]: nextState },
        innerTransform: (_a) => {
            var { key } = _a, params = __rest(_a, ["key"]);
            return innerTransform(Object.assign(Object.assign({}, params), { key: key.second }));
        },
        toServerState: (state, key) => toServerState(state, key.second),
        protectedValuePolicy: {
            cancelCreate: cancelCreate === undefined ? undefined : ((_a) => {
                var { key } = _a, params = __rest(_a, ["key"]);
                return cancelCreate(Object.assign(Object.assign({}, params), { key: key.second }));
            }),
            cancelUpdate: cancelUpdate === undefined ? undefined : ((_a) => {
                var { key } = _a, params = __rest(_a, ["key"]);
                return cancelUpdate(Object.assign(Object.assign({}, params), { key: key.second }));
            }),
            cancelRemove: cancelRemove === undefined ? undefined : ((_a) => {
                var { key } = _a, params = __rest(_a, ["key"]);
                return cancelRemove(Object.assign(Object.assign({}, params), { key: key.second }));
            }),
        },
    });
    if (result.isError) {
        return result;
    }
    return Result_1.ResultModule.ok((_a = (result.value === undefined ? undefined : result.value[dummyKey])) !== null && _a !== void 0 ? _a : {});
};
exports.transform = transform;
const diff = ({ prev, next, innerDiff, }) => {
    return DualKeyRecordOperation.diff({
        prev: { [dummyKey]: prev },
        next: { [dummyKey]: next },
        innerDiff: (_a) => {
            var { key } = _a, params = __rest(_a, ["key"]);
            return innerDiff(Object.assign(Object.assign({}, params), { key: key.second }));
        },
    });
};
exports.diff = diff;
const dummyFirstKey = '';
const toDualKeyRecord = (source) => {
    return { [dummyFirstKey]: source };
};
const toRecord = (source) => {
    var _a;
    return (_a = source[dummyFirstKey]) !== null && _a !== void 0 ? _a : {};
};
class RecordTransformer {
    constructor(factory) {
        const cancelRemove = factory.protectedValuePolicy.cancelRemove;
        this.core = new DualKeyRecordOperation.DualKeyRecordTransformer({
            composeLoose: params => factory.composeLoose({
                key: params.key.second,
                first: params.first,
                second: params.second,
            }),
            restore: params => factory.restore({
                key: params.key.second,
                nextState: params.nextState,
                downOperation: params.downOperation,
            }),
            transform: params => factory.transform({
                key: params.key.second,
                prevState: params.prevState,
                currentState: params.currentState,
                serverOperation: params.serverOperation,
                clientOperation: params.clientOperation,
            }),
            diff: params => factory.diff({
                key: params.key.second,
                prevState: params.prevState,
                nextState: params.nextState,
            }),
            applyBack: params => factory.applyBack({
                key: params.key.second,
                downOperation: params.downOperation,
                nextState: params.nextState,
            }),
            toServerState: params => factory.toServerState({
                key: params.key.second,
                clientState: params.clientState,
            }),
            protectedValuePolicy: cancelRemove === undefined ? {} : {
                cancelRemove: params => cancelRemove({ key: params.key.second, nextState: params.nextState })
            },
        });
    }
    composeLoose({ first, second, }) {
        const dualKeyMap = this.core.composeLoose({
            first: first == null ? undefined : toDualKeyRecord(first),
            second: second == null ? undefined : toDualKeyRecord(second),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return Result_1.ResultModule.ok(dualKeyMap.value === undefined ? undefined : toRecord(dualKeyMap.value));
    }
    restore({ downOperation, nextState, }) {
        const dualKeyMap = this.core.restore({
            downOperation: downOperation == null ? undefined : toDualKeyRecord(downOperation),
            nextState: toDualKeyRecord(nextState),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return Result_1.ResultModule.ok({
            prevState: toRecord(dualKeyMap.value.prevState),
            twoWayOperation: dualKeyMap.value.twoWayOperation === undefined ? undefined : toRecord(dualKeyMap.value.twoWayOperation),
        });
    }
    transform({ prevState, currentState, serverOperation, clientOperation, }) {
        const dualKeyMap = this.core.transform({
            prevState: toDualKeyRecord(prevState),
            currentState: toDualKeyRecord(currentState),
            serverOperation: serverOperation == null ? undefined : toDualKeyRecord(serverOperation),
            clientOperation: clientOperation == null ? undefined : toDualKeyRecord(clientOperation),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return Result_1.ResultModule.ok(dualKeyMap.value === undefined ? undefined : toRecord(dualKeyMap.value));
    }
    restoreAndTransform({ currentState, serverOperation, clientOperation, }) {
        const dualKeyMap = this.core.restoreAndTransform({
            currentState: toDualKeyRecord(currentState),
            serverOperation: toDualKeyRecord(serverOperation),
            clientOperation: toDualKeyRecord(clientOperation),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return Result_1.ResultModule.ok(dualKeyMap.value === undefined ? undefined : toRecord(dualKeyMap.value));
    }
    diff({ prevState, nextState, }) {
        const dualKeyMap = this.core.diff({
            prevState: toDualKeyRecord(prevState),
            nextState: toDualKeyRecord(nextState),
        });
        return toRecord(dualKeyMap);
    }
    applyBack({ downOperation, nextState, }) {
        if (downOperation == null) {
            return Result_1.ResultModule.ok(nextState);
        }
        const dualKeyMap = this.core.applyBack({
            downOperation: toDualKeyRecord(downOperation),
            nextState: toDualKeyRecord(nextState),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return Result_1.ResultModule.ok(toRecord(dualKeyMap.value));
    }
    toServerState({ clientState, }) {
        const dualKeyMap = this.core.toServerState({
            clientState: toDualKeyRecord(clientState),
        });
        return toRecord(dualKeyMap);
    }
}
exports.RecordTransformer = RecordTransformer;
