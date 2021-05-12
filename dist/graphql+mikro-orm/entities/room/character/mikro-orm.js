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
exports.UpdateCharaOp = exports.RemoveCharaOp = exports.AddCharaOp = exports.Chara = exports.CharaBase = void 0;
const core_1 = require("@mikro-orm/core");
const uuid_1 = require("uuid");
const FileSourceType_1 = require("../../../../enums/FileSourceType");
const mikro_orm_1 = require("./boolParam/mikro-orm");
const mikro_orm_2 = require("./numParam/mikro-orm");
const mikro_orm_3 = require("./piece/mikro-orm");
const mikro_orm_4 = require("../mikro-orm");
const mikro_orm_5 = require("./strParam/mikro-orm");
const mikro_orm_6 = require("./tachie/mikro-orm");
class CharaBase {
    constructor({ createdBy, stateId, isPrivate, name, }) {
        this.id = uuid_1.v4();
        this.createdBy = createdBy;
        this.stateId = stateId;
        this.isPrivate = isPrivate;
        this.name = name;
        this.privateVarToml = '';
    }
}
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], CharaBase.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], CharaBase.prototype, "createdBy", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], CharaBase.prototype, "stateId", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Boolean)
], CharaBase.prototype, "isPrivate", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", String)
], CharaBase.prototype, "name", void 0);
__decorate([
    core_1.Property({ nullable: true, default: '', length: 65536 }),
    __metadata("design:type", String)
], CharaBase.prototype, "privateVarToml", void 0);
__decorate([
    core_1.Property({ nullable: true, length: 65535 }),
    __metadata("design:type", String)
], CharaBase.prototype, "imagePath", void 0);
__decorate([
    core_1.Enum({ items: () => FileSourceType_1.FileSourceType, nullable: true }),
    __metadata("design:type", String)
], CharaBase.prototype, "imageSourceType", void 0);
__decorate([
    core_1.Property({ nullable: true, length: 65535, default: null }),
    __metadata("design:type", String)
], CharaBase.prototype, "tachieImagePath", void 0);
__decorate([
    core_1.Enum({ items: () => FileSourceType_1.FileSourceType, nullable: true, default: null }),
    __metadata("design:type", String)
], CharaBase.prototype, "tachieImageSourceType", void 0);
exports.CharaBase = CharaBase;
let Chara = class Chara extends CharaBase {
    constructor(params) {
        super(params);
        this.version = 1;
        this.boolParams = new core_1.Collection(this);
        this.numParams = new core_1.Collection(this);
        this.numMaxParams = new core_1.Collection(this);
        this.strParams = new core_1.Collection(this);
        this.charaPieces = new core_1.Collection(this);
        this.tachieLocs = new core_1.Collection(this);
        this.room = core_1.Reference.create(params.room);
    }
};
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], Chara.prototype, "version", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_1.BoolParam, x => x.chara, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Chara.prototype, "boolParams", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_2.NumParam, x => x.chara, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Chara.prototype, "numParams", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_2.NumMaxParam, x => x.chara, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Chara.prototype, "numMaxParams", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_5.StrParam, x => x.chara, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Chara.prototype, "strParams", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_3.CharaPiece, x => x.chara, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Chara.prototype, "charaPieces", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_6.TachieLoc, x => x.chara, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Chara.prototype, "tachieLocs", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_4.Room, { wrappedReference: true }),
    __metadata("design:type", Object)
], Chara.prototype, "room", void 0);
Chara = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['createdBy', 'stateId'] }),
    __metadata("design:paramtypes", [Object])
], Chara);
exports.Chara = Chara;
let AddCharaOp = class AddCharaOp {
    constructor({ createdBy, stateId, roomOp, }) {
        this.id = uuid_1.v4();
        this.createdBy = createdBy;
        this.stateId = stateId;
        this.roomOp = core_1.Reference.create(roomOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], AddCharaOp.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], AddCharaOp.prototype, "createdBy", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], AddCharaOp.prototype, "stateId", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_4.RoomOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], AddCharaOp.prototype, "roomOp", void 0);
AddCharaOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['roomOp', 'createdBy', 'stateId'], name: 'add_chara_op_unique' }),
    __metadata("design:paramtypes", [Object])
], AddCharaOp);
exports.AddCharaOp = AddCharaOp;
let RemoveCharaOp = class RemoveCharaOp extends CharaBase {
    constructor(params) {
        super(params);
        this.removedBoolParam = new core_1.Collection(this);
        this.removedNumParam = new core_1.Collection(this);
        this.removedNumMaxParam = new core_1.Collection(this);
        this.removedStrParam = new core_1.Collection(this);
        this.removedCharaPieces = new core_1.Collection(this);
        this.removedTachieLocs = new core_1.Collection(this);
        this.roomOp = core_1.Reference.create(params.roomOp);
    }
};
__decorate([
    core_1.OneToMany(() => mikro_orm_1.RemovedBoolParam, x => x.removeCharaOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RemoveCharaOp.prototype, "removedBoolParam", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_2.RemovedNumParam, x => x.removeCharaOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RemoveCharaOp.prototype, "removedNumParam", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_2.RemovedNumMaxParam, x => x.removeCharaOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RemoveCharaOp.prototype, "removedNumMaxParam", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_5.RemovedStrParam, x => x.removeCharaOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RemoveCharaOp.prototype, "removedStrParam", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_3.RemovedCharaPiece, x => x.removeCharaOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RemoveCharaOp.prototype, "removedCharaPieces", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_6.RemovedTachieLoc, x => x.removeCharaOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RemoveCharaOp.prototype, "removedTachieLocs", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_4.RoomOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], RemoveCharaOp.prototype, "roomOp", void 0);
RemoveCharaOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['roomOp', 'createdBy', 'stateId'], name: 'remove_chara_op_unique' }),
    __metadata("design:paramtypes", [Object])
], RemoveCharaOp);
exports.RemoveCharaOp = RemoveCharaOp;
let UpdateCharaOp = class UpdateCharaOp {
    constructor({ createdBy, stateId, roomOp, }) {
        this.id = uuid_1.v4();
        this.updateBoolParamOps = new core_1.Collection(this);
        this.updateNumParamOps = new core_1.Collection(this);
        this.updateNumMaxParamOps = new core_1.Collection(this);
        this.updateStrParamOps = new core_1.Collection(this);
        this.addCharaPieceOps = new core_1.Collection(this);
        this.removeCharaPieceOps = new core_1.Collection(this);
        this.updateCharaPieceOps = new core_1.Collection(this);
        this.addTachieLocOps = new core_1.Collection(this);
        this.removeTachieLocOps = new core_1.Collection(this);
        this.updateTachieLocOps = new core_1.Collection(this);
        this.createdBy = createdBy;
        this.stateId = stateId;
        this.roomOp = core_1.Reference.create(roomOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], UpdateCharaOp.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], UpdateCharaOp.prototype, "createdBy", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], UpdateCharaOp.prototype, "stateId", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateCharaOp.prototype, "isPrivate", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], UpdateCharaOp.prototype, "name", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], UpdateCharaOp.prototype, "privateVarToml", void 0);
__decorate([
    core_1.Property({ type: core_1.JsonType, nullable: true }),
    __metadata("design:type", Object)
], UpdateCharaOp.prototype, "image", void 0);
__decorate([
    core_1.Property({ type: core_1.JsonType, nullable: true }),
    __metadata("design:type", Object)
], UpdateCharaOp.prototype, "tachieImage", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_1.UpdateBoolParamOp, x => x.updateCharaOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], UpdateCharaOp.prototype, "updateBoolParamOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_2.UpdateNumParamOp, x => x.updateCharaOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], UpdateCharaOp.prototype, "updateNumParamOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_2.UpdateNumMaxParamOp, x => x.updateCharaOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], UpdateCharaOp.prototype, "updateNumMaxParamOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_5.UpdateStrParamOp, x => x.updateCharaOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], UpdateCharaOp.prototype, "updateStrParamOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_3.AddCharaPieceOp, x => x.updateCharaOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], UpdateCharaOp.prototype, "addCharaPieceOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_3.RemoveCharaPieceOp, x => x.updateCharaOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], UpdateCharaOp.prototype, "removeCharaPieceOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_3.UpdateCharaPieceOp, x => x.updateCharaOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], UpdateCharaOp.prototype, "updateCharaPieceOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_6.AddTachieLocOp, x => x.updateCharaOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], UpdateCharaOp.prototype, "addTachieLocOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_6.RemoveTachieLocOp, x => x.updateCharaOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], UpdateCharaOp.prototype, "removeTachieLocOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_6.UpdateTachieLocOp, x => x.updateCharaOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], UpdateCharaOp.prototype, "updateTachieLocOps", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_4.RoomOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], UpdateCharaOp.prototype, "roomOp", void 0);
UpdateCharaOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['roomOp', 'createdBy', 'stateId'], name: 'update_chara_op_unique' }),
    __metadata("design:paramtypes", [Object])
], UpdateCharaOp);
exports.UpdateCharaOp = UpdateCharaOp;
