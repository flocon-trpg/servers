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
exports.diff = exports.clientTransform = exports.serverTransform = exports.composeDownOperation = exports.composeUpOperation = exports.applyBack = exports.apply = exports.restore = exports.toClientOperation = exports.toClientState = exports.upOperationFactory = exports.downOperationFactory = exports.stateFactory = void 0;
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
    if (downOperation == null) {
        return Result_1.ResultModule.ok({
            prevState: nextState,
            twoWayOperation: undefined
        });
    }
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
const applyBack = ({ nextState, operation, innerApplyBack }) => {
    var _a;
    if (operation == null) {
        return Result_1.ResultModule.ok(nextState);
    }
    const result = DualKeyRecordOperation.applyBack({
        nextState: { [dummyKey]: nextState },
        operation: { [dummyKey]: operation },
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
const composeUpOperation = ({ first, second, innerApply, innerCompose }) => {
    if (first == null) {
        return Result_1.ResultModule.ok(second);
    }
    if (second == null) {
        return Result_1.ResultModule.ok(first);
    }
    const result = DualKeyRecordOperation.composeUpOperation({
        first: { [dummyKey]: first },
        second: { [dummyKey]: second },
        innerApply: (_a) => {
            var { key } = _a, params = __rest(_a, ["key"]);
            return innerApply(Object.assign(Object.assign({}, params), { key: key.second }));
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
exports.composeUpOperation = composeUpOperation;
const composeDownOperation = ({ first, second, innerApplyBack, innerCompose }) => {
    if (first == null) {
        return Result_1.ResultModule.ok(second);
    }
    if (second == null) {
        return Result_1.ResultModule.ok(first);
    }
    const result = DualKeyRecordOperation.composeDownOperation({
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
exports.composeDownOperation = composeDownOperation;
const serverTransform = ({ first, second, prevState, nextState, innerTransform, toServerState, protectedValuePolicy }) => {
    var _a;
    const cancelCreate = protectedValuePolicy.cancelCreate;
    const cancelUpdate = protectedValuePolicy.cancelUpdate;
    const cancelRemove = protectedValuePolicy.cancelRemove;
    const result = DualKeyRecordOperation.serverTransform({
        first: first === undefined ? undefined : { [dummyKey]: first },
        second: second === undefined ? undefined : { [dummyKey]: second },
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
exports.serverTransform = serverTransform;
const clientTransform = ({ first, second, innerTransform, innerDiff, }) => {
    const result = DualKeyRecordOperation.clientTransform({
        first: first == null ? undefined : { [dummyKey]: first },
        second: second == null ? undefined : { [dummyKey]: second },
        innerTransform: params => innerTransform(params),
        innerDiff: params => innerDiff(params),
    });
    if (result.isError) {
        return result;
    }
    return Result_1.ResultModule.ok({
        firstPrime: result.value.firstPrime == null ? undefined : result.value.firstPrime[dummyKey],
        secondPrime: result.value.secondPrime == null ? undefined : result.value.secondPrime[dummyKey],
    });
};
exports.clientTransform = clientTransform;
const diff = ({ prevState, nextState, innerDiff, }) => {
    return DualKeyRecordOperation.diff({
        prevState: { [dummyKey]: prevState },
        nextState: { [dummyKey]: nextState },
        innerDiff: (_a) => {
            var { key } = _a, params = __rest(_a, ["key"]);
            return innerDiff(Object.assign(Object.assign({}, params), { key: key.second }));
        },
    })[dummyKey];
};
exports.diff = diff;
