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
exports.UpdateBoolParamOp = exports.RemovedBoolParam = exports.BoolParam = exports.BoolParamBase = void 0;
const core_1 = require("@mikro-orm/core");
const uuid_1 = require("uuid");
const mikro_orm_1 = require("../mikro-orm");
class BoolParamBase {
    constructor({ key, isValuePrivate, value, }) {
        this.id = uuid_1.v4();
        this.key = key;
        this.isValuePrivate = isValuePrivate;
        this.value = value;
    }
}
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], BoolParamBase.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], BoolParamBase.prototype, "key", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Boolean)
], BoolParamBase.prototype, "isValuePrivate", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Boolean)
], BoolParamBase.prototype, "value", void 0);
exports.BoolParamBase = BoolParamBase;
let BoolParam = class BoolParam extends BoolParamBase {
    constructor(params) {
        super(params);
        this.version = 1;
        this.chara = core_1.Reference.create(params.chara);
    }
};
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], BoolParam.prototype, "version", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.Chara, { wrappedReference: true }),
    __metadata("design:type", Object)
], BoolParam.prototype, "chara", void 0);
BoolParam = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['chara', 'key'] }),
    __metadata("design:paramtypes", [Object])
], BoolParam);
exports.BoolParam = BoolParam;
let RemovedBoolParam = class RemovedBoolParam extends BoolParamBase {
    constructor(params) {
        super(params);
        this.version = 1;
        this.removeCharaOp = core_1.Reference.create(params.removeCharaOp);
    }
};
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], RemovedBoolParam.prototype, "version", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.RemoveCharaOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], RemovedBoolParam.prototype, "removeCharaOp", void 0);
RemovedBoolParam = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['removeCharaOp', 'key'] }),
    __metadata("design:paramtypes", [Object])
], RemovedBoolParam);
exports.RemovedBoolParam = RemovedBoolParam;
let UpdateBoolParamOp = class UpdateBoolParamOp {
    constructor({ key, updateCharaOp, }) {
        this.id = uuid_1.v4();
        this.key = key;
        this.updateCharaOp = core_1.Reference.create(updateCharaOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], UpdateBoolParamOp.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], UpdateBoolParamOp.prototype, "key", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateBoolParamOp.prototype, "isValuePrivate", void 0);
__decorate([
    core_1.Property({ type: core_1.JsonType, nullable: true }),
    __metadata("design:type", Object)
], UpdateBoolParamOp.prototype, "value", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.UpdateCharaOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], UpdateBoolParamOp.prototype, "updateCharaOp", void 0);
UpdateBoolParamOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['updateCharaOp', 'key'] }),
    __metadata("design:paramtypes", [Object])
], UpdateBoolParamOp);
exports.UpdateBoolParamOp = UpdateBoolParamOp;
