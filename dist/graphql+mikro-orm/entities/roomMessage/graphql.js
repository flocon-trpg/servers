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
exports.RoomMessageEvent = exports.RoomPrivateMessageUpdate = exports.RoomPrivateMessageUpdateType = exports.RoomPublicMessageUpdate = exports.RoomPublicMessageUpdateType = exports.RoomPublicChannelUpdate = exports.RoomPublicChannelUpdateType = exports.EditMessageResult = exports.DeleteMessageResult = exports.MakeMessageNotSecretResult = exports.WriteRoomSoundEffectResult = exports.WriteRoomSoundEffectFailureResult = exports.WriteRoomSoundEffectFailureResultType = exports.WritePublicRoomMessageResult = exports.WritePublicRoomMessageFailureResult = exports.WritePublicRoomMessageFailureResultType = exports.WritePrivateRoomMessageResult = exports.WritePrivateRoomMessageFailureResult = exports.WritePrivateRoomMessageFailureResultType = exports.GetRoomLogResult = exports.GetRoomLogFailureResult = exports.GetRoomLogFailureResultType = exports.GetRoomMessagesResult = exports.GetRoomMessagesFailureResult = exports.GetRoomMessagesFailureResultType = exports.RoomMessages = exports.RoomMessagesType = exports.RoomMessage = exports.RoomSoundEffect = exports.RoomSoundEffectType = exports.MyValueLog = exports.MyValueLogType = exports.BoardId = exports.RoomPrivateMessage = exports.RoomPrivateMessageType = exports.RoomPublicMessage = exports.RoomPublicMessageType = exports.CharacterValueForMessage = exports.RoomPublicChannel = exports.RoomPublicChannelType = exports.CommandResult = void 0;
const type_graphql_1 = require("type-graphql");
const Constants_1 = require("../../../@shared/Constants");
const DeleteMessageFailureType_1 = require("../../../enums/DeleteMessageFailureType");
const EditMessageFailureType_1 = require("../../../enums/EditMessageFailureType");
const GetRoomLogFailureType_1 = require("../../../enums/GetRoomLogFailureType");
const GetRoomMessagesFailureType_1 = require("../../../enums/GetRoomMessagesFailureType");
const MakeMessageNotSecretFailureType_1 = require("../../../enums/MakeMessageNotSecretFailureType");
const WritePrivateRoomMessageFailureType_1 = require("../../../enums/WritePrivateRoomMessageFailureType");
const WritePublicRoomMessageFailureType_1 = require("../../../enums/WritePublicRoomMessageFailureType");
const WriteRoomSoundEffectFailureType_1 = require("../../../enums/WriteRoomSoundEffectFailureType");
const graphql_1 = require("../filePath/graphql");
const MyValueLogType_1 = require("../../../enums/MyValueLogType");
let CommandResult = class CommandResult {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CommandResult.prototype, "text", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true, description: '成功判定のないコマンドの場合はnullish。成功判定のあるコマンドの場合はその結果。' }),
    __metadata("design:type", Boolean)
], CommandResult.prototype, "isSuccess", void 0);
CommandResult = __decorate([
    type_graphql_1.ObjectType()
], CommandResult);
exports.CommandResult = CommandResult;
exports.RoomPublicChannelType = 'RoomPublicChannel';
let RoomPublicChannel = class RoomPublicChannel {
};
__decorate([
    type_graphql_1.Field({ description: `現在の仕様では、${Constants_1.$system}, ${Constants_1.$free}, '1', … , '10' の12個のみをサポートしている。このうち、${Constants_1.$system}はシステムメッセージ専用チャンネルであるため誰も書き込むことができない。'1', …, '10'はSpectatorが書き込むことはできないが、${Constants_1.$free}はSpectatorも書き込むことができる。` }),
    __metadata("design:type", String)
], RoomPublicChannel.prototype, "key", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], RoomPublicChannel.prototype, "name", void 0);
RoomPublicChannel = __decorate([
    type_graphql_1.ObjectType()
], RoomPublicChannel);
exports.RoomPublicChannel = RoomPublicChannel;
let CharacterValueForMessage = class CharacterValueForMessage {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CharacterValueForMessage.prototype, "stateId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], CharacterValueForMessage.prototype, "isPrivate", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CharacterValueForMessage.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(() => graphql_1.FilePath, { nullable: true }),
    __metadata("design:type", graphql_1.FilePath)
], CharacterValueForMessage.prototype, "image", void 0);
__decorate([
    type_graphql_1.Field(() => graphql_1.FilePath, { nullable: true }),
    __metadata("design:type", graphql_1.FilePath)
], CharacterValueForMessage.prototype, "tachieImage", void 0);
CharacterValueForMessage = __decorate([
    type_graphql_1.ObjectType()
], CharacterValueForMessage);
exports.CharacterValueForMessage = CharacterValueForMessage;
exports.RoomPublicMessageType = 'RoomPublicMessage';
let RoomPublicMessage = class RoomPublicMessage {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomPublicMessage.prototype, "messageId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomPublicMessage.prototype, "channelKey", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], RoomPublicMessage.prototype, "text", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], RoomPublicMessage.prototype, "textColor", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", CommandResult)
], RoomPublicMessage.prototype, "commandResult", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], RoomPublicMessage.prototype, "altTextToSecret", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], RoomPublicMessage.prototype, "isSecret", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true, description: `channelKeyが${Constants_1.$system}以外のときは、システムメッセージならばnullishで、そうでないならばnullishではない。${Constants_1.$system}のとき、原則として全てシステムメッセージであるため常にnullishになる。` }),
    __metadata("design:type", String)
], RoomPublicMessage.prototype, "createdBy", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true, description: '発言がCharacterと紐付いているときはnon-nullish。PLとしての発言、もしくはcreatedByがnullishのときはnullish。' }),
    __metadata("design:type", CharacterValueForMessage)
], RoomPublicMessage.prototype, "character", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], RoomPublicMessage.prototype, "customName", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], RoomPublicMessage.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Number)
], RoomPublicMessage.prototype, "updatedAt", void 0);
RoomPublicMessage = __decorate([
    type_graphql_1.ObjectType()
], RoomPublicMessage);
exports.RoomPublicMessage = RoomPublicMessage;
exports.RoomPrivateMessageType = 'RoomPrivateMessage';
let RoomPrivateMessage = class RoomPrivateMessage {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomPrivateMessage.prototype, "messageId", void 0);
__decorate([
    type_graphql_1.Field(() => [String]),
    __metadata("design:type", Array)
], RoomPrivateMessage.prototype, "visibleTo", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], RoomPrivateMessage.prototype, "text", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], RoomPrivateMessage.prototype, "textColor", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", CommandResult)
], RoomPrivateMessage.prototype, "commandResult", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], RoomPrivateMessage.prototype, "altTextToSecret", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], RoomPrivateMessage.prototype, "isSecret", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], RoomPrivateMessage.prototype, "createdBy", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true, description: '発言がCharacterと紐付いているときはnon-nullish。PLとしての発言、もしくはcreatedByがnullishのときはnullish。後からCharacterの値が更新されても、この値が更新されることはない。' }),
    __metadata("design:type", CharacterValueForMessage)
], RoomPrivateMessage.prototype, "character", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], RoomPrivateMessage.prototype, "customName", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], RoomPrivateMessage.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Number)
], RoomPrivateMessage.prototype, "updatedAt", void 0);
RoomPrivateMessage = __decorate([
    type_graphql_1.ObjectType()
], RoomPrivateMessage);
exports.RoomPrivateMessage = RoomPrivateMessage;
let BoardId = class BoardId {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], BoardId.prototype, "createdBy", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], BoardId.prototype, "stateId", void 0);
BoardId = __decorate([
    type_graphql_1.ObjectType()
], BoardId);
exports.BoardId = BoardId;
exports.MyValueLogType = 'MyValueLog';
let MyValueLog = class MyValueLog {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], MyValueLog.prototype, "messageId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], MyValueLog.prototype, "stateUserUid", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], MyValueLog.prototype, "stateId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], MyValueLog.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field(() => MyValueLogType_1.MyValueLogType),
    __metadata("design:type", String)
], MyValueLog.prototype, "myValueType", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], MyValueLog.prototype, "valueChanged", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], MyValueLog.prototype, "isValuePrivateChanged", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Boolean)
], MyValueLog.prototype, "replaceType", void 0);
__decorate([
    type_graphql_1.Field(() => [BoardId]),
    __metadata("design:type", Array)
], MyValueLog.prototype, "createdPieces", void 0);
__decorate([
    type_graphql_1.Field(() => [BoardId]),
    __metadata("design:type", Array)
], MyValueLog.prototype, "deletedPieces", void 0);
__decorate([
    type_graphql_1.Field(() => [BoardId]),
    __metadata("design:type", Array)
], MyValueLog.prototype, "movedPieces", void 0);
__decorate([
    type_graphql_1.Field(() => [BoardId]),
    __metadata("design:type", Array)
], MyValueLog.prototype, "resizedPieces", void 0);
MyValueLog = __decorate([
    type_graphql_1.ObjectType()
], MyValueLog);
exports.MyValueLog = MyValueLog;
exports.RoomSoundEffectType = 'RoomSoundEffect';
let RoomSoundEffect = class RoomSoundEffect {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomSoundEffect.prototype, "messageId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_1.FilePath)
], RoomSoundEffect.prototype, "file", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], RoomSoundEffect.prototype, "createdBy", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], RoomSoundEffect.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], RoomSoundEffect.prototype, "volume", void 0);
RoomSoundEffect = __decorate([
    type_graphql_1.ObjectType()
], RoomSoundEffect);
exports.RoomSoundEffect = RoomSoundEffect;
exports.RoomMessage = type_graphql_1.createUnionType({
    name: 'RoomMessage',
    types: () => [RoomPublicMessage, RoomPrivateMessage, MyValueLog, RoomPublicChannel, RoomSoundEffect],
    resolveType: value => {
        switch (value.__tstype) {
            case exports.RoomPrivateMessageType:
                return RoomPrivateMessage;
            case exports.RoomPublicChannelType:
                return RoomPublicMessage;
            case exports.MyValueLogType:
                return MyValueLog;
            case exports.RoomPublicMessageType:
                return RoomPublicChannel;
            case exports.RoomSoundEffectType:
                return RoomSoundEffect;
        }
    }
});
exports.RoomMessagesType = 'RoomMessages';
let RoomMessages = class RoomMessages {
};
__decorate([
    type_graphql_1.Field(() => [RoomPublicMessage]),
    __metadata("design:type", Array)
], RoomMessages.prototype, "publicMessages", void 0);
__decorate([
    type_graphql_1.Field(() => [RoomPrivateMessage]),
    __metadata("design:type", Array)
], RoomMessages.prototype, "privateMessages", void 0);
__decorate([
    type_graphql_1.Field(() => [MyValueLog]),
    __metadata("design:type", Array)
], RoomMessages.prototype, "myValueLogs", void 0);
__decorate([
    type_graphql_1.Field(() => [RoomPublicChannel]),
    __metadata("design:type", Array)
], RoomMessages.prototype, "publicChannels", void 0);
__decorate([
    type_graphql_1.Field(() => [RoomSoundEffect]),
    __metadata("design:type", Array)
], RoomMessages.prototype, "soundEffects", void 0);
RoomMessages = __decorate([
    type_graphql_1.ObjectType()
], RoomMessages);
exports.RoomMessages = RoomMessages;
exports.GetRoomMessagesFailureResultType = 'GetRoomMessagesFailureResult';
let GetRoomMessagesFailureResult = class GetRoomMessagesFailureResult {
};
__decorate([
    type_graphql_1.Field(() => GetRoomMessagesFailureType_1.GetRoomMessagesFailureType),
    __metadata("design:type", String)
], GetRoomMessagesFailureResult.prototype, "failureType", void 0);
GetRoomMessagesFailureResult = __decorate([
    type_graphql_1.ObjectType()
], GetRoomMessagesFailureResult);
exports.GetRoomMessagesFailureResult = GetRoomMessagesFailureResult;
exports.GetRoomMessagesResult = type_graphql_1.createUnionType({
    name: 'GetRoomMessagesResult',
    types: () => [RoomMessages, GetRoomMessagesFailureResult],
    resolveType: value => {
        switch (value.__tstype) {
            case exports.RoomMessagesType:
                return RoomMessages;
            case exports.GetRoomMessagesFailureResultType:
                return GetRoomMessagesFailureResult;
        }
    }
});
exports.GetRoomLogFailureResultType = 'GetRoomLogFailureResultType';
let GetRoomLogFailureResult = class GetRoomLogFailureResult {
};
__decorate([
    type_graphql_1.Field(() => GetRoomLogFailureType_1.GetRoomLogFailureType),
    __metadata("design:type", String)
], GetRoomLogFailureResult.prototype, "failureType", void 0);
GetRoomLogFailureResult = __decorate([
    type_graphql_1.ObjectType()
], GetRoomLogFailureResult);
exports.GetRoomLogFailureResult = GetRoomLogFailureResult;
exports.GetRoomLogResult = type_graphql_1.createUnionType({
    name: 'GetRoomLogResult',
    types: () => [RoomMessages, GetRoomLogFailureResult],
    resolveType: value => {
        switch (value.__tstype) {
            case exports.RoomMessagesType:
                return RoomMessages;
            case exports.GetRoomLogFailureResultType:
                return GetRoomLogFailureResult;
        }
    }
});
exports.WritePrivateRoomMessageFailureResultType = 'WritePrivateRoomMessageFailureResult';
let WritePrivateRoomMessageFailureResult = class WritePrivateRoomMessageFailureResult {
};
__decorate([
    type_graphql_1.Field(() => WritePrivateRoomMessageFailureType_1.WritePrivateRoomMessageFailureType),
    __metadata("design:type", String)
], WritePrivateRoomMessageFailureResult.prototype, "failureType", void 0);
WritePrivateRoomMessageFailureResult = __decorate([
    type_graphql_1.ObjectType()
], WritePrivateRoomMessageFailureResult);
exports.WritePrivateRoomMessageFailureResult = WritePrivateRoomMessageFailureResult;
exports.WritePrivateRoomMessageResult = type_graphql_1.createUnionType({
    name: 'WritePrivateRoomMessageResult',
    types: () => [RoomPrivateMessage, WritePrivateRoomMessageFailureResult],
    resolveType: value => {
        switch (value.__tstype) {
            case exports.RoomPrivateMessageType:
                return RoomPrivateMessage;
            case exports.WritePrivateRoomMessageFailureResultType:
                return WritePrivateRoomMessageFailureResult;
        }
    }
});
exports.WritePublicRoomMessageFailureResultType = 'WritePublicRoomMessageFailureResult';
let WritePublicRoomMessageFailureResult = class WritePublicRoomMessageFailureResult {
};
__decorate([
    type_graphql_1.Field(() => WritePublicRoomMessageFailureType_1.WritePublicRoomMessageFailureType),
    __metadata("design:type", String)
], WritePublicRoomMessageFailureResult.prototype, "failureType", void 0);
WritePublicRoomMessageFailureResult = __decorate([
    type_graphql_1.ObjectType()
], WritePublicRoomMessageFailureResult);
exports.WritePublicRoomMessageFailureResult = WritePublicRoomMessageFailureResult;
exports.WritePublicRoomMessageResult = type_graphql_1.createUnionType({
    name: 'WritePublicRoomMessageResult',
    types: () => [RoomPublicMessage, WritePublicRoomMessageFailureResult],
    resolveType: value => {
        switch (value.__tstype) {
            case exports.RoomPublicMessageType:
                return RoomPublicMessage;
            case exports.WritePublicRoomMessageFailureResultType:
                return WritePublicRoomMessageFailureResult;
        }
    }
});
exports.WriteRoomSoundEffectFailureResultType = 'WriteRoomSoundEffectFailureResult';
let WriteRoomSoundEffectFailureResult = class WriteRoomSoundEffectFailureResult {
};
__decorate([
    type_graphql_1.Field(() => WriteRoomSoundEffectFailureType_1.WriteRoomSoundEffectFailureType),
    __metadata("design:type", String)
], WriteRoomSoundEffectFailureResult.prototype, "failureType", void 0);
WriteRoomSoundEffectFailureResult = __decorate([
    type_graphql_1.ObjectType()
], WriteRoomSoundEffectFailureResult);
exports.WriteRoomSoundEffectFailureResult = WriteRoomSoundEffectFailureResult;
exports.WriteRoomSoundEffectResult = type_graphql_1.createUnionType({
    name: 'WriteRoomSoundEffectResult',
    types: () => [RoomSoundEffect, WriteRoomSoundEffectFailureResult],
    resolveType: value => {
        switch (value.__tstype) {
            case exports.RoomSoundEffectType:
                return RoomSoundEffect;
            case exports.WriteRoomSoundEffectFailureResultType:
                return WriteRoomSoundEffectFailureResult;
        }
    }
});
let MakeMessageNotSecretResult = class MakeMessageNotSecretResult {
};
__decorate([
    type_graphql_1.Field(() => MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType, { nullable: true }),
    __metadata("design:type", String)
], MakeMessageNotSecretResult.prototype, "failureType", void 0);
MakeMessageNotSecretResult = __decorate([
    type_graphql_1.ObjectType()
], MakeMessageNotSecretResult);
exports.MakeMessageNotSecretResult = MakeMessageNotSecretResult;
let DeleteMessageResult = class DeleteMessageResult {
};
__decorate([
    type_graphql_1.Field(() => DeleteMessageFailureType_1.DeleteMessageFailureType, { nullable: true }),
    __metadata("design:type", String)
], DeleteMessageResult.prototype, "failureType", void 0);
DeleteMessageResult = __decorate([
    type_graphql_1.ObjectType()
], DeleteMessageResult);
exports.DeleteMessageResult = DeleteMessageResult;
let EditMessageResult = class EditMessageResult {
};
__decorate([
    type_graphql_1.Field(() => EditMessageFailureType_1.EditMessageFailureType, { nullable: true }),
    __metadata("design:type", String)
], EditMessageResult.prototype, "failureType", void 0);
EditMessageResult = __decorate([
    type_graphql_1.ObjectType()
], EditMessageResult);
exports.EditMessageResult = EditMessageResult;
exports.RoomPublicChannelUpdateType = 'RoomPublicChannelUpdate';
let RoomPublicChannelUpdate = class RoomPublicChannelUpdate {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomPublicChannelUpdate.prototype, "key", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], RoomPublicChannelUpdate.prototype, "name", void 0);
RoomPublicChannelUpdate = __decorate([
    type_graphql_1.ObjectType()
], RoomPublicChannelUpdate);
exports.RoomPublicChannelUpdate = RoomPublicChannelUpdate;
exports.RoomPublicMessageUpdateType = 'RoomPublicMessageUpdate';
let RoomPublicMessageUpdate = class RoomPublicMessageUpdate {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomPublicMessageUpdate.prototype, "messageId", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], RoomPublicMessageUpdate.prototype, "text", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", CommandResult)
], RoomPublicMessageUpdate.prototype, "commandResult", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], RoomPublicMessageUpdate.prototype, "altTextToSecret", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], RoomPublicMessageUpdate.prototype, "isSecret", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Number)
], RoomPublicMessageUpdate.prototype, "updatedAt", void 0);
RoomPublicMessageUpdate = __decorate([
    type_graphql_1.ObjectType()
], RoomPublicMessageUpdate);
exports.RoomPublicMessageUpdate = RoomPublicMessageUpdate;
exports.RoomPrivateMessageUpdateType = 'RoomPrivateMessageUpdate';
let RoomPrivateMessageUpdate = class RoomPrivateMessageUpdate {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomPrivateMessageUpdate.prototype, "messageId", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], RoomPrivateMessageUpdate.prototype, "text", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", CommandResult)
], RoomPrivateMessageUpdate.prototype, "commandResult", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], RoomPrivateMessageUpdate.prototype, "altTextToSecret", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], RoomPrivateMessageUpdate.prototype, "isSecret", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Number)
], RoomPrivateMessageUpdate.prototype, "updatedAt", void 0);
RoomPrivateMessageUpdate = __decorate([
    type_graphql_1.ObjectType()
], RoomPrivateMessageUpdate);
exports.RoomPrivateMessageUpdate = RoomPrivateMessageUpdate;
exports.RoomMessageEvent = type_graphql_1.createUnionType({
    name: 'RoomMessageEvent',
    types: () => [RoomPublicMessage, RoomPrivateMessage, RoomPublicChannel, MyValueLog, RoomSoundEffect, RoomPublicChannelUpdate, RoomPublicMessageUpdate, RoomPrivateMessageUpdate],
    resolveType: value => {
        switch (value.__tstype) {
            case exports.RoomPrivateMessageType:
                return RoomPrivateMessage;
            case exports.RoomPublicChannelType:
                return RoomPublicChannel;
            case exports.MyValueLogType:
                return MyValueLog;
            case exports.RoomPublicMessageType:
                return RoomPublicMessage;
            case exports.RoomSoundEffectType:
                return RoomSoundEffect;
            case exports.RoomPublicChannelUpdateType:
                return RoomPublicChannelUpdate;
            case exports.RoomPublicMessageUpdateType:
                return RoomPublicMessageUpdate;
            case exports.RoomPrivateMessageUpdateType:
                return RoomPrivateMessageUpdate;
        }
    }
});
