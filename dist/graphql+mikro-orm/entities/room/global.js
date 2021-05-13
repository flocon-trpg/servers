"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalRoom = void 0;
const DualKeyMap_1 = require("../../../@shared/DualKeyMap");
const Result_1 = require("../../../@shared/Result");
const Operations_1 = require("../../Operations");
const global_1 = require("./board/global");
const global_2 = require("./character/global");
const global_3 = require("../global");
const global_4 = require("./participant/global");
const global_5 = require("./bgm/global");
const mikro_orm_1 = require("./mikro-orm");
const global_6 = require("./paramName/global");
const Types_1 = require("../../Types");
const core_1 = require("@mikro-orm/core");
const utils_1 = require("../../../@shared/utils");
const isSequential = (array, getIndex) => {
    const sorted = array.map(value => ({ index: getIndex(value), value })).sort((x, y) => x.index - y.index);
    if (sorted.length === 0) {
        return { type: 'EmptyArray' };
    }
    const takeUntilSequential = [];
    const minIndex = sorted[0].index;
    let maxIndex = minIndex;
    let previousElement = null;
    for (const elem of sorted) {
        if (previousElement != null) {
            if (elem.index === previousElement.index) {
                return { type: 'DuplicateElement' };
            }
            if (elem.index - previousElement.index !== 1) {
                return {
                    type: 'NotSequential',
                    minIndex,
                    maxIndex,
                    takeUntilSequential,
                };
            }
        }
        maxIndex = elem.index;
        previousElement = elem;
        takeUntilSequential.push(elem);
    }
    return {
        type: 'Sequential',
        minIndex,
        maxIndex,
    };
};
var GlobalRoom;
(function (GlobalRoom) {
    let MikroORM;
    (function (MikroORM) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.state = async (entity) => {
                const bgms = global_5.GlobalBgm.MikroORM.ToGlobal.stateMany(await entity.roomBgms.loadItems());
                const boards = global_1.GlobalBoard.MikroORM.ToGlobal.stateMany(await entity.boards.loadItems());
                const characters = await global_2.GlobalCharacter.MikroORM.ToGlobal.stateMany(await entity.characters.loadItems());
                const paramNames = global_6.GlobalParamName.MikroORM.ToGlobal.stateMany(await entity.paramNames.loadItems());
                const participants = await global_4.GlobalParticipant.MikroORM.ToGlobal.stateMany(await entity.particis.loadItems());
                return Object.assign(Object.assign({}, entity), { bgms,
                    boards,
                    characters,
                    paramNames,
                    participants });
            };
            ToGlobal.downOperation = async ({ op, }) => {
                const bgms = await global_5.GlobalBgm.MikroORM.ToGlobal.downOperationMany({
                    add: op.addRoomBgmOps,
                    remove: op.removeRoomBgmOps,
                    update: op.updateRoomBgmOps,
                });
                if (bgms.isError) {
                    return bgms;
                }
                const boards = await global_1.GlobalBoard.MikroORM.ToGlobal.downOperationMany({
                    add: op.addBoardOps,
                    remove: op.removeBoardOps,
                    update: op.updateBoardOps,
                });
                if (boards.isError) {
                    return boards;
                }
                const characters = await global_2.GlobalCharacter.MikroORM.ToGlobal.downOperationMany({
                    add: op.addCharacterOps,
                    remove: op.removeCharacterOps,
                    update: op.updateCharacterOps,
                });
                if (characters.isError) {
                    return characters;
                }
                const paramNames = await global_6.GlobalParamName.MikroORM.ToGlobal.downOperationMany({
                    add: op.addParamNameOps,
                    remove: op.removeParamNameOps,
                    update: op.updateParamNameOps,
                });
                if (paramNames.isError) {
                    return paramNames;
                }
                const participants = await global_4.GlobalParticipant.MikroORM.ToGlobal.downOperationMany({
                    add: op.addParticiOps,
                    remove: op.removeParticiOps,
                    update: op.updateParticiOps,
                });
                if (participants.isError) {
                    return participants;
                }
                return Result_1.ResultModule.ok({
                    bgms: bgms.value,
                    boards: boards.value,
                    characters: characters.value,
                    paramNames: paramNames.value,
                    participants: participants.value,
                    name: op.name == null ? undefined : { oldValue: op.name },
                    publicChannel1Name: op.publicChannel1Name == null ? undefined : { oldValue: op.publicChannel1Name },
                    publicChannel2Name: op.publicChannel2Name == null ? undefined : { oldValue: op.publicChannel2Name },
                    publicChannel3Name: op.publicChannel3Name == null ? undefined : { oldValue: op.publicChannel3Name },
                    publicChannel4Name: op.publicChannel4Name == null ? undefined : { oldValue: op.publicChannel4Name },
                    publicChannel5Name: op.publicChannel5Name == null ? undefined : { oldValue: op.publicChannel5Name },
                    publicChannel6Name: op.publicChannel6Name == null ? undefined : { oldValue: op.publicChannel6Name },
                    publicChannel7Name: op.publicChannel7Name == null ? undefined : { oldValue: op.publicChannel7Name },
                    publicChannel8Name: op.publicChannel8Name == null ? undefined : { oldValue: op.publicChannel8Name },
                    publicChannel9Name: op.publicChannel9Name == null ? undefined : { oldValue: op.publicChannel9Name },
                    publicChannel10Name: op.publicChannel10Name == null ? undefined : { oldValue: op.publicChannel10Name },
                });
            };
            ToGlobal.downOperationMany = async ({ em, roomId, revisionRange, }) => {
                const operationEntities = await em.find(mikro_orm_1.RoomOp, { room: { id: roomId }, prevRevision: { $gte: revisionRange.from } });
                const isSequentialResult = isSequential(operationEntities, o => o.prevRevision);
                if (isSequentialResult.type === 'NotSequential') {
                    return Result_1.ResultModule.error('Database error. There are missing operations. Multiple server apps edit same database simultaneously?');
                }
                if (isSequentialResult.type === 'DuplicateElement') {
                    return Result_1.ResultModule.error('Database error. There are duplicate operations. Multiple server apps edit same database simultaneously?');
                }
                if (isSequentialResult.type === 'EmptyArray') {
                    return Result_1.ResultModule.ok(undefined);
                }
                if (isSequentialResult.minIndex !== revisionRange.from) {
                    return Result_1.ResultModule.error('revision out of range(too small)');
                }
                if (revisionRange.expectedTo !== undefined) {
                    if (isSequentialResult.maxIndex !== (revisionRange.expectedTo - 1)) {
                        return Result_1.ResultModule.error('Database error. Revision of latest operation is not same as revision of state. Multiple server apps edit same database simultaneously?');
                    }
                }
                const sortedOperationEntities = operationEntities.sort((x, y) => x.prevRevision - y.prevRevision);
                const operationResult = await MikroORM.ToGlobal.downOperation({ op: sortedOperationEntities[0] });
                if (operationResult.isError) {
                    return operationResult;
                }
                let operation = operationResult.value;
                let isFirst = false;
                for (const model of sortedOperationEntities) {
                    if (isFirst) {
                        isFirst = true;
                        continue;
                    }
                    const second = await MikroORM.ToGlobal.downOperation({ op: model });
                    if (second.isError) {
                        return second;
                    }
                    if (operation === undefined) {
                        operation = second.value;
                        continue;
                    }
                    const composed = GlobalRoom.transformerFactory({ type: Types_1.server }).composeLoose({ key: null, first: operation, second: second.value });
                    if (composed.isError) {
                        return composed;
                    }
                    operation = composed.value;
                }
                return Result_1.ResultModule.ok(operation);
            };
        })(ToGlobal = MikroORM.ToGlobal || (MikroORM.ToGlobal = {}));
    })(MikroORM = GlobalRoom.MikroORM || (GlobalRoom.MikroORM = {}));
    let Global;
    (function (Global) {
        let ToGraphQL;
        (function (ToGraphQL) {
            ToGraphQL.state = ({ source, requestedBy }) => {
                const bgms = global_5.GlobalBgm.Global.ToGraphQL.stateMany({ source: source.bgms });
                const boards = global_1.GlobalBoard.Global.ToGraphQL.stateMany({ source: source.boards });
                const characters = global_2.GlobalCharacter.Global.ToGraphQL.stateMany({ source: source.characters, requestedBy });
                const paramNames = global_6.GlobalParamName.Global.ToGraphQL.stateMany({ source: source.paramNames });
                const participants = global_4.GlobalParticipant.Global.ToGraphQL.stateMany({ source: source.participants, requestedBy });
                return {
                    name: source.name,
                    publicChannel1Name: source.publicChannel1Name,
                    publicChannel2Name: source.publicChannel2Name,
                    publicChannel3Name: source.publicChannel3Name,
                    publicChannel4Name: source.publicChannel4Name,
                    publicChannel5Name: source.publicChannel5Name,
                    publicChannel6Name: source.publicChannel6Name,
                    publicChannel7Name: source.publicChannel7Name,
                    publicChannel8Name: source.publicChannel8Name,
                    publicChannel9Name: source.publicChannel9Name,
                    publicChannel10Name: source.publicChannel10Name,
                    bgms,
                    boards,
                    characters,
                    paramNames,
                    participants,
                };
            };
            ToGraphQL.operation = ({ operation, prevState, nextState, requestedBy, }) => {
                const bgms = global_5.GlobalBgm.Global.ToGraphQL.operation({ operation: operation.bgms });
                const boards = global_1.GlobalBoard.Global.ToGraphQL.operation({ operation: operation.boards });
                const characters = global_2.GlobalCharacter.Global.ToGraphQL.operation({ operation: operation.characters, prevState: prevState.characters, nextState: nextState.characters, requestedBy });
                const paramNames = global_6.GlobalParamName.Global.ToGraphQL.operation({ operation: operation.paramNames });
                const participants = global_4.GlobalParticipant.Global.ToGraphQL.operation({ operation: operation.participants, prevState: prevState.participants, nextState: nextState.participants, requestedBy });
                return {
                    name: operation.name,
                    publicChannel1Name: operation.publicChannel1Name,
                    publicChannel2Name: operation.publicChannel2Name,
                    publicChannel3Name: operation.publicChannel3Name,
                    publicChannel4Name: operation.publicChannel4Name,
                    publicChannel5Name: operation.publicChannel5Name,
                    publicChannel6Name: operation.publicChannel6Name,
                    publicChannel7Name: operation.publicChannel7Name,
                    publicChannel8Name: operation.publicChannel8Name,
                    publicChannel9Name: operation.publicChannel9Name,
                    publicChannel10Name: operation.publicChannel10Name,
                    bgms,
                    boards,
                    characters,
                    paramNames,
                    participants,
                };
            };
        })(ToGraphQL = Global.ToGraphQL || (Global.ToGraphQL = {}));
        Global.emptyTwoWayOperation = () => ({
            bgms: new Map(),
            boards: new DualKeyMap_1.DualKeyMap(),
            characters: new DualKeyMap_1.DualKeyMap(),
            paramNames: new DualKeyMap_1.DualKeyMap(),
            participants: new Map(),
        });
        Global.applyToEntity = async ({ em, target, operation, }) => {
            const prevRevision = target.revision;
            target.revision += 1;
            const op = new mikro_orm_1.RoomOp({ prevRevision });
            op.room = core_1.Reference.create(target);
            await global_5.GlobalBgm.Global.applyToEntity({ em, parent: target, parentOp: op, operation: operation.bgms });
            await global_1.GlobalBoard.Global.applyToEntity({ em, parent: target, parentOp: op, operation: operation.boards });
            await global_2.GlobalCharacter.Global.applyToEntity({ em, parent: target, parentOp: op, operation: operation.characters });
            await global_6.GlobalParamName.Global.applyToEntity({ em, parent: target, parentOp: op, operation: operation.paramNames });
            await global_4.GlobalParticipant.Global.applyToEntity({ em, parent: target, parentOp: op, operation: operation.participants });
            if (operation.name != null) {
                target.name = operation.name.newValue;
                op.name = operation.name.oldValue;
            }
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(i => {
                const key = `publicChannel${i}Name`;
                const operationElement = operation[key];
                if (operationElement != null) {
                    target[key] = operationElement.newValue;
                    op[key] = operationElement.oldValue;
                }
            });
            em.persist(op);
        };
    })(Global = GlobalRoom.Global || (GlobalRoom.Global = {}));
    let GraphQL;
    (function (GraphQL) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.upOperation = (source) => {
                const bgms = global_5.GlobalBgm.GraphQL.ToGlobal.upOperationMany(source.value.bgms);
                if (bgms.isError) {
                    return bgms;
                }
                const boards = global_1.GlobalBoard.GraphQL.ToGlobal.upOperationMany(source.value.boards);
                if (boards.isError) {
                    return boards;
                }
                const characters = global_2.GlobalCharacter.GraphQL.ToGlobal.upOperationMany(source.value.characters);
                if (characters.isError) {
                    return characters;
                }
                const paramNames = global_6.GlobalParamName.GraphQL.ToGlobal.upOperationMany(source.value.paramNames);
                if (paramNames.isError) {
                    return paramNames;
                }
                const participants = global_4.GlobalParticipant.GraphQL.ToGlobal.upOperationManyFromInput(source.value.participants);
                if (participants.isError) {
                    return participants;
                }
                return Result_1.ResultModule.ok({
                    name: source.value.name,
                    publicChannel1Name: source.value.publicChannel1Name,
                    publicChannel2Name: source.value.publicChannel2Name,
                    publicChannel3Name: source.value.publicChannel3Name,
                    publicChannel4Name: source.value.publicChannel4Name,
                    publicChannel5Name: source.value.publicChannel5Name,
                    publicChannel6Name: source.value.publicChannel6Name,
                    publicChannel7Name: source.value.publicChannel7Name,
                    publicChannel8Name: source.value.publicChannel8Name,
                    publicChannel9Name: source.value.publicChannel9Name,
                    publicChannel10Name: source.value.publicChannel10Name,
                    bgms: bgms.value,
                    boards: boards.value,
                    characters: characters.value,
                    paramNames: paramNames.value,
                    participants: participants.value,
                });
            };
        })(ToGlobal = GraphQL.ToGlobal || (GraphQL.ToGlobal = {}));
    })(GraphQL = GlobalRoom.GraphQL || (GlobalRoom.GraphQL = {}));
    const bgmTransformer = global_5.GlobalBgm.transformerFactory;
    const bgmsTransformer = new global_3.MapTransformer(bgmTransformer);
    const boardTransformer = global_1.GlobalBoard.transformerFactory;
    const boardsTransformer = new global_3.DualKeyMapTransformer(boardTransformer);
    const createCharacterTransformer = (operatedBy) => global_2.GlobalCharacter.transformerFactory(operatedBy);
    const createCharactersTransformer = (operatedBy) => new global_3.DualKeyMapTransformer(createCharacterTransformer(operatedBy));
    const paramNameTransformer = global_6.GlobalParamName.transformerFactory;
    const paramNamesTransformer = new global_3.DualKeyMapTransformer(paramNameTransformer);
    const createParticipantTransformer = (operatedBy) => global_4.GlobalParticipant.transformerFactory(operatedBy);
    const createParticipantsTransformer = (operatedBy) => new global_3.MapTransformer(createParticipantTransformer(operatedBy));
    GlobalRoom.transformerFactory = (operatedBy) => ({
        composeLoose: ({ first, second }) => {
            var _a, _b, _c, _d, _e;
            const bgms = bgmsTransformer.composeLoose({
                first: first.bgms,
                second: second.bgms,
            });
            if (bgms.isError) {
                return bgms;
            }
            const boards = boardsTransformer.composeLoose({
                first: first.boards,
                second: second.boards,
            });
            if (boards.isError) {
                return boards;
            }
            const characters = createCharactersTransformer(operatedBy).composeLoose({
                first: first.characters,
                second: second.characters,
            });
            if (characters.isError) {
                return characters;
            }
            const paramNames = paramNamesTransformer.composeLoose({
                first: first.paramNames,
                second: second.paramNames,
            });
            if (paramNames.isError) {
                return paramNames;
            }
            const participants = createParticipantsTransformer(operatedBy).composeLoose({
                first: first.participants,
                second: second.participants,
            });
            if (participants.isError) {
                return participants;
            }
            const valueProps = {
                name: Operations_1.ReplaceStringDownOperationModule.compose(first.name, second.name),
                publicChannel1Name: Operations_1.ReplaceStringDownOperationModule.compose(first.publicChannel1Name, second.publicChannel1Name),
                publicChannel2Name: Operations_1.ReplaceStringDownOperationModule.compose(first.publicChannel2Name, second.publicChannel2Name),
                publicChannel3Name: Operations_1.ReplaceStringDownOperationModule.compose(first.publicChannel3Name, second.publicChannel3Name),
                publicChannel4Name: Operations_1.ReplaceStringDownOperationModule.compose(first.publicChannel4Name, second.publicChannel4Name),
                publicChannel5Name: Operations_1.ReplaceStringDownOperationModule.compose(first.publicChannel5Name, second.publicChannel5Name),
                publicChannel6Name: Operations_1.ReplaceStringDownOperationModule.compose(first.publicChannel6Name, second.publicChannel6Name),
                publicChannel7Name: Operations_1.ReplaceStringDownOperationModule.compose(first.publicChannel7Name, second.publicChannel7Name),
                publicChannel8Name: Operations_1.ReplaceStringDownOperationModule.compose(first.publicChannel8Name, second.publicChannel8Name),
                publicChannel9Name: Operations_1.ReplaceStringDownOperationModule.compose(first.publicChannel9Name, second.publicChannel9Name),
                publicChannel10Name: Operations_1.ReplaceStringDownOperationModule.compose(first.publicChannel10Name, second.publicChannel10Name),
                bgms: (_a = bgms.value) !== null && _a !== void 0 ? _a : new Map(),
                boards: (_b = boards.value) !== null && _b !== void 0 ? _b : new DualKeyMap_1.DualKeyMap(),
                characters: (_c = characters.value) !== null && _c !== void 0 ? _c : new DualKeyMap_1.DualKeyMap(),
                paramNames: (_d = paramNames.value) !== null && _d !== void 0 ? _d : new DualKeyMap_1.DualKeyMap(),
                participants: (_e = participants.value) !== null && _e !== void 0 ? _e : new Map(),
            };
            return Result_1.ResultModule.ok(valueProps);
        },
        restore: ({ nextState, downOperation }) => {
            if (downOperation === undefined) {
                return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
            }
            const bgms = bgmsTransformer.restore({
                nextState: nextState.bgms,
                downOperation: downOperation.bgms,
            });
            if (bgms.isError) {
                return bgms;
            }
            const boards = boardsTransformer.restore({
                nextState: nextState.boards,
                downOperation: downOperation.boards,
            });
            if (boards.isError) {
                return boards;
            }
            const characters = createCharactersTransformer(operatedBy).restore({
                nextState: nextState.characters,
                downOperation: downOperation.characters,
            });
            if (characters.isError) {
                return characters;
            }
            const paramNames = paramNamesTransformer.restore({
                nextState: nextState.paramNames,
                downOperation: downOperation.paramNames,
            });
            if (paramNames.isError) {
                return paramNames;
            }
            const participants = createParticipantsTransformer(operatedBy).restore({
                nextState: nextState.participants,
                downOperation: downOperation.participants,
            });
            if (participants.isError) {
                return participants;
            }
            const prevState = Object.assign(Object.assign({}, nextState), { bgms: bgms.value.prevState, boards: boards.value.prevState, characters: characters.value.prevState, paramNames: paramNames.value.prevState, participants: participants.value.prevState });
            const twoWayOperation = {
                bgms: bgms.value.twoWayOperation,
                boards: boards.value.twoWayOperation,
                characters: characters.value.twoWayOperation,
                paramNames: paramNames.value.twoWayOperation,
                participants: participants.value.twoWayOperation,
            };
            if (downOperation.name !== undefined) {
                prevState.name = downOperation.name.oldValue;
                twoWayOperation.name = Object.assign(Object.assign({}, downOperation.name), { newValue: nextState.name });
            }
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(i => {
                const key = `publicChannel${i}Name`;
                const downOperationValue = downOperation[key];
                if (downOperationValue !== undefined) {
                    prevState[key] = downOperationValue.oldValue;
                    twoWayOperation[key] = Object.assign(Object.assign({}, downOperationValue), { newValue: nextState[key] });
                }
            });
            return Result_1.ResultModule.ok({ prevState, twoWayOperation });
        },
        transform: ({ prevState, currentState, clientOperation, serverOperation }) => {
            var _a, _b, _c, _d, _e;
            const bgms = bgmsTransformer.transform({
                prevState: prevState.bgms,
                currentState: currentState.bgms,
                clientOperation: clientOperation.bgms,
                serverOperation: (_a = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.bgms) !== null && _a !== void 0 ? _a : new Map(),
            });
            if (bgms.isError) {
                return bgms;
            }
            const boards = boardsTransformer.transform({
                prevState: prevState.boards,
                currentState: currentState.boards,
                clientOperation: clientOperation.boards,
                serverOperation: (_b = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.boards) !== null && _b !== void 0 ? _b : new DualKeyMap_1.DualKeyMap(),
            });
            if (boards.isError) {
                return boards;
            }
            const characters = createCharactersTransformer(operatedBy).transform({
                prevState: prevState.characters,
                currentState: currentState.characters,
                clientOperation: clientOperation.characters,
                serverOperation: (_c = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.characters) !== null && _c !== void 0 ? _c : new DualKeyMap_1.DualKeyMap(),
            });
            if (characters.isError) {
                return characters;
            }
            const paramNames = paramNamesTransformer.transform({
                prevState: prevState.paramNames,
                currentState: currentState.paramNames,
                clientOperation: clientOperation.paramNames,
                serverOperation: (_d = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.paramNames) !== null && _d !== void 0 ? _d : new DualKeyMap_1.DualKeyMap(),
            });
            if (paramNames.isError) {
                return paramNames;
            }
            const participants = createParticipantsTransformer(operatedBy).transform({
                prevState: prevState.participants,
                currentState: currentState.participants,
                clientOperation: clientOperation.participants,
                serverOperation: (_e = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.participants) !== null && _e !== void 0 ? _e : new Map(),
            });
            if (participants.isError) {
                return participants;
            }
            const twoWayOperation = {};
            twoWayOperation.name = Operations_1.ReplaceStringTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.name,
                second: clientOperation.name,
                prevState: prevState.name,
            });
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(i => {
                const key = `publicChannel${i}Name`;
                twoWayOperation[key] = Operations_1.ReplaceStringTwoWayOperationModule.transform({
                    first: serverOperation == null ? undefined : serverOperation[key],
                    second: clientOperation[key],
                    prevState: prevState[key],
                });
            });
            if (utils_1.undefinedForAll(twoWayOperation) && bgms.value.size === 0 && boards.value.size === 0 && characters.value.size === 0 && paramNames.value.size === 0 && participants.value.size === 0) {
                return Result_1.ResultModule.ok(undefined);
            }
            return Result_1.ResultModule.ok(Object.assign(Object.assign({}, twoWayOperation), { bgms: bgms.value, boards: boards.value, characters: characters.value, paramNames: paramNames.value, participants: participants.value }));
        },
        diff: ({ prevState, nextState }) => {
            const bgms = bgmsTransformer.diff({
                prevState: prevState.bgms,
                nextState: nextState.bgms,
            });
            const boards = boardsTransformer.diff({
                prevState: prevState.boards,
                nextState: nextState.boards,
            });
            const characters = createCharactersTransformer(operatedBy).diff({
                prevState: prevState.characters,
                nextState: nextState.characters,
            });
            const paramNames = paramNamesTransformer.diff({
                prevState: prevState.paramNames,
                nextState: nextState.paramNames,
            });
            const participants = createParticipantsTransformer(operatedBy).diff({
                prevState: prevState.participants,
                nextState: nextState.participants,
            });
            const resultType = {};
            if (prevState.name !== nextState.name) {
                resultType.name = { oldValue: prevState.name, newValue: nextState.name };
            }
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(i => {
                const key = `publicChannel${i}Name`;
                if (prevState[key] !== nextState[key]) {
                    resultType[key] = { oldValue: prevState[key], newValue: nextState[key] };
                }
            });
            if (utils_1.undefinedForAll(resultType) && bgms.size === 0 && boards.size === 0 && characters.size === 0 && paramNames.size === 0 && participants.size === 0) {
                return undefined;
            }
            return Object.assign(Object.assign({}, resultType), { bgms, boards, characters, paramNames, participants });
        },
        applyBack: ({ downOperation, nextState }) => {
            const bgms = bgmsTransformer.applyBack({
                downOperation: downOperation.bgms,
                nextState: nextState.bgms,
            });
            if (bgms.isError) {
                return bgms;
            }
            const boards = boardsTransformer.applyBack({
                downOperation: downOperation.boards,
                nextState: nextState.boards,
            });
            if (boards.isError) {
                return boards;
            }
            const characters = createCharactersTransformer(operatedBy).applyBack({
                downOperation: downOperation.characters,
                nextState: nextState.characters,
            });
            if (characters.isError) {
                return characters;
            }
            const paramNames = paramNamesTransformer.applyBack({
                downOperation: downOperation.paramNames,
                nextState: nextState.paramNames,
            });
            if (paramNames.isError) {
                return paramNames;
            }
            const participants = createParticipantsTransformer(operatedBy).applyBack({
                downOperation: downOperation.participants,
                nextState: nextState.participants,
            });
            if (participants.isError) {
                return participants;
            }
            const result = Object.assign(Object.assign({}, nextState), { bgms: bgms.value, boards: boards.value, characters: characters.value, paramNames: paramNames.value, participants: participants.value });
            if (downOperation.name !== undefined) {
                result.name = downOperation.name.oldValue;
            }
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(i => {
                const key = `publicChannel${i}Name`;
                const downOperationValue = downOperation[key];
                if (downOperationValue !== undefined) {
                    result[key] = downOperationValue.oldValue;
                }
            });
            return Result_1.ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        protectedValuePolicy: {}
    });
})(GlobalRoom = exports.GlobalRoom || (exports.GlobalRoom = {}));
