import { registerEnumType } from 'type-graphql';
import { ParticipantRoleType } from '../enums/ParticipantRoleType';
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
import { PromoteFailureType } from '../enums/PromoteFailureType';
import { ChangeParticipantNameFailureType } from '../enums/ChangeParticipantNameFailureType';
import { DeleteRoomFailureType } from '../enums/DeleteRoomFailureType';
import { PrereleaseType } from '../enums/PrereleaseType';
import { GetRoomConnectionFailureType } from '../enums/GetRoomConnectionFailureType';
import { WritingMessageStatusInputType } from '../enums/WritingMessageStatusInputType';
import { WritingMessageStatusType } from '../enums/WritingMessageStatusType';
import { PieceLogType } from '../enums/PieceLogType';
import { BaasType } from '../enums/BaasType';
import { GetFileItemsFailureType } from '../enums/GetFileItemsFailureType';
import { CreateRoomFailureType } from '../enums/CreateRoomFailureType';
import { GetRoomsListFailureType } from '../enums/GetRoomsListFailureType';
import { ResetRoomMessagesFailureType } from '../enums/ResetRoomMessagesFailureType';
import { DeleteRoomAsAdminFailureType } from '../enums/DeleteRoomAsAdminFailureType';
import { UpdateBookmarkFailureType } from '../enums/UpdateBookmarkFailureType';
import { FileListType } from '../enums/FileListType';

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
    registerEnumType(DeleteRoomAsAdminFailureType, {
        name: 'DeleteRoomAsAdminFailureType',
    });
    registerEnumType(EditMessageFailureType, {
        name: 'EditMessageFailureType',
    });
    registerEnumType(EntryToServerResultType, {
        name: 'EntryToServerResultType',
    });
    registerEnumType(FileListType, {
        name: 'FileListType',
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
    registerEnumType(ParticipantRoleType, {
        // 互換性のため'ParticipantRoleType'ではなく'ParticipantRole'としている。だが、'ParticipantRoleType'に変更することで問題が生じるかどうかは確認していない。
        name: 'ParticipantRole',
    });
    registerEnumType(PieceLogType, {
        name: 'PieceLogType',
    });
    registerEnumType(PrereleaseType, {
        name: 'PrereleaseType',
    });
    registerEnumType(PromoteFailureType, {
        name: 'PromoteFailureType',
    });
    registerEnumType(ResetRoomMessagesFailureType, {
        name: 'ResetRoomMessagesFailureType',
    });
    registerEnumType(RoomParameterNameType, {
        name: 'RoomParameterNameType',
    });
    registerEnumType(UpdateBookmarkFailureType, {
        name: 'UpdateBookmarkFailureType',
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
