import { registerEnumType } from 'type-graphql';
import { ParticipantRole } from '../enums/ParticipantRole';
import { JoinRoomFailureType } from '../enums/JoinRoomFailureType';
import { FileSourceType } from '../enums/FileSourceType';
import { GetRoomFailureType } from '../enums/GetRoomFailureType';
import { GetRoomsListFailureType } from '../enums/GetRoomsListFailureType';
import { CreateRoomFailureType } from '../enums/CreateRoomFailureType';
import { EntryToServerResultType } from '../enums/EntryToServerResultType';
import { OperateRoomFailureType } from '../enums/OperateRoomFailureType';
import { GetRoomMessagesFailureType } from '../enums/GetRoomMessagesFailureType';
import { WritePublicRoomMessageFailureType } from '../enums/WritePublicRoomMessageFailureType';
import { WritePrivateRoomMessageFailureType } from '../enums/WritePrivateRoomMessageFailureType';
import { LeaveRoomFailureType } from '../enums/LeaveRoomFailureType';
import { RoomParameterNameType } from '../enums/RoomParameterNameType';
import { WriteRoomSoundEffectFailureType } from '../enums/WriteRoomSoundEffectFailureType';
import { DeleteMessageFailureType } from '../enums/DeleteMessageFailureType';
import { EditMessageFailureType } from '../enums/EditMessageFailureType';
import { MakeMessageNotSecretFailureType } from '../enums/MakeMessageNotSecretFailureType';

let hasRegistered = false;
const registerEnumTypes = (): void => {
    if (hasRegistered) {
        return;
    }
    hasRegistered = true;
    registerEnumType(CreateRoomFailureType, {
        name: 'CreateRoomFailureType'
    });
    registerEnumType(DeleteMessageFailureType, {
        name: 'DeleteMessageFailureType'
    });
    registerEnumType(EditMessageFailureType, {
        name: 'EditMessageFailureType'
    });
    registerEnumType(EntryToServerResultType, {
        name: 'EntryToServerResultType'
    });
    registerEnumType(FileSourceType, {
        name: 'FileSourceType'
    });
    registerEnumType(GetRoomFailureType, {
        name: 'GetRoomFailureType'
    });
    registerEnumType(GetRoomMessagesFailureType, {
        name: 'GetRoomMessagesFailureType'
    });
    registerEnumType(GetRoomsListFailureType, {
        name: 'GetRoomsListFailureType'
    });
    registerEnumType(JoinRoomFailureType, {
        name: 'JoinRoomFailureType'
    });
    registerEnumType(LeaveRoomFailureType, {
        name: 'LeaveRoomFailureType'
    });
    registerEnumType(MakeMessageNotSecretFailureType, {
        name: 'MakeMessageNotSecretFailureType'
    });
    registerEnumType(OperateRoomFailureType, {
        name: 'OperateRoomFailureType'
    });
    registerEnumType(ParticipantRole, {
        name: 'ParticipantRole'
    });
    registerEnumType(RoomParameterNameType, {
        name: 'RoomParameterNameType'
    });
    registerEnumType(WritePrivateRoomMessageFailureType, {
        name: 'WritePrivateRoomMessageFailureType'
    });
    registerEnumType(WritePublicRoomMessageFailureType, {
        name: 'WritePublicRoomMessageFailureType'
    });
    registerEnumType(WriteRoomSoundEffectFailureType, {
        name: 'WriteRoomSoundEffectFailureType'
    });
};

export default registerEnumTypes;