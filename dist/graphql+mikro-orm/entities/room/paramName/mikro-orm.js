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
exports.UpdateParamNameOp = exports.RemoveParamNameOp = exports.AddParamNameOp = exports.ParamName = exports.ParamNameBase = void 0;
const core_1 = require("@mikro-orm/core");
const uuid_1 = require("uuid");
const RoomParameterNameType_1 = require("../../../../enums/RoomParameterNameType");
const mikro_orm_1 = require("../mikro-orm");
class ParamNameBase {
    constructor({ type, key, name, }) {
        this.id = uuid_1.v4();
        this.type = type;
        this.key = key;
        this.name = name;
    }
}
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], ParamNameBase.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], ParamNameBase.prototype, "key", void 0);
__decorate([
    core_1.Enum({ items: () => RoomParameterNameType_1.RoomParameterNameType }),
    core_1.Index(),
    __metadata("design:type", String)
], ParamNameBase.prototype, "type", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", String)
], ParamNameBase.prototype, "name", void 0);
exports.ParamNameBase = ParamNameBase;
let ParamName = class ParamName extends ParamNameBase {
    constructor(params) {
        super(params);
        this.version = 1;
        this.room = core_1.Reference.create(params.room);
    }
};
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], ParamName.prototype, "version", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.Room, { wrappedReference: true }),
    __metadata("design:type", Object)
], ParamName.prototype, "room", void 0);
ParamName = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['room', 'type', 'key'] }),
    __metadata("design:paramtypes", [Object])
], ParamName);
exports.ParamName = ParamName;
let AddParamNameOp = class AddParamNameOp {
    constructor({ type, key, roomOp, }) {
        this.id = uuid_1.v4();
        this.type = type;
        this.key = key;
        this.roomOp = core_1.Reference.create(roomOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], AddParamNameOp.prototype, "id", void 0);
__decorate([
    core_1.Enum({ items: () => RoomParameterNameType_1.RoomParameterNameType }),
    core_1.Index(),
    __metadata("design:type", String)
], AddParamNameOp.prototype, "type", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], AddParamNameOp.prototype, "key", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.RoomOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], AddParamNameOp.prototype, "roomOp", void 0);
AddParamNameOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['roomOp', 'type', 'key'] }),
    __metadata("design:paramtypes", [Object])
], AddParamNameOp);
exports.AddParamNameOp = AddParamNameOp;
let RemoveParamNameOp = class RemoveParamNameOp extends ParamNameBase {
    constructor(params) {
        super(params);
        this.roomOp = core_1.Reference.create(params.roomOp);
    }
};
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.RoomOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], RemoveParamNameOp.prototype, "roomOp", void 0);
RemoveParamNameOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['roomOp', 'type', 'key'] }),
    __metadata("design:paramtypes", [Object])
], RemoveParamNameOp);
exports.RemoveParamNameOp = RemoveParamNameOp;
let UpdateParamNameOp = class UpdateParamNameOp {
    constructor({ type, key, roomOp, }) {
        this.id = uuid_1.v4();
        this.type = type;
        this.key = key;
        this.roomOp = core_1.Reference.create(roomOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], UpdateParamNameOp.prototype, "id", void 0);
__decorate([
    core_1.Enum({ items: () => RoomParameterNameType_1.RoomParameterNameType }),
    core_1.Index(),
    __metadata("design:type", String)
], UpdateParamNameOp.prototype, "type", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], UpdateParamNameOp.prototype, "key", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], UpdateParamNameOp.prototype, "name", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.RoomOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], UpdateParamNameOp.prototype, "roomOp", void 0);
UpdateParamNameOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['roomOp', 'type', 'key'] }),
    __metadata("design:paramtypes", [Object])
], UpdateParamNameOp);
exports.UpdateParamNameOp = UpdateParamNameOp;
