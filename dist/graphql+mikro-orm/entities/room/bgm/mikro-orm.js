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
exports.UpdateRoomBgmOp = exports.RemoveRoomBgmOp = exports.AddRoomBgmOp = exports.RoomBgm = exports.RoomBgmBase = void 0;
const core_1 = require("@mikro-orm/core");
const uuid_1 = require("uuid");
const mikro_orm_1 = require("../mikro-orm");
let RoomBgmBase = class RoomBgmBase {
    constructor({ channelKey, files, volume, }) {
        this.id = uuid_1.v4();
        this.version = 1;
        this.channelKey = channelKey;
        this.files = files;
        this.volume = volume;
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], RoomBgmBase.prototype, "id", void 0);
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], RoomBgmBase.prototype, "version", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], RoomBgmBase.prototype, "channelKey", void 0);
__decorate([
    core_1.Property({ type: core_1.JsonType }),
    __metadata("design:type", Array)
], RoomBgmBase.prototype, "files", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], RoomBgmBase.prototype, "volume", void 0);
RoomBgmBase = __decorate([
    core_1.Entity(),
    __metadata("design:paramtypes", [Object])
], RoomBgmBase);
exports.RoomBgmBase = RoomBgmBase;
let RoomBgm = class RoomBgm extends RoomBgmBase {
    constructor(params) {
        super(params);
        this.version = 1;
        this.room = core_1.Reference.create(params.room);
    }
};
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], RoomBgm.prototype, "version", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.Room, { wrappedReference: true }),
    __metadata("design:type", Object)
], RoomBgm.prototype, "room", void 0);
RoomBgm = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['room', 'channelKey'] }),
    __metadata("design:paramtypes", [Object])
], RoomBgm);
exports.RoomBgm = RoomBgm;
let AddRoomBgmOp = class AddRoomBgmOp {
    constructor({ channelKey, roomOp, }) {
        this.id = uuid_1.v4();
        this.channelKey = channelKey;
        this.roomOp = core_1.Reference.create(roomOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], AddRoomBgmOp.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], AddRoomBgmOp.prototype, "channelKey", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.RoomOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], AddRoomBgmOp.prototype, "roomOp", void 0);
AddRoomBgmOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['roomOp', 'channelKey'] }),
    __metadata("design:paramtypes", [Object])
], AddRoomBgmOp);
exports.AddRoomBgmOp = AddRoomBgmOp;
let RemoveRoomBgmOp = class RemoveRoomBgmOp extends RoomBgmBase {
    constructor(params) {
        super(params);
        this.roomOp = core_1.Reference.create(params.roomOp);
    }
};
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.RoomOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], RemoveRoomBgmOp.prototype, "roomOp", void 0);
RemoveRoomBgmOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['roomOp', 'channelKey'] }),
    __metadata("design:paramtypes", [Object])
], RemoveRoomBgmOp);
exports.RemoveRoomBgmOp = RemoveRoomBgmOp;
let UpdateRoomBgmOp = class UpdateRoomBgmOp {
    constructor({ channelKey, roomOp, }) {
        this.id = uuid_1.v4();
        this.channelKey = channelKey;
        this.roomOp = core_1.Reference.create(roomOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], UpdateRoomBgmOp.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], UpdateRoomBgmOp.prototype, "channelKey", void 0);
__decorate([
    core_1.Property({ type: core_1.JsonType, nullable: true }),
    __metadata("design:type", Array)
], UpdateRoomBgmOp.prototype, "files", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateRoomBgmOp.prototype, "volume", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.RoomOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], UpdateRoomBgmOp.prototype, "roomOp", void 0);
UpdateRoomBgmOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['roomOp', 'channelKey'] }),
    __metadata("design:paramtypes", [Object])
], UpdateRoomBgmOp);
exports.UpdateRoomBgmOp = UpdateRoomBgmOp;
