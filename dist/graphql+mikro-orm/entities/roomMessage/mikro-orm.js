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
exports.RoomSe = exports.StringPieceValueLog = exports.DicePieceValueLog = exports.RoomPrvMsg = exports.RoomPubMsg = exports.RoomPubCh = void 0;
const core_1 = require("@mikro-orm/core");
const uuid_1 = require("uuid");
const FileSourceType_1 = require("../../../enums/FileSourceType");
const easyFlake_1 = require("../../../utils/easyFlake");
const mikro_orm_1 = require("../room/mikro-orm");
const mikro_orm_2 = require("../user/mikro-orm");
let RoomPubCh = class RoomPubCh {
    constructor({ key }) {
        this.id = (0, uuid_1.v4)();
        this.version = 1;
        this.roomPubMsgs = new core_1.Collection(this);
        this.key = key;
    }
};
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", String)
], RoomPubCh.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ version: true, index: true }),
    __metadata("design:type", Number)
], RoomPubCh.prototype, "version", void 0);
__decorate([
    (0, core_1.Property)({ type: Date, nullable: true, onUpdate: () => new Date(), index: true }),
    __metadata("design:type", Date)
], RoomPubCh.prototype, "updatedAt", void 0);
__decorate([
    (0, core_1.Property)({ index: true }),
    __metadata("design:type", String)
], RoomPubCh.prototype, "key", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], RoomPubCh.prototype, "name", void 0);
__decorate([
    (0, core_1.OneToMany)(() => RoomPubMsg, x => x.roomPubCh, { orphanRemoval: true }),
    __metadata("design:type", Object)
], RoomPubCh.prototype, "roomPubMsgs", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => mikro_orm_1.Room),
    __metadata("design:type", Object)
], RoomPubCh.prototype, "room", void 0);
RoomPubCh = __decorate([
    (0, core_1.Entity)(),
    (0, core_1.Unique)({ properties: ['room', 'key'] }),
    __metadata("design:paramtypes", [Object])
], RoomPubCh);
exports.RoomPubCh = RoomPubCh;
let RoomPubMsg = class RoomPubMsg {
    constructor({ initText, initTextSource, }) {
        this.id = (0, easyFlake_1.easyFlake)();
        this.version = 1;
        this.createdAt = new Date();
        this.isSecret = false;
        this.initText = initText;
        this.initTextSource = initTextSource;
    }
};
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", String)
], RoomPubMsg.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ version: true, index: true }),
    __metadata("design:type", Number)
], RoomPubMsg.prototype, "version", void 0);
__decorate([
    (0, core_1.Property)({ type: Date, onCreate: () => new Date(), index: true }),
    __metadata("design:type", Date)
], RoomPubMsg.prototype, "createdAt", void 0);
__decorate([
    (0, core_1.Property)({ type: Date, nullable: true, onUpdate: () => new Date(), index: true }),
    __metadata("design:type", Date)
], RoomPubMsg.prototype, "updatedAt", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, length: 65535, default: '' }),
    __metadata("design:type", String)
], RoomPubMsg.prototype, "initTextSource", void 0);
__decorate([
    (0, core_1.Property)({ length: 65535, default: '' }),
    __metadata("design:type", String)
], RoomPubMsg.prototype, "initText", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, length: 65535 }),
    __metadata("design:type", String)
], RoomPubMsg.prototype, "updatedText", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, default: null }),
    __metadata("design:type", Number)
], RoomPubMsg.prototype, "textUpdatedAt", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], RoomPubMsg.prototype, "textColor", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, length: 65535 }),
    __metadata("design:type", String)
], RoomPubMsg.prototype, "commandResult", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, default: null, index: true }),
    __metadata("design:type", Boolean)
], RoomPubMsg.prototype, "commandIsSuccess", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, length: 65535 }),
    __metadata("design:type", String)
], RoomPubMsg.prototype, "altTextToSecret", void 0);
__decorate([
    (0, core_1.Property)({ index: true }),
    __metadata("design:type", Boolean)
], RoomPubMsg.prototype, "isSecret", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, index: true }),
    __metadata("design:type", String)
], RoomPubMsg.prototype, "charaStateId", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], RoomPubMsg.prototype, "charaName", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, default: null }),
    __metadata("design:type", Boolean)
], RoomPubMsg.prototype, "charaIsPrivate", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, length: 65535, default: null }),
    __metadata("design:type", String)
], RoomPubMsg.prototype, "charaImagePath", void 0);
__decorate([
    (0, core_1.Property)({ type: () => String, nullable: true, default: null }),
    __metadata("design:type", String)
], RoomPubMsg.prototype, "charaImageSourceType", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, length: 65535, default: null }),
    __metadata("design:type", String)
], RoomPubMsg.prototype, "charaTachieImagePath", void 0);
__decorate([
    (0, core_1.Property)({ type: () => String, nullable: true, default: null }),
    __metadata("design:type", String)
], RoomPubMsg.prototype, "charaTachieImageSourceType", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], RoomPubMsg.prototype, "customName", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => RoomPubCh, { wrappedReference: true }),
    __metadata("design:type", Object)
], RoomPubMsg.prototype, "roomPubCh", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => mikro_orm_2.User, { nullable: true, wrappedReference: true }),
    __metadata("design:type", Object)
], RoomPubMsg.prototype, "createdBy", void 0);
RoomPubMsg = __decorate([
    (0, core_1.Entity)(),
    __metadata("design:paramtypes", [Object])
], RoomPubMsg);
exports.RoomPubMsg = RoomPubMsg;
let RoomPrvMsg = class RoomPrvMsg {
    constructor({ initText, initTextSource, }) {
        this.id = (0, easyFlake_1.easyFlake)();
        this.version = 1;
        this.createdAt = new Date();
        this.isSecret = false;
        this.visibleTo = new core_1.Collection(this);
        this.initText = initText;
        this.initTextSource = initTextSource;
    }
};
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", String)
], RoomPrvMsg.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ version: true, index: true }),
    __metadata("design:type", Number)
], RoomPrvMsg.prototype, "version", void 0);
__decorate([
    (0, core_1.Property)({ type: Date, onCreate: () => new Date(), index: true }),
    __metadata("design:type", Date)
], RoomPrvMsg.prototype, "createdAt", void 0);
__decorate([
    (0, core_1.Property)({ type: Date, nullable: true, onUpdate: () => new Date(), index: true }),
    __metadata("design:type", Date)
], RoomPrvMsg.prototype, "updatedAt", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, length: 65535, default: '' }),
    __metadata("design:type", String)
], RoomPrvMsg.prototype, "initTextSource", void 0);
__decorate([
    (0, core_1.Property)({ length: 65535, default: '' }),
    __metadata("design:type", String)
], RoomPrvMsg.prototype, "initText", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, length: 65535 }),
    __metadata("design:type", String)
], RoomPrvMsg.prototype, "updatedText", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, default: null }),
    __metadata("design:type", Number)
], RoomPrvMsg.prototype, "textUpdatedAt", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], RoomPrvMsg.prototype, "textColor", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, length: 65535 }),
    __metadata("design:type", String)
], RoomPrvMsg.prototype, "commandResult", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, default: null }),
    __metadata("design:type", Boolean)
], RoomPrvMsg.prototype, "commandIsSuccess", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, length: 65535 }),
    __metadata("design:type", String)
], RoomPrvMsg.prototype, "altTextToSecret", void 0);
__decorate([
    (0, core_1.Property)({ index: true }),
    __metadata("design:type", Boolean)
], RoomPrvMsg.prototype, "isSecret", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, index: true }),
    __metadata("design:type", String)
], RoomPrvMsg.prototype, "charaStateId", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], RoomPrvMsg.prototype, "charaName", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, default: null }),
    __metadata("design:type", Boolean)
], RoomPrvMsg.prototype, "charaIsPrivate", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, length: 65535, default: null }),
    __metadata("design:type", String)
], RoomPrvMsg.prototype, "charaImagePath", void 0);
__decorate([
    (0, core_1.Property)({ type: () => FileSourceType_1.FileSourceType, nullable: true, default: null }),
    __metadata("design:type", String)
], RoomPrvMsg.prototype, "charaImageSourceType", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, length: 65535, default: null }),
    __metadata("design:type", String)
], RoomPrvMsg.prototype, "charaTachieImagePath", void 0);
__decorate([
    (0, core_1.Property)({ type: () => String, nullable: true, default: null }),
    __metadata("design:type", String)
], RoomPrvMsg.prototype, "charaTachieImageSourceType", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], RoomPrvMsg.prototype, "customName", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => mikro_orm_2.User, { wrappedReference: true, nullable: true }),
    __metadata("design:type", Object)
], RoomPrvMsg.prototype, "createdBy", void 0);
__decorate([
    (0, core_1.ManyToMany)(() => mikro_orm_2.User, x => x.visibleRoomPrvMsgs),
    __metadata("design:type", Object)
], RoomPrvMsg.prototype, "visibleTo", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => mikro_orm_1.Room, { wrappedReference: true }),
    __metadata("design:type", Object)
], RoomPrvMsg.prototype, "room", void 0);
RoomPrvMsg = __decorate([
    (0, core_1.Entity)(),
    __metadata("design:paramtypes", [Object])
], RoomPrvMsg);
exports.RoomPrvMsg = RoomPrvMsg;
let DicePieceValueLog = class DicePieceValueLog {
    constructor({ characterCreatedBy, characterId, room, stateId, value, }) {
        this.id = (0, easyFlake_1.easyFlake)();
        this.createdAt = new Date();
        this.characterCreatedBy = characterCreatedBy;
        this.characterId = characterId;
        this.room = core_1.Reference.create(room);
        this.stateId = stateId;
        this.value = value;
    }
};
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", String)
], DicePieceValueLog.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ index: true }),
    __metadata("design:type", String)
], DicePieceValueLog.prototype, "characterCreatedBy", void 0);
__decorate([
    (0, core_1.Property)({ index: true }),
    __metadata("design:type", String)
], DicePieceValueLog.prototype, "characterId", void 0);
__decorate([
    (0, core_1.Property)({ type: Date, onCreate: () => new Date() }),
    __metadata("design:type", Date)
], DicePieceValueLog.prototype, "createdAt", void 0);
__decorate([
    (0, core_1.Property)({ index: true }),
    __metadata("design:type", String)
], DicePieceValueLog.prototype, "stateId", void 0);
__decorate([
    (0, core_1.Property)({ type: core_1.JsonType, nullable: true }),
    __metadata("design:type", Object)
], DicePieceValueLog.prototype, "value", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => mikro_orm_1.Room, { wrappedReference: true }),
    __metadata("design:type", Object)
], DicePieceValueLog.prototype, "room", void 0);
DicePieceValueLog = __decorate([
    (0, core_1.Entity)(),
    __metadata("design:paramtypes", [Object])
], DicePieceValueLog);
exports.DicePieceValueLog = DicePieceValueLog;
let StringPieceValueLog = class StringPieceValueLog {
    constructor({ characterCreatedBy, characterId, room, stateId, value, }) {
        this.id = (0, easyFlake_1.easyFlake)();
        this.createdAt = new Date();
        this.characterCreatedBy = characterCreatedBy;
        this.characterId = characterId;
        this.room = core_1.Reference.create(room);
        this.stateId = stateId;
        this.value = value;
    }
};
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", String)
], StringPieceValueLog.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ index: true }),
    __metadata("design:type", String)
], StringPieceValueLog.prototype, "characterCreatedBy", void 0);
__decorate([
    (0, core_1.Property)({ index: true }),
    __metadata("design:type", String)
], StringPieceValueLog.prototype, "characterId", void 0);
__decorate([
    (0, core_1.Property)({ type: Date, onCreate: () => new Date() }),
    __metadata("design:type", Date)
], StringPieceValueLog.prototype, "createdAt", void 0);
__decorate([
    (0, core_1.Property)({ index: true }),
    __metadata("design:type", String)
], StringPieceValueLog.prototype, "stateId", void 0);
__decorate([
    (0, core_1.Property)({ type: core_1.JsonType, nullable: true }),
    __metadata("design:type", Object)
], StringPieceValueLog.prototype, "value", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => mikro_orm_1.Room, { wrappedReference: true }),
    __metadata("design:type", Object)
], StringPieceValueLog.prototype, "room", void 0);
StringPieceValueLog = __decorate([
    (0, core_1.Entity)(),
    __metadata("design:paramtypes", [Object])
], StringPieceValueLog);
exports.StringPieceValueLog = StringPieceValueLog;
let RoomSe = class RoomSe {
    constructor({ filePath, fileSourceType, volume, }) {
        this.id = (0, easyFlake_1.easyFlake)();
        this.createdAt = new Date();
        this.filePath = filePath;
        this.fileSourceType = fileSourceType;
        this.volume = volume;
    }
};
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", String)
], RoomSe.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ type: Date, onCreate: () => new Date() }),
    __metadata("design:type", Date)
], RoomSe.prototype, "createdAt", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], RoomSe.prototype, "filePath", void 0);
__decorate([
    (0, core_1.Property)({ type: () => String }),
    __metadata("design:type", String)
], RoomSe.prototype, "fileSourceType", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", Number)
], RoomSe.prototype, "volume", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => mikro_orm_2.User, { nullable: true, wrappedReference: true }),
    __metadata("design:type", Object)
], RoomSe.prototype, "createdBy", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => mikro_orm_1.Room, { wrappedReference: true }),
    __metadata("design:type", Object)
], RoomSe.prototype, "room", void 0);
RoomSe = __decorate([
    (0, core_1.Entity)(),
    __metadata("design:paramtypes", [Object])
], RoomSe);
exports.RoomSe = RoomSe;
