'use strict';

var tslib = require('tslib');
var core = require('@mikro-orm/core');
var uuid = require('uuid');
var entity$1 = require('../file/entity.js');
var entity = require('../user/entity.js');

exports.FileTag = class FileTag {
    constructor({ name }) {
        this.id = uuid.v4();
        this.files = new core.Collection(this);
        this.name = name;
    }
};
tslib.__decorate([
    core.PrimaryKey(),
    tslib.__metadata("design:type", String)
], exports.FileTag.prototype, "id", void 0);
tslib.__decorate([
    core.Property(),
    tslib.__metadata("design:type", String)
], exports.FileTag.prototype, "name", void 0);
tslib.__decorate([
    core.ManyToOne(() => entity.User),
    tslib.__metadata("design:type", Object)
], exports.FileTag.prototype, "user", void 0);
tslib.__decorate([
    core.ManyToMany(() => entity$1.File, x => x.fileTags),
    tslib.__metadata("design:type", Object)
], exports.FileTag.prototype, "files", void 0);
exports.FileTag = tslib.__decorate([
    core.Entity(),
    tslib.__metadata("design:paramtypes", [Object])
], exports.FileTag);
//# sourceMappingURL=entity.js.map
