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
exports.getSingletonEntity = exports.Singleton = void 0;
const core_1 = require("@mikro-orm/core");
let Singleton = class Singleton {
    constructor() {
        this.id = '';
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], Singleton.prototype, "id", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], Singleton.prototype, "entryPasswordHash", void 0);
Singleton = __decorate([
    core_1.Entity()
], Singleton);
exports.Singleton = Singleton;
const getSingletonEntity = async (em) => {
    const entity = await em.findOne(Singleton, { id: '' });
    if (entity != null) {
        return entity;
    }
    const newEntity = new Singleton();
    await em.persistAndFlush(newEntity);
    return newEntity;
};
exports.getSingletonEntity = getSingletonEntity;
