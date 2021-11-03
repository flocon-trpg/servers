"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalRoom = void 0;
const mikro_orm_1 = require("./mikro-orm");
const core_1 = require("@mikro-orm/core");
const result_1 = require("@kizahasi/result");
const flocon_core_1 = require("@kizahasi/flocon-core");
const mikro_orm_2 = require("../participant/mikro-orm");
const util_1 = require("@kizahasi/util");
const mikro_orm_3 = require("../user/mikro-orm");
const ParticipantRoleType_1 = require("../../../enums/ParticipantRoleType");
const convertToMaxLength100String_1 = require("../../../utils/convertToMaxLength100String");
const readonlyNonEmptyArray_1 = require("../../../utils/readonlyNonEmptyArray");
const isSequential = (array, getIndex) => {
    const sorted = array
        .map(value => ({ index: getIndex(value), value }))
        .sort((x, y) => x.index - y.index);
    if (!(0, readonlyNonEmptyArray_1.isNonEmptyArray)(sorted)) {
        throw new Error('this should not happen');
    }
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
                };
            }
        }
        maxIndex = elem.index;
        previousElement = elem;
    }
    return {
        type: 'Sequential',
        minIndex,
        maxIndex,
        sortedResult: sorted,
    };
};
var GlobalRoom;
(function (GlobalRoom) {
    let MikroORM;
    (function (MikroORM) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.state = async (roomEntity, em) => {
                const result = (0, flocon_core_1.decodeDbState)(roomEntity.value);
                const participants = {};
                await (0, util_1.recordForEachAsync)(result.participants, async (participant, participantKey) => {
                    const participantEntity = await em.findOne(mikro_orm_2.Participant, {
                        room: { id: roomEntity.id },
                        user: { userUid: participantKey },
                    });
                    const name = participantEntity === null || participantEntity === void 0 ? void 0 : participantEntity.name;
                    participants[participantKey] = Object.assign(Object.assign({}, participant), { name: name == null ? undefined : (0, convertToMaxLength100String_1.convertToMaxLength100String)(name), role: participantEntity === null || participantEntity === void 0 ? void 0 : participantEntity.role });
                });
                return Object.assign(Object.assign({}, result), { createdBy: roomEntity.createdBy, name: roomEntity.name, participants });
            };
            const downOperation = (entity) => {
                const result = (0, flocon_core_1.decodeDownOperation)(entity.value);
                return result;
            };
            ToGlobal.downOperationMany = async ({ em, roomId, revisionRange, }) => {
                if (revisionRange.expectedTo != null) {
                    if (revisionRange.from > revisionRange.expectedTo) {
                        throw new Error('Must be "revisionRange.from > revisionRange.expectedTo"');
                    }
                    if (revisionRange.from === revisionRange.expectedTo) {
                        return result_1.Result.ok(undefined);
                    }
                }
                const operationEntities = await em.find(mikro_orm_1.RoomOp, {
                    room: { id: roomId },
                    prevRevision: { $gte: revisionRange.from },
                });
                if (!(0, readonlyNonEmptyArray_1.isNonEmptyArray)(operationEntities)) {
                    if (revisionRange.expectedTo == null) {
                        return result_1.Result.ok(undefined);
                    }
                    return result_1.Result.error('Database error: There are missing operations. Client state is too old?');
                }
                if (revisionRange.expectedTo != null) {
                    const expectedOperationEntitiesLength = revisionRange.expectedTo - revisionRange.from;
                    if (expectedOperationEntitiesLength < operationEntities.length) {
                        return result_1.Result.error('Database error: There are duplicate operations. Multiple apps tried to update same database simultaneously?');
                    }
                    if (expectedOperationEntitiesLength > operationEntities.length) {
                        return result_1.Result.error('Database error: There are missing operations. Client state is too old?');
                    }
                }
                const isSequentialResult = isSequential(operationEntities, o => o.prevRevision);
                if (isSequentialResult.type === 'NotSequential') {
                    return result_1.Result.error('Database error: There are missing operations. Multiple apps tried to update same database simultaneously?');
                }
                if (isSequentialResult.type === 'DuplicateElement') {
                    return result_1.Result.error('Database error: There are duplicate operations. Multiple apps tried to update same database simultaneously?');
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
                    const composed = (0, flocon_core_1.composeDownOperation)({ first: operation, second });
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
                    stateJson: (0, flocon_core_1.stringifyState)((0, flocon_core_1.toClientState)(requestedBy)(source)),
                };
            };
            ToGraphQL.operation = ({ prevState, nextState, requestedBy, }) => {
                const prevClientState = (0, flocon_core_1.toClientState)(requestedBy)(prevState);
                const nextClientState = (0, flocon_core_1.toClientState)(requestedBy)(nextState);
                const diffOperation = (0, flocon_core_1.diff)({
                    prevState: prevClientState,
                    nextState: nextClientState,
                });
                const upOperation = diffOperation == null ? undefined : (0, flocon_core_1.toUpOperation)(diffOperation);
                return (0, flocon_core_1.stringifyUpOperation)(upOperation !== null && upOperation !== void 0 ? upOperation : { $v: 1, $r: 2 });
            };
        })(ToGraphQL = Global.ToGraphQL || (Global.ToGraphQL = {}));
        class EnsureParticipantEntity {
            constructor(em, room, participantKey) {
                this.em = em;
                this.room = room;
                this.participantKey = participantKey;
                this.participantEntity = null;
            }
            async get() {
                if (this.participantEntity == null) {
                    this.participantEntity = await this.em.findOne(mikro_orm_2.Participant, {
                        room: { id: this.room.id },
                        user: { userUid: this.participantKey },
                    });
                    if (this.participantEntity == null) {
                        const user = await this.em.findOne(mikro_orm_3.User, { userUid: this.participantKey });
                        if (user == null) {
                            throw new Error(`Tried to apply a Participant entity, but User was not found. roomId: ${this.room.id}, participantKey:${this.participantKey}`);
                        }
                        this.participantEntity = new mikro_orm_2.Participant();
                        this.room.participants.add(this.participantEntity);
                        user.participants.add(this.participantEntity);
                        this.em.persist(this.participantEntity);
                    }
                }
                return this.participantEntity;
            }
        }
        const maxJsonLength = 1000000;
        Global.applyToEntity = async ({ em, target, prevState, operation, }) => {
            var _a;
            const nextState = (0, flocon_core_1.apply)({
                state: prevState,
                operation: (0, flocon_core_1.toUpOperation)(operation),
            });
            if (nextState.isError) {
                throw nextState.error;
            }
            target.name = nextState.value.name;
            const newValue = (0, flocon_core_1.exactDbState)(nextState.value);
            const newValueJson = JSON.stringify(newValue);
            if (newValueJson.length > maxJsonLength) {
                const oldValue = target.value;
                const oldValueJson = JSON.stringify(oldValue);
                if (oldValueJson.length < maxJsonLength) {
                    throw new Error('value size limit exceeded');
                }
            }
            target.value = newValue;
            const prevRevision = target.revision;
            target.revision += 1;
            await (0, util_1.recordForEachAsync)((_a = operation.participants) !== null && _a !== void 0 ? _a : {}, async (participant, participantKey) => {
                var _a, _b, _c, _d;
                const ensureEntity = new EnsureParticipantEntity(em, target, participantKey);
                if (participant.type === flocon_core_1.update) {
                    if (participant.update.name != null) {
                        (await ensureEntity.get()).name =
                            (_a = participant.update.name.newValue) !== null && _a !== void 0 ? _a : undefined;
                    }
                    if (participant.update.role != null) {
                        (await ensureEntity.get()).role =
                            (_b = (0, ParticipantRoleType_1.nullableStringToParticipantRoleType)(participant.update.role.newValue)) !== null && _b !== void 0 ? _b : undefined;
                    }
                    return;
                }
                if (participant.replace.newValue == null) {
                    em.remove(await ensureEntity.get());
                    return;
                }
                const newParticipant = await ensureEntity.get();
                newParticipant.name = (_c = participant.replace.newValue.name) !== null && _c !== void 0 ? _c : undefined;
                newParticipant.role =
                    (_d = (0, ParticipantRoleType_1.nullableStringToParticipantRoleType)(participant.replace.newValue.role)) !== null && _d !== void 0 ? _d : undefined;
            });
            const op = new mikro_orm_1.RoomOp({
                prevRevision,
                value: (0, flocon_core_1.toDownOperation)(operation),
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
                return (0, flocon_core_1.parseUpOperation)(source.valueJson);
            };
        })(ToGlobal = GraphQL.ToGlobal || (GraphQL.ToGlobal = {}));
    })(GraphQL = GlobalRoom.GraphQL || (GlobalRoom.GraphQL = {}));
})(GlobalRoom = exports.GlobalRoom || (exports.GlobalRoom = {}));
