'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var ParticipantRoleType = require('../../enums/ParticipantRoleType.js');

exports.RoomGetState = class RoomGetState {
};
tslib.__decorate([
    typeGraphql.Field({
        description: 'Current revision of Room. Whenever Room is updated, this value is incremented by 1. This value is required when you apply RoomOperation. / Roomの現在のリビジョン。Roomが更新されるたび、この値は1増加する。RoomOperationを適用する際に必要となる。',
    }),
    tslib.__metadata("design:type", Number)
], exports.RoomGetState.prototype, "revision", void 0);
tslib.__decorate([
    typeGraphql.Field({ description: 'この部屋の作成者。Firebase AuthenticationのUserUidで表現される。' }),
    tslib.__metadata("design:type", String)
], exports.RoomGetState.prototype, "createdBy", void 0);
tslib.__decorate([
    typeGraphql.Field({ description: 'since v0.7.2', nullable: true }),
    tslib.__metadata("design:type", Number)
], exports.RoomGetState.prototype, "createdAt", void 0);
tslib.__decorate([
    typeGraphql.Field({
        description: `データベースのRoomエンティティが最後に更新された日時。Roomエンティティのみが対象であるため、例えばメッセージの投稿などは反映されないことに注意。
since v0.7.2`,
        nullable: true,
    }),
    tslib.__metadata("design:type", Number)
], exports.RoomGetState.prototype, "updatedAt", void 0);
tslib.__decorate([
    typeGraphql.Field({ description: 'room.state をJSON化したもの' }),
    tslib.__metadata("design:type", String)
], exports.RoomGetState.prototype, "stateJson", void 0);
tslib.__decorate([
    typeGraphql.Field({ description: 'since v0.7.2' }),
    tslib.__metadata("design:type", Boolean)
], exports.RoomGetState.prototype, "isBookmarked", void 0);
tslib.__decorate([
    typeGraphql.Field(() => ParticipantRoleType.ParticipantRoleType, { description: 'since v0.7.2', nullable: true }),
    tslib.__metadata("design:type", Object)
], exports.RoomGetState.prototype, "role", void 0);
exports.RoomGetState = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.RoomGetState);
let OperatedBy = class OperatedBy {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], OperatedBy.prototype, "userUid", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], OperatedBy.prototype, "clientId", void 0);
OperatedBy = tslib.__decorate([
    typeGraphql.ObjectType()
], OperatedBy);
exports.RoomOperation = class RoomOperation {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Number)
], exports.RoomOperation.prototype, "revisionTo", void 0);
tslib.__decorate([
    typeGraphql.Field(() => OperatedBy, {
        nullable: true,
        description: 'operateRoomを呼んだ人物。promoteなどの結果の場合はnullishになる。',
    }),
    tslib.__metadata("design:type", OperatedBy)
], exports.RoomOperation.prototype, "operatedBy", void 0);
tslib.__decorate([
    typeGraphql.Field({ description: 'room.upOperationをJSONにしたもの。idならばnullish。' }),
    tslib.__metadata("design:type", String)
], exports.RoomOperation.prototype, "valueJson", void 0);
exports.RoomOperation = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.RoomOperation);
exports.RoomAsListItem = class RoomAsListItem {
};
tslib.__decorate([
    typeGraphql.Field(() => typeGraphql.ID),
    tslib.__metadata("design:type", String)
], exports.RoomAsListItem.prototype, "id", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], exports.RoomAsListItem.prototype, "name", void 0);
tslib.__decorate([
    typeGraphql.Field({ description: 'since v0.7.2', nullable: true }),
    tslib.__metadata("design:type", Number)
], exports.RoomAsListItem.prototype, "createdAt", void 0);
tslib.__decorate([
    typeGraphql.Field({
        description: `データベースのRoomエンティティが最後に更新された日時。Roomエンティティのみが対象であるため、例えばメッセージの投稿などは反映されないことに注意。
since v0.7.2`,
        nullable: true,
    }),
    tslib.__metadata("design:type", Number)
], exports.RoomAsListItem.prototype, "updatedAt", void 0);
tslib.__decorate([
    typeGraphql.Field({ description: 'この部屋の作成者。Firebase AuthenticationのUserUidで表現される。' }),
    tslib.__metadata("design:type", String)
], exports.RoomAsListItem.prototype, "createdBy", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Boolean)
], exports.RoomAsListItem.prototype, "requiresPlayerPassword", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Boolean)
], exports.RoomAsListItem.prototype, "requiresSpectatorPassword", void 0);
tslib.__decorate([
    typeGraphql.Field({ description: 'since v0.7.2' }),
    tslib.__metadata("design:type", Boolean)
], exports.RoomAsListItem.prototype, "isBookmarked", void 0);
tslib.__decorate([
    typeGraphql.Field(() => ParticipantRoleType.ParticipantRoleType, { description: 'since v0.7.2', nullable: true }),
    tslib.__metadata("design:type", Object)
], exports.RoomAsListItem.prototype, "role", void 0);
exports.RoomAsListItem = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.RoomAsListItem);
//# sourceMappingURL=room.js.map
