"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEnumTypes = void 0;
const type_graphql_1 = require("type-graphql");
const ParticipantRole_1 = require("../enums/ParticipantRole");
const JoinRoomFailureType_1 = require("../enums/JoinRoomFailureType");
const FileSourceType_1 = require("../enums/FileSourceType");
const GetRoomFailureType_1 = require("../enums/GetRoomFailureType");
const EntryToServerResultType_1 = require("../enums/EntryToServerResultType");
const OperateRoomFailureType_1 = require("../enums/OperateRoomFailureType");
const GetRoomMessagesFailureType_1 = require("../enums/GetRoomMessagesFailureType");
const WriteRoomPublicMessageFailureType_1 = require("../enums/WriteRoomPublicMessageFailureType");
const WriteRoomPrivateMessageFailureType_1 = require("../enums/WriteRoomPrivateMessageFailureType");
const LeaveRoomFailureType_1 = require("../enums/LeaveRoomFailureType");
const RoomParameterNameType_1 = require("../enums/RoomParameterNameType");
const WriteRoomSoundEffectFailureType_1 = require("../enums/WriteRoomSoundEffectFailureType");
const DeleteMessageFailureType_1 = require("../enums/DeleteMessageFailureType");
const EditMessageFailureType_1 = require("../enums/EditMessageFailureType");
const MakeMessageNotSecretFailureType_1 = require("../enums/MakeMessageNotSecretFailureType");
const GetRoomLogFailureType_1 = require("../enums/GetRoomLogFailureType");
const RequiresPhraseFailureType_1 = require("../enums/RequiresPhraseFailureType");
const PromoteFailureType_1 = require("../enums/PromoteFailureType");
const ChangeParticipantNameFailureType_1 = require("../enums/ChangeParticipantNameFailureType");
const DeleteRoomFailureType_1 = require("../enums/DeleteRoomFailureType");
const PrereleaseType_1 = require("../enums/PrereleaseType");
const GetRoomConnectionFailureType_1 = require("../enums/GetRoomConnectionFailureType");
const WritingMessageStatusInputType_1 = require("../enums/WritingMessageStatusInputType");
const WritingMessageStatusType_1 = require("../enums/WritingMessageStatusType");
const PieceValueLogType_1 = require("../enums/PieceValueLogType");
const BaasType_1 = require("../enums/BaasType");
const GetFileItemsFailureType_1 = require("../enums/GetFileItemsFailureType");
const CreateRoomFailureType_1 = require("../enums/CreateRoomFailureType");
const GetRoomsListFailureType_1 = require("../enums/GetRoomsListFailureType");
let hasRegistered = false;
const registerEnumTypes = () => {
    if (hasRegistered) {
        return;
    }
    hasRegistered = true;
    (0, type_graphql_1.registerEnumType)(BaasType_1.BaasType, {
        name: 'BaasType',
    });
    (0, type_graphql_1.registerEnumType)(ChangeParticipantNameFailureType_1.ChangeParticipantNameFailureType, {
        name: 'ChangeParticipantNameFailureType',
    });
    (0, type_graphql_1.registerEnumType)(CreateRoomFailureType_1.CreateRoomFailureType, {
        name: 'CreateRoomFailureType',
    });
    (0, type_graphql_1.registerEnumType)(DeleteMessageFailureType_1.DeleteMessageFailureType, {
        name: 'DeleteMessageFailureType',
    });
    (0, type_graphql_1.registerEnumType)(DeleteRoomFailureType_1.DeleteRoomFailureType, {
        name: 'DeleteRoomFailureType',
    });
    (0, type_graphql_1.registerEnumType)(EditMessageFailureType_1.EditMessageFailureType, {
        name: 'EditMessageFailureType',
    });
    (0, type_graphql_1.registerEnumType)(EntryToServerResultType_1.EntryToServerResultType, {
        name: 'EntryToServerResultType',
    });
    (0, type_graphql_1.registerEnumType)(FileSourceType_1.FileSourceType, {
        name: 'FileSourceType',
    });
    (0, type_graphql_1.registerEnumType)(GetFileItemsFailureType_1.GetFileItemsFailureType, {
        name: 'GetFileItemsFailureType',
    });
    (0, type_graphql_1.registerEnumType)(GetRoomConnectionFailureType_1.GetRoomConnectionFailureType, {
        name: 'GetRoomConnectionFailureType',
    });
    (0, type_graphql_1.registerEnumType)(GetRoomFailureType_1.GetRoomFailureType, {
        name: 'GetRoomFailureType',
    });
    (0, type_graphql_1.registerEnumType)(GetRoomLogFailureType_1.GetRoomLogFailureType, {
        name: 'GetRoomLogFailureType',
    });
    (0, type_graphql_1.registerEnumType)(GetRoomMessagesFailureType_1.GetRoomMessagesFailureType, {
        name: 'GetRoomMessagesFailureType',
    });
    (0, type_graphql_1.registerEnumType)(GetRoomsListFailureType_1.GetRoomsListFailureType, {
        name: 'GetRoomsListFailureType',
    });
    (0, type_graphql_1.registerEnumType)(JoinRoomFailureType_1.JoinRoomFailureType, {
        name: 'JoinRoomFailureType',
    });
    (0, type_graphql_1.registerEnumType)(LeaveRoomFailureType_1.LeaveRoomFailureType, {
        name: 'LeaveRoomFailureType',
    });
    (0, type_graphql_1.registerEnumType)(MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType, {
        name: 'MakeMessageNotSecretFailureType',
    });
    (0, type_graphql_1.registerEnumType)(OperateRoomFailureType_1.OperateRoomFailureType, {
        name: 'OperateRoomFailureType',
    });
    (0, type_graphql_1.registerEnumType)(ParticipantRole_1.ParticipantRole, {
        name: 'ParticipantRole',
    });
    (0, type_graphql_1.registerEnumType)(PieceValueLogType_1.PieceValueLogType, {
        name: 'PieceValueLogType',
    });
    (0, type_graphql_1.registerEnumType)(PrereleaseType_1.PrereleaseType, {
        name: 'PrereleaseType',
    });
    (0, type_graphql_1.registerEnumType)(PromoteFailureType_1.PromoteFailureType, {
        name: 'PromoteFailureType',
    });
    (0, type_graphql_1.registerEnumType)(RequiresPhraseFailureType_1.RequiresPhraseFailureType, {
        name: 'RequiresPhraseFailureType',
    });
    (0, type_graphql_1.registerEnumType)(RoomParameterNameType_1.RoomParameterNameType, {
        name: 'RoomParameterNameType',
    });
    (0, type_graphql_1.registerEnumType)(WriteRoomPrivateMessageFailureType_1.WriteRoomPrivateMessageFailureType, {
        name: 'WriteRoomPrivateMessageFailureType',
    });
    (0, type_graphql_1.registerEnumType)(WriteRoomPublicMessageFailureType_1.WriteRoomPublicMessageFailureType, {
        name: 'WriteRoomPublicMessageFailureType',
    });
    (0, type_graphql_1.registerEnumType)(WriteRoomSoundEffectFailureType_1.WriteRoomSoundEffectFailureType, {
        name: 'WriteRoomSoundEffectFailureType',
    });
    (0, type_graphql_1.registerEnumType)(WritingMessageStatusInputType_1.WritingMessageStatusInputType, {
        name: 'WritingMessageStatusInputType',
    });
    (0, type_graphql_1.registerEnumType)(WritingMessageStatusType_1.WritingMessageStatusType, {
        name: 'WritingMessageStatusType',
    });
};
exports.registerEnumTypes = registerEnumTypes;
