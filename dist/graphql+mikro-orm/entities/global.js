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
exports.ParamMapTransformer = exports.MapTransformer = exports.DualKeyMapTransformer = void 0;
const Result_1 = require("../../@shared/Result");
const DualKeyMapOperations = __importStar(require("../dualKeyMapOperations"));
const ParamMapOperations = __importStar(require("../paramMapOperations"));
const DualKeyMap_1 = require("../../@shared/DualKeyMap");
const collection_1 = require("../../@shared/collection");
class DualKeyMapTransformer {
    constructor(factory) {
        this.factory = factory;
    }
    composeLoose(params) {
        return DualKeyMapOperations.composeDownOperationLoose(Object.assign(Object.assign({}, params), { innerApplyBack: params => this.factory.applyBack(params), innerCompose: params => this.factory.composeLoose(params) }));
    }
    restore({ downOperation, nextState, }) {
        return DualKeyMapOperations.restore({
            nextState,
            downOperation,
            innerRestore: params => this.factory.restore(params),
            innerDiff: params => this.factory.diff(params),
        });
    }
    transform({ prevState, currentState, serverOperation, clientOperation, }) {
        return DualKeyMapOperations.transform({
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
        return DualKeyMapOperations.diff({
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
        return DualKeyMapOperations.applyBack({
            nextState,
            downOperation,
            innerApplyBack: params => this.factory.applyBack(params),
        });
    }
    toServerState({ clientState, }) {
        return clientState.map((value, key) => this.factory.toServerState({ key, clientState: value }));
    }
}
exports.DualKeyMapTransformer = DualKeyMapTransformer;
const dummyFirstKey = '';
const toDualKeyMap = (source) => {
    const sourceMap = new Map();
    sourceMap.set(dummyFirstKey, source);
    return new DualKeyMap_1.DualKeyMap(sourceMap);
};
const toMap = (source) => {
    var _a;
    return (_a = source.getByFirst(dummyFirstKey)) !== null && _a !== void 0 ? _a : new Map();
};
class MapTransformer {
    constructor(factory) {
        const cancelRemove = factory.protectedValuePolicy.cancelRemove;
        this.core = new DualKeyMapTransformer({
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
            first: toDualKeyMap(first),
            second: toDualKeyMap(second),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return Result_1.ResultModule.ok(dualKeyMap.value === undefined ? undefined : toMap(dualKeyMap.value));
    }
    restore({ downOperation, nextState, }) {
        const dualKeyMap = this.core.restore({
            downOperation: toDualKeyMap(downOperation),
            nextState: toDualKeyMap(nextState),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return Result_1.ResultModule.ok({
            prevState: toMap(dualKeyMap.value.prevState),
            twoWayOperation: toMap(dualKeyMap.value.twoWayOperation),
        });
    }
    transform({ prevState, currentState, serverOperation, clientOperation, }) {
        const dualKeyMap = this.core.transform({
            prevState: toDualKeyMap(prevState),
            currentState: toDualKeyMap(currentState),
            serverOperation: toDualKeyMap(serverOperation),
            clientOperation: toDualKeyMap(clientOperation),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return Result_1.ResultModule.ok(toMap(dualKeyMap.value));
    }
    restoreAndTransform({ currentState, serverOperation, clientOperation, }) {
        const dualKeyMap = this.core.restoreAndTransform({
            currentState: toDualKeyMap(currentState),
            serverOperation: toDualKeyMap(serverOperation),
            clientOperation: toDualKeyMap(clientOperation),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return Result_1.ResultModule.ok(toMap(dualKeyMap.value));
    }
    diff({ prevState, nextState, }) {
        const dualKeyMap = this.core.diff({
            prevState: toDualKeyMap(prevState),
            nextState: toDualKeyMap(nextState),
        });
        return toMap(dualKeyMap);
    }
    applyBack({ downOperation, nextState, }) {
        const dualKeyMap = this.core.applyBack({
            downOperation: toDualKeyMap(downOperation),
            nextState: toDualKeyMap(nextState),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return Result_1.ResultModule.ok(toMap(dualKeyMap.value));
    }
    toServerState({ clientState, }) {
        const dualKeyMap = this.core.toServerState({
            clientState: toDualKeyMap(clientState),
        });
        return toMap(dualKeyMap);
    }
}
exports.MapTransformer = MapTransformer;
class ParamMapTransformer {
    constructor(factory) {
        this.factory = factory;
    }
    compose(params) {
        return ParamMapOperations.composeDownOperation(Object.assign(Object.assign({}, params), { innerCompose: params => this.factory.composeLoose(params) }));
    }
    restore({ downOperation, nextState, }) {
        return ParamMapOperations.restore({
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
        return ParamMapOperations.transform({
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
        return ParamMapOperations.diff({
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
        return ParamMapOperations.applyBack({
            nextState,
            downOperation,
            innerApplyBack: params => this.factory.applyBack(params),
        });
    }
    toServerState({ clientState, }) {
        return collection_1.__(clientState).toMap(([key, value]) => ({
            key,
            value: this.factory.toServerState({ key, clientState: value }),
        }));
    }
}
exports.ParamMapTransformer = ParamMapTransformer;
