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
exports.User = void 0;
const core_1 = require("@mikro-orm/core");
const BaasType_1 = require("../../../enums/BaasType");
const mikro_orm_1 = require("../file/mikro-orm");
const mikro_orm_2 = require("../participant/mikro-orm");
const mikro_orm_3 = require("../roomMessage/mikro-orm");
let User = class User {
    constructor({ userUid, baasType }) {
        this.isEntry = false;
        this.participants = new core_1.Collection(this);
        this.files = new core_1.Collection(this);
        this.roomPubMsgs = new core_1.Collection(this);
        this.roomPrvMsgs = new core_1.Collection(this);
        this.roomSEs = new core_1.Collection(this);
        this.visibleRoomPrvMsgs = new core_1.Collection(this);
        this.userUid = userUid;
        this.baasType = baasType;
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], User.prototype, "userUid", void 0);
__decorate([
    core_1.Enum({ items: () => BaasType_1.BaasType, index: true }),
    __metadata("design:type", String)
], User.prototype, "baasType", void 0);
__decorate([
    core_1.Property({ index: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isEntry", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_2.Participant, x => x.user, { orphanRemoval: true }),
    __metadata("design:type", Object)
], User.prototype, "participants", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_1.File, x => x.createdBy, { orphanRemoval: true }),
    __metadata("design:type", Object)
], User.prototype, "files", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_3.RoomPubMsg, x => x.createdBy, { orphanRemoval: true }),
    __metadata("design:type", Object)
], User.prototype, "roomPubMsgs", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_3.RoomPrvMsg, x => x.createdBy, { orphanRemoval: true }),
    __metadata("design:type", Object)
], User.prototype, "roomPrvMsgs", void 0);
__decorate([
    core_1.OneToMany(() => mikro_orm_3.RoomPrvMsg, x => x.createdBy, { orphanRemoval: true }),
    __metadata("design:type", Object)
], User.prototype, "roomSEs", void 0);
__decorate([
    core_1.ManyToMany(() => mikro_orm_3.RoomPrvMsg, x => x.visibleTo, { owner: true }),
    __metadata("design:type", Object)
], User.prototype, "visibleRoomPrvMsgs", void 0);
User = __decorate([
    core_1.Entity(),
    __metadata("design:paramtypes", [Object])
], User);
exports.User = User;
