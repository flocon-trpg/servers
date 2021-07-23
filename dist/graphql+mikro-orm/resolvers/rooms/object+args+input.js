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
exports.RoomEvent = exports.WritingMessageStatus = exports.RoomConnectionEvent = exports.GetRoomConnectionsResult = exports.GetRoomConnectionsFailureResult = exports.GetRoomConnectionFailureResultType = exports.GetRoomConnectionsSuccessResult = exports.GetRoomConnectionSuccessResultType = exports.UpdateWritingMessageStateArgs = exports.GetLogArgs = exports.GetMessagesArgs = exports.EditMessageArgs = exports.MessageIdArgs = exports.WriteRoomSoundEffectArgs = exports.WritePrivateMessageArgs = exports.WritePublicMessageArgs = exports.GetRoomArgs = exports.OperateArgs = exports.ChangeParticipantNameArgs = exports.PromoteArgs = exports.JoinRoomArgs = exports.DeleteRoomArgs = exports.CreateRoomInput = void 0;
const class_validator_1 = require("class-validator");
const type_graphql_1 = require("type-graphql");
const GetRoomConnectionFailureType_1 = require("../../../enums/GetRoomConnectionFailureType");
const WritingMessageStatusInputType_1 = require("../../../enums/WritingMessageStatusInputType");
const WritingMessageStatusType_1 = require("../../../enums/WritingMessageStatusType");
const graphql_1 = require("../../entities/filePath/graphql");
const graphql_2 = require("../../entities/room/graphql");
const graphql_3 = require("../../entities/roomMessage/graphql");
let CreateRoomInput = class CreateRoomInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CreateRoomInput.prototype, "roomName", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CreateRoomInput.prototype, "participantName", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], CreateRoomInput.prototype, "joinAsPlayerPhrase", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], CreateRoomInput.prototype, "joinAsSpectatorPhrase", void 0);
CreateRoomInput = __decorate([
    type_graphql_1.InputType()
], CreateRoomInput);
exports.CreateRoomInput = CreateRoomInput;
let DeleteRoomArgs = class DeleteRoomArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], DeleteRoomArgs.prototype, "id", void 0);
DeleteRoomArgs = __decorate([
    type_graphql_1.ArgsType()
], DeleteRoomArgs);
exports.DeleteRoomArgs = DeleteRoomArgs;
let JoinRoomArgs = class JoinRoomArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], JoinRoomArgs.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], JoinRoomArgs.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], JoinRoomArgs.prototype, "phrase", void 0);
JoinRoomArgs = __decorate([
    type_graphql_1.ArgsType()
], JoinRoomArgs);
exports.JoinRoomArgs = JoinRoomArgs;
let PromoteArgs = class PromoteArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PromoteArgs.prototype, "roomId", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], PromoteArgs.prototype, "phrase", void 0);
PromoteArgs = __decorate([
    type_graphql_1.ArgsType()
], PromoteArgs);
exports.PromoteArgs = PromoteArgs;
let ChangeParticipantNameArgs = class ChangeParticipantNameArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ChangeParticipantNameArgs.prototype, "roomId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ChangeParticipantNameArgs.prototype, "newName", void 0);
ChangeParticipantNameArgs = __decorate([
    type_graphql_1.ArgsType()
], ChangeParticipantNameArgs);
exports.ChangeParticipantNameArgs = ChangeParticipantNameArgs;
let OperateArgs = class OperateArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], OperateArgs.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], OperateArgs.prototype, "prevRevision", void 0);
__decorate([
    type_graphql_1.Field(() => graphql_2.RoomOperationInput),
    __metadata("design:type", graphql_2.RoomOperationInput)
], OperateArgs.prototype, "operation", void 0);
__decorate([
    type_graphql_1.Field(),
    class_validator_1.MaxLength(10),
    __metadata("design:type", String)
], OperateArgs.prototype, "requestId", void 0);
OperateArgs = __decorate([
    type_graphql_1.ArgsType()
], OperateArgs);
exports.OperateArgs = OperateArgs;
let GetRoomArgs = class GetRoomArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetRoomArgs.prototype, "id", void 0);
GetRoomArgs = __decorate([
    type_graphql_1.ArgsType()
], GetRoomArgs);
exports.GetRoomArgs = GetRoomArgs;
let WritePublicMessageArgs = class WritePublicMessageArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], WritePublicMessageArgs.prototype, "roomId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], WritePublicMessageArgs.prototype, "text", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    class_validator_1.MaxLength(10),
    __metadata("design:type", String)
], WritePublicMessageArgs.prototype, "textColor", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], WritePublicMessageArgs.prototype, "channelKey", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], WritePublicMessageArgs.prototype, "characterStateId", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], WritePublicMessageArgs.prototype, "customName", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true, description: 'BCDiceのgameType。' }),
    __metadata("design:type", String)
], WritePublicMessageArgs.prototype, "gameType", void 0);
WritePublicMessageArgs = __decorate([
    type_graphql_1.ArgsType()
], WritePublicMessageArgs);
exports.WritePublicMessageArgs = WritePublicMessageArgs;
let WritePrivateMessageArgs = class WritePrivateMessageArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], WritePrivateMessageArgs.prototype, "roomId", void 0);
__decorate([
    type_graphql_1.Field(() => [String]),
    __metadata("design:type", Array)
], WritePrivateMessageArgs.prototype, "visibleTo", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], WritePrivateMessageArgs.prototype, "text", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    class_validator_1.MaxLength(10),
    __metadata("design:type", String)
], WritePrivateMessageArgs.prototype, "textColor", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], WritePrivateMessageArgs.prototype, "characterStateId", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], WritePrivateMessageArgs.prototype, "customName", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true, description: 'BCDiceのgameType。' }),
    __metadata("design:type", String)
], WritePrivateMessageArgs.prototype, "gameType", void 0);
WritePrivateMessageArgs = __decorate([
    type_graphql_1.ArgsType()
], WritePrivateMessageArgs);
exports.WritePrivateMessageArgs = WritePrivateMessageArgs;
let WriteRoomSoundEffectArgs = class WriteRoomSoundEffectArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], WriteRoomSoundEffectArgs.prototype, "roomId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_1.FilePath)
], WriteRoomSoundEffectArgs.prototype, "file", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], WriteRoomSoundEffectArgs.prototype, "volume", void 0);
WriteRoomSoundEffectArgs = __decorate([
    type_graphql_1.ArgsType()
], WriteRoomSoundEffectArgs);
exports.WriteRoomSoundEffectArgs = WriteRoomSoundEffectArgs;
let MessageIdArgs = class MessageIdArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], MessageIdArgs.prototype, "roomId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], MessageIdArgs.prototype, "messageId", void 0);
MessageIdArgs = __decorate([
    type_graphql_1.ArgsType()
], MessageIdArgs);
exports.MessageIdArgs = MessageIdArgs;
let EditMessageArgs = class EditMessageArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], EditMessageArgs.prototype, "roomId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], EditMessageArgs.prototype, "messageId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], EditMessageArgs.prototype, "text", void 0);
EditMessageArgs = __decorate([
    type_graphql_1.ArgsType()
], EditMessageArgs);
exports.EditMessageArgs = EditMessageArgs;
let GetMessagesArgs = class GetMessagesArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetMessagesArgs.prototype, "roomId", void 0);
GetMessagesArgs = __decorate([
    type_graphql_1.ArgsType()
], GetMessagesArgs);
exports.GetMessagesArgs = GetMessagesArgs;
let GetLogArgs = class GetLogArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetLogArgs.prototype, "roomId", void 0);
GetLogArgs = __decorate([
    type_graphql_1.ArgsType()
], GetLogArgs);
exports.GetLogArgs = GetLogArgs;
let UpdateWritingMessageStateArgs = class UpdateWritingMessageStateArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UpdateWritingMessageStateArgs.prototype, "roomId", void 0);
__decorate([
    type_graphql_1.Field(() => WritingMessageStatusInputType_1.WritingMessageStatusInputType),
    __metadata("design:type", String)
], UpdateWritingMessageStateArgs.prototype, "newStatus", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UpdateWritingMessageStateArgs.prototype, "publicChannelKey", void 0);
UpdateWritingMessageStateArgs = __decorate([
    type_graphql_1.ArgsType()
], UpdateWritingMessageStateArgs);
exports.UpdateWritingMessageStateArgs = UpdateWritingMessageStateArgs;
exports.GetRoomConnectionSuccessResultType = 'GetRoomConnectionSuccessResultType';
let GetRoomConnectionsSuccessResult = class GetRoomConnectionsSuccessResult {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], GetRoomConnectionsSuccessResult.prototype, "fetchedAt", void 0);
__decorate([
    type_graphql_1.Field(() => [String]),
    __metadata("design:type", Array)
], GetRoomConnectionsSuccessResult.prototype, "connectedUserUids", void 0);
GetRoomConnectionsSuccessResult = __decorate([
    type_graphql_1.ObjectType()
], GetRoomConnectionsSuccessResult);
exports.GetRoomConnectionsSuccessResult = GetRoomConnectionsSuccessResult;
exports.GetRoomConnectionFailureResultType = 'GetRoomConnectionFailureResultType';
let GetRoomConnectionsFailureResult = class GetRoomConnectionsFailureResult {
};
__decorate([
    type_graphql_1.Field(() => GetRoomConnectionFailureType_1.GetRoomConnectionFailureType),
    __metadata("design:type", String)
], GetRoomConnectionsFailureResult.prototype, "failureType", void 0);
GetRoomConnectionsFailureResult = __decorate([
    type_graphql_1.ObjectType()
], GetRoomConnectionsFailureResult);
exports.GetRoomConnectionsFailureResult = GetRoomConnectionsFailureResult;
exports.GetRoomConnectionsResult = type_graphql_1.createUnionType({
    name: 'GetRoomConnectionsResult',
    types: () => [GetRoomConnectionsSuccessResult, GetRoomConnectionsFailureResult],
    resolveType: value => {
        switch (value.__tstype) {
            case exports.GetRoomConnectionSuccessResultType:
                return GetRoomConnectionsSuccessResult;
            case exports.GetRoomConnectionFailureResultType:
                return GetRoomConnectionsFailureResult;
        }
    },
});
let RoomConnectionEvent = class RoomConnectionEvent {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RoomConnectionEvent.prototype, "userUid", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], RoomConnectionEvent.prototype, "isConnected", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], RoomConnectionEvent.prototype, "updatedAt", void 0);
RoomConnectionEvent = __decorate([
    type_graphql_1.ObjectType()
], RoomConnectionEvent);
exports.RoomConnectionEvent = RoomConnectionEvent;
let WritingMessageStatus = class WritingMessageStatus {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], WritingMessageStatus.prototype, "userUid", void 0);
__decorate([
    type_graphql_1.Field(() => WritingMessageStatusType_1.WritingMessageStatusType),
    __metadata("design:type", String)
], WritingMessageStatus.prototype, "status", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], WritingMessageStatus.prototype, "updatedAt", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], WritingMessageStatus.prototype, "publicChannelKey", void 0);
WritingMessageStatus = __decorate([
    type_graphql_1.ObjectType()
], WritingMessageStatus);
exports.WritingMessageStatus = WritingMessageStatus;
let RoomEvent = class RoomEvent {
};
__decorate([
    type_graphql_1.Field(() => graphql_2.RoomOperation, { nullable: true }),
    __metadata("design:type", graphql_2.RoomOperation)
], RoomEvent.prototype, "roomOperation", void 0);
__decorate([
    type_graphql_1.Field(() => graphql_2.DeleteRoomOperation, { nullable: true }),
    __metadata("design:type", graphql_2.DeleteRoomOperation)
], RoomEvent.prototype, "deleteRoomOperation", void 0);
__decorate([
    type_graphql_1.Field(() => graphql_3.RoomMessageEvent, { nullable: true }),
    __metadata("design:type", Object)
], RoomEvent.prototype, "roomMessageEvent", void 0);
__decorate([
    type_graphql_1.Field(() => RoomConnectionEvent, { nullable: true }),
    __metadata("design:type", RoomConnectionEvent)
], RoomEvent.prototype, "roomConnectionEvent", void 0);
__decorate([
    type_graphql_1.Field(() => WritingMessageStatus, { nullable: true }),
    __metadata("design:type", WritingMessageStatus)
], RoomEvent.prototype, "writingMessageStatus", void 0);
RoomEvent = __decorate([
    type_graphql_1.ObjectType()
], RoomEvent);
exports.RoomEvent = RoomEvent;
