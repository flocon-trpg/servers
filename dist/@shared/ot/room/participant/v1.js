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
exports.clientTransform = exports.serverTransform = exports.diff = exports.restore = exports.composeDownOperation = exports.composeUpOperation = exports.applyBack = exports.apply = exports.toClientOperation = exports.toUpOperation = exports.toDownOperation = exports.toClientState = exports.upOperation = exports.downOperation = exports.state = exports.Master = exports.Spectator = exports.Player = void 0;
const t = __importStar(require("io-ts"));
const io_ts_1 = require("../../../io-ts");
const Board = __importStar(require("./board/v1"));
const Character = __importStar(require("./character/v1"));
const MyNumberValue = __importStar(require("./myNumberValue/v1"));
const recordOperationElement_1 = require("../util/recordOperationElement");
const RecordOperation = __importStar(require("../util/recordOperation"));
const type_1 = require("../util/type");
const ReplaceOperation = __importStar(require("../util/replaceOperation"));
const Result_1 = require("../../../Result");
const utils_1 = require("../../../utils");
const operation_1 = require("../util/operation");
const record_1 = require("../util/record");
exports.Player = 'Player';
exports.Spectator = 'Spectator';
exports.Master = 'Master';
const participantRole = t.union([t.literal(exports.Player), t.literal(exports.Spectator), t.literal(exports.Master)]);
exports.state = t.type({
    $version: t.literal(1),
    name: t.string,
    role: io_ts_1.maybe(participantRole),
    boards: t.record(t.string, Board.state),
    characters: t.record(t.string, Character.state),
    myNumberValues: t.record(t.string, MyNumberValue.state),
});
exports.downOperation = operation_1.operation(1, {
    name: t.type({ oldValue: t.string }),
    role: t.type({ oldValue: io_ts_1.maybe(participantRole) }),
    boards: t.record(t.string, recordOperationElement_1.recordDownOperationElementFactory(Board.state, Board.downOperation)),
    characters: t.record(t.string, recordOperationElement_1.recordDownOperationElementFactory(Character.state, Character.downOperation)),
    myNumberValues: t.record(t.string, recordOperationElement_1.recordDownOperationElementFactory(MyNumberValue.state, MyNumberValue.downOperation)),
});
exports.upOperation = operation_1.operation(1, {
    name: t.type({ newValue: t.string }),
    role: t.type({ newValue: io_ts_1.maybe(participantRole) }),
    boards: t.record(t.string, recordOperationElement_1.recordUpOperationElementFactory(Board.state, Board.upOperation)),
    characters: t.record(t.string, recordOperationElement_1.recordUpOperationElementFactory(Character.state, Character.upOperation)),
    myNumberValues: t.record(t.string, recordOperationElement_1.recordUpOperationElementFactory(MyNumberValue.state, MyNumberValue.upOperation)),
});
const toClientState = (createdByMe) => (source) => {
    return Object.assign(Object.assign({}, source), { boards: RecordOperation.toClientState({
            serverState: source.boards,
            isPrivate: () => false,
            toClientState: ({ state }) => Board.toClientState(state),
        }), characters: RecordOperation.toClientState({
            serverState: source.characters,
            isPrivate: state => !createdByMe && state.isPrivate,
            toClientState: ({ state }) => Character.toClientState(createdByMe)(state),
        }), myNumberValues: RecordOperation.toClientState({
            serverState: source.myNumberValues,
            isPrivate: () => false,
            toClientState: ({ state }) => MyNumberValue.toClientState(createdByMe)(state),
        }) });
};
exports.toClientState = toClientState;
const toDownOperation = (source) => {
    return Object.assign(Object.assign({}, source), { boards: source.boards == null ? undefined : utils_1.chooseRecord(source.boards, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Board.toDownOperation,
        })), characters: source.characters == null ? undefined : utils_1.chooseRecord(source.characters, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Character.toDownOperation,
        })), myNumberValues: source.myNumberValues == null ? undefined : utils_1.chooseRecord(source.myNumberValues, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: MyNumberValue.toDownOperation,
        })) });
};
exports.toDownOperation = toDownOperation;
const toUpOperation = (source) => {
    return Object.assign(Object.assign({}, source), { boards: source.boards == null ? undefined : utils_1.chooseRecord(source.boards, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Board.toUpOperation,
        })), characters: source.characters == null ? undefined : utils_1.chooseRecord(source.characters, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Character.toUpOperation,
        })), myNumberValues: source.myNumberValues == null ? undefined : utils_1.chooseRecord(source.myNumberValues, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: MyNumberValue.toUpOperation,
        })) });
};
exports.toUpOperation = toUpOperation;
const toClientOperation = (createdByMe) => ({ prevState, nextState, diff }) => {
    return Object.assign(Object.assign({}, diff), { boards: diff.boards == null ? undefined : RecordOperation.toClientOperation({
            diff: diff.boards,
            prevState: prevState.boards,
            nextState: nextState.boards,
            toClientState: ({ nextState }) => Board.toClientState(nextState),
            toClientOperation: (params) => Board.toClientOperation(params),
            isPrivate: () => false,
        }), characters: diff.characters == null ? undefined : RecordOperation.toClientOperation({
            diff: diff.characters,
            prevState: prevState.characters,
            nextState: nextState.characters,
            toClientState: ({ nextState }) => Character.toClientState(createdByMe)(nextState),
            toClientOperation: (params) => Character.toClientOperation(createdByMe)(params),
            isPrivate: () => false,
        }), myNumberValues: diff.myNumberValues == null ? undefined : RecordOperation.toClientOperation({
            diff: diff.myNumberValues,
            prevState: prevState.myNumberValues,
            nextState: nextState.myNumberValues,
            toClientState: ({ nextState }) => MyNumberValue.toClientState(createdByMe)(nextState),
            toClientOperation: (params) => MyNumberValue.toClientOperation(createdByMe)(params),
            isPrivate: () => false,
        }) });
};
exports.toClientOperation = toClientOperation;
const apply = ({ state, operation }) => {
    const result = Object.assign({}, state);
    if (operation.name != null) {
        result.name = operation.name.newValue;
    }
    if (operation.role != null) {
        result.role = operation.role.newValue;
    }
    const boards = RecordOperation.apply({
        prevState: state.boards, operation: operation.boards, innerApply: ({ prevState, operation: upOperation }) => {
            return Board.apply({ state: prevState, operation: upOperation });
        }
    });
    if (boards.isError) {
        return boards;
    }
    result.boards = boards.value;
    const characters = RecordOperation.apply({
        prevState: state.characters, operation: operation.characters, innerApply: ({ prevState, operation: upOperation }) => {
            return Character.apply({ state: prevState, operation: upOperation });
        }
    });
    if (characters.isError) {
        return characters;
    }
    result.characters = characters.value;
    const myNumberValues = RecordOperation.apply({
        prevState: state.myNumberValues, operation: operation.myNumberValues, innerApply: ({ prevState, operation: upOperation }) => {
            return MyNumberValue.apply({ state: prevState, operation: upOperation });
        }
    });
    if (myNumberValues.isError) {
        return myNumberValues;
    }
    result.myNumberValues = myNumberValues.value;
    return Result_1.ResultModule.ok(result);
};
exports.apply = apply;
const applyBack = ({ state, operation }) => {
    const result = Object.assign({}, state);
    if (operation.name != null) {
        result.name = operation.name.oldValue;
    }
    if (operation.role != null) {
        result.role = operation.role.oldValue;
    }
    const boards = RecordOperation.applyBack({
        nextState: state.boards, operation: operation.boards, innerApplyBack: ({ state, operation }) => {
            return Board.applyBack({ state, operation });
        }
    });
    if (boards.isError) {
        return boards;
    }
    result.boards = boards.value;
    const characters = RecordOperation.applyBack({
        nextState: state.characters, operation: operation.characters, innerApplyBack: ({ state, operation }) => {
            return Character.applyBack({ state, operation });
        }
    });
    if (characters.isError) {
        return characters;
    }
    result.characters = characters.value;
    const myNumberValues = RecordOperation.applyBack({
        nextState: state.myNumberValues, operation: operation.myNumberValues, innerApplyBack: ({ state, operation }) => {
            return MyNumberValue.applyBack({ state, operation });
        }
    });
    if (myNumberValues.isError) {
        return myNumberValues;
    }
    result.myNumberValues = myNumberValues.value;
    return Result_1.ResultModule.ok(result);
};
exports.applyBack = applyBack;
const composeUpOperation = ({ first, second }) => {
    var _a, _b, _c, _d;
    const boards = RecordOperation.composeUpOperation({
        first: first.boards,
        second: second.boards,
        innerApply: params => Board.apply(params),
        innerCompose: params => Board.composeUpOperation(params),
    });
    if (boards.isError) {
        return boards;
    }
    const characters = RecordOperation.composeUpOperation({
        first: first.characters,
        second: second.characters,
        innerApply: params => Character.apply(params),
        innerCompose: params => Character.composeUpOperation(params),
    });
    if (characters.isError) {
        return characters;
    }
    const myNumberValues = RecordOperation.composeUpOperation({
        first: first.myNumberValues,
        second: second.myNumberValues,
        innerApply: params => MyNumberValue.apply(params),
        innerCompose: params => MyNumberValue.composeUpOperation(params),
    });
    if (myNumberValues.isError) {
        return myNumberValues;
    }
    const valueProps = {
        $version: 1,
        name: ReplaceOperation.composeUpOperation((_a = first.name) !== null && _a !== void 0 ? _a : undefined, (_b = second.name) !== null && _b !== void 0 ? _b : undefined),
        role: ReplaceOperation.composeUpOperation((_c = first.role) !== null && _c !== void 0 ? _c : undefined, (_d = second.role) !== null && _d !== void 0 ? _d : undefined),
        boards: boards.value,
        characters: characters.value,
        myNumberValues: myNumberValues.value,
    };
    return Result_1.ResultModule.ok(valueProps);
};
exports.composeUpOperation = composeUpOperation;
const composeDownOperation = ({ first, second }) => {
    var _a, _b, _c, _d;
    const boards = RecordOperation.composeDownOperation({
        first: first.boards,
        second: second.boards,
        innerApplyBack: params => Board.applyBack(params),
        innerCompose: params => Board.composeDownOperation(params),
    });
    if (boards.isError) {
        return boards;
    }
    const characters = RecordOperation.composeDownOperation({
        first: first.characters,
        second: second.characters,
        innerApplyBack: params => Character.applyBack(params),
        innerCompose: params => Character.composeDownOperation(params),
    });
    if (characters.isError) {
        return characters;
    }
    const myNumberValues = RecordOperation.composeDownOperation({
        first: first.myNumberValues,
        second: second.myNumberValues,
        innerApplyBack: params => MyNumberValue.applyBack(params),
        innerCompose: params => MyNumberValue.composeDownOperation(params),
    });
    if (myNumberValues.isError) {
        return myNumberValues;
    }
    const valueProps = {
        $version: 1,
        name: ReplaceOperation.composeDownOperation((_a = first.name) !== null && _a !== void 0 ? _a : undefined, (_b = second.name) !== null && _b !== void 0 ? _b : undefined),
        role: ReplaceOperation.composeDownOperation((_c = first.role) !== null && _c !== void 0 ? _c : undefined, (_d = second.role) !== null && _d !== void 0 ? _d : undefined),
        boards: boards.value,
        characters: characters.value,
        myNumberValues: myNumberValues.value,
    };
    return Result_1.ResultModule.ok(valueProps);
};
exports.composeDownOperation = composeDownOperation;
const restore = ({ nextState, downOperation }) => {
    var _a, _b;
    if (downOperation === undefined) {
        return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
    }
    const boards = RecordOperation.restore({
        nextState: nextState.boards,
        downOperation: downOperation.boards,
        innerDiff: params => Board.diff(params),
        innerRestore: params => Board.restore(params),
    });
    if (boards.isError) {
        return boards;
    }
    const characters = RecordOperation.restore({
        nextState: nextState.characters,
        downOperation: downOperation.characters,
        innerDiff: params => Character.diff(params),
        innerRestore: params => Character.restore(params),
    });
    if (characters.isError) {
        return characters;
    }
    const myNumberValues = RecordOperation.restore({
        nextState: nextState.myNumberValues,
        downOperation: downOperation.myNumberValues,
        innerDiff: params => MyNumberValue.diff(params),
        innerRestore: params => MyNumberValue.restore(params),
    });
    if (myNumberValues.isError) {
        return myNumberValues;
    }
    const prevState = Object.assign(Object.assign({}, nextState), { boards: boards.value.prevState, characters: characters.value.prevState, myNumberValues: myNumberValues.value.prevState });
    const twoWayOperation = {
        $version: 1,
        boards: boards.value.twoWayOperation,
        characters: characters.value.twoWayOperation,
        myNumberValues: myNumberValues.value.twoWayOperation,
    };
    if (downOperation.name != null) {
        prevState.name = downOperation.name.oldValue;
        twoWayOperation.name = Object.assign(Object.assign({}, downOperation.name), { newValue: nextState.name });
    }
    if (downOperation.role != null) {
        prevState.role = (_a = downOperation.role.oldValue) !== null && _a !== void 0 ? _a : undefined;
        twoWayOperation.role = { oldValue: (_b = downOperation.role.oldValue) !== null && _b !== void 0 ? _b : undefined, newValue: nextState.role };
    }
    return Result_1.ResultModule.ok({ prevState, twoWayOperation });
};
exports.restore = restore;
const diff = ({ prevState, nextState }) => {
    const boards = RecordOperation.diff({
        prevState: prevState.boards,
        nextState: nextState.boards,
        innerDiff: params => Board.diff(params),
    });
    const characters = RecordOperation.diff({
        prevState: prevState.characters,
        nextState: nextState.characters,
        innerDiff: params => Character.diff(params),
    });
    const myNumberValues = RecordOperation.diff({
        prevState: prevState.myNumberValues,
        nextState: nextState.myNumberValues,
        innerDiff: params => MyNumberValue.diff(params),
    });
    const result = {
        $version: 1,
        boards,
        characters,
        myNumberValues,
    };
    if (prevState.name != nextState.name) {
        result.name = { oldValue: prevState.name, newValue: nextState.name };
    }
    if (prevState.role != nextState.role) {
        result.role = { oldValue: prevState.role, newValue: nextState.role };
    }
    if (record_1.isIdRecord(result)) {
        return undefined;
    }
    return result;
};
exports.diff = diff;
const serverTransform = (requestedBy) => ({ prevState, currentState, clientOperation, serverOperation }) => {
    var _a, _b, _c, _d;
    const boards = RecordOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.boards,
        second: clientOperation.boards,
        prevState: prevState.boards,
        nextState: currentState.boards,
        innerTransform: ({ first, second, prevState, nextState }) => Board.serverTransform({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        protectedValuePolicy: {}
    });
    if (boards.isError) {
        return boards;
    }
    const characters = RecordOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.characters,
        second: clientOperation.characters,
        prevState: prevState.characters,
        nextState: currentState.characters,
        innerTransform: ({ first, second, prevState, nextState, key }) => Character.serverTransform(type_1.RequestedBy.createdByMe({ requestedBy, userUid: key }))({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        protectedValuePolicy: {}
    });
    if (characters.isError) {
        return characters;
    }
    const myNumberValues = RecordOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.myNumberValues,
        second: clientOperation.myNumberValues,
        prevState: prevState.myNumberValues,
        nextState: currentState.myNumberValues,
        innerTransform: ({ first, second, prevState, nextState, key }) => MyNumberValue.serverTransform(type_1.RequestedBy.createdByMe({ requestedBy, userUid: key }))({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        protectedValuePolicy: {}
    });
    if (myNumberValues.isError) {
        return myNumberValues;
    }
    const twoWayOperation = {
        $version: 1,
        boards: boards.value,
        characters: characters.value,
        myNumberValues: myNumberValues.value,
    };
    twoWayOperation.name = ReplaceOperation.serverTransform({
        first: (_a = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.name) !== null && _a !== void 0 ? _a : undefined,
        second: (_b = clientOperation.name) !== null && _b !== void 0 ? _b : undefined,
        prevState: prevState.name,
    });
    if (requestedBy.type === type_1.server) {
        twoWayOperation.role = ReplaceOperation.serverTransform({
            first: (_c = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.role) !== null && _c !== void 0 ? _c : undefined,
            second: (_d = clientOperation.role) !== null && _d !== void 0 ? _d : undefined,
            prevState: prevState.role,
        });
    }
    if (record_1.isIdRecord(twoWayOperation)) {
        return Result_1.ResultModule.ok(undefined);
    }
    return Result_1.ResultModule.ok(twoWayOperation);
};
exports.serverTransform = serverTransform;
const clientTransform = ({ first, second }) => {
    const boards = RecordOperation.clientTransform({
        first: first.boards,
        second: second.boards,
        innerTransform: params => Board.clientTransform(params),
        innerDiff: params => {
            const diff = Board.diff(params);
            if (diff == null) {
                return diff;
            }
            return Board.toUpOperation(diff);
        },
    });
    if (boards.isError) {
        return boards;
    }
    const characters = RecordOperation.clientTransform({
        first: first.characters,
        second: second.characters,
        innerTransform: params => Character.clientTransform(params),
        innerDiff: params => {
            const diff = Character.diff(params);
            if (diff == null) {
                return diff;
            }
            return Character.toUpOperation(diff);
        },
    });
    if (characters.isError) {
        return characters;
    }
    const myNumberValues = RecordOperation.clientTransform({
        first: first.myNumberValues,
        second: second.myNumberValues,
        innerTransform: params => MyNumberValue.clientTransform(params),
        innerDiff: params => {
            const diff = MyNumberValue.diff(params);
            if (diff == null) {
                return diff;
            }
            return MyNumberValue.toUpOperation(diff);
        },
    });
    if (myNumberValues.isError) {
        return myNumberValues;
    }
    const name = ReplaceOperation.clientTransform({
        first: first.name,
        second: second.name,
    });
    const role = ReplaceOperation.clientTransform({
        first: first.role,
        second: second.role,
    });
    const firstPrime = {
        $version: 1,
        boards: boards.value.firstPrime,
        characters: characters.value.firstPrime,
        myNumberValues: myNumberValues.value.firstPrime,
        name: name.firstPrime,
        role: role.firstPrime,
    };
    const secondPrime = {
        $version: 1,
        boards: boards.value.secondPrime,
        characters: characters.value.secondPrime,
        myNumberValues: myNumberValues.value.secondPrime,
        name: name.secondPrime,
        role: role.secondPrime,
    };
    return Result_1.ResultModule.ok({
        firstPrime: record_1.isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: record_1.isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
exports.clientTransform = clientTransform;
