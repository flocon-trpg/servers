'use strict';

var tslib = require('tslib');
var core = require('@mikro-orm/core');
require('../../enums/BaasType.js');
var entity$1 = require('../file/entity.js');
var entity$2 = require('../fileTag/entity.js');
var entity = require('../participant/entity.js');
var entity$4 = require('../room/entity.js');
var entity$3 = require('../roomMessage/entity.js');

exports.User = class User {
    constructor({ userUid, baasType }) {
        this.isEntry = false;
        this.participants = new core.Collection(this);
        this.files = new core.Collection(this);
        this.fileTags = new core.Collection(this);
        this.roomPubMsgs = new core.Collection(this);
        this.roomPrvMsgs = new core.Collection(this);
        this.roomSEs = new core.Collection(this);
        this.visibleRoomPrvMsgs = new core.Collection(this);
        this.bookmarkedRooms = new core.Collection(this);
        this.userUid = userUid;
        this.baasType = baasType;
    }
};
tslib.__decorate([
    core.PrimaryKey(),
    tslib.__metadata("design:type", String)
], exports.User.prototype, "userUid", void 0);
tslib.__decorate([
    core.Property({ type: 'string', index: true }),
    tslib.__metadata("design:type", String)
], exports.User.prototype, "baasType", void 0);
tslib.__decorate([
    core.Property({ index: true }),
    tslib.__metadata("design:type", Boolean)
], exports.User.prototype, "isEntry", void 0);
tslib.__decorate([
    core.OneToMany(() => entity.Participant, x => x.user, { orphanRemoval: true }),
    tslib.__metadata("design:type", Object)
], exports.User.prototype, "participants", void 0);
tslib.__decorate([
    core.OneToMany(() => entity$1.File, x => x.createdBy, { orphanRemoval: true }),
    tslib.__metadata("design:type", Object)
], exports.User.prototype, "files", void 0);
tslib.__decorate([
    core.OneToMany(() => entity$2.FileTag, x => x.user, { orphanRemoval: true }),
    tslib.__metadata("design:type", Object)
], exports.User.prototype, "fileTags", void 0);
tslib.__decorate([
    core.OneToMany(() => entity$3.RoomPubMsg, x => x.createdBy, { orphanRemoval: true }),
    tslib.__metadata("design:type", Object)
], exports.User.prototype, "roomPubMsgs", void 0);
tslib.__decorate([
    core.OneToMany(() => entity$3.RoomPrvMsg, x => x.createdBy, { orphanRemoval: true }),
    tslib.__metadata("design:type", Object)
], exports.User.prototype, "roomPrvMsgs", void 0);
tslib.__decorate([
    core.OneToMany(() => entity$3.RoomPrvMsg, x => x.createdBy, { orphanRemoval: true }),
    tslib.__metadata("design:type", Object)
], exports.User.prototype, "roomSEs", void 0);
tslib.__decorate([
    core.ManyToMany(() => entity$3.RoomPrvMsg, x => x.visibleTo, { owner: true }),
    tslib.__metadata("design:type", Object)
], exports.User.prototype, "visibleRoomPrvMsgs", void 0);
tslib.__decorate([
    core.ManyToMany(() => entity$4.Room, x => x.bookmarkedBy, { owner: true }),
    tslib.__metadata("design:type", Object)
], exports.User.prototype, "bookmarkedRooms", void 0);
exports.User = tslib.__decorate([
    core.Entity(),
    tslib.__metadata("design:paramtypes", [Object])
], exports.User);
//# sourceMappingURL=entity.js.map
