'use strict';

var tslib = require('tslib');
var FilePathModule = require('@flocon-trpg/core');
var typeGraphql = require('type-graphql');
var DeleteMessageFailureType = require('../../enums/DeleteMessageFailureType.js');
var EditMessageFailureType = require('../../enums/EditMessageFailureType.js');
var GetRoomLogFailureType = require('../../enums/GetRoomLogFailureType.js');
var GetRoomMessagesFailureType = require('../../enums/GetRoomMessagesFailureType.js');
var MakeMessageNotSecretFailureType = require('../../enums/MakeMessageNotSecretFailureType.js');
var PieceLogType$1 = require('../../enums/PieceLogType.js');
var ResetRoomMessagesFailureType = require('../../enums/ResetRoomMessagesFailureType.js');
var WriteRoomPrivateMessageFailureType = require('../../enums/WriteRoomPrivateMessageFailureType.js');
var WriteRoomPublicMessageFailureType = require('../../enums/WriteRoomPublicMessageFailureType.js');
var WriteRoomSoundEffectFailureType = require('../../enums/WriteRoomSoundEffectFailureType.js');
var filePath = require('./filePath.js');

exports.CommandResult = class CommandResult {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], exports.CommandResult.prototype, "text", void 0);
tslib.__decorate([
    typeGraphql.Field({
        nullable: true,
        description: '成功判定のないコマンドの場合はnullish。成功判定のあるコマンドの場合はその結果。',
    }),
    tslib.__metadata("design:type", Boolean)
], exports.CommandResult.prototype, "isSuccess", void 0);
exports.CommandResult = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.CommandResult);
const RoomPublicChannelType = 'RoomPublicChannel';
exports.RoomPublicChannel = class RoomPublicChannel {
};
tslib.__decorate([
    typeGraphql.Field({
        description: `現在の仕様では、${FilePathModule.$system}, ${FilePathModule.$free}, '1', … , '10' の12個のみをサポートしている。このうち、${FilePathModule.$system}はシステムメッセージ専用チャンネルであるため誰も書き込むことができない。'1', …, '10'はSpectatorが書き込むことはできないが、${FilePathModule.$free}はSpectatorも書き込むことができる。`,
    }),
    tslib.__metadata("design:type", String)
], exports.RoomPublicChannel.prototype, "key", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPublicChannel.prototype, "name", void 0);
exports.RoomPublicChannel = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.RoomPublicChannel);
exports.CharacterValueForMessage = class CharacterValueForMessage {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], exports.CharacterValueForMessage.prototype, "stateId", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Boolean)
], exports.CharacterValueForMessage.prototype, "isPrivate", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], exports.CharacterValueForMessage.prototype, "name", void 0);
tslib.__decorate([
    typeGraphql.Field(() => filePath.FilePath, { nullable: true }),
    tslib.__metadata("design:type", filePath.FilePath)
], exports.CharacterValueForMessage.prototype, "image", void 0);
tslib.__decorate([
    typeGraphql.Field(() => filePath.FilePath, { nullable: true }),
    tslib.__metadata("design:type", filePath.FilePath)
], exports.CharacterValueForMessage.prototype, "portraitImage", void 0);
exports.CharacterValueForMessage = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.CharacterValueForMessage);
exports.UpdatedText = class UpdatedText {
};
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.UpdatedText.prototype, "currentText", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Number)
], exports.UpdatedText.prototype, "updatedAt", void 0);
exports.UpdatedText = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.UpdatedText);
const RoomPublicMessageType = 'RoomPublicMessage';
exports.RoomPublicMessage = class RoomPublicMessage {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], exports.RoomPublicMessage.prototype, "messageId", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], exports.RoomPublicMessage.prototype, "channelKey", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPublicMessage.prototype, "initText", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPublicMessage.prototype, "initTextSource", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", exports.UpdatedText)
], exports.RoomPublicMessage.prototype, "updatedText", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPublicMessage.prototype, "textColor", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", exports.CommandResult)
], exports.RoomPublicMessage.prototype, "commandResult", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPublicMessage.prototype, "altTextToSecret", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Boolean)
], exports.RoomPublicMessage.prototype, "isSecret", void 0);
tslib.__decorate([
    typeGraphql.Field({
        nullable: true,
        description: `channelKeyが${FilePathModule.$system}以外のときは、システムメッセージならばnullishで、そうでないならばnullishではない。${FilePathModule.$system}のとき、原則として全てシステムメッセージであるため常にnullishになる。`,
    }),
    tslib.__metadata("design:type", String)
], exports.RoomPublicMessage.prototype, "createdBy", void 0);
tslib.__decorate([
    typeGraphql.Field({
        nullable: true,
        description: '発言がCharacterと紐付いているときはnon-nullish。PLとしての発言、もしくはcreatedByがnullishのときはnullish。',
    }),
    tslib.__metadata("design:type", exports.CharacterValueForMessage)
], exports.RoomPublicMessage.prototype, "character", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPublicMessage.prototype, "customName", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Number)
], exports.RoomPublicMessage.prototype, "createdAt", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", Number)
], exports.RoomPublicMessage.prototype, "updatedAt", void 0);
exports.RoomPublicMessage = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.RoomPublicMessage);
const RoomPrivateMessageType = 'RoomPrivateMessage';
exports.RoomPrivateMessage = class RoomPrivateMessage {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], exports.RoomPrivateMessage.prototype, "messageId", void 0);
tslib.__decorate([
    typeGraphql.Field(() => [String]),
    tslib.__metadata("design:type", Array)
], exports.RoomPrivateMessage.prototype, "visibleTo", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPrivateMessage.prototype, "initText", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPrivateMessage.prototype, "initTextSource", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", exports.UpdatedText)
], exports.RoomPrivateMessage.prototype, "updatedText", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPrivateMessage.prototype, "textColor", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", exports.CommandResult)
], exports.RoomPrivateMessage.prototype, "commandResult", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPrivateMessage.prototype, "altTextToSecret", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Boolean)
], exports.RoomPrivateMessage.prototype, "isSecret", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPrivateMessage.prototype, "createdBy", void 0);
tslib.__decorate([
    typeGraphql.Field({
        nullable: true,
        description: '発言がCharacterと紐付いているときはnon-nullish。PLとしての発言、もしくはcreatedByがnullishのときはnullish。後からCharacterの値が更新されても、この値が更新されることはない。',
    }),
    tslib.__metadata("design:type", exports.CharacterValueForMessage)
], exports.RoomPrivateMessage.prototype, "character", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPrivateMessage.prototype, "customName", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Number)
], exports.RoomPrivateMessage.prototype, "createdAt", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", Number)
], exports.RoomPrivateMessage.prototype, "updatedAt", void 0);
exports.RoomPrivateMessage = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.RoomPrivateMessage);
const PieceLogType = 'PieceLog';
exports.PieceLog = class PieceLog {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], exports.PieceLog.prototype, "messageId", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], exports.PieceLog.prototype, "stateId", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Number)
], exports.PieceLog.prototype, "createdAt", void 0);
tslib.__decorate([
    typeGraphql.Field(() => PieceLogType$1.PieceLogType),
    tslib.__metadata("design:type", String)
], exports.PieceLog.prototype, "logType", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], exports.PieceLog.prototype, "valueJson", void 0);
exports.PieceLog = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.PieceLog);
const RoomSoundEffectType = 'RoomSoundEffect';
exports.RoomSoundEffect = class RoomSoundEffect {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], exports.RoomSoundEffect.prototype, "messageId", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", filePath.FilePath)
], exports.RoomSoundEffect.prototype, "file", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomSoundEffect.prototype, "createdBy", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Number)
], exports.RoomSoundEffect.prototype, "createdAt", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Number)
], exports.RoomSoundEffect.prototype, "volume", void 0);
exports.RoomSoundEffect = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.RoomSoundEffect);
typeGraphql.createUnionType({
    name: 'RoomMessage',
    types: () => [
        exports.RoomPublicMessage,
        exports.RoomPrivateMessage,
        exports.PieceLog,
        exports.RoomPublicChannel,
        exports.RoomSoundEffect,
    ],
    resolveType: value => {
        switch (value.__tstype) {
            case RoomPrivateMessageType:
                return exports.RoomPrivateMessage;
            case RoomPublicChannelType:
                return exports.RoomPublicMessage;
            case PieceLogType:
                return exports.PieceLog;
            case RoomPublicMessageType:
                return exports.RoomPublicChannel;
            case RoomSoundEffectType:
                return exports.RoomSoundEffect;
        }
    },
});
const RoomMessagesType = 'RoomMessages';
exports.RoomMessages = class RoomMessages {
};
tslib.__decorate([
    typeGraphql.Field(() => [exports.RoomPublicMessage]),
    tslib.__metadata("design:type", Array)
], exports.RoomMessages.prototype, "publicMessages", void 0);
tslib.__decorate([
    typeGraphql.Field(() => [exports.RoomPrivateMessage]),
    tslib.__metadata("design:type", Array)
], exports.RoomMessages.prototype, "privateMessages", void 0);
tslib.__decorate([
    typeGraphql.Field(() => [exports.PieceLog]),
    tslib.__metadata("design:type", Array)
], exports.RoomMessages.prototype, "pieceLogs", void 0);
tslib.__decorate([
    typeGraphql.Field(() => [exports.RoomPublicChannel]),
    tslib.__metadata("design:type", Array)
], exports.RoomMessages.prototype, "publicChannels", void 0);
tslib.__decorate([
    typeGraphql.Field(() => [exports.RoomSoundEffect]),
    tslib.__metadata("design:type", Array)
], exports.RoomMessages.prototype, "soundEffects", void 0);
exports.RoomMessages = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.RoomMessages);
const GetRoomMessagesFailureResultType = 'GetRoomMessagesFailureResult';
exports.GetRoomMessagesFailureResult = class GetRoomMessagesFailureResult {
};
tslib.__decorate([
    typeGraphql.Field(() => GetRoomMessagesFailureType.GetRoomMessagesFailureType),
    tslib.__metadata("design:type", String)
], exports.GetRoomMessagesFailureResult.prototype, "failureType", void 0);
exports.GetRoomMessagesFailureResult = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.GetRoomMessagesFailureResult);
const GetRoomMessagesResult = typeGraphql.createUnionType({
    name: 'GetRoomMessagesResult',
    types: () => [exports.RoomMessages, exports.GetRoomMessagesFailureResult],
    resolveType: value => {
        switch (value.__tstype) {
            case RoomMessagesType:
                return exports.RoomMessages;
            case GetRoomMessagesFailureResultType:
                return exports.GetRoomMessagesFailureResult;
        }
    },
});
const GetRoomLogFailureResultType = 'GetRoomLogFailureResultType';
exports.GetRoomLogFailureResult = class GetRoomLogFailureResult {
};
tslib.__decorate([
    typeGraphql.Field(() => GetRoomLogFailureType.GetRoomLogFailureType),
    tslib.__metadata("design:type", String)
], exports.GetRoomLogFailureResult.prototype, "failureType", void 0);
exports.GetRoomLogFailureResult = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.GetRoomLogFailureResult);
const GetRoomLogResult = typeGraphql.createUnionType({
    name: 'GetRoomLogResult',
    types: () => [exports.RoomMessages, exports.GetRoomLogFailureResult],
    resolveType: value => {
        switch (value.__tstype) {
            case RoomMessagesType:
                return exports.RoomMessages;
            case GetRoomLogFailureResultType:
                return exports.GetRoomLogFailureResult;
        }
    },
});
const RoomMessageSyntaxErrorType = 'RoomMessageSyntaxError';
exports.RoomMessageSyntaxError = class RoomMessageSyntaxError {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], exports.RoomMessageSyntaxError.prototype, "errorMessage", void 0);
exports.RoomMessageSyntaxError = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.RoomMessageSyntaxError);
const WriteRoomPrivateMessageFailureResultType = 'WriteRoomPrivateMessageFailureResult';
exports.WriteRoomPrivateMessageFailureResult = class WriteRoomPrivateMessageFailureResult {
};
tslib.__decorate([
    typeGraphql.Field(() => WriteRoomPrivateMessageFailureType.WriteRoomPrivateMessageFailureType),
    tslib.__metadata("design:type", String)
], exports.WriteRoomPrivateMessageFailureResult.prototype, "failureType", void 0);
exports.WriteRoomPrivateMessageFailureResult = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.WriteRoomPrivateMessageFailureResult);
const WriteRoomPrivateMessageResult = typeGraphql.createUnionType({
    name: 'WriteRoomPrivateMessageResult',
    types: () => [exports.RoomPrivateMessage, exports.WriteRoomPrivateMessageFailureResult, exports.RoomMessageSyntaxError],
    resolveType: value => {
        switch (value.__tstype) {
            case RoomPrivateMessageType:
                return exports.RoomPrivateMessage;
            case WriteRoomPrivateMessageFailureResultType:
                return exports.WriteRoomPrivateMessageFailureResult;
            case RoomMessageSyntaxErrorType:
                return exports.RoomMessageSyntaxError;
        }
    },
});
const WriteRoomPublicMessageFailureResultType = 'WriteRoomPublicMessageFailureResult';
exports.WriteRoomPublicMessageFailureResult = class WriteRoomPublicMessageFailureResult {
};
tslib.__decorate([
    typeGraphql.Field(() => WriteRoomPublicMessageFailureType.WriteRoomPublicMessageFailureType),
    tslib.__metadata("design:type", String)
], exports.WriteRoomPublicMessageFailureResult.prototype, "failureType", void 0);
exports.WriteRoomPublicMessageFailureResult = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.WriteRoomPublicMessageFailureResult);
const WriteRoomPublicMessageResult = typeGraphql.createUnionType({
    name: 'WriteRoomPublicMessageResult',
    types: () => [exports.RoomPublicMessage, exports.WriteRoomPublicMessageFailureResult, exports.RoomMessageSyntaxError],
    resolveType: value => {
        switch (value.__tstype) {
            case RoomPublicMessageType:
                return exports.RoomPublicMessage;
            case WriteRoomPublicMessageFailureResultType:
                return exports.WriteRoomPublicMessageFailureResult;
            case RoomMessageSyntaxErrorType:
                return exports.RoomMessageSyntaxError;
        }
    },
});
const WriteRoomSoundEffectFailureResultType = 'WriteRoomSoundEffectFailureResult';
exports.WriteRoomSoundEffectFailureResult = class WriteRoomSoundEffectFailureResult {
};
tslib.__decorate([
    typeGraphql.Field(() => WriteRoomSoundEffectFailureType.WriteRoomSoundEffectFailureType),
    tslib.__metadata("design:type", String)
], exports.WriteRoomSoundEffectFailureResult.prototype, "failureType", void 0);
exports.WriteRoomSoundEffectFailureResult = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.WriteRoomSoundEffectFailureResult);
const WriteRoomSoundEffectResult = typeGraphql.createUnionType({
    name: 'WriteRoomSoundEffectResult',
    types: () => [exports.RoomSoundEffect, exports.WriteRoomSoundEffectFailureResult],
    resolveType: value => {
        switch (value.__tstype) {
            case RoomSoundEffectType:
                return exports.RoomSoundEffect;
            case WriteRoomSoundEffectFailureResultType:
                return exports.WriteRoomSoundEffectFailureResult;
        }
    },
});
exports.MakeMessageNotSecretResult = class MakeMessageNotSecretResult {
};
tslib.__decorate([
    typeGraphql.Field(() => MakeMessageNotSecretFailureType.MakeMessageNotSecretFailureType, { nullable: true }),
    tslib.__metadata("design:type", String)
], exports.MakeMessageNotSecretResult.prototype, "failureType", void 0);
exports.MakeMessageNotSecretResult = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.MakeMessageNotSecretResult);
exports.DeleteMessageResult = class DeleteMessageResult {
};
tslib.__decorate([
    typeGraphql.Field(() => DeleteMessageFailureType.DeleteMessageFailureType, { nullable: true }),
    tslib.__metadata("design:type", String)
], exports.DeleteMessageResult.prototype, "failureType", void 0);
exports.DeleteMessageResult = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.DeleteMessageResult);
exports.EditMessageResult = class EditMessageResult {
};
tslib.__decorate([
    typeGraphql.Field(() => EditMessageFailureType.EditMessageFailureType, { nullable: true }),
    tslib.__metadata("design:type", String)
], exports.EditMessageResult.prototype, "failureType", void 0);
exports.EditMessageResult = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.EditMessageResult);
const ResetRoomMessagesResultType = 'ResetRoomMessagesResult';
exports.ResetRoomMessagesResult = class ResetRoomMessagesResult {
};
tslib.__decorate([
    typeGraphql.Field(() => ResetRoomMessagesFailureType.ResetRoomMessagesFailureType, { nullable: true }),
    tslib.__metadata("design:type", String)
], exports.ResetRoomMessagesResult.prototype, "failureType", void 0);
exports.ResetRoomMessagesResult = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.ResetRoomMessagesResult);
const RoomPublicChannelUpdateType = 'RoomPublicChannelUpdate';
exports.RoomPublicChannelUpdate = class RoomPublicChannelUpdate {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], exports.RoomPublicChannelUpdate.prototype, "key", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPublicChannelUpdate.prototype, "name", void 0);
exports.RoomPublicChannelUpdate = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.RoomPublicChannelUpdate);
const RoomPublicMessageUpdateType = 'RoomPublicMessageUpdate';
exports.RoomPublicMessageUpdate = class RoomPublicMessageUpdate {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], exports.RoomPublicMessageUpdate.prototype, "messageId", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPublicMessageUpdate.prototype, "initText", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPublicMessageUpdate.prototype, "initTextSource", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", exports.UpdatedText)
], exports.RoomPublicMessageUpdate.prototype, "updatedText", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", exports.CommandResult)
], exports.RoomPublicMessageUpdate.prototype, "commandResult", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPublicMessageUpdate.prototype, "altTextToSecret", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Boolean)
], exports.RoomPublicMessageUpdate.prototype, "isSecret", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", Number)
], exports.RoomPublicMessageUpdate.prototype, "updatedAt", void 0);
exports.RoomPublicMessageUpdate = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.RoomPublicMessageUpdate);
const RoomPrivateMessageUpdateType = 'RoomPrivateMessageUpdate';
exports.RoomPrivateMessageUpdate = class RoomPrivateMessageUpdate {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], exports.RoomPrivateMessageUpdate.prototype, "messageId", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPrivateMessageUpdate.prototype, "initText", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPrivateMessageUpdate.prototype, "initTextSource", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", exports.UpdatedText)
], exports.RoomPrivateMessageUpdate.prototype, "updatedText", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", exports.CommandResult)
], exports.RoomPrivateMessageUpdate.prototype, "commandResult", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.RoomPrivateMessageUpdate.prototype, "altTextToSecret", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Boolean)
], exports.RoomPrivateMessageUpdate.prototype, "isSecret", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", Number)
], exports.RoomPrivateMessageUpdate.prototype, "updatedAt", void 0);
exports.RoomPrivateMessageUpdate = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.RoomPrivateMessageUpdate);
const RoomMessagesResetType = 'RoomMessagesReset';
exports.RoomMessagesReset = class RoomMessagesReset {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Boolean)
], exports.RoomMessagesReset.prototype, "publicMessagesDeleted", void 0);
exports.RoomMessagesReset = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.RoomMessagesReset);
const RoomMessageEvent = typeGraphql.createUnionType({
    name: 'RoomMessageEvent',
    types: () => [
        exports.RoomPublicMessage,
        exports.RoomPrivateMessage,
        exports.RoomPublicChannel,
        exports.PieceLog,
        exports.RoomSoundEffect,
        exports.RoomPublicChannelUpdate,
        exports.RoomPublicMessageUpdate,
        exports.RoomPrivateMessageUpdate,
        exports.RoomMessagesReset,
    ],
    resolveType: value => {
        switch (value.__tstype) {
            case RoomPublicMessageType:
                return exports.RoomPublicMessage;
            case RoomPrivateMessageType:
                return exports.RoomPrivateMessage;
            case RoomPublicChannelType:
                return exports.RoomPublicChannel;
            case PieceLogType:
                return exports.PieceLog;
            case RoomSoundEffectType:
                return exports.RoomSoundEffect;
            case RoomPublicChannelUpdateType:
                return exports.RoomPublicChannelUpdate;
            case RoomPublicMessageUpdateType:
                return exports.RoomPublicMessageUpdate;
            case RoomPrivateMessageUpdateType:
                return exports.RoomPrivateMessageUpdate;
            case RoomMessagesResetType:
                return exports.RoomMessagesReset;
        }
    },
});

