'use strict';

var tslib = require('tslib');
var core = require('@mikro-orm/core');
var uuid = require('uuid');
var easyFlake = require('../../utils/easyFlake.js');
var entity = require('../participant/entity.js');
var entity$1 = require('../roomMessage/entity.js');
var entity$2 = require('../user/entity.js');

exports.Room = class Room {
    constructor({ createdBy, name, value, }) {
        this.id = easyFlake.easyFlake();
        this.version = 1;
        this.revision = 0;
        this.participants = new core.Collection(this);
        this.roomOperations = new core.Collection(this);
        this.roomChatChs = new core.Collection(this);
        this.roomPrvMsgs = new core.Collection(this);
        this.dicePieceLogs = new core.Collection(this);
        this.stringPieceLogs = new core.Collection(this);
        this.roomSes = new core.Collection(this);
        this.bookmarkedBy = new core.Collection(this);
        this.createdBy = createdBy;
        this.name = name;
        this.value = value;
    }
};
tslib.__decorate([
    core.PrimaryKey(),
    tslib.__metadata("design:type", String)
], exports.Room.prototype, "id", void 0);
tslib.__decorate([
    core.Property({ version: true, index: true }),
    tslib.__metadata("design:type", Number)
], exports.Room.prototype, "version", void 0);
tslib.__decorate([
    core.Property({ type: Date, nullable: true, onCreate: () => new Date(), index: true }),
    tslib.__metadata("design:type", Date)
], exports.Room.prototype, "createdAt", void 0);
tslib.__decorate([
    core.Property({ type: Date, nullable: true, onUpdate: () => new Date(), index: true }),
    tslib.__metadata("design:type", Date)
], exports.Room.prototype, "updatedAt", void 0);
tslib.__decorate([
    core.Property({ type: Date, nullable: true, index: true }),
    tslib.__metadata("design:type", Date)
], exports.Room.prototype, "completeUpdatedAt", void 0);
tslib.__decorate([
    core.Property({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.Room.prototype, "playerPasswordHash", void 0);
tslib.__decorate([
    core.Property({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.Room.prototype, "spectatorPasswordHash", void 0);
tslib.__decorate([
    core.Property({ index: true }),
    tslib.__metadata("design:type", String)
], exports.Room.prototype, "createdBy", void 0);
tslib.__decorate([
    core.Property(),
    tslib.__metadata("design:type", String)
], exports.Room.prototype, "name", void 0);
tslib.__decorate([
    core.Property({ type: core.JsonType }),
    tslib.__metadata("design:type", Object)
], exports.Room.prototype, "value", void 0);
tslib.__decorate([
    core.Property(),
    tslib.__metadata("design:type", Number)
], exports.Room.prototype, "revision", void 0);
tslib.__decorate([
    core.OneToMany(() => entity.Participant, x => x.room, { orphanRemoval: true }),
    tslib.__metadata("design:type", Object)
], exports.Room.prototype, "participants", void 0);
tslib.__decorate([
    core.OneToMany(() => exports.RoomOp, x => x.room, { orphanRemoval: true }),
    tslib.__metadata("design:type", Object)
], exports.Room.prototype, "roomOperations", void 0);
tslib.__decorate([
    core.OneToMany(() => entity$1.RoomPubCh, x => x.room, { orphanRemoval: true }),
    tslib.__metadata("design:type", Object)
], exports.Room.prototype, "roomChatChs", void 0);
tslib.__decorate([
    core.OneToMany(() => entity$1.RoomPrvMsg, x => x.room, { orphanRemoval: true }),
    tslib.__metadata("design:type", Object)
], exports.Room.prototype, "roomPrvMsgs", void 0);
tslib.__decorate([
    core.OneToMany(() => entity$1.DicePieceLog, x => x.room, { orphanRemoval: true }),
    tslib.__metadata("design:type", Object)
], exports.Room.prototype, "dicePieceLogs", void 0);
tslib.__decorate([
    core.OneToMany(() => entity$1.StringPieceLog, x => x.room, { orphanRemoval: true }),
    tslib.__metadata("design:type", Object)
], exports.Room.prototype, "stringPieceLogs", void 0);
tslib.__decorate([
    core.OneToMany(() => entity$1.RoomSe, x => x.room, { orphanRemoval: true }),
    tslib.__metadata("design:type", Object)
], exports.Room.prototype, "roomSes", void 0);
tslib.__decorate([
    core.ManyToMany(() => entity$2.User, user => user.bookmarkedRooms),
    tslib.__metadata("design:type", Object)
], exports.Room.prototype, "bookmarkedBy", void 0);
exports.Room = tslib.__decorate([
    core.Entity(),
    tslib.__metadata("design:paramtypes", [Object])
], exports.Room);
exports.RoomOp = class RoomOp {
    constructor({ prevRevision, value, }) {
        this.id = uuid.v4();
        this.prevRevision = prevRevision;
        this.value = value;
    }
};
tslib.__decorate([
    core.PrimaryKey(),
    tslib.__metadata("design:type", String)
], exports.RoomOp.prototype, "id", void 0);
tslib.__decorate([
    core.Property({
        type: Date,
        nullable: true,
        onCreate: () => new Date(),
        index: true,
        default: null,
    }),
    tslib.__metadata("design:type", Date)
], exports.RoomOp.prototype, "createdAt", void 0);
tslib.__decorate([
    core.Property({ index: true }),
    tslib.__metadata("design:type", Number)
], exports.RoomOp.prototype, "prevRevision", void 0);
tslib.__decorate([
    core.Property({ type: core.JsonType }),
    tslib.__metadata("design:type", Object)
], exports.RoomOp.prototype, "value", void 0);
tslib.__decorate([
    core.ManyToOne(() => exports.Room, { ref: true }),
    tslib.__metadata("design:type", Object)
], exports.RoomOp.prototype, "room", void 0);
exports.RoomOp = tslib.__decorate([
    core.Entity(),
    core.Unique({ properties: ['prevRevision', 'room'] }),
    tslib.__metadata("design:paramtypes", [Object])
], exports.RoomOp);
const deleteRoom = async (em, room) => {
    await room.roomOperations.init();
    room.roomOperations.getItems().forEach(x => em.remove(x));
    room.roomOperations.removeAll();
    for (const roomChatCh of await room.roomChatChs.loadItems()) {
        await roomChatCh.roomPubMsgs.init();
        roomChatCh.roomPubMsgs.getItems().forEach(x => em.remove(x));
        roomChatCh.roomPubMsgs.removeAll();
    }
    room.roomChatChs.getItems().forEach(x => em.remove(x));
    room.roomChatChs.removeAll();
    await room.roomPrvMsgs.init();
    room.roomPrvMsgs.getItems().forEach(x => em.remove(x));
    room.roomPrvMsgs.removeAll();
    await room.roomSes.init();
    room.roomSes.getItems().forEach(x => em.remove(x));
    room.roomSes.removeAll();
    await room.participants.init();
    room.participants.getItems().forEach(x => em.remove(x));
    room.participants.removeAll();
    await room.dicePieceLogs.init();
    room.dicePieceLogs.getItems().forEach(x => em.remove(x));
    room.dicePieceLogs.removeAll();
    await room.stringPieceLogs.init();
    room.stringPieceLogs.getItems().forEach(x => em.remove(x));
    room.stringPieceLogs.removeAll();
    em.remove(room);
};

exports.deleteRoom = deleteRoom;
//# sourceMappingURL=entity.js.map
