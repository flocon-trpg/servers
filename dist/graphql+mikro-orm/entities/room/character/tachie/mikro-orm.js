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
exports.UpdateTachieLocOp = exports.RemoveTachieLocOp = exports.AddTachieLocOp = exports.RemovedTachieLoc = exports.TachieLoc = exports.TachieLocBase = void 0;
const core_1 = require("@mikro-orm/core");
const uuid_1 = require("uuid");
const mikro_orm_1 = require("../mikro-orm");
class TachieLocBase {
    constructor({ boardId, boardCreatedBy, isPrivate, x, y, w, h, }) {
        this.id = uuid_1.v4();
        this.boardId = boardId;
        this.boardCreatedBy = boardCreatedBy;
        this.isPrivate = isPrivate;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], TachieLocBase.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], TachieLocBase.prototype, "boardId", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], TachieLocBase.prototype, "boardCreatedBy", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Boolean)
], TachieLocBase.prototype, "isPrivate", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], TachieLocBase.prototype, "x", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], TachieLocBase.prototype, "y", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], TachieLocBase.prototype, "w", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], TachieLocBase.prototype, "h", void 0);
exports.TachieLocBase = TachieLocBase;
let TachieLoc = class TachieLoc extends TachieLocBase {
    constructor(params) {
        super(params);
        this.version = 1;
        this.chara = core_1.Reference.create(params.chara);
    }
};
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], TachieLoc.prototype, "version", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.Chara, { wrappedReference: true }),
    __metadata("design:type", Object)
], TachieLoc.prototype, "chara", void 0);
TachieLoc = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['chara', 'boardCreatedBy', 'boardId'], name: 'tachie_loc_unique' }),
    __metadata("design:paramtypes", [Object])
], TachieLoc);
exports.TachieLoc = TachieLoc;
let RemovedTachieLoc = class RemovedTachieLoc extends TachieLocBase {
    constructor(params) {
        super(params);
        this.version = 1;
        this.removeCharaOp = core_1.Reference.create(params.removeCharaOp);
    }
};
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], RemovedTachieLoc.prototype, "version", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.RemoveCharaOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], RemovedTachieLoc.prototype, "removeCharaOp", void 0);
RemovedTachieLoc = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['removeCharaOp', 'boardCreatedBy', 'boardId'], name: 'removed_tachie_loc_unique' }),
    __metadata("design:paramtypes", [Object])
], RemovedTachieLoc);
exports.RemovedTachieLoc = RemovedTachieLoc;
let AddTachieLocOp = class AddTachieLocOp {
    constructor({ boardId, boardCreatedBy, updateCharaOp, }) {
        this.id = uuid_1.v4();
        this.boardId = boardId;
        this.boardCreatedBy = boardCreatedBy;
        this.updateCharaOp = core_1.Reference.create(updateCharaOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], AddTachieLocOp.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], AddTachieLocOp.prototype, "boardId", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], AddTachieLocOp.prototype, "boardCreatedBy", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.UpdateCharaOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], AddTachieLocOp.prototype, "updateCharaOp", void 0);
AddTachieLocOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['updateCharaOp', 'boardCreatedBy', 'boardId'], name: 'add_tachie_loc_op_unique' }),
    __metadata("design:paramtypes", [Object])
], AddTachieLocOp);
exports.AddTachieLocOp = AddTachieLocOp;
let RemoveTachieLocOp = class RemoveTachieLocOp extends TachieLocBase {
    constructor(params) {
        super(params);
        this.updateCharaOp = core_1.Reference.create(params.updateCharaOp);
    }
};
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.UpdateCharaOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], RemoveTachieLocOp.prototype, "updateCharaOp", void 0);
RemoveTachieLocOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['updateCharaOp', 'boardCreatedBy', 'boardId'], name: 'remove_tachie_loc_op_unique' }),
    __metadata("design:paramtypes", [Object])
], RemoveTachieLocOp);
exports.RemoveTachieLocOp = RemoveTachieLocOp;
let UpdateTachieLocOp = class UpdateTachieLocOp {
    constructor({ boardId, boardCreatedBy, updateCharaOp, }) {
        this.id = uuid_1.v4();
        this.boardId = boardId;
        this.boardCreatedBy = boardCreatedBy;
        this.updateCharaOp = core_1.Reference.create(updateCharaOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], UpdateTachieLocOp.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], UpdateTachieLocOp.prototype, "boardId", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], UpdateTachieLocOp.prototype, "boardCreatedBy", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateTachieLocOp.prototype, "isPrivate", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateTachieLocOp.prototype, "x", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateTachieLocOp.prototype, "y", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateTachieLocOp.prototype, "w", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateTachieLocOp.prototype, "h", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.UpdateCharaOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], UpdateTachieLocOp.prototype, "updateCharaOp", void 0);
UpdateTachieLocOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['updateCharaOp', 'boardCreatedBy', 'boardId'], name: 'update_tachie_loc_op_unique' }),
    __metadata("design:paramtypes", [Object])
], UpdateTachieLocOp);
exports.UpdateTachieLocOp = UpdateTachieLocOp;
