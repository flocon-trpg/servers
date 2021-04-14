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
exports.UpdateMyValueOp = exports.AddMyValueOp = exports.RemovedMyValue = exports.RemoveMyValueOp = exports.MyValue = exports.MyValueBase = void 0;
const core_1 = require("@mikro-orm/core");
const uuid_1 = require("uuid");
const mikro_orm_1 = require("../mikro-orm");
const mikro_orm_piece_1 = require("./mikro-orm_piece");
class MyValueBase {
    constructor({ stateId, value, }) {
        this.id = uuid_1.v4();
        this.stateId = stateId;
        this.value = value;
    }
}
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], MyValueBase.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], MyValueBase.prototype, "stateId", void 0);
__decorate([
    core_1.Property({ type: core_1.JsonType }),
    __metadata("design:type", Object)
], MyValueBase.prototype, "value", void 0);
exports.MyValueBase = MyValueBase;
let MyValue = class MyValue extends MyValueBase {
    constructor(params) {
        super(params);
        this.version = 1;
        this.myValuePieces = new core_1.Collection(this);
        this.partici = core_1.Reference.create(params.partici);
    }
};
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], MyValue.prototype, "version", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_piece_1.MyValuePiece, x => x.myValue, { orphanRemoval: true }),
    __metadata("design:type", Object)
], MyValue.prototype, "myValuePieces", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.Partici, { wrappedReference: true }),
    __metadata("design:type", Object)
], MyValue.prototype, "partici", void 0);
MyValue = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['partici', 'stateId'] }),
    __metadata("design:paramtypes", [Object])
], MyValue);
exports.MyValue = MyValue;
let RemoveMyValueOp = class RemoveMyValueOp extends MyValueBase {
    constructor(params) {
        super(params);
        this.removedMyValuePieces = new core_1.Collection(this);
        this.updateParticiOp = core_1.Reference.create(params.updateParticiOp);
    }
};
__decorate([
    core_1.OneToMany(() => mikro_orm_piece_1.RemovedMyValuePieceByMyValue, x => x.removeMyValueOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RemoveMyValueOp.prototype, "removedMyValuePieces", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.UpdateParticiOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], RemoveMyValueOp.prototype, "updateParticiOp", void 0);
RemoveMyValueOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['updateParticiOp', 'stateId'] }),
    __metadata("design:paramtypes", [Object])
], RemoveMyValueOp);
exports.RemoveMyValueOp = RemoveMyValueOp;
let RemovedMyValue = class RemovedMyValue extends MyValueBase {
    constructor(params) {
        super(params);
        this.removedMyValuePieces = new core_1.Collection(this);
        this.removeParticiOp = core_1.Reference.create(params.removeParticiOp);
    }
};
__decorate([
    core_1.OneToMany(() => mikro_orm_piece_1.RemovedMyValuePieceByPartici, x => x.removedMyValue, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RemovedMyValue.prototype, "removedMyValuePieces", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.RemoveParticiOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], RemovedMyValue.prototype, "removeParticiOp", void 0);
RemovedMyValue = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['removeParticiOp', 'stateId'] }),
    __metadata("design:paramtypes", [Object])
], RemovedMyValue);
exports.RemovedMyValue = RemovedMyValue;
let AddMyValueOp = class AddMyValueOp {
    constructor({ stateId, updateParticiOp, }) {
        this.id = uuid_1.v4();
        this.stateId = stateId;
        this.updateParticiOp = core_1.Reference.create(updateParticiOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], AddMyValueOp.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], AddMyValueOp.prototype, "stateId", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.UpdateParticiOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], AddMyValueOp.prototype, "updateParticiOp", void 0);
AddMyValueOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['updateParticiOp', 'stateId'] }),
    __metadata("design:paramtypes", [Object])
], AddMyValueOp);
exports.AddMyValueOp = AddMyValueOp;
let UpdateMyValueOp = class UpdateMyValueOp {
    constructor({ stateId, value, updateParticiOp, }) {
        this.id = uuid_1.v4();
        this.addPieceOps = new core_1.Collection(this);
        this.removePieceOps = new core_1.Collection(this);
        this.updatePieceOps = new core_1.Collection(this);
        this.stateId = stateId;
        this.value = value;
        this.updateParticiOp = core_1.Reference.create(updateParticiOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], UpdateMyValueOp.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], UpdateMyValueOp.prototype, "stateId", void 0);
__decorate([
    core_1.Property({ type: core_1.JsonType }),
    __metadata("design:type", Object)
], UpdateMyValueOp.prototype, "value", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_piece_1.AddMyValuePieceOp, x => x.updateMyValueOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], UpdateMyValueOp.prototype, "addPieceOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_piece_1.RemoveMyValuePieceOp, x => x.updateMyValueOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], UpdateMyValueOp.prototype, "removePieceOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_piece_1.UpdateMyValuePieceOp, x => x.updateMyValueOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], UpdateMyValueOp.prototype, "updatePieceOps", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.UpdateParticiOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], UpdateMyValueOp.prototype, "updateParticiOp", void 0);
UpdateMyValueOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['updateParticiOp', 'stateId'] }),
    __metadata("design:paramtypes", [Object])
], UpdateMyValueOp);
exports.UpdateMyValueOp = UpdateMyValueOp;
