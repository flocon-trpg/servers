"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoom = exports.RoomOp = exports.Room = void 0;
const core_1 = require("@mikro-orm/core");
const uuid_1 = require("uuid");
const easyFlake_1 = require("../../../utils/easyFlake");
const mikro_orm_1 = require("../participant/mikro-orm");
const mikro_orm_2 = require("../roomMessage/mikro-orm");
let Room = class Room {
    constructor({ createdBy, name, value, }) {
        this.id = easyFlake_1.easyFlake();
        this.version = 1;
        this.revision = 0;
        this.participants = new core_1.Collection(this);
        this.roomOperations = new core_1.Collection(this);
        this.roomChatChs = new core_1.Collection(this);
        this.roomPrvMsgs = new core_1.Collection(this);
        this.dicePieceValueLogs = new core_1.Collection(this);
        this.numberPieceValueLogs = new core_1.Collection(this);
        this.roomSes = new core_1.Collection(this);
        this.createdBy = createdBy;
        this.name = name;
        this.value = value;
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], Room.prototype, "id", void 0);
__decorate([
    core_1.Property({ version: true, index: true }),
    __metadata("design:type", Number)
], Room.prototype, "version", void 0);
__decorate([
    core_1.Property({ type: Date, nullable: true, onCreate: () => new Date(), index: true }),
    __metadata("design:type", Date)
], Room.prototype, "createdAt", void 0);
__decorate([
    core_1.Property({ type: Date, nullable: true, onUpdate: () => new Date(), index: true }),
    __metadata("design:type", Date)
], Room.prototype, "updatedAt", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], Room.prototype, "joinAsPlayerPhrase", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], Room.prototype, "joinAsSpectatorPhrase", void 0);
__decorate([
    core_1.Property({ index: true }),
    __metadata("design:type", String)
], Room.prototype, "createdBy", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", String)
], Room.prototype, "name", void 0);
__decorate([
    core_1.Property({ type: core_1.JsonType }),
    __metadata("design:type", Object)
], Room.prototype, "value", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], Room.prototype, "revision", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_1.Participant, x => x.room, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Room.prototype, "participants", void 0);
__decorate([
    core_1.OneToMany(() => RoomOp, x => x.room, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Room.prototype, "roomOperations", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_2.RoomPubCh, x => x.room, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Room.prototype, "roomChatChs", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_2.RoomPrvMsg, x => x.room, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Room.prototype, "roomPrvMsgs", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_2.DicePieceValueLog, x => x.room, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Room.prototype, "dicePieceValueLogs", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_2.NumberPieceValueLog, x => x.room, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Room.prototype, "numberPieceValueLogs", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_2.RoomSe, x => x.room, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Room.prototype, "roomSes", void 0);
Room = __decorate([
    core_1.Entity(),
    __metadata("design:paramtypes", [Object])
], Room);
exports.Room = Room;
let RoomOp = class RoomOp {
    constructor({ prevRevision, value }) {
        this.id = uuid_1.v4();
        this.prevRevision = prevRevision;
        this.value = value;
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], RoomOp.prototype, "id", void 0);
__decorate([
    core_1.Property({ index: true }),
    __metadata("design:type", Number)
], RoomOp.prototype, "prevRevision", void 0);
__decorate([
    core_1.Property({ type: core_1.JsonType }),
    __metadata("design:type", Object)
], RoomOp.prototype, "value", void 0);
__decorate([
    core_1.ManyToOne(() => Room, { wrappedReference: true }),
    __metadata("design:type", Object)
], RoomOp.prototype, "room", void 0);
RoomOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['prevRevision', 'room'] }),
    __metadata("design:paramtypes", [Object])
], RoomOp);
exports.RoomOp = RoomOp;
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
    await room.dicePieceValueLogs.init();
    room.dicePieceValueLogs.getItems().forEach(x => em.remove(x));
    room.dicePieceValueLogs.removeAll();
    await room.numberPieceValueLogs.init();
    room.numberPieceValueLogs.getItems().forEach(x => em.remove(x));
    room.numberPieceValueLogs.removeAll();
    em.remove(room);
};
exports.deleteRoom = deleteRoom;
