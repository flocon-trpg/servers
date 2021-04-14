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
const mikro_orm_1 = require("./board/mikro-orm");
const mikro_orm_2 = require("./character/mikro-orm");
const mikro_orm_3 = require("../roomMessage/mikro-orm");
const mikro_orm_4 = require("./bgm/mikro-orm");
const mikro_orm_5 = require("./paramName/mikro-orm");
const mikro_orm_6 = require("./participant/mikro-orm");
let Room = class Room {
    constructor({ name, publicChannel1Name, publicChannel2Name, publicChannel3Name, publicChannel4Name, publicChannel5Name, publicChannel6Name, publicChannel7Name, publicChannel8Name, publicChannel9Name, publicChannel10Name, createdBy, }) {
        this.id = uuid_1.v4();
        this.version = 1;
        this.revision = 0;
        this.roomOperations = new core_1.Collection(this);
        this.particis = new core_1.Collection(this);
        this.paramNames = new core_1.Collection(this);
        this.boards = new core_1.Collection(this);
        this.characters = new core_1.Collection(this);
        this.roomBgms = new core_1.Collection(this);
        this.roomChatChs = new core_1.Collection(this);
        this.roomPrvMsgs = new core_1.Collection(this);
        this.roomSes = new core_1.Collection(this);
        this.name = name;
        this.publicChannel1Name = publicChannel1Name;
        this.publicChannel2Name = publicChannel2Name;
        this.publicChannel3Name = publicChannel3Name;
        this.publicChannel4Name = publicChannel4Name;
        this.publicChannel5Name = publicChannel5Name;
        this.publicChannel6Name = publicChannel6Name;
        this.publicChannel7Name = publicChannel7Name;
        this.publicChannel8Name = publicChannel8Name;
        this.publicChannel9Name = publicChannel9Name;
        this.publicChannel10Name = publicChannel10Name;
        this.createdBy = createdBy;
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], Room.prototype, "id", void 0);
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], Room.prototype, "version", void 0);
__decorate([
    core_1.Property({ type: Date, nullable: true, onUpdate: () => new Date() }),
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
    core_1.Property(),
    __metadata("design:type", String)
], Room.prototype, "createdBy", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], Room.prototype, "revision", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", String)
], Room.prototype, "name", void 0);
__decorate([
    core_1.Property({ default: '' }),
    __metadata("design:type", String)
], Room.prototype, "publicChannel1Name", void 0);
__decorate([
    core_1.Property({ default: '' }),
    __metadata("design:type", String)
], Room.prototype, "publicChannel2Name", void 0);
__decorate([
    core_1.Property({ default: '' }),
    __metadata("design:type", String)
], Room.prototype, "publicChannel3Name", void 0);
__decorate([
    core_1.Property({ default: '' }),
    __metadata("design:type", String)
], Room.prototype, "publicChannel4Name", void 0);
__decorate([
    core_1.Property({ default: '' }),
    __metadata("design:type", String)
], Room.prototype, "publicChannel5Name", void 0);
__decorate([
    core_1.Property({ default: '' }),
    __metadata("design:type", String)
], Room.prototype, "publicChannel6Name", void 0);
__decorate([
    core_1.Property({ default: '' }),
    __metadata("design:type", String)
], Room.prototype, "publicChannel7Name", void 0);
__decorate([
    core_1.Property({ default: '' }),
    __metadata("design:type", String)
], Room.prototype, "publicChannel8Name", void 0);
__decorate([
    core_1.Property({ default: '' }),
    __metadata("design:type", String)
], Room.prototype, "publicChannel9Name", void 0);
__decorate([
    core_1.Property({ default: '' }),
    __metadata("design:type", String)
], Room.prototype, "publicChannel10Name", void 0);
__decorate([
    core_1.OneToMany(() => RoomOp, x => x.room, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Room.prototype, "roomOperations", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_6.Partici, x => x.room, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Room.prototype, "particis", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_5.ParamName, x => x.room, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Room.prototype, "paramNames", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_1.Board, x => x.room, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Room.prototype, "boards", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_2.Chara, x => x.room, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Room.prototype, "characters", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_4.RoomBgm, x => x.room, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Room.prototype, "roomBgms", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_3.RoomPubCh, x => x.room, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Room.prototype, "roomChatChs", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_3.RoomPrvMsg, x => x.room, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Room.prototype, "roomPrvMsgs", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_3.RoomSe, x => x.room, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Room.prototype, "roomSes", void 0);
Room = __decorate([
    core_1.Entity(),
    __metadata("design:paramtypes", [Object])
], Room);
exports.Room = Room;
let RoomOp = class RoomOp {
    constructor({ prevRevision, }) {
        this.id = uuid_1.v4();
        this.addParticiOps = new core_1.Collection(this);
        this.removeParticiOps = new core_1.Collection(this);
        this.updateParticiOps = new core_1.Collection(this);
        this.addParamNameOps = new core_1.Collection(this);
        this.removeParamNameOps = new core_1.Collection(this);
        this.updateParamNameOps = new core_1.Collection(this);
        this.addRoomBgmOps = new core_1.Collection(this);
        this.removeRoomBgmOps = new core_1.Collection(this);
        this.updateRoomBgmOps = new core_1.Collection(this);
        this.addBoardOps = new core_1.Collection(this);
        this.removeBoardOps = new core_1.Collection(this);
        this.updateBoardOps = new core_1.Collection(this);
        this.addCharacterOps = new core_1.Collection(this);
        this.removeCharacterOps = new core_1.Collection(this);
        this.updateCharacterOps = new core_1.Collection(this);
        this.prevRevision = prevRevision;
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], RoomOp.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], RoomOp.prototype, "prevRevision", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], RoomOp.prototype, "name", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], RoomOp.prototype, "publicChannel1Name", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], RoomOp.prototype, "publicChannel2Name", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], RoomOp.prototype, "publicChannel3Name", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], RoomOp.prototype, "publicChannel4Name", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], RoomOp.prototype, "publicChannel5Name", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], RoomOp.prototype, "publicChannel6Name", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], RoomOp.prototype, "publicChannel7Name", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], RoomOp.prototype, "publicChannel8Name", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], RoomOp.prototype, "publicChannel9Name", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], RoomOp.prototype, "publicChannel10Name", void 0);
__decorate([
    core_1.ManyToOne(() => Room, { wrappedReference: true }),
    __metadata("design:type", Object)
], RoomOp.prototype, "room", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_6.AddParticiOp, x => x.roomOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RoomOp.prototype, "addParticiOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_6.RemoveParticiOp, x => x.roomOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RoomOp.prototype, "removeParticiOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_6.UpdateParticiOp, x => x.roomOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RoomOp.prototype, "updateParticiOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_5.AddParamNameOp, x => x.roomOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RoomOp.prototype, "addParamNameOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_5.RemoveParamNameOp, x => x.roomOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RoomOp.prototype, "removeParamNameOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_5.UpdateParamNameOp, x => x.roomOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RoomOp.prototype, "updateParamNameOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_4.AddRoomBgmOp, x => x.roomOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RoomOp.prototype, "addRoomBgmOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_4.RemoveRoomBgmOp, x => x.roomOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RoomOp.prototype, "removeRoomBgmOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_4.UpdateRoomBgmOp, x => x.roomOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RoomOp.prototype, "updateRoomBgmOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_1.AddBoardOp, x => x.roomOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RoomOp.prototype, "addBoardOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_1.RemoveBoardOp, x => x.roomOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RoomOp.prototype, "removeBoardOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_1.UpdateBoardOp, x => x.roomOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RoomOp.prototype, "updateBoardOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_2.AddCharaOp, x => x.roomOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RoomOp.prototype, "addCharacterOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_2.RemoveCharaOp, x => x.roomOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RoomOp.prototype, "removeCharacterOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_2.UpdateCharaOp, x => x.roomOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RoomOp.prototype, "updateCharacterOps", void 0);
RoomOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['prevRevision', 'room'] }),
    __metadata("design:paramtypes", [Object])
], RoomOp);
exports.RoomOp = RoomOp;
const deleteRoom = async (em, room) => {
    await room.boards.init();
    room.boards.removeAll();
    for (const character of await room.characters.loadItems()) {
        await character.boolParams.init();
        character.boolParams.removeAll();
        await character.numParams.init();
        character.numParams.removeAll();
        await character.numMaxParams.init();
        character.numMaxParams.removeAll();
        await character.strParams.init();
        character.strParams.removeAll();
        await character.charaPieces.init();
        character.charaPieces.removeAll();
        await character.tachieLocs.init();
        character.tachieLocs.removeAll();
    }
    room.characters.removeAll();
    for (const partici of await room.particis.loadItems()) {
        await partici.myValues.init();
        partici.myValues.removeAll();
    }
    room.particis.removeAll();
    await room.paramNames.init();
    room.paramNames.removeAll();
    for (const operation of await room.roomOperations.loadItems()) {
        await operation.addParticiOps.init();
        operation.addParticiOps.removeAll();
        for (const updateParticiOp of await operation.updateParticiOps.loadItems()) {
            await updateParticiOp.addMyValueOps.init();
            updateParticiOp.addMyValueOps.removeAll();
            await updateParticiOp.updateMyValueOps.init();
            updateParticiOp.updateMyValueOps.removeAll();
            await updateParticiOp.removeMyValueOps.init();
            updateParticiOp.removeMyValueOps.removeAll();
        }
        operation.updateParticiOps.removeAll();
        await operation.addBoardOps.init();
        operation.addBoardOps.removeAll();
        await operation.updateBoardOps.init();
        operation.updateBoardOps.removeAll();
        await operation.removeBoardOps.init();
        operation.removeBoardOps.removeAll();
        await operation.addCharacterOps.init();
        operation.addCharacterOps.removeAll();
        for (const updateCharacterOp of await operation.updateCharacterOps.loadItems()) {
            await updateCharacterOp.updateBoolParamOps.init();
            updateCharacterOp.updateBoolParamOps.removeAll();
            await updateCharacterOp.updateNumParamOps.init();
            updateCharacterOp.updateNumParamOps.removeAll();
            await updateCharacterOp.updateNumMaxParamOps.init();
            updateCharacterOp.updateNumMaxParamOps.removeAll();
            await updateCharacterOp.updateStrParamOps.init();
            updateCharacterOp.updateStrParamOps.removeAll();
            await updateCharacterOp.addCharaPieceOps.init();
            updateCharacterOp.addCharaPieceOps.removeAll();
            await updateCharacterOp.updateCharaPieceOps.init();
            updateCharacterOp.updateCharaPieceOps.removeAll();
            await updateCharacterOp.removeCharaPieceOps.init();
            updateCharacterOp.removeCharaPieceOps.removeAll();
            await updateCharacterOp.addTachieLocOps.init();
            updateCharacterOp.addTachieLocOps.removeAll();
            await updateCharacterOp.updateTachieLocOps.init();
            updateCharacterOp.updateTachieLocOps.removeAll();
            await updateCharacterOp.removeTachieLocOps.init();
            updateCharacterOp.removeTachieLocOps.removeAll();
        }
        operation.updateCharacterOps.removeAll();
        for (const removeCharacterOp of await operation.removeCharacterOps.loadItems()) {
            await removeCharacterOp.removedBoolParam.init();
            removeCharacterOp.removedBoolParam.removeAll();
            await removeCharacterOp.removedNumParam.init();
            removeCharacterOp.removedNumParam.removeAll();
            await removeCharacterOp.removedStrParam.init();
            removeCharacterOp.removedStrParam.removeAll();
            await removeCharacterOp.removedCharaPieces.init();
            removeCharacterOp.removedCharaPieces.removeAll();
            await removeCharacterOp.removedTachieLocs.init();
            removeCharacterOp.removedTachieLocs.removeAll();
        }
        operation.removeCharacterOps.removeAll();
    }
    room.roomOperations.removeAll();
    for (const roomChatCh of await room.roomChatChs.loadItems()) {
        await roomChatCh.roomPubMsgs.init();
        roomChatCh.roomPubMsgs.removeAll();
    }
    room.roomChatChs.removeAll();
    await room.roomPrvMsgs.init();
    room.roomPrvMsgs.removeAll();
    await room.roomSes.init();
    room.roomSes.removeAll();
    em.remove(room);
};
exports.deleteRoom = deleteRoom;
