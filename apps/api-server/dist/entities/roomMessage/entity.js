'use strict';

var tslib = require('tslib');
var core = require('@mikro-orm/core');
var uuid = require('uuid');
var FileSourceType = require('../../enums/FileSourceType.js');
var easyFlake = require('../../utils/easyFlake.js');
var entity = require('../room/entity.js');
var entity$1 = require('../user/entity.js');

exports.RoomPubCh = class RoomPubCh {
    constructor({ key }) {
        this.id = uuid.v4();
        this.version = 1;
        this.roomPubMsgs = new core.Collection(this);
        this.key = key;
    }
};
tslib.__decorate([
    core.PrimaryKey(),
    tslib.__metadata("design:type", String)
], exports.RoomPubCh.prototype, "id", void 0);
tslib.__decorate([
    core.Property({ version: true, index: true }),
    tslib.__metadata("design:type", Number)
], exports.RoomPubCh.prototype, "version", void 0);
tslib.__decorate([
    core.Property({ type: Date, nullable: true, onUpdate: () => new Date(), index: true }),
    tslib.__metadata("design:type", Date)
], exports.RoomPubCh.prototype, "updatedAt", void 0);
tslib.__decorate([
    core.Property({ index: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPubCh.prototype, "key", void 0);
tslib.__decorate([
    core.Property({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPubCh.prototype, "name", void 0);
tslib.__decorate([
    core.OneToMany(() => exports.RoomPubMsg, x => x.roomPubCh, { orphanRemoval: true }),
    tslib.__metadata("design:type", Object)
], exports.RoomPubCh.prototype, "roomPubMsgs", void 0);
tslib.__decorate([
    core.ManyToOne(() => entity.Room),
    tslib.__metadata("design:type", Object)
], exports.RoomPubCh.prototype, "room", void 0);
exports.RoomPubCh = tslib.__decorate([
    core.Entity(),
    core.Unique({ properties: ['room', 'key'] }),
    tslib.__metadata("design:paramtypes", [Object])
], exports.RoomPubCh);
exports.RoomPubMsg = class RoomPubMsg {
    constructor({ initText, initTextSource, }) {
        this.id = easyFlake.easyFlake();
        this.version = 1;
        this.createdAt = new Date();
        this.isSecret = false;
        this.initText = initText;
        this.initTextSource = initText === initTextSource ? undefined : initTextSource;
    }
    get textUpdatedAtValue() {
        if (this.textUpdatedAt3 != null) {
            return this.textUpdatedAt3.getTime();
        }
        if (this.textUpdatedAt2 != null) {
            return this.textUpdatedAt2.getTime();
        }
        return this.textUpdatedAt;
    }
};
tslib.__decorate([
    core.PrimaryKey(),
    tslib.__metadata("design:type", String)
], exports.RoomPubMsg.prototype, "id", void 0);
tslib.__decorate([
    core.Property({ version: true, index: true }),
    tslib.__metadata("design:type", Number)
], exports.RoomPubMsg.prototype, "version", void 0);
tslib.__decorate([
    core.Property({ type: Date, onCreate: () => new Date(), index: true }),
    tslib.__metadata("design:type", Date)
], exports.RoomPubMsg.prototype, "createdAt", void 0);
tslib.__decorate([
    core.Property({ type: Date, nullable: true, onUpdate: () => new Date(), index: true }),
    tslib.__metadata("design:type", Date)
], exports.RoomPubMsg.prototype, "updatedAt", void 0);
tslib.__decorate([
    core.Property({ nullable: true, type: core.TextType, default: null }),
    tslib.__metadata("design:type", String)
], exports.RoomPubMsg.prototype, "initTextSource", void 0);
tslib.__decorate([
    core.Property({ nullable: true, type: core.TextType, default: null }),
    tslib.__metadata("design:type", String)
], exports.RoomPubMsg.prototype, "initText", void 0);
tslib.__decorate([
    core.Property({ nullable: true, type: core.TextType }),
    tslib.__metadata("design:type", String)
], exports.RoomPubMsg.prototype, "updatedText", void 0);
tslib.__decorate([
    core.Property({ nullable: true, default: null }),
    tslib.__metadata("design:type", Number)
], exports.RoomPubMsg.prototype, "textUpdatedAt", void 0);
tslib.__decorate([
    core.Property({ type: core.DateType, nullable: true, default: null }),
    tslib.__metadata("design:type", Date)
], exports.RoomPubMsg.prototype, "textUpdatedAt2", void 0);
tslib.__decorate([
    core.Property({ type: Date, nullable: true, default: null }),
    tslib.__metadata("design:type", Date)
], exports.RoomPubMsg.prototype, "textUpdatedAt3", void 0);
tslib.__decorate([
    core.Property({ persist: false }),
    tslib.__metadata("design:type", Object),
    tslib.__metadata("design:paramtypes", [])
], exports.RoomPubMsg.prototype, "textUpdatedAtValue", null);
tslib.__decorate([
    core.Property({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPubMsg.prototype, "textColor", void 0);
tslib.__decorate([
    core.Property({ nullable: true, type: core.TextType }),
    tslib.__metadata("design:type", String)
], exports.RoomPubMsg.prototype, "commandResult", void 0);
tslib.__decorate([
    core.Property({ nullable: true, default: null, index: true }),
    tslib.__metadata("design:type", Boolean)
], exports.RoomPubMsg.prototype, "commandIsSuccess", void 0);
tslib.__decorate([
    core.Property({ nullable: true, type: core.TextType }),
    tslib.__metadata("design:type", String)
], exports.RoomPubMsg.prototype, "altTextToSecret", void 0);
tslib.__decorate([
    core.Property({ index: true }),
    tslib.__metadata("design:type", Boolean)
], exports.RoomPubMsg.prototype, "isSecret", void 0);
tslib.__decorate([
    core.Property({ nullable: true, index: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPubMsg.prototype, "charaStateId", void 0);
tslib.__decorate([
    core.Property({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPubMsg.prototype, "charaName", void 0);
tslib.__decorate([
    core.Property({ nullable: true, default: null }),
    tslib.__metadata("design:type", Boolean)
], exports.RoomPubMsg.prototype, "charaIsPrivate", void 0);
tslib.__decorate([
    core.Property({ nullable: true, type: core.TextType, default: null }),
    tslib.__metadata("design:type", String)
], exports.RoomPubMsg.prototype, "charaImagePath", void 0);
tslib.__decorate([
    core.Property({ nullable: true, type: core.TextType, default: null }),
    tslib.__metadata("design:type", String)
], exports.RoomPubMsg.prototype, "charaImageSourceType", void 0);
tslib.__decorate([
    core.Property({ nullable: true, type: core.TextType, default: null }),
    tslib.__metadata("design:type", String)
], exports.RoomPubMsg.prototype, "charaPortraitImagePath", void 0);
tslib.__decorate([
    core.Property({ type: 'string', nullable: true, default: null }),
    tslib.__metadata("design:type", String)
], exports.RoomPubMsg.prototype, "charaPortraitImageSourceType", void 0);
tslib.__decorate([
    core.Property({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPubMsg.prototype, "customName", void 0);
tslib.__decorate([
    core.ManyToOne(() => exports.RoomPubCh, { wrappedReference: true }),
    tslib.__metadata("design:type", Object)
], exports.RoomPubMsg.prototype, "roomPubCh", void 0);
tslib.__decorate([
    core.ManyToOne(() => entity$1.User, { nullable: true, wrappedReference: true }),
    tslib.__metadata("design:type", Object)
], exports.RoomPubMsg.prototype, "createdBy", void 0);
exports.RoomPubMsg = tslib.__decorate([
    core.Entity(),
    tslib.__metadata("design:paramtypes", [Object])
], exports.RoomPubMsg);
exports.RoomPrvMsg = class RoomPrvMsg {
    constructor({ initText, initTextSource, }) {
        this.id = easyFlake.easyFlake();
        this.version = 1;
        this.createdAt = new Date();
        this.isSecret = false;
        this.visibleTo = new core.Collection(this);
        this.initText = initText;
        this.initTextSource = initText === initTextSource ? undefined : initTextSource;
    }
    get textUpdatedAtValue() {
        if (this.textUpdatedAt3 != null) {
            return this.textUpdatedAt3.getTime();
        }
        if (this.textUpdatedAt2 != null) {
            return this.textUpdatedAt2.getTime();
        }
        return this.textUpdatedAt;
    }
};
tslib.__decorate([
    core.PrimaryKey(),
    tslib.__metadata("design:type", String)
], exports.RoomPrvMsg.prototype, "id", void 0);
tslib.__decorate([
    core.Property({ version: true, index: true }),
    tslib.__metadata("design:type", Number)
], exports.RoomPrvMsg.prototype, "version", void 0);
tslib.__decorate([
    core.Property({ type: Date, onCreate: () => new Date(), index: true }),
    tslib.__metadata("design:type", Date)
], exports.RoomPrvMsg.prototype, "createdAt", void 0);
tslib.__decorate([
    core.Property({ type: Date, nullable: true, onUpdate: () => new Date(), index: true }),
    tslib.__metadata("design:type", Date)
], exports.RoomPrvMsg.prototype, "updatedAt", void 0);
tslib.__decorate([
    core.Property({ nullable: true, type: core.TextType, default: null }),
    tslib.__metadata("design:type", String)
], exports.RoomPrvMsg.prototype, "initTextSource", void 0);
tslib.__decorate([
    core.Property({ nullable: true, type: core.TextType, default: null }),
    tslib.__metadata("design:type", String)
], exports.RoomPrvMsg.prototype, "initText", void 0);
tslib.__decorate([
    core.Property({ nullable: true, type: core.TextType }),
    tslib.__metadata("design:type", String)
], exports.RoomPrvMsg.prototype, "updatedText", void 0);
tslib.__decorate([
    core.Property({ nullable: true, default: null }),
    tslib.__metadata("design:type", Number)
], exports.RoomPrvMsg.prototype, "textUpdatedAt", void 0);
tslib.__decorate([
    core.Property({ type: core.DateType, nullable: true, default: null }),
    tslib.__metadata("design:type", Date)
], exports.RoomPrvMsg.prototype, "textUpdatedAt2", void 0);
tslib.__decorate([
    core.Property({ type: Date, nullable: true, default: null }),
    tslib.__metadata("design:type", Date)
], exports.RoomPrvMsg.prototype, "textUpdatedAt3", void 0);
tslib.__decorate([
    core.Property({ persist: false }),
    tslib.__metadata("design:type", Object),
    tslib.__metadata("design:paramtypes", [])
], exports.RoomPrvMsg.prototype, "textUpdatedAtValue", null);
tslib.__decorate([
    core.Property({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPrvMsg.prototype, "textColor", void 0);
tslib.__decorate([
    core.Property({ nullable: true, type: core.TextType }),
    tslib.__metadata("design:type", String)
], exports.RoomPrvMsg.prototype, "commandResult", void 0);
tslib.__decorate([
    core.Property({ nullable: true, default: null }),
    tslib.__metadata("design:type", Boolean)
], exports.RoomPrvMsg.prototype, "commandIsSuccess", void 0);
tslib.__decorate([
    core.Property({ nullable: true, type: core.TextType }),
    tslib.__metadata("design:type", String)
], exports.RoomPrvMsg.prototype, "altTextToSecret", void 0);
tslib.__decorate([
    core.Property({ index: true }),
    tslib.__metadata("design:type", Boolean)
], exports.RoomPrvMsg.prototype, "isSecret", void 0);
tslib.__decorate([
    core.Property({ nullable: true, index: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPrvMsg.prototype, "charaStateId", void 0);
tslib.__decorate([
    core.Property({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPrvMsg.prototype, "charaName", void 0);
tslib.__decorate([
    core.Property({ nullable: true, default: null }),
    tslib.__metadata("design:type", Boolean)
], exports.RoomPrvMsg.prototype, "charaIsPrivate", void 0);
tslib.__decorate([
    core.Property({ nullable: true, type: core.TextType, default: null }),
    tslib.__metadata("design:type", String)
], exports.RoomPrvMsg.prototype, "charaImagePath", void 0);
tslib.__decorate([
    core.Property({ type: () => FileSourceType.FileSourceType, nullable: true, default: null }),
    tslib.__metadata("design:type", String)
], exports.RoomPrvMsg.prototype, "charaImageSourceType", void 0);
tslib.__decorate([
    core.Property({ nullable: true, type: core.TextType, default: null }),
    tslib.__metadata("design:type", String)
], exports.RoomPrvMsg.prototype, "charaPortraitImagePath", void 0);
tslib.__decorate([
    core.Property({ type: 'string', nullable: true, default: null }),
    tslib.__metadata("design:type", String)
], exports.RoomPrvMsg.prototype, "charaPortraitImageSourceType", void 0);
tslib.__decorate([
    core.Property({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPrvMsg.prototype, "customName", void 0);
tslib.__decorate([
    core.ManyToOne(() => entity$1.User, { wrappedReference: true, nullable: true }),
    tslib.__metadata("design:type", Object)
], exports.RoomPrvMsg.prototype, "createdBy", void 0);
tslib.__decorate([
    core.ManyToMany(() => entity$1.User, x => x.visibleRoomPrvMsgs),
    tslib.__metadata("design:type", Object)
], exports.RoomPrvMsg.prototype, "visibleTo", void 0);
tslib.__decorate([
    core.ManyToOne(() => entity.Room, { wrappedReference: true }),
    tslib.__metadata("design:type", Object)
], exports.RoomPrvMsg.prototype, "room", void 0);
exports.RoomPrvMsg = tslib.__decorate([
    core.Entity(),
    tslib.__metadata("design:paramtypes", [Object])
], exports.RoomPrvMsg);
exports.DicePieceLog = class DicePieceLog {
    constructor({ room, stateId, value, }) {
        this.id = easyFlake.easyFlake();
        this.createdAt = new Date();
        this.room = core.Reference.create(room);
        this.stateId = stateId;
        this.value = value;
    }
};
tslib.__decorate([
    core.PrimaryKey(),
    tslib.__metadata("design:type", String)
], exports.DicePieceLog.prototype, "id", void 0);
tslib.__decorate([
    core.Property({ type: Date, onCreate: () => new Date() }),
    tslib.__metadata("design:type", Date)
], exports.DicePieceLog.prototype, "createdAt", void 0);
tslib.__decorate([
    core.Property({ index: true }),
    tslib.__metadata("design:type", String)
], exports.DicePieceLog.prototype, "stateId", void 0);
tslib.__decorate([
    core.Property({ type: core.JsonType, nullable: true }),
    tslib.__metadata("design:type", Object)
], exports.DicePieceLog.prototype, "value", void 0);
tslib.__decorate([
    core.ManyToOne(() => entity.Room, { wrappedReference: true }),
    tslib.__metadata("design:type", Object)
], exports.DicePieceLog.prototype, "room", void 0);
exports.DicePieceLog = tslib.__decorate([
    core.Entity(),
    tslib.__metadata("design:paramtypes", [Object])
], exports.DicePieceLog);
exports.StringPieceLog = class StringPieceLog {
    constructor({ room, stateId, value, }) {
        this.id = easyFlake.easyFlake();
        this.createdAt = new Date();
        this.room = core.Reference.create(room);
        this.stateId = stateId;
        this.value = value;
    }
};
tslib.__decorate([
    core.PrimaryKey(),
    tslib.__metadata("design:type", String)
], exports.StringPieceLog.prototype, "id", void 0);
tslib.__decorate([
    core.Property({ type: Date, onCreate: () => new Date() }),
    tslib.__metadata("design:type", Date)
], exports.StringPieceLog.prototype, "createdAt", void 0);
tslib.__decorate([
    core.Property({ index: true }),
    tslib.__metadata("design:type", String)
], exports.StringPieceLog.prototype, "stateId", void 0);
tslib.__decorate([
    core.Property({ type: core.JsonType, nullable: true }),
    tslib.__metadata("design:type", Object)
], exports.StringPieceLog.prototype, "value", void 0);
tslib.__decorate([
    core.ManyToOne(() => entity.Room, { wrappedReference: true }),
    tslib.__metadata("design:type", Object)
], exports.StringPieceLog.prototype, "room", void 0);
exports.StringPieceLog = tslib.__decorate([
    core.Entity(),
    tslib.__metadata("design:paramtypes", [Object])
], exports.StringPieceLog);
exports.RoomSe = class RoomSe {
    constructor({ filePath, fileSourceType, volume, }) {
        this.id = easyFlake.easyFlake();
        this.createdAt = new Date();
        this.filePath = filePath;
        this.fileSourceType = fileSourceType;
        this.volume = volume;
    }
};
tslib.__decorate([
    core.PrimaryKey(),
    tslib.__metadata("design:type", String)
], exports.RoomSe.prototype, "id", void 0);
tslib.__decorate([
    core.Property({ type: Date, onCreate: () => new Date() }),
    tslib.__metadata("design:type", Date)
], exports.RoomSe.prototype, "createdAt", void 0);
tslib.__decorate([
    core.Property(),
    tslib.__metadata("design:type", String)
], exports.RoomSe.prototype, "filePath", void 0);
tslib.__decorate([
    core.Property({ type: 'string' }),
    tslib.__metadata("design:type", String)
], exports.RoomSe.prototype, "fileSourceType", void 0);
tslib.__decorate([
    core.Property(),
    tslib.__metadata("design:type", Number)
], exports.RoomSe.prototype, "volume", void 0);
tslib.__decorate([
    core.ManyToOne(() => entity$1.User, { nullable: true, wrappedReference: true }),
    tslib.__metadata("design:type", Object)
], exports.RoomSe.prototype, "createdBy", void 0);
tslib.__decorate([
    core.ManyToOne(() => entity.Room, { wrappedReference: true }),
    tslib.__metadata("design:type", Object)
], exports.RoomSe.prototype, "room", void 0);
exports.RoomSe = tslib.__decorate([
    core.Entity(),
    tslib.__metadata("design:paramtypes", [Object])
], exports.RoomSe);
//# sourceMappingURL=entity.js.map
