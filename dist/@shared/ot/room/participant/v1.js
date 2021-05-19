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
exports.transformerFactory = exports.apply = exports.toClientOperation = exports.toServerOperation = exports.toClientState = exports.upOperation = exports.downOperation = exports.state = exports.Master = exports.Spectator = exports.Player = void 0;
const t = __importStar(require("io-ts"));
const io_ts_1 = require("../../../io-ts");
const Board = __importStar(require("./board/v1"));
const Character = __importStar(require("./character/v1"));
const MyNumberValue = __importStar(require("./myNumberValue/v1"));
const recordOperationElement_1 = require("../util/recordOperationElement");
const recordOperation_1 = require("../util/recordOperation");
const RecordOperation = __importStar(require("../util/recordOperation"));
const type_1 = require("../util/type");
const ReplaceValueOperation = __importStar(require("../util/replaceOperation"));
const Result_1 = require("../../../Result");
const utils_1 = require("../../../utils");
exports.Player = 'Player';
exports.Spectator = 'Spectator';
exports.Master = 'Master';
const participantRole = t.union([t.literal(exports.Player), t.literal(exports.Spectator), t.literal(exports.Master)]);
exports.state = t.type({
    version: t.literal(1),
    name: t.string,
    role: io_ts_1.maybe(participantRole),
    boards: t.record(t.string, Board.state),
    characters: t.record(t.string, Character.state),
    myNumberValues: t.record(t.string, MyNumberValue.state),
});
exports.downOperation = t.partial({
    name: t.type({ oldValue: t.string }),
    role: t.type({ oldValue: io_ts_1.maybe(participantRole) }),
    boards: t.record(t.string, recordOperationElement_1.recordDownOperationElementFactory(Board.state, Board.downOperation)),
    characters: t.record(t.string, recordOperationElement_1.recordDownOperationElementFactory(Character.state, Character.downOperation)),
    myNumberValues: t.record(t.string, recordOperationElement_1.recordDownOperationElementFactory(MyNumberValue.state, MyNumberValue.downOperation)),
});
exports.upOperation = t.partial({
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
const toServerOperation = (source) => {
    return Object.assign(Object.assign({}, source), { boards: source.boards == null ? undefined : utils_1.chooseRecord(source.boards, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Board.toServerOperation,
        })), characters: source.characters == null ? undefined : utils_1.chooseRecord(source.characters, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Character.toServerOperation,
        })), myNumberValues: source.myNumberValues == null ? undefined : utils_1.chooseRecord(source.myNumberValues, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: MyNumberValue.toServerOperation,
        })) });
};
exports.toServerOperation = toServerOperation;
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
const boardTransformer = Board.transformerFactory;
const boardsTransformer = new recordOperation_1.RecordTransformer(boardTransformer);
const createCharacterTransformer = (createdByMe) => Character.transformerFactory(createdByMe);
const createCharactersTransformer = (createdByMe) => new recordOperation_1.RecordTransformer(createCharacterTransformer(createdByMe));
const createMyNumberValueTransformer = (createdByMe) => MyNumberValue.transformerFactory(createdByMe);
const createMyNumberValuesTransformer = (createdByMe) => new recordOperation_1.RecordTransformer(createMyNumberValueTransformer(createdByMe));
const transformerFactory = (requestedBy) => ({
    composeLoose: ({ key, first, second }) => {
        var _a, _b, _c, _d;
        const boards = boardsTransformer.composeLoose({
            first: first.boards,
            second: second.boards,
        });
        if (boards.isError) {
            return boards;
        }
        const charactersTransformer = createCharactersTransformer(type_1.RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const characters = charactersTransformer.composeLoose({
            first: first.characters,
            second: second.characters,
        });
        if (characters.isError) {
            return characters;
        }
        const myNumberValuesTransformer = createMyNumberValuesTransformer(type_1.RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const myNumberValues = myNumberValuesTransformer.composeLoose({
            first: first.myNumberValues,
            second: second.myNumberValues,
        });
        if (myNumberValues.isError) {
            return myNumberValues;
        }
        const valueProps = {
            name: ReplaceValueOperation.composeDownOperation((_a = first.name) !== null && _a !== void 0 ? _a : undefined, (_b = second.name) !== null && _b !== void 0 ? _b : undefined),
            role: ReplaceValueOperation.composeDownOperation((_c = first.role) !== null && _c !== void 0 ? _c : undefined, (_d = second.role) !== null && _d !== void 0 ? _d : undefined),
            boards: boards.value,
            characters: characters.value,
            myNumberValues: myNumberValues.value,
        };
        return Result_1.ResultModule.ok(valueProps);
    },
    restore: ({ key, nextState, downOperation }) => {
        var _a, _b;
        if (downOperation === undefined) {
            return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
        }
        const boards = boardsTransformer.restore({
            nextState: nextState.boards,
            downOperation: downOperation.boards,
        });
        if (boards.isError) {
            return boards;
        }
        const charactersTransformer = createCharactersTransformer(type_1.RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const characters = charactersTransformer.restore({
            nextState: nextState.characters,
            downOperation: downOperation.characters,
        });
        if (characters.isError) {
            return characters;
        }
        const myNumberValuesTransformer = createMyNumberValuesTransformer(type_1.RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const myNumberValues = myNumberValuesTransformer.restore({
            nextState: nextState.myNumberValues,
            downOperation: downOperation.myNumberValues,
        });
        if (myNumberValues.isError) {
            return myNumberValues;
        }
        const prevState = Object.assign(Object.assign({}, nextState), { boards: boards.value.prevState, characters: characters.value.prevState, myNumberValues: myNumberValues.value.prevState });
        const twoWayOperation = {
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
    },
    transform: ({ key, prevState, currentState, clientOperation, serverOperation }) => {
        var _a, _b, _c, _d;
        const boards = boardsTransformer.transform({
            prevState: prevState.boards,
            currentState: currentState.boards,
            clientOperation: clientOperation.boards,
            serverOperation: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.boards,
        });
        if (boards.isError) {
            return boards;
        }
        const charactersTransformer = createCharactersTransformer(type_1.RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const characters = charactersTransformer.transform({
            prevState: prevState.characters,
            currentState: currentState.characters,
            clientOperation: clientOperation.characters,
            serverOperation: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.characters,
        });
        if (characters.isError) {
            return characters;
        }
        const myNumberValuesTransformer = createMyNumberValuesTransformer(type_1.RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const myNumberValues = myNumberValuesTransformer.transform({
            prevState: prevState.myNumberValues,
            currentState: currentState.myNumberValues,
            clientOperation: clientOperation.myNumberValues,
            serverOperation: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.myNumberValues,
        });
        if (myNumberValues.isError) {
            return myNumberValues;
        }
        const twoWayOperation = {
            boards: boards.value,
            characters: characters.value,
            myNumberValues: myNumberValues.value,
        };
        twoWayOperation.name = ReplaceValueOperation.transform({
            first: (_a = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.name) !== null && _a !== void 0 ? _a : undefined,
            second: (_b = clientOperation.name) !== null && _b !== void 0 ? _b : undefined,
            prevState: prevState.name,
        });
        if (requestedBy.type === type_1.server) {
            twoWayOperation.role = ReplaceValueOperation.transform({
                first: (_c = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.role) !== null && _c !== void 0 ? _c : undefined,
                second: (_d = clientOperation.role) !== null && _d !== void 0 ? _d : undefined,
                prevState: prevState.role,
            });
        }
        if (utils_1.undefinedForAll(twoWayOperation)) {
            return Result_1.ResultModule.ok(undefined);
        }
        return Result_1.ResultModule.ok(twoWayOperation);
    },
    diff: ({ key, prevState, nextState }) => {
        const boards = boardsTransformer.diff({
            prevState: prevState.boards,
            nextState: nextState.boards,
        });
        const charactersTransformer = createCharactersTransformer(type_1.RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const characters = charactersTransformer.diff({
            prevState: prevState.characters,
            nextState: nextState.characters,
        });
        const myNumberValuesTransformer = createMyNumberValuesTransformer(type_1.RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const myNumberValues = myNumberValuesTransformer.diff({
            prevState: prevState.myNumberValues,
            nextState: nextState.myNumberValues,
        });
        const result = {
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
        if (utils_1.undefinedForAll(result)) {
            return undefined;
        }
        return result;
    },
    applyBack: ({ key, downOperation, nextState }) => {
        var _a, _b;
        const boards = boardsTransformer.applyBack({
            downOperation: downOperation.boards,
            nextState: nextState.boards,
        });
        if (boards.isError) {
            return boards;
        }
        const charactersTransformer = createCharactersTransformer(type_1.RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const characters = charactersTransformer.applyBack({
            downOperation: downOperation.characters,
            nextState: nextState.characters,
        });
        if (characters.isError) {
            return characters;
        }
        const myNumberValuesTransformer = createMyNumberValuesTransformer(type_1.RequestedBy.createdByMe({ requestedBy, userUid: key }));
        const myNumberValues = myNumberValuesTransformer.applyBack({
            downOperation: downOperation.myNumberValues,
            nextState: nextState.myNumberValues,
        });
        if (myNumberValues.isError) {
            return myNumberValues;
        }
        const result = Object.assign(Object.assign({}, nextState), { boards: boards.value, characters: characters.value, myNumberValues: myNumberValues.value });
        if (downOperation.name !== undefined) {
            result.name = (_a = downOperation.name.oldValue) !== null && _a !== void 0 ? _a : undefined;
        }
        if (downOperation.role !== undefined) {
            result.role = (_b = downOperation.role.oldValue) !== null && _b !== void 0 ? _b : undefined;
        }
        return Result_1.ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    protectedValuePolicy: {}
});
exports.transformerFactory = transformerFactory;
