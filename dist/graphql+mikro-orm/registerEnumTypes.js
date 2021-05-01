"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const ParticipantRole_1 = require("../enums/ParticipantRole");
const JoinRoomFailureType_1 = require("../enums/JoinRoomFailureType");
const FileSourceType_1 = require("../enums/FileSourceType");
const GetRoomFailureType_1 = require("../enums/GetRoomFailureType");
const GetRoomsListFailureType_1 = require("../enums/GetRoomsListFailureType");
const CreateRoomFailureType_1 = require("../enums/CreateRoomFailureType");
const EntryToServerResultType_1 = require("../enums/EntryToServerResultType");
const OperateRoomFailureType_1 = require("../enums/OperateRoomFailureType");
const GetRoomMessagesFailureType_1 = require("../enums/GetRoomMessagesFailureType");
const WritePublicRoomMessageFailureType_1 = require("../enums/WritePublicRoomMessageFailureType");
const WritePrivateRoomMessageFailureType_1 = require("../enums/WritePrivateRoomMessageFailureType");
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
const MyValueLogType_1 = require("../enums/MyValueLogType");
const GetRoomConnectionFailureType_1 = require("../enums/GetRoomConnectionFailureType");
let hasRegistered = false;
const registerEnumTypes = () => {
    if (hasRegistered) {
        return;
    }
    hasRegistered = true;
    type_graphql_1.registerEnumType(ChangeParticipantNameFailureType_1.ChangeParticipantNameFailureType, {
        name: 'ChangeParticipantNameFailureType'
    });
    type_graphql_1.registerEnumType(CreateRoomFailureType_1.CreateRoomFailureType, {
        name: 'CreateRoomFailureType'
    });
    type_graphql_1.registerEnumType(DeleteMessageFailureType_1.DeleteMessageFailureType, {
        name: 'DeleteMessageFailureType'
    });
    type_graphql_1.registerEnumType(DeleteRoomFailureType_1.DeleteRoomFailureType, {
        name: 'DeleteRoomFailureType'
    });
    type_graphql_1.registerEnumType(EditMessageFailureType_1.EditMessageFailureType, {
        name: 'EditMessageFailureType'
    });
    type_graphql_1.registerEnumType(EntryToServerResultType_1.EntryToServerResultType, {
        name: 'EntryToServerResultType'
    });
    type_graphql_1.registerEnumType(FileSourceType_1.FileSourceType, {
        name: 'FileSourceType'
    });
    type_graphql_1.registerEnumType(GetRoomConnectionFailureType_1.GetRoomConnectionFailureType, {
        name: 'GetRoomConnectionFailureType'
    });
    type_graphql_1.registerEnumType(GetRoomFailureType_1.GetRoomFailureType, {
        name: 'GetRoomFailureType'
    });
    type_graphql_1.registerEnumType(GetRoomLogFailureType_1.GetRoomLogFailureType, {
        name: 'GetRoomLogFailureType'
    });
    type_graphql_1.registerEnumType(GetRoomMessagesFailureType_1.GetRoomMessagesFailureType, {
        name: 'GetRoomMessagesFailureType'
    });
    type_graphql_1.registerEnumType(GetRoomsListFailureType_1.GetRoomsListFailureType, {
        name: 'GetRoomsListFailureType'
    });
    type_graphql_1.registerEnumType(JoinRoomFailureType_1.JoinRoomFailureType, {
        name: 'JoinRoomFailureType'
    });
    type_graphql_1.registerEnumType(LeaveRoomFailureType_1.LeaveRoomFailureType, {
        name: 'LeaveRoomFailureType'
    });
    type_graphql_1.registerEnumType(MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType, {
        name: 'MakeMessageNotSecretFailureType'
    });
    type_graphql_1.registerEnumType(MyValueLogType_1.MyValueLogType, {
        name: 'MyValueLogType'
    });
    type_graphql_1.registerEnumType(OperateRoomFailureType_1.OperateRoomFailureType, {
        name: 'OperateRoomFailureType'
    });
    type_graphql_1.registerEnumType(ParticipantRole_1.ParticipantRole, {
        name: 'ParticipantRole'
    });
    type_graphql_1.registerEnumType(PrereleaseType_1.PrereleaseType, {
        name: 'PrereleaseType'
    });
    type_graphql_1.registerEnumType(PromoteFailureType_1.PromoteFailureType, {
        name: 'PromoteFailureType'
    });
    type_graphql_1.registerEnumType(RequiresPhraseFailureType_1.RequiresPhraseFailureType, {
        name: 'RequiresPhraseFailureType'
    });
    type_graphql_1.registerEnumType(RoomParameterNameType_1.RoomParameterNameType, {
        name: 'RoomParameterNameType'
    });
    type_graphql_1.registerEnumType(WritePrivateRoomMessageFailureType_1.WritePrivateRoomMessageFailureType, {
        name: 'WritePrivateRoomMessageFailureType'
    });
    type_graphql_1.registerEnumType(WritePublicRoomMessageFailureType_1.WritePublicRoomMessageFailureType, {
        name: 'WritePublicRoomMessageFailureType'
    });
    type_graphql_1.registerEnumType(WriteRoomSoundEffectFailureType_1.WriteRoomSoundEffectFailureType, {
        name: 'WriteRoomSoundEffectFailureType'
    });
};
exports.default = registerEnumTypes;
