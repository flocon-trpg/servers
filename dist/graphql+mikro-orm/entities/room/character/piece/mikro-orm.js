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
exports.UpdateCharaPieceOp = exports.RemoveCharaPieceOp = exports.AddCharaPieceOp = exports.RemovedCharaPiece = exports.CharaPiece = exports.CharaPieceBase = void 0;
const core_1 = require("@mikro-orm/core");
const uuid_1 = require("uuid");
const mikro_orm_1 = require("../mikro-orm");
class CharaPieceBase {
    constructor({ boardId, boardCreatedBy, isPrivate, isCellMode, x, y, w, h, cellX, cellY, cellW, cellH, }) {
        this.id = uuid_1.v4();
        this.boardId = boardId;
        this.boardCreatedBy = boardCreatedBy;
        this.isPrivate = isPrivate;
        this.isCellMode = isCellMode;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.cellX = cellX;
        this.cellY = cellY;
        this.cellW = cellW;
        this.cellH = cellH;
    }
}
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], CharaPieceBase.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], CharaPieceBase.prototype, "boardId", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], CharaPieceBase.prototype, "boardCreatedBy", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Boolean)
], CharaPieceBase.prototype, "isPrivate", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Boolean)
], CharaPieceBase.prototype, "isCellMode", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], CharaPieceBase.prototype, "x", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], CharaPieceBase.prototype, "y", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], CharaPieceBase.prototype, "w", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], CharaPieceBase.prototype, "h", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], CharaPieceBase.prototype, "cellX", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], CharaPieceBase.prototype, "cellY", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], CharaPieceBase.prototype, "cellW", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], CharaPieceBase.prototype, "cellH", void 0);
exports.CharaPieceBase = CharaPieceBase;
let CharaPiece = class CharaPiece extends CharaPieceBase {
    constructor(params) {
        super(params);
        this.version = 1;
        this.chara = core_1.Reference.create(params.chara);
    }
};
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], CharaPiece.prototype, "version", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.Chara, { wrappedReference: true }),
    __metadata("design:type", Object)
], CharaPiece.prototype, "chara", void 0);
CharaPiece = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['chara', 'boardCreatedBy', 'boardId'], name: 'chara_piece_unique' }),
    __metadata("design:paramtypes", [Object])
], CharaPiece);
exports.CharaPiece = CharaPiece;
let RemovedCharaPiece = class RemovedCharaPiece extends CharaPieceBase {
    constructor(params) {
        super(params);
        this.version = 1;
        this.removeCharaOp = core_1.Reference.create(params.removeCharaOp);
    }
};
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], RemovedCharaPiece.prototype, "version", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.RemoveCharaOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], RemovedCharaPiece.prototype, "removeCharaOp", void 0);
RemovedCharaPiece = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['removeCharaOp', 'boardCreatedBy', 'boardId'], name: 'removed_chara_piece_unique' }),
    __metadata("design:paramtypes", [Object])
], RemovedCharaPiece);
exports.RemovedCharaPiece = RemovedCharaPiece;
let AddCharaPieceOp = class AddCharaPieceOp {
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
], AddCharaPieceOp.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], AddCharaPieceOp.prototype, "boardId", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], AddCharaPieceOp.prototype, "boardCreatedBy", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.UpdateCharaOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], AddCharaPieceOp.prototype, "updateCharaOp", void 0);
AddCharaPieceOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['updateCharaOp', 'boardCreatedBy', 'boardId'], name: 'add_chara_piece_op_unique' }),
    __metadata("design:paramtypes", [Object])
], AddCharaPieceOp);
exports.AddCharaPieceOp = AddCharaPieceOp;
let RemoveCharaPieceOp = class RemoveCharaPieceOp extends CharaPieceBase {
    constructor(params) {
        super(params);
        this.updateCharaOp = core_1.Reference.create(params.updateCharaOp);
    }
};
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.UpdateCharaOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], RemoveCharaPieceOp.prototype, "updateCharaOp", void 0);
RemoveCharaPieceOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['updateCharaOp', 'boardCreatedBy', 'boardId'], name: 'remove_chara_piece_op_unique' }),
    __metadata("design:paramtypes", [Object])
], RemoveCharaPieceOp);
exports.RemoveCharaPieceOp = RemoveCharaPieceOp;
let UpdateCharaPieceOp = class UpdateCharaPieceOp {
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
], UpdateCharaPieceOp.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], UpdateCharaPieceOp.prototype, "boardId", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], UpdateCharaPieceOp.prototype, "boardCreatedBy", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateCharaPieceOp.prototype, "isPrivate", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateCharaPieceOp.prototype, "isCellMode", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateCharaPieceOp.prototype, "x", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateCharaPieceOp.prototype, "y", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateCharaPieceOp.prototype, "w", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateCharaPieceOp.prototype, "h", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateCharaPieceOp.prototype, "cellX", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateCharaPieceOp.prototype, "cellY", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateCharaPieceOp.prototype, "cellW", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateCharaPieceOp.prototype, "cellH", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.UpdateCharaOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], UpdateCharaPieceOp.prototype, "updateCharaOp", void 0);
UpdateCharaPieceOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['updateCharaOp', 'boardCreatedBy', 'boardId'], name: 'update_chara_piece_op_unique' }),
    __metadata("design:paramtypes", [Object])
], UpdateCharaPieceOp);
exports.UpdateCharaPieceOp = UpdateCharaPieceOp;
