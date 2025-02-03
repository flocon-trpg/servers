import { registerEnumType } from '@nestjs/graphql';
import { AnswerRollCallFailureType } from '../enums/AnswerRollCallFailureType';
import { BaasType } from '../enums/BaasType';
import { ChangeParticipantNameFailureType } from '../enums/ChangeParticipantNameFailureType';
import { CloseRollCallFailureType } from '../enums/CloseRollCallFailureType';
import { CreateRoomFailureType } from '../enums/CreateRoomFailureType';
import { DeleteMessageFailureType } from '../enums/DeleteMessageFailureType';
import { DeleteRoomAsAdminFailureType } from '../enums/DeleteRoomAsAdminFailureType';
import { DeleteRoomFailureType } from '../enums/DeleteRoomFailureType';
import { EditMessageFailureType } from '../enums/EditMessageFailureType';
import { EntryToServerResultType } from '../enums/EntryToServerResultType';
import { FileListType } from '../enums/FileListType';
import { FileSourceType } from '../enums/FileSourceType';
import { GetRoomConnectionFailureType } from '../enums/GetRoomConnectionFailureType';
import { GetRoomFailureType } from '../enums/GetRoomFailureType';
import { GetRoomLogFailureType } from '../enums/GetRoomLogFailureType';
import { GetRoomMessagesFailureType } from '../enums/GetRoomMessagesFailureType';
import { GetRoomsListFailureType } from '../enums/GetRoomsListFailureType';
import { JoinRoomFailureType } from '../enums/JoinRoomFailureType';
import { LeaveRoomFailureType } from '../enums/LeaveRoomFailureType';
import { MakeMessageNotSecretFailureType } from '../enums/MakeMessageNotSecretFailureType';
import { OperateRoomFailureType } from '../enums/OperateRoomFailureType';
import { ParticipantRoleType } from '../enums/ParticipantRoleType';
import { PerformRollCallFailureType } from '../enums/PerformRollCallFailureType';
import { PieceLogType } from '../enums/PieceLogType';
import { PrereleaseType } from '../enums/PrereleaseType';
import { PromoteFailureType } from '../enums/PromoteFailureType';
import { ResetRoomMessagesFailureType } from '../enums/ResetRoomMessagesFailureType';
import { RoomParameterNameType } from '../enums/RoomParameterNameType';
import { UpdateBookmarkFailureType } from '../enums/UpdateBookmarkFailureType';
import { WriteRoomPrivateMessageFailureType } from '../enums/WriteRoomPrivateMessageFailureType';
import { WriteRoomPublicMessageFailureType } from '../enums/WriteRoomPublicMessageFailureType';
import { WriteRoomSoundEffectFailureType } from '../enums/WriteRoomSoundEffectFailureType';
import { WritingMessageStatusInputType } from '../enums/WritingMessageStatusInputType';
import { WritingMessageStatusType } from '../enums/WritingMessageStatusType';

let hasRegistered = false;
export const registerEnumTypes = (): void => {
    if (hasRegistered) {
        return;
    }
    hasRegistered = true;
    registerEnumType(AnswerRollCallFailureType, {
        name: 'AnswerRollCallFailureType',
    });
    registerEnumType(BaasType, {
        name: 'BaasType',
    });
    registerEnumType(ChangeParticipantNameFailureType, {
        name: 'ChangeParticipantNameFailureType',
    });
    registerEnumType(CloseRollCallFailureType, {
        name: 'CloseRollCallFailureType',
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
        name: 'EntryWithPasswordResultType',
    });
    registerEnumType(FileListType, {
        name: 'FileListType',
    });
    registerEnumType(FileSourceType, {
        name: 'FileSourceType',
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
        // 'ParticipantRoleType'とすべきところを誤って 'ParticipantRole' としたため、互換性を保持するためにそのままにしている。だが、'ParticipantRoleType'に変更することで問題が生じるかどうかは確認していない。
        // TODO: 破壊的変更のあるアップデートの際にあわせて、'ParticipantRoleType' に変更する
        name: 'ParticipantRole',
    });
    registerEnumType(PerformRollCallFailureType, {
        name: 'PerformRollCallFailureType',
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
