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
exports.UpdateBoardOp = exports.RemoveBoardOp = exports.AddBoardOp = exports.Board = exports.BoardBase = void 0;
const core_1 = require("@mikro-orm/core");
const uuid_1 = require("uuid");
const FileSourceType_1 = require("../../../../enums/FileSourceType");
const mikro_orm_1 = require("../mikro-orm");
class BoardBase {
    constructor({ createdBy, stateId, name, cellWidth, cellHeight, cellRowCount, cellColumnCount, cellOffsetX, cellOffsetY, }) {
        this.id = uuid_1.v4();
        this.backgroundImageZoom = 1;
        this.createdBy = createdBy;
        this.stateId = stateId;
        this.name = name;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.cellRowCount = cellRowCount;
        this.cellColumnCount = cellColumnCount;
        this.cellOffsetX = cellOffsetX;
        this.cellOffsetY = cellOffsetY;
    }
}
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], BoardBase.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], BoardBase.prototype, "createdBy", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], BoardBase.prototype, "stateId", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", String)
], BoardBase.prototype, "name", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], BoardBase.prototype, "cellWidth", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], BoardBase.prototype, "cellHeight", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], BoardBase.prototype, "cellRowCount", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], BoardBase.prototype, "cellColumnCount", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], BoardBase.prototype, "cellOffsetX", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], BoardBase.prototype, "cellOffsetY", void 0);
__decorate([
    core_1.Property({ nullable: true, length: 65535 }),
    __metadata("design:type", String)
], BoardBase.prototype, "backgroundImagePath", void 0);
__decorate([
    core_1.Enum({ items: () => FileSourceType_1.FileSourceType, nullable: true }),
    __metadata("design:type", String)
], BoardBase.prototype, "backgroundImageSourceType", void 0);
__decorate([
    core_1.Property(),
    __metadata("design:type", Number)
], BoardBase.prototype, "backgroundImageZoom", void 0);
exports.BoardBase = BoardBase;
let Board = class Board extends BoardBase {
    constructor(params) {
        super(params);
        this.version = 1;
        this.room = core_1.Reference.create(params.room);
    }
};
__decorate([
    core_1.Property({ version: true }),
    __metadata("design:type", Number)
], Board.prototype, "version", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.Room, { wrappedReference: true }),
    __metadata("design:type", Object)
], Board.prototype, "room", void 0);
Board = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['createdBy', 'stateId'] }),
    __metadata("design:paramtypes", [Object])
], Board);
exports.Board = Board;
let AddBoardOp = class AddBoardOp {
    constructor({ createdBy, stateId, roomOp, }) {
        this.id = uuid_1.v4();
        this.createdBy = createdBy;
        this.stateId = stateId;
        this.roomOp = core_1.Reference.create(roomOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], AddBoardOp.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], AddBoardOp.prototype, "createdBy", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], AddBoardOp.prototype, "stateId", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.RoomOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], AddBoardOp.prototype, "roomOp", void 0);
AddBoardOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['roomOp', 'createdBy', 'stateId'], name: 'add_board_op_unique' }),
    __metadata("design:paramtypes", [Object])
], AddBoardOp);
exports.AddBoardOp = AddBoardOp;
let RemoveBoardOp = class RemoveBoardOp extends BoardBase {
    constructor(params) {
        super(params);
        this.roomOp = core_1.Reference.create(params.roomOp);
    }
};
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.RoomOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], RemoveBoardOp.prototype, "roomOp", void 0);
RemoveBoardOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['roomOp', 'createdBy', 'stateId'], name: 'remove_board_op_unique' }),
    __metadata("design:paramtypes", [Object])
], RemoveBoardOp);
exports.RemoveBoardOp = RemoveBoardOp;
let UpdateBoardOp = class UpdateBoardOp {
    constructor({ createdBy, stateId, roomOp, }) {
        this.id = uuid_1.v4();
        this.createdBy = createdBy;
        this.stateId = stateId;
        this.roomOp = core_1.Reference.create(roomOp);
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], UpdateBoardOp.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], UpdateBoardOp.prototype, "createdBy", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], UpdateBoardOp.prototype, "stateId", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], UpdateBoardOp.prototype, "name", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateBoardOp.prototype, "cellWidth", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateBoardOp.prototype, "cellHeight", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateBoardOp.prototype, "cellRowCount", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateBoardOp.prototype, "cellColumnCount", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateBoardOp.prototype, "cellOffsetX", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateBoardOp.prototype, "cellOffsetY", void 0);
__decorate([
    core_1.Property({ type: core_1.JsonType, nullable: true }),
    __metadata("design:type", Object)
], UpdateBoardOp.prototype, "backgroundImage", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Number)
], UpdateBoardOp.prototype, "backgroundImageZoom", void 0);
__decorate([
    core_1.ManyToOne(() => mikro_orm_1.RoomOp, { wrappedReference: true }),
    __metadata("design:type", Object)
], UpdateBoardOp.prototype, "roomOp", void 0);
UpdateBoardOp = __decorate([
    core_1.Entity(),
    core_1.Unique({ properties: ['roomOp', 'createdBy', 'stateId'], name: 'update_board_op_unique' }),
    __metadata("design:paramtypes", [Object])
], UpdateBoardOp);
exports.UpdateBoardOp = UpdateBoardOp;
