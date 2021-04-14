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
exports.UpdateNumMaxParamOp = exports.RemovedNumMaxParam = exports.NumMaxParam = exports.NumMaxParamBase = exports.UpdateNumParamOp = exports.RemovedNumParam = exports.NumParam = exports.NumParamBase = void 0;
const core_1 = require("@mikro-orm/core");
const uuid_1 = require("uuid");
const mikro_orm_1 = require("../mikro-orm");
class NumParamBase {
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
], NumParamBase.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], NumParamBase.prototype, "key", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Boolean)
], NumParamBase.prototype, "isValuePrivate", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], NumParamBase.prototype, "value", void 0);
exports.NumParamBase = NumParamBase;
let NumParam = class NumParam extends NumParamBase {
    constructor(params) {
        super(params);
        this.version = 1;
        this.chara = core_1.Reference.create(params.chara);
    }
};
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], NumParam.prototype, "version", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.Chara, { wrappedReference: true }),
    __metadata("design:type", Object)
], NumParam.prototype, "chara", void 0);
NumParam = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['chara', 'key'] }),
    __metadata("design:paramtypes", [Object])
], NumParam);
exports.NumParam = NumParam;
let RemovedNumParam = class RemovedNumParam extends NumParamBase {
    constructor(params) {
        super(params);
        this.version = 1;
        this.removeCharaOp = core_1.Reference.create(params.removeCharaOp);
    }
};
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], RemovedNumParam.prototype, "version", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.RemoveCharaOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], RemovedNumParam.prototype, "removeCharaOp", void 0);
RemovedNumParam = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['removeCharaOp', 'key'] }),
    __metadata("design:paramtypes", [Object])
], RemovedNumParam);
exports.RemovedNumParam = RemovedNumParam;
let UpdateNumParamOp = class UpdateNumParamOp {
    constructor({ key, updateCharaOp, }) {
        this.id = uuid_1.v4();
        this.key = key;
        this.updateCharaOp = core_1.Reference.create(updateCharaOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], UpdateNumParamOp.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], UpdateNumParamOp.prototype, "key", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateNumParamOp.prototype, "isValuePrivate", void 0);
__decorate([
    core_1.Property({ type: core_1.JsonType, nullable: true }),
    __metadata("design:type", Object)
], UpdateNumParamOp.prototype, "value", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.UpdateCharaOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], UpdateNumParamOp.prototype, "updateCharaOp", void 0);
UpdateNumParamOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['updateCharaOp', 'key'] }),
    __metadata("design:paramtypes", [Object])
], UpdateNumParamOp);
exports.UpdateNumParamOp = UpdateNumParamOp;
class NumMaxParamBase {
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
], NumMaxParamBase.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], NumMaxParamBase.prototype, "key", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Boolean)
], NumMaxParamBase.prototype, "isValuePrivate", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], NumMaxParamBase.prototype, "value", void 0);
exports.NumMaxParamBase = NumMaxParamBase;
let NumMaxParam = class NumMaxParam extends NumMaxParamBase {
    constructor(params) {
        super(params);
        this.version = 1;
        this.chara = core_1.Reference.create(params.chara);
    }
};
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], NumMaxParam.prototype, "version", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.Chara, { wrappedReference: true }),
    __metadata("design:type", Object)
], NumMaxParam.prototype, "chara", void 0);
NumMaxParam = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['chara', 'key'] }),
    __metadata("design:paramtypes", [Object])
], NumMaxParam);
exports.NumMaxParam = NumMaxParam;
let RemovedNumMaxParam = class RemovedNumMaxParam extends NumMaxParamBase {
    constructor(params) {
        super(params);
        this.version = 1;
        this.removeCharaOp = core_1.Reference.create(params.removeCharaOp);
    }
};
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], RemovedNumMaxParam.prototype, "version", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.RemoveCharaOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], RemovedNumMaxParam.prototype, "removeCharaOp", void 0);
RemovedNumMaxParam = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['removeCharaOp', 'key'] }),
    __metadata("design:paramtypes", [Object])
], RemovedNumMaxParam);
exports.RemovedNumMaxParam = RemovedNumMaxParam;
let UpdateNumMaxParamOp = class UpdateNumMaxParamOp {
    constructor({ key, updateCharaOp, }) {
        this.id = uuid_1.v4();
        this.key = key;
        this.updateCharaOp = core_1.Reference.create(updateCharaOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], UpdateNumMaxParamOp.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], UpdateNumMaxParamOp.prototype, "key", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateNumMaxParamOp.prototype, "isValuePrivate", void 0);
__decorate([
    core_1.Property({ type: core_1.JsonType, nullable: true }),
    __metadata("design:type", Object)
], UpdateNumMaxParamOp.prototype, "value", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.UpdateCharaOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], UpdateNumMaxParamOp.prototype, "updateCharaOp", void 0);
UpdateNumMaxParamOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['updateCharaOp', 'key'] }),
    __metadata("design:paramtypes", [Object])
], UpdateNumMaxParamOp);
exports.UpdateNumMaxParamOp = UpdateNumMaxParamOp;
