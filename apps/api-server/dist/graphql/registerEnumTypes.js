'use strict';

var typeGraphql = require('type-graphql');
var BaasType = require('../enums/BaasType.js');
var ChangeParticipantNameFailureType = require('../enums/ChangeParticipantNameFailureType.js');
var CreateRoomFailureType = require('../enums/CreateRoomFailureType.js');
var DeleteMessageFailureType = require('../enums/DeleteMessageFailureType.js');
var DeleteRoomAsAdminFailureType = require('../enums/DeleteRoomAsAdminFailureType.js');
var DeleteRoomFailureType = require('../enums/DeleteRoomFailureType.js');
var EditMessageFailureType = require('../enums/EditMessageFailureType.js');
var EntryToServerResultType = require('../enums/EntryToServerResultType.js');
var FileListType = require('../enums/FileListType.js');
var FileSourceType = require('../enums/FileSourceType.js');
var GetRoomConnectionFailureType = require('../enums/GetRoomConnectionFailureType.js');
var GetRoomFailureType = require('../enums/GetRoomFailureType.js');
var GetRoomLogFailureType = require('../enums/GetRoomLogFailureType.js');
var GetRoomMessagesFailureType = require('../enums/GetRoomMessagesFailureType.js');
var GetRoomsListFailureType = require('../enums/GetRoomsListFailureType.js');
var JoinRoomFailureType = require('../enums/JoinRoomFailureType.js');
var LeaveRoomFailureType = require('../enums/LeaveRoomFailureType.js');
var MakeMessageNotSecretFailureType = require('../enums/MakeMessageNotSecretFailureType.js');
var OperateRoomFailureType = require('../enums/OperateRoomFailureType.js');
var ParticipantRoleType = require('../enums/ParticipantRoleType.js');
var PieceLogType = require('../enums/PieceLogType.js');
var PrereleaseType = require('../enums/PrereleaseType.js');
var PromoteFailureType = require('../enums/PromoteFailureType.js');
var ResetRoomMessagesFailureType = require('../enums/ResetRoomMessagesFailureType.js');
var RoomParameterNameType = require('../enums/RoomParameterNameType.js');
var UpdateBookmarkFailureType = require('../enums/UpdateBookmarkFailureType.js');
var WriteRoomPrivateMessageFailureType = require('../enums/WriteRoomPrivateMessageFailureType.js');
var WriteRoomPublicMessageFailureType = require('../enums/WriteRoomPublicMessageFailureType.js');
var WriteRoomSoundEffectFailureType = require('../enums/WriteRoomSoundEffectFailureType.js');
var WritingMessageStatusInputType = require('../enums/WritingMessageStatusInputType.js');
var WritingMessageStatusType = require('../enums/WritingMessageStatusType.js');
var AnswerRollCallFailureType = require('../enums/AnswerRollCallFailureType.js');
var CloseRollCallFailureType = require('../enums/CloseRollCallFailureType.js');
var PerformRollCallFailureType = require('../enums/PerformRollCallFailureType.js');

