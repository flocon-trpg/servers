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
exports.File = void 0;
const core_1 = require("@mikro-orm/core");
const FilePermissionType_1 = require("../../../enums/FilePermissionType");
const mikro_orm_1 = require("../user/mikro-orm");
let File = class File {
    constructor({ createdBy, deletePermission, encoding, filename, filesize, listPermission, thumbFilename, mimetype, renamePermission, screenname, size, }) {
        this.createdBy = createdBy;
        this.deletePermission = deletePermission;
        this.encoding = encoding;
        this.filename = filename;
        this.filesize = filesize;
        this.listPermission = listPermission;
        this.thumbFilename = thumbFilename;
        this.mimetype = mimetype;
        this.renamePermission = renamePermission;
        this.screenname = screenname;
        this.size = size;
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], File.prototype, "filename", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], File.prototype, "screenname", void 0);
__decorate([
    core_1.Property({ type: Date, nullable: true, onCreate: () => new Date() }),
    core_1.Index(),
    __metadata("design:type", Date)
], File.prototype, "createdAt", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", String)
], File.prototype, "encoding", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], File.prototype, "size", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    core_1.Index(),
    __metadata("design:type", String)
], File.prototype, "thumbFilename", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], File.prototype, "mimetype", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", Number)
], File.prototype, "filesize", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], File.prototype, "listPermission", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], File.prototype, "renamePermission", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], File.prototype, "deletePermission", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.User),
    __metadata("design:type", Object)
], File.prototype, "createdBy", void 0);
File = __decorate([
    core_1.Entity(),
    __metadata("design:paramtypes", [Object])
], File);
exports.File = File;
