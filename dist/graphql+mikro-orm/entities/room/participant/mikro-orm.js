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
exports.UpdateParticiOp = exports.AddParticiOp = exports.RemoveParticiOp = exports.Partici = exports.ParticiBase = void 0;
const mikro_orm_1 = require("../../user/mikro-orm");
const core_1 = require("@mikro-orm/core");
const uuid_1 = require("uuid");
const mikro_orm_2 = require("../mikro-orm");
const ParticipantRoleOperation_1 = require("../../../../enums/ParticipantRoleOperation");
const ParticipantRole_1 = require("../../../../enums/ParticipantRole");
const mikro_orm_value_1 = require("./myValue/mikro-orm_value");
const mikro_orm_3 = require("../../roomMessage/mikro-orm");
class ParticiBase {
    constructor({ role, name, }) {
        this.id = uuid_1.v4();
        this.version = 1;
        this.role = role;
        this.name = name;
    }
}
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], ParticiBase.prototype, "id", void 0);
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], ParticiBase.prototype, "version", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", String)
], ParticiBase.prototype, "name", void 0);
__decorate([
    core_1.Enum({ items: () => ParticipantRole_1.ParticipantRole, nullable: true }),
    __metadata("design:type", String)
], ParticiBase.prototype, "role", void 0);
exports.ParticiBase = ParticiBase;
let Partici = class Partici extends ParticiBase {
    constructor(params) {
        super(params);
        this.myValues = new core_1.Collection(this);
        this.myValueLogs = new core_1.Collection(this);
        this.user = core_1.Reference.create(params.user);
        this.room = core_1.Reference.create(params.room);
    }
};
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.User, { wrappedReference: true }),
    __metadata("design:type", Object)
], Partici.prototype, "user", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_2.Room, { wrappedReference: true }),
    __metadata("design:type", Object)
], Partici.prototype, "room", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_value_1.MyValue, x => x.partici, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Partici.prototype, "myValues", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_3.MyValueLog, x => x.createdBy, { orphanRemoval: true }),
    __metadata("design:type", Object)
], Partici.prototype, "myValueLogs", void 0);
Partici = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['user', 'room'] }),
    __metadata("design:paramtypes", [Object])
], Partici);
exports.Partici = Partici;
let RemoveParticiOp = class RemoveParticiOp extends ParticiBase {
    constructor(params) {
        super(params);
        this.removedMyValues = new core_1.Collection(this);
        this.user = core_1.Reference.create(params.user);
        this.roomOp = core_1.Reference.create(params.roomOp);
    }
};
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.User, { wrappedReference: true }),
    __metadata("design:type", Object)
], RemoveParticiOp.prototype, "user", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_2.RoomOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], RemoveParticiOp.prototype, "roomOp", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_value_1.RemovedMyValue, x => x.removeParticiOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RemoveParticiOp.prototype, "removedMyValues", void 0);
RemoveParticiOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['roomOp', 'user'] }),
    __metadata("design:paramtypes", [Object])
], RemoveParticiOp);
exports.RemoveParticiOp = RemoveParticiOp;
let AddParticiOp = class AddParticiOp {
    constructor(params) {
        this.id = uuid_1.v4();
        this.user = core_1.Reference.create(params.user);
        this.roomOp = core_1.Reference.create(params.roomOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], AddParticiOp.prototype, "id", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.User, { wrappedReference: true }),
    __metadata("design:type", Object)
], AddParticiOp.prototype, "user", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_2.RoomOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], AddParticiOp.prototype, "roomOp", void 0);
AddParticiOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['roomOp', 'user'] }),
    __metadata("design:paramtypes", [Object])
], AddParticiOp);
exports.AddParticiOp = AddParticiOp;
let UpdateParticiOp = class UpdateParticiOp {
    constructor(params) {
        this.id = uuid_1.v4();
        this.addMyValueOps = new core_1.Collection(this);
        this.updateMyValueOps = new core_1.Collection(this);
        this.removeMyValueOps = new core_1.Collection(this);
        this.user = core_1.Reference.create(params.user);
        this.roomOp = core_1.Reference.create(params.roomOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], UpdateParticiOp.prototype, "id", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], UpdateParticiOp.prototype, "name", void 0);
__decorate([
    core_1.Enum({ items: () => ParticipantRoleOperation_1.ParticipantRoleOperation, nullable: true }),
    __metadata("design:type", String)
], UpdateParticiOp.prototype, "role", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.User, { wrappedReference: true }),
    __metadata("design:type", Object)
], UpdateParticiOp.prototype, "user", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_2.RoomOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], UpdateParticiOp.prototype, "roomOp", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_value_1.AddMyValueOp, x => x.updateParticiOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], UpdateParticiOp.prototype, "addMyValueOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_value_1.UpdateMyValueOp, x => x.updateParticiOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], UpdateParticiOp.prototype, "updateMyValueOps", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_value_1.RemoveMyValueOp, x => x.updateParticiOp, { orphanRemoval: true }),
    __metadata("design:type", Object)
], UpdateParticiOp.prototype, "removeMyValueOps", void 0);
UpdateParticiOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['roomOp', 'user'] }),
    __metadata("design:paramtypes", [Object])
], UpdateParticiOp);
exports.UpdateParticiOp = UpdateParticiOp;