let hasRegistered = false;
const registerEnumTypes = () => {
    if (hasRegistered) {
        return;
    }
    hasRegistered = true;
    typeGraphql.registerEnumType(AnswerRollCallFailureType.AnswerRollCallFailureType, {
        name: 'AnswerRollCallFailureType',
    });
    typeGraphql.registerEnumType(BaasType.BaasType, {
        name: 'BaasType',
    });
    typeGraphql.registerEnumType(ChangeParticipantNameFailureType.ChangeParticipantNameFailureType, {
        name: 'ChangeParticipantNameFailureType',
    });
    typeGraphql.registerEnumType(CloseRollCallFailureType.CloseRollCallFailureType, {
        name: 'CloseRollCallFailureType',
    });
    typeGraphql.registerEnumType(CreateRoomFailureType.CreateRoomFailureType, {
        name: 'CreateRoomFailureType',
    });
    typeGraphql.registerEnumType(DeleteMessageFailureType.DeleteMessageFailureType, {
        name: 'DeleteMessageFailureType',
    });
    typeGraphql.registerEnumType(DeleteRoomFailureType.DeleteRoomFailureType, {
        name: 'DeleteRoomFailureType',
    });
    typeGraphql.registerEnumType(DeleteRoomAsAdminFailureType.DeleteRoomAsAdminFailureType, {
        name: 'DeleteRoomAsAdminFailureType',
    });
    typeGraphql.registerEnumType(EditMessageFailureType.EditMessageFailureType, {
        name: 'EditMessageFailureType',
    });
    typeGraphql.registerEnumType(EntryToServerResultType.EntryToServerResultType, {
        name: 'EntryToServerResultType',
    });
    typeGraphql.registerEnumType(FileListType.FileListType, {
        name: 'FileListType',
    });
    typeGraphql.registerEnumType(FileSourceType.FileSourceType, {
        name: 'FileSourceType',
    });
    typeGraphql.registerEnumType(GetRoomConnectionFailureType.GetRoomConnectionFailureType, {
        name: 'GetRoomConnectionFailureType',
    });
    typeGraphql.registerEnumType(GetRoomFailureType.GetRoomFailureType, {
        name: 'GetRoomFailureType',
    });
    typeGraphql.registerEnumType(GetRoomLogFailureType.GetRoomLogFailureType, {
        name: 'GetRoomLogFailureType',
    });
    typeGraphql.registerEnumType(GetRoomMessagesFailureType.GetRoomMessagesFailureType, {
        name: 'GetRoomMessagesFailureType',
    });
    typeGraphql.registerEnumType(GetRoomsListFailureType.GetRoomsListFailureType, {
        name: 'GetRoomsListFailureType',
    });
    typeGraphql.registerEnumType(JoinRoomFailureType.JoinRoomFailureType, {
        name: 'JoinRoomFailureType',
    });
    typeGraphql.registerEnumType(LeaveRoomFailureType.LeaveRoomFailureType, {
        name: 'LeaveRoomFailureType',
    });
    typeGraphql.registerEnumType(MakeMessageNotSecretFailureType.MakeMessageNotSecretFailureType, {
        name: 'MakeMessageNotSecretFailureType',
    });
    typeGraphql.registerEnumType(OperateRoomFailureType.OperateRoomFailureType, {
        name: 'OperateRoomFailureType',
    });
    typeGraphql.registerEnumType(ParticipantRoleType.ParticipantRoleType, {
        name: 'ParticipantRole',
    });
    typeGraphql.registerEnumType(PerformRollCallFailureType.PerformRollCallFailureType, {
        name: 'PerformRollCallFailureType',
    });
    typeGraphql.registerEnumType(PieceLogType.PieceLogType, {
        name: 'PieceLogType',
    });
    typeGraphql.registerEnumType(PrereleaseType.PrereleaseType, {
        name: 'PrereleaseType',
    });
    typeGraphql.registerEnumType(PromoteFailureType.PromoteFailureType, {
        name: 'PromoteFailureType',
    });
    typeGraphql.registerEnumType(ResetRoomMessagesFailureType.ResetRoomMessagesFailureType, {
        name: 'ResetRoomMessagesFailureType',
    });
    typeGraphql.registerEnumType(RoomParameterNameType.RoomParameterNameType, {
        name: 'RoomParameterNameType',
    });
    typeGraphql.registerEnumType(UpdateBookmarkFailureType.UpdateBookmarkFailureType, {
        name: 'UpdateBookmarkFailureType',
    });
    typeGraphql.registerEnumType(WriteRoomPrivateMessageFailureType.WriteRoomPrivateMessageFailureType, {
        name: 'WriteRoomPrivateMessageFailureType',
    });
    typeGraphql.registerEnumType(WriteRoomPublicMessageFailureType.WriteRoomPublicMessageFailureType, {
        name: 'WriteRoomPublicMessageFailureType',
    });
    typeGraphql.registerEnumType(WriteRoomSoundEffectFailureType.WriteRoomSoundEffectFailureType, {
        name: 'WriteRoomSoundEffectFailureType',
    });
    typeGraphql.registerEnumType(WritingMessageStatusInputType.WritingMessageStatusInputType, {
        name: 'WritingMessageStatusInputType',
    });
    typeGraphql.registerEnumType(WritingMessageStatusType.WritingMessageStatusType, {
        name: 'WritingMessageStatusType',
    });
};

exports.registerEnumTypes = registerEnumTypes;
//# sourceMappingURL=registerEnumTypes.js.map
