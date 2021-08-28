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
exports.Participant = void 0;
const core_1 = require("@mikro-orm/core");
const uuid_1 = require("uuid");
const ParticipantRoleType_1 = require("../../../enums/ParticipantRoleType");
const mikro_orm_1 = require("../room/mikro-orm");
const mikro_orm_2 = require("../user/mikro-orm");
let Participant = class Participant {
    constructor() {
        this.id = uuid_1.v4();
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], Participant.prototype, "id", void 0);
__decorate([
    core_1.Enum({ items: () => ParticipantRoleType_1.ParticipantRoleType, index: true, nullable: true }),
    __metadata("design:type", String)
], Participant.prototype, "role", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], Participant.prototype, "name", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.Room),
    __metadata("design:type", Object)
], Participant.prototype, "room", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_2.User),
    __metadata("design:type", Object)
], Participant.prototype, "user", void 0);
Participant = __decorate([
    core_1.Entity()
], Participant);
exports.Participant = Participant;
