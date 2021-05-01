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
import { GetRoomLogFailureType } from '../enums/GetRoomLogFailureType';
import { RequiresPhraseFailureType } from '../enums/RequiresPhraseFailureType';
import { PromoteFailureType } from '../enums/PromoteFailureType';
import { ChangeParticipantNameFailureType } from '../enums/ChangeParticipantNameFailureType';
import { DeleteRoomFailureType } from '../enums/DeleteRoomFailureType';
import { PrereleaseType } from '../enums/PrereleaseType';
import { MyValueLogType } from '../enums/MyValueLogType';
import { GetRoomConnectionFailureType } from '../enums/GetRoomConnectionFailureType';

let hasRegistered = false;
const registerEnumTypes = (): void => {
    if (hasRegistered) {
        return;
    }
    hasRegistered = true;
    registerEnumType(ChangeParticipantNameFailureType, {
        name: 'ChangeParticipantNameFailureType'
    });
    registerEnumType(CreateRoomFailureType, {
        name: 'CreateRoomFailureType'
    });
    registerEnumType(DeleteMessageFailureType, {
        name: 'DeleteMessageFailureType'
    });
    registerEnumType(DeleteRoomFailureType, {
        name: 'DeleteRoomFailureType'
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
    registerEnumType(GetRoomConnectionFailureType, {
        name: 'GetRoomConnectionFailureType'
    });
    registerEnumType(GetRoomFailureType, {
        name: 'GetRoomFailureType'
    });
    registerEnumType(GetRoomLogFailureType, {
        name: 'GetRoomLogFailureType'
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
    registerEnumType(MyValueLogType, {
        name: 'MyValueLogType'
    });
    registerEnumType(OperateRoomFailureType, {
        name: 'OperateRoomFailureType'
    });
    registerEnumType(ParticipantRole, {
        name: 'ParticipantRole'
    });
    registerEnumType(PrereleaseType, {
        name: 'PrereleaseType'
    });
    registerEnumType(PromoteFailureType, {
        name: 'PromoteFailureType'
    });
    registerEnumType(RequiresPhraseFailureType, {
        name: 'RequiresPhraseFailureType'
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