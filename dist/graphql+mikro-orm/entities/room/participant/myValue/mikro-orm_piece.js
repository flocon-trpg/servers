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
exports.UpdateMyValuePieceOp = exports.RemoveMyValuePieceOp = exports.AddMyValuePieceOp = exports.RemovedMyValuePieceByMyValue = exports.RemovedMyValuePieceByPartici = exports.MyValuePiece = void 0;
const core_1 = require("@mikro-orm/core");
const uuid_1 = require("uuid");
const mikro_orm_value_1 = require("./mikro-orm_value");
class MyValuePieceBase {
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
], MyValuePieceBase.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], MyValuePieceBase.prototype, "boardId", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], MyValuePieceBase.prototype, "boardCreatedBy", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Boolean)
], MyValuePieceBase.prototype, "isPrivate", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Boolean)
], MyValuePieceBase.prototype, "isCellMode", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], MyValuePieceBase.prototype, "x", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], MyValuePieceBase.prototype, "y", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], MyValuePieceBase.prototype, "w", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], MyValuePieceBase.prototype, "h", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], MyValuePieceBase.prototype, "cellX", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], MyValuePieceBase.prototype, "cellY", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], MyValuePieceBase.prototype, "cellW", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], MyValuePieceBase.prototype, "cellH", void 0);
let MyValuePiece = class MyValuePiece extends MyValuePieceBase {
    constructor(params) {
        super(params);
        this.version = 1;
        this.myValue = core_1.Reference.create(params.myValue);
    }
};
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], MyValuePiece.prototype, "version", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_value_1.MyValue, { wrappedReference: true }),
    __metadata("design:type", Object)
], MyValuePiece.prototype, "myValue", void 0);
MyValuePiece = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['myValue', 'boardId', 'boardCreatedBy'], name: 'my_value_piece_unique' }),
    __metadata("design:paramtypes", [Object])
], MyValuePiece);
exports.MyValuePiece = MyValuePiece;
let RemovedMyValuePieceByPartici = class RemovedMyValuePieceByPartici extends MyValuePieceBase {
    constructor(params) {
        super(params);
        this.version = 1;
        this.removedMyValue = core_1.Reference.create(params.removedMyValue);
    }
};
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], RemovedMyValuePieceByPartici.prototype, "version", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_value_1.RemovedMyValue, { wrappedReference: true }),
    __metadata("design:type", Object)
], RemovedMyValuePieceByPartici.prototype, "removedMyValue", void 0);
RemovedMyValuePieceByPartici = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['boardId', 'boardCreatedBy', 'removedMyValue'], name: 'removed_my_value_piece_by_partici_unique' }),
    __metadata("design:paramtypes", [Object])
], RemovedMyValuePieceByPartici);
exports.RemovedMyValuePieceByPartici = RemovedMyValuePieceByPartici;
let RemovedMyValuePieceByMyValue = class RemovedMyValuePieceByMyValue extends MyValuePieceBase {
    constructor(params) {
        super(params);
        this.version = 1;
        this.removeMyValueOp = core_1.Reference.create(params.removeMyValueOp);
    }
};
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], RemovedMyValuePieceByMyValue.prototype, "version", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_value_1.RemoveMyValueOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], RemovedMyValuePieceByMyValue.prototype, "removeMyValueOp", void 0);
RemovedMyValuePieceByMyValue = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['boardId', 'boardCreatedBy', 'removeMyValueOp'], name: 'removed_my_value_piece_by_my_value_unique' }),
    __metadata("design:paramtypes", [Object])
], RemovedMyValuePieceByMyValue);
exports.RemovedMyValuePieceByMyValue = RemovedMyValuePieceByMyValue;
let AddMyValuePieceOp = class AddMyValuePieceOp {
    constructor({ boardId, boardCreatedBy, updateMyValueOp, }) {
        this.id = uuid_1.v4();
        this.boardId = boardId;
        this.boardCreatedBy = boardCreatedBy;
        this.updateMyValueOp = core_1.Reference.create(updateMyValueOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], AddMyValuePieceOp.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], AddMyValuePieceOp.prototype, "boardId", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], AddMyValuePieceOp.prototype, "boardCreatedBy", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_value_1.UpdateMyValueOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], AddMyValuePieceOp.prototype, "updateMyValueOp", void 0);
AddMyValuePieceOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['boardId', 'boardCreatedBy', 'updateMyValueOp'], name: 'add_my_value_piece_op_unique' }),
    __metadata("design:paramtypes", [Object])
], AddMyValuePieceOp);
exports.AddMyValuePieceOp = AddMyValuePieceOp;
let RemoveMyValuePieceOp = class RemoveMyValuePieceOp extends MyValuePieceBase {
    constructor(params) {
        super(params);
        this.updateMyValueOp = core_1.Reference.create(params.updateMyValueOp);
    }
};
__decorate([
    core_1.ManyToOne(() => mikro_orm_value_1.UpdateMyValueOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], RemoveMyValuePieceOp.prototype, "updateMyValueOp", void 0);
RemoveMyValuePieceOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['boardId', 'boardCreatedBy', 'updateMyValueOp'], name: 'remove_my_value_piece_op_unique' }),
    __metadata("design:paramtypes", [Object])
], RemoveMyValuePieceOp);
exports.RemoveMyValuePieceOp = RemoveMyValuePieceOp;
let UpdateMyValuePieceOp = class UpdateMyValuePieceOp {
    constructor({ boardId, boardCreatedBy, updateMyValueOp, }) {
        this.id = uuid_1.v4();
        this.boardId = boardId;
        this.boardCreatedBy = boardCreatedBy;
        this.updateMyValueOp = core_1.Reference.create(updateMyValueOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], UpdateMyValuePieceOp.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], UpdateMyValuePieceOp.prototype, "boardId", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], UpdateMyValuePieceOp.prototype, "boardCreatedBy", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateMyValuePieceOp.prototype, "isPrivate", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateMyValuePieceOp.prototype, "isCellMode", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateMyValuePieceOp.prototype, "x", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateMyValuePieceOp.prototype, "y", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateMyValuePieceOp.prototype, "w", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateMyValuePieceOp.prototype, "h", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateMyValuePieceOp.prototype, "cellX", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateMyValuePieceOp.prototype, "cellY", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateMyValuePieceOp.prototype, "cellW", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateMyValuePieceOp.prototype, "cellH", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_value_1.UpdateMyValueOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], UpdateMyValuePieceOp.prototype, "updateMyValueOp", void 0);
UpdateMyValuePieceOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['boardId', 'boardCreatedBy', 'updateMyValueOp'], name: 'update_my_value_piece_op_unique' }),
    __metadata("design:paramtypes", [Object])
], UpdateMyValuePieceOp);
exports.UpdateMyValuePieceOp = UpdateMyValuePieceOp;
