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
exports.FileTag = void 0;
const core_1 = require("@mikro-orm/core");
const uuid_1 = require("uuid");
const mikro_orm_1 = require("../file/mikro-orm");
const mikro_orm_2 = require("../user/mikro-orm");
let FileTag = class FileTag {
    constructor({ name }) {
        this.id = uuid_1.v4();
        this.files = new core_1.Collection(this);
        this.name = name;
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], FileTag.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", String)
], FileTag.prototype, "name", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_2.User),
    __metadata("design:type", Object)
], FileTag.prototype, "user", void 0);
__decorate([
    core_1.ManyToMany(() => mikro_orm_1.File, x => x.fileTags),
    __metadata("design:type", Object)
], FileTag.prototype, "files", void 0);
FileTag = __decorate([
    core_1.Entity(),
    __metadata("design:paramtypes", [Object])
], FileTag);
exports.FileTag = FileTag;
