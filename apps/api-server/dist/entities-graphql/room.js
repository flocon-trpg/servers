'use strict';

var FilePathModule = require('@flocon-trpg/core');
var utils = require('@flocon-trpg/utils');
var result = require('@kizahasi/result');
var core = require('@mikro-orm/core');
var entity = require('../entities/participant/entity.js');
var entity$1 = require('../entities/room/entity.js');
var entity$2 = require('../entities/user/entity.js');
var ParticipantRoleType = require('../enums/ParticipantRoleType.js');
var convertToMaxLength100String = require('../utils/convertToMaxLength100String.js');

const isSequential = (array, getIndex) => {
    const sorted = array
        .map(value => ({ index: getIndex(value), value }))
        .sort((x, y) => x.index - y.index);
    if (!utils.isReadonlyNonEmptyArray(sorted)) {
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
exports.GlobalRoom = void 0;
(function (GlobalRoom) {
    (function (MikroORM) {
        (function (ToGlobal) {
            ToGlobal.state = async (roomEntity, em) => {
                const result = FilePathModule.decodeDbState(roomEntity.value);
                const participants = {};
                const participantEntities = await em.find(entity.Participant, {
                    room: { id: roomEntity.id },
                });
                for (const participantEntity of participantEntities) {
                    const name = participantEntity?.name;
                    participants[participantEntity.user.userUid] = {
                        $v: 2,
                        $r: 1,
                        name: name == null ? undefined : convertToMaxLength100String.convertToMaxLength100String(name),
                        role: participantEntity?.role,
                    };
                }
                return {
                    ...result,
                    createdBy: roomEntity.createdBy,
                    name: roomEntity.name,
                    participants,
                };
            };
            const downOperation = (entity) => {
                const result = FilePathModule.decodeDownOperation(entity.value);
                return result;
            };
            ToGlobal.downOperationMany = async ({ em, roomId, revisionRange, }) => {
                if (revisionRange.expectedTo != null) {
                    if (revisionRange.from > revisionRange.expectedTo) {
                        throw new Error('Must be "revisionRange.from > revisionRange.expectedTo"');
                    }
                    if (revisionRange.from === revisionRange.expectedTo) {
                        return result.Result.ok(undefined);
                    }
                }
                const operationEntities = await em.find(entity$1.RoomOp, {
                    room: { id: roomId },
                    prevRevision: { $gte: revisionRange.from },
                });
                if (!utils.isReadonlyNonEmptyArray(operationEntities)) {
                    if (revisionRange.expectedTo == null) {
                        return result.Result.ok(undefined);
                    }
                    return result.Result.error('Some operations are not found. Maybe your request is too old, or ROOMHIST_COUNT is too small?');
                }
                if (revisionRange.expectedTo != null) {
                    const expectedOperationEntitiesLength = revisionRange.expectedTo - revisionRange.from;
                    if (expectedOperationEntitiesLength < operationEntities.length) {
                        return result.Result.error('There are duplicate operations. Multiple apps tried to update same database simultaneously?');
                    }
                    if (expectedOperationEntitiesLength > operationEntities.length) {
                        return result.Result.error('Some operations are not found. Maybe your request is too old, or ROOMHIST_COUNT is too small?');
                    }
                }
                const isSequentialResult = isSequential(operationEntities, o => o.prevRevision);
                if (isSequentialResult.type === 'NotSequential') {
                    return result.Result.error('There are missing operations. Multiple apps tried to update same database simultaneously?');
                }
                if (isSequentialResult.type === 'DuplicateElement') {
                    return result.Result.error('There are duplicate operations. Multiple apps tried to update same database simultaneously?');
                }
                const sortedOperationEntities = operationEntities.sort((x, y) => x.prevRevision - y.prevRevision);
                let operation = sortedOperationEntities.length === 0
                    ? undefined
                    : downOperation(sortedOperationEntities[0]);
                for (const model of sortedOperationEntities) {
                    const second = downOperation(model);
                    if (operation === undefined) {
                        operation = second;
                        continue;
                    }
                    const composed = FilePathModule.composeDownOperation(FilePathModule.roomTemplate)({
                        first: operation,
                        second,
                    });
                    if (composed.isError) {
                        return composed;
                    }
                    operation = composed.value;
                }
                return result.Result.ok(operation);
            };
        })(MikroORM.ToGlobal || (MikroORM.ToGlobal = {}));
    })(GlobalRoom.MikroORM || (GlobalRoom.MikroORM = {}));
    (function (Global) {
        (function (ToGraphQL) {
            ToGraphQL.state = ({ source, requestedBy, }) => {
                return {
                    stateJson: FilePathModule.stringifyState(FilePathModule.toClientState(requestedBy)(source)),
                };
            };
            ToGraphQL.operation = ({ prevState, nextState, requestedBy, }) => {
                const prevClientState = FilePathModule.toClientState(requestedBy)(prevState);
                const nextClientState = FilePathModule.toClientState(requestedBy)(nextState);
                const diffOperation = FilePathModule.diff(FilePathModule.roomTemplate)({
                    prevState: prevClientState,
                    nextState: nextClientState,
                });
                const upOperation = diffOperation == null ? undefined : FilePathModule.toUpOperation(FilePathModule.roomTemplate)(diffOperation);
                return FilePathModule.stringifyUpOperation(upOperation ?? { $v: 2, $r: 1 });
            };
        })(Global.ToGraphQL || (Global.ToGraphQL = {}));
        class EnsureParticipantEntity {
            constructor(em, room, participantKey) {
                this.em = em;
                this.room = room;
                this.participantKey = participantKey;
                this.participantEntity = null;
            }
            async get() {
                if (this.participantEntity == null) {
                    this.participantEntity = await this.em.findOne(entity.Participant, {
                        room: { id: this.room.id },
                        user: { userUid: this.participantKey },
                    });
                    if (this.participantEntity == null) {
                        const user = await this.em.findOne(entity$2.User, { userUid: this.participantKey });
                        if (user == null) {
                            throw new Error(`Tried to apply a Participant entity, but User was not found. roomId: ${this.room.id}, participantKey:${this.participantKey}`);
                        }
                        this.participantEntity = new entity.Participant();
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
            const nextState = FilePathModule.apply(FilePathModule.roomTemplate)({
                state: prevState,
                operation: FilePathModule.toUpOperation(FilePathModule.roomTemplate)(operation),
            });
            if (nextState.isError) {
                throw FilePathModule.toOtError(nextState.error);
            }
            target.name = nextState.value.name;
            const newValue = FilePathModule.exactDbState(nextState.value);
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
            target.completeUpdatedAt = new Date();
            await utils.recordForEachAsync(operation.participants ?? {}, async (participant, participantKey) => {
                const ensureEntity = new EnsureParticipantEntity(em, target, participantKey);
                if (participant.type === FilePathModule.update) {
                    if (participant.update.name != null) {
                        (await ensureEntity.get()).name =
                            participant.update.name.newValue ?? undefined;
                    }
                    if (participant.update.role != null) {
                        (await ensureEntity.get()).role =
                            ParticipantRoleType.nullableStringToParticipantRoleType(participant.update.role.newValue) ?? undefined;
                    }
                    return;
                }
                if (participant.replace.newValue == null) {
                    em.remove(await ensureEntity.get());
                    return;
                }
                const newParticipant = await ensureEntity.get();
                newParticipant.name = participant.replace.newValue.name ?? undefined;
                newParticipant.role =
                    ParticipantRoleType.nullableStringToParticipantRoleType(participant.replace.newValue.role) ??
                        undefined;
            });
            const op = new entity$1.RoomOp({
                prevRevision,
                value: FilePathModule.toDownOperation(FilePathModule.roomTemplate)(operation),
            });
            op.room = core.Reference.create(target);
            em.persist(op);
            return nextState.value;
        };
        Global.cleanOldRoomOp = async ({ em, room, roomHistCount, }) => {
            if (roomHistCount == null || roomHistCount < 0) {
                return;
            }
            const toRemove = await em.find(entity$1.RoomOp, {
                room: { id: room.id },
                prevRevision: { $lt: room.revision - roomHistCount },
            });
            if (toRemove.length === 0) {
                return;
            }
            await room.roomOperations.init();
            for (const tr of toRemove) {
                em.remove(tr);
                room.roomOperations.remove(tr);
            }
        };
    })(GlobalRoom.Global || (GlobalRoom.Global = {}));
})(exports.GlobalRoom || (exports.GlobalRoom = {}));
//# sourceMappingURL=room.js.map