exports.GetRoomLogFailureResultType = GetRoomLogFailureResultType;
exports.GetRoomLogResult = GetRoomLogResult;
exports.GetRoomMessagesFailureResultType = GetRoomMessagesFailureResultType;
exports.GetRoomMessagesResult = GetRoomMessagesResult;
exports.PieceLogType = PieceLogType;
exports.ResetRoomMessagesResultType = ResetRoomMessagesResultType;
exports.RoomMessageEvent = RoomMessageEvent;
exports.RoomMessageSyntaxErrorType = RoomMessageSyntaxErrorType;
exports.RoomMessagesResetType = RoomMessagesResetType;
exports.RoomMessagesType = RoomMessagesType;
exports.RoomPrivateMessageType = RoomPrivateMessageType;
exports.RoomPrivateMessageUpdateType = RoomPrivateMessageUpdateType;
exports.RoomPublicChannelType = RoomPublicChannelType;
exports.RoomPublicChannelUpdateType = RoomPublicChannelUpdateType;
exports.RoomPublicMessageType = RoomPublicMessageType;
exports.RoomPublicMessageUpdateType = RoomPublicMessageUpdateType;
exports.RoomSoundEffectType = RoomSoundEffectType;
exports.WriteRoomPrivateMessageFailureResultType = WriteRoomPrivateMessageFailureResultType;
exports.WriteRoomPrivateMessageResult = WriteRoomPrivateMessageResult;
exports.WriteRoomPublicMessageFailureResultType = WriteRoomPublicMessageFailureResultType;
exports.WriteRoomPublicMessageResult = WriteRoomPublicMessageResult;
exports.WriteRoomSoundEffectFailureResultType = WriteRoomSoundEffectFailureResultType;
exports.WriteRoomSoundEffectResult = WriteRoomSoundEffectResult;
//# sourceMappingURL=roomMessage.js.map
