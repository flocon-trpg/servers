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
exports.GlobalRoom = void 0;
const mikro_orm_1 = require("./mikro-orm");
const core_1 = require("@mikro-orm/core");
const RoomConverterModule = __importStar(require("../../../@shared/ot/room/converter"));
const RoomModule = __importStar(require("../../../@shared/ot/room/v1"));
const Converter = __importStar(require("../../../@shared/ot/room/converter"));
const Result_1 = require("../../../@shared/Result");
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
            ToGlobal.state = (entity) => {
                const result = RoomConverterModule.decodeDbState(entity.value);
                return Object.assign(Object.assign({}, result), { name: entity.name });
            };
            const downOperation = (entity) => {
                const result = RoomConverterModule.decodeDownOperation(entity.value);
                return result;
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
                let operation = sortedOperationEntities.length === 0 ? undefined : downOperation(sortedOperationEntities[0]);
                let isFirst = false;
                for (const model of sortedOperationEntities) {
                    if (isFirst) {
                        isFirst = true;
                        continue;
                    }
                    const second = downOperation(model);
                    if (operation === undefined) {
                        operation = second;
                        continue;
                    }
                    const composed = RoomModule.composeDownOperation({ first: operation, second });
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
                return {
                    stateJson: RoomConverterModule.stringifyState(RoomModule.toClientState(requestedBy)(source)),
                };
            };
            ToGraphQL.operation = ({ operation, prevState, nextState, requestedBy, }) => {
                const upOperationBase = RoomModule.toClientOperation(requestedBy)({
                    prevState,
                    nextState,
                    diff: operation,
                });
                return RoomConverterModule.stringifyUpOperation(upOperationBase);
            };
        })(ToGraphQL = Global.ToGraphQL || (Global.ToGraphQL = {}));
        Global.applyToEntity = ({ em, target, prevState, operation, }) => {
            const nextState = RoomModule.apply({
                state: prevState,
                operation,
            });
            if (nextState.isError) {
                throw nextState.error;
            }
            target.name = nextState.value.name;
            target.value = RoomConverterModule.exactDbState(nextState.value);
            const prevRevision = target.revision;
            target.revision += 1;
            const op = new mikro_orm_1.RoomOp({
                prevRevision,
                value: RoomModule.toDownOperation(operation),
            });
            op.room = core_1.Reference.create(target);
            em.persist(op);
            return nextState.value;
        };
    })(Global = GlobalRoom.Global || (GlobalRoom.Global = {}));
    let GraphQL;
    (function (GraphQL) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.upOperation = (source) => {
                return Converter.parseUpOperation(source.valueJson);
            };
        })(ToGlobal = GraphQL.ToGlobal || (GraphQL.ToGlobal = {}));
    })(GraphQL = GlobalRoom.GraphQL || (GlobalRoom.GraphQL = {}));
})(GlobalRoom = exports.GlobalRoom || (exports.GlobalRoom = {}));
