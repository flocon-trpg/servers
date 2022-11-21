'use strict';

var tslib = require('tslib');
var core = require('@mikro-orm/core');
require('../../enums/FilePermissionType.js');
var entity$1 = require('../fileTag/entity.js');
var entity = require('../user/entity.js');

exports.File = class File {
    constructor({ createdBy, deletePermission, encoding, filename, filesize, listPermission, thumbFilename, mimetype, renamePermission, screenname, size, }) {
        this.fileTags = new core.Collection(this);
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
tslib.__decorate([
    core.PrimaryKey(),
    tslib.__metadata("design:type", String)
], exports.File.prototype, "filename", void 0);
tslib.__decorate([
    core.Property({ nullable: true, type: core.TextType }),
    tslib.__metadata("design:type", String)
], exports.File.prototype, "screenname", void 0);
tslib.__decorate([
    core.Property({ type: Date, nullable: true, onCreate: () => new Date() }),
    core.Index(),
    tslib.__metadata("design:type", Date)
], exports.File.prototype, "createdAt", void 0);
tslib.__decorate([
    core.Property(),
    tslib.__metadata("design:type", String)
], exports.File.prototype, "encoding", void 0);
tslib.__decorate([
    core.Property(),
    tslib.__metadata("design:type", Number)
], exports.File.prototype, "size", void 0);
tslib.__decorate([
    core.Property({ nullable: true }),
    core.Index(),
    tslib.__metadata("design:type", String)
], exports.File.prototype, "thumbFilename", void 0);
tslib.__decorate([
    core.Property(),
    core.Index(),
    tslib.__metadata("design:type", String)
], exports.File.prototype, "mimetype", void 0);
tslib.__decorate([
    core.Property(),
    core.Index(),
    tslib.__metadata("design:type", Number)
], exports.File.prototype, "filesize", void 0);
tslib.__decorate([
    core.Property({ type: 'string' }),
    core.Index(),
    tslib.__metadata("design:type", String)
], exports.File.prototype, "listPermission", void 0);
tslib.__decorate([
    core.Property({ type: 'string' }),
    core.Index(),
    tslib.__metadata("design:type", String)
], exports.File.prototype, "renamePermission", void 0);
tslib.__decorate([
    core.Property({ type: 'string' }),
    core.Index(),
    tslib.__metadata("design:type", String)
], exports.File.prototype, "deletePermission", void 0);
tslib.__decorate([
    core.ManyToOne(() => entity.User),
    tslib.__metadata("design:type", Object)
], exports.File.prototype, "createdBy", void 0);
tslib.__decorate([
    core.ManyToMany(() => entity$1.FileTag, x => x.files, { owner: true }),
    tslib.__metadata("design:type", Object)
], exports.File.prototype, "fileTags", void 0);
exports.File = tslib.__decorate([
    core.Entity(),
    tslib.__metadata("design:paramtypes", [Object])
], exports.File);
//# sourceMappingURL=entity.js.map
