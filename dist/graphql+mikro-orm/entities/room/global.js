"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalRoom = void 0;
const mikro_orm_1 = require("./mikro-orm");
const core_1 = require("@mikro-orm/core");
const result_1 = require("@kizahasi/result");
const flocon_core_1 = require("@kizahasi/flocon-core");
const isSequential = (array, getIndex) => {
    const sorted = array
        .map(value => ({ index: getIndex(value), value }))
        .sort((x, y) => x.index - y.index);
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
                const result = flocon_core_1.decodeDbState(entity.value);
                return Object.assign(Object.assign({}, result), { createdBy: entity.createdBy, name: entity.name });
            };
            const downOperation = (entity) => {
                const result = flocon_core_1.decodeDownOperation(entity.value);
                return result;
            };
            ToGlobal.downOperationMany = async ({ em, roomId, revisionRange, }) => {
                const operationEntities = await em.find(mikro_orm_1.RoomOp, {
                    room: { id: roomId },
                    prevRevision: { $gte: revisionRange.from },
                });
                const isSequentialResult = isSequential(operationEntities, o => o.prevRevision);
                if (isSequentialResult.type === 'NotSequential') {
                    return result_1.Result.error('Database error. There are missing operations. Multiple server apps edit same database simultaneously?');
                }
                if (isSequentialResult.type === 'DuplicateElement') {
                    return result_1.Result.error('Database error. There are duplicate operations. Multiple server apps edit same database simultaneously?');
                }
                if (isSequentialResult.type === 'EmptyArray') {
                    return result_1.Result.ok(undefined);
                }
                if (isSequentialResult.minIndex !== revisionRange.from) {
                    return result_1.Result.error('revision out of range(too small)');
                }
                if (revisionRange.expectedTo !== undefined) {
                    if (isSequentialResult.maxIndex !== revisionRange.expectedTo - 1) {
                        return result_1.Result.error('Database error. Revision of latest operation is not same as revision of state. Multiple server apps edit same database simultaneously?');
                    }
                }
                const sortedOperationEntities = operationEntities.sort((x, y) => x.prevRevision - y.prevRevision);
                let operation = sortedOperationEntities.length === 0
                    ? undefined
                    : downOperation(sortedOperationEntities[0]);
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
                    const composed = flocon_core_1.composeDownOperation({ first: operation, second });
                    if (composed.isError) {
                        return composed;
                    }
                    operation = composed.value;
                }
                return result_1.Result.ok(operation);
            };
        })(ToGlobal = MikroORM.ToGlobal || (MikroORM.ToGlobal = {}));
    })(MikroORM = GlobalRoom.MikroORM || (GlobalRoom.MikroORM = {}));
    let Global;
    (function (Global) {
        let ToGraphQL;
        (function (ToGraphQL) {
            ToGraphQL.state = ({ source, requestedBy, }) => {
                return {
                    stateJson: flocon_core_1.stringifyState(flocon_core_1.toClientState(requestedBy)(source)),
                };
            };
            ToGraphQL.operation = ({ prevState, nextState, requestedBy, }) => {
                const prevClientState = flocon_core_1.toClientState(requestedBy)(prevState);
                const nextClientState = flocon_core_1.toClientState(requestedBy)(nextState);
                const diffOperation = flocon_core_1.diff({
                    prevState: prevClientState,
                    nextState: nextClientState,
                });
                const upOperation = diffOperation == null ? undefined : flocon_core_1.toUpOperation(diffOperation);
                return flocon_core_1.stringifyUpOperation(upOperation !== null && upOperation !== void 0 ? upOperation : { $version: 1 });
            };
        })(ToGraphQL = Global.ToGraphQL || (Global.ToGraphQL = {}));
        Global.applyToEntity = ({ em, target, prevState, operation, }) => {
            const nextState = flocon_core_1.apply({
                state: prevState,
                operation: flocon_core_1.toUpOperation(operation),
            });
            if (nextState.isError) {
                throw nextState.error;
            }
            target.name = nextState.value.name;
            target.value = flocon_core_1.exactDbState(nextState.value);
            const prevRevision = target.revision;
            target.revision += 1;
            const op = new mikro_orm_1.RoomOp({
                prevRevision,
                value: flocon_core_1.toDownOperation(operation),
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
                return flocon_core_1.parseUpOperation(source.valueJson);
            };
        })(ToGlobal = GraphQL.ToGlobal || (GraphQL.ToGlobal = {}));
    })(GraphQL = GlobalRoom.GraphQL || (GlobalRoom.GraphQL = {}));
})(GlobalRoom = exports.GlobalRoom || (exports.GlobalRoom = {}));
