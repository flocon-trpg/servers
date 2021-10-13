import { registerEnumType } from 'type-graphql';
import { ParticipantRole } from '../enums/ParticipantRole';
import { JoinRoomFailureType } from '../enums/JoinRoomFailureType';
import { FileSourceType } from '../enums/FileSourceType';
import { GetRoomFailureType } from '../enums/GetRoomFailureType';
import { EntryToServerResultType } from '../enums/EntryToServerResultType';
import { OperateRoomFailureType } from '../enums/OperateRoomFailureType';
import { GetRoomMessagesFailureType } from '../enums/GetRoomMessagesFailureType';
import { WriteRoomPublicMessageFailureType } from '../enums/WriteRoomPublicMessageFailureType';
import { WriteRoomPrivateMessageFailureType } from '../enums/WriteRoomPrivateMessageFailureType';
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
import { GetRoomConnectionFailureType } from '../enums/GetRoomConnectionFailureType';
import { WritingMessageStatusInputType } from '../enums/WritingMessageStatusInputType';
import { WritingMessageStatusType } from '../enums/WritingMessageStatusType';
import { PieceValueLogType } from '../enums/PieceValueLogType';
import { BaasType } from '../enums/BaasType';
import { GetFileItemsFailureType } from '../enums/GetFileItemsFailureType';
import { CreateRoomFailureType } from '../enums/CreateRoomFailureType';
import { GetRoomsListFailureType } from '../enums/GetRoomsListFailureType';

let hasRegistered = false;
export const registerEnumTypes = (): void => {
    if (hasRegistered) {
        return;
    }
    hasRegistered = true;
    registerEnumType(BaasType, {
        name: 'BaasType',
    });
    registerEnumType(ChangeParticipantNameFailureType, {
        name: 'ChangeParticipantNameFailureType',
    });
    registerEnumType(CreateRoomFailureType, {
        name: 'CreateRoomFailureType',
    });
    registerEnumType(DeleteMessageFailureType, {
        name: 'DeleteMessageFailureType',
    });
    registerEnumType(DeleteRoomFailureType, {
        name: 'DeleteRoomFailureType',
    });
    registerEnumType(EditMessageFailureType, {
        name: 'EditMessageFailureType',
    });
    registerEnumType(EntryToServerResultType, {
        name: 'EntryToServerResultType',
    });
    registerEnumType(FileSourceType, {
        name: 'FileSourceType',
    });
    registerEnumType(GetFileItemsFailureType, {
        name: 'GetFileItemsFailureType',
    });
    registerEnumType(GetRoomConnectionFailureType, {
        name: 'GetRoomConnectionFailureType',
    });
    registerEnumType(GetRoomFailureType, {
        name: 'GetRoomFailureType',
    });
    registerEnumType(GetRoomLogFailureType, {
        name: 'GetRoomLogFailureType',
    });
    registerEnumType(GetRoomMessagesFailureType, {
        name: 'GetRoomMessagesFailureType',
    });
    registerEnumType(GetRoomsListFailureType, {
        name: 'GetRoomsListFailureType',
    });
    registerEnumType(JoinRoomFailureType, {
        name: 'JoinRoomFailureType',
    });
    registerEnumType(LeaveRoomFailureType, {
        name: 'LeaveRoomFailureType',
    });
    registerEnumType(MakeMessageNotSecretFailureType, {
        name: 'MakeMessageNotSecretFailureType',
    });
    registerEnumType(OperateRoomFailureType, {
        name: 'OperateRoomFailureType',
    });
    registerEnumType(ParticipantRole, {
        name: 'ParticipantRole',
    });
    registerEnumType(PieceValueLogType, {
        name: 'PieceValueLogType',
    });
    registerEnumType(PrereleaseType, {
        name: 'PrereleaseType',
    });
    registerEnumType(PromoteFailureType, {
        name: 'PromoteFailureType',
    });
    registerEnumType(RequiresPhraseFailureType, {
        name: 'RequiresPhraseFailureType',
    });
    registerEnumType(RoomParameterNameType, {
        name: 'RoomParameterNameType',
    });
    registerEnumType(WriteRoomPrivateMessageFailureType, {
        name: 'WriteRoomPrivateMessageFailureType',
    });
    registerEnumType(WriteRoomPublicMessageFailureType, {
        name: 'WriteRoomPublicMessageFailureType',
    });
    registerEnumType(WriteRoomSoundEffectFailureType, {
        name: 'WriteRoomSoundEffectFailureType',
    });
    registerEnumType(WritingMessageStatusInputType, {
        name: 'WritingMessageStatusInputType',
    });
    registerEnumType(WritingMessageStatusType, {
        name: 'WritingMessageStatusType',
    });
};
