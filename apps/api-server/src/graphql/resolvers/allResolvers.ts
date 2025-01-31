import { AnswerRollCallResolver } from './mutations/answerRollCall/resolver';
import { ChangeParticipantNameResolver } from './mutations/changeParitipantName/resolver';
import { CloseRollCallResolver } from './mutations/closeRollCall/resolver';
import { CreateCustomDeckTemplateResolver } from './mutations/createDeckTemplate/resolver';
import { CreateFileTagResolver } from './mutations/createFileTag/resolver';
import { CreateRoomResolver } from './mutations/createRoom/resolver';
import { DeleteCustomDeckTemplateResolver } from './mutations/deleteDeckTemplate/resolver';
import { DeleteFileTagResolver } from './mutations/deleteFileTag/resolver';
import { DeleteFilesResolver } from './mutations/deleteFiles/resolver';
import { DeleteMessageResolver } from './mutations/deleteMessage/resolver';
import { DeleteRoomResolver } from './mutations/deleteRoom/resolver';
import { DeleteRoomAsAdminResolver } from './mutations/deleteRoomAsAdmin/resolver';
import { EditFileTagsResolver } from './mutations/editFileTags/resolver';
import { EditMessageResolver } from './mutations/editMessage/resolver';
import { EntryWithPasswordResolver } from './mutations/entryToServer/resolver';
import {
    JoinRoomAsPlayerResolver,
    JoinRoomAsSpectatorResolver,
} from './mutations/joinRoom/resolver';
import { LeaveRoomResolver } from './mutations/leaveRoom/resolver';
import { MakeMessageNotSecretResolver } from './mutations/makeMessageNotSecret/resolver';
import { OperateRoomResolver } from './mutations/operateRoom/resolver';
import { PerformRollCallResolver } from './mutations/performRollCall/resolver';
import { PromoteToPlayerResolver } from './mutations/promoteToPlayer/resolver';
import { RenameFilesResolver } from './mutations/renameFiles/resolver';
import { ResetMessagesResolver } from './mutations/resetMessages/resolver';
import { UpdateBookmarkResolver } from './mutations/updateBookmark/resolver';
import { UpdateDeckTemplateResolver } from './mutations/updateDeckTemplate/resolver';
import { UpdateWritingMessageStatusResolver } from './mutations/updateWritingMessageStatus/resolver';
import { WritePrivateMessageResolver } from './mutations/writePrivateMessage/resolver';
import { WritePublicMessageResolver } from './mutations/writePublicMessage/resolver';
import { WriteRoomSoundEffectResolver } from './mutations/writeRoomSoundEffect/resolver';
import { GetAvailableGameSystemsResolver } from './queries/getAvailableGameSystems/resolver';
import { GetCustomDeckTemplateResolver } from './queries/getCustomDeckTemplate/resolver';
import { GetCustomDeckTemplatesListResolver } from './queries/getCustomDeckTemplatesList/resolver';
import { GetDefaultDeckTemplatesListResolver } from './queries/getDefaultDeckTemplatesList/resolver';
import { GetDiceHelpMessageResolver } from './queries/getDiceHelpMessage/resolver';
import { GetFilesResolver } from './queries/getFiles/resolver';
import { GetLogResolver } from './queries/getLog/resolver';
import { GetRoomMessagesResolver } from './queries/getMessages/resolver';
import { GetMyRolesResolver } from './queries/getMyRoles/resolver';
import { GetRoomResolver } from './queries/getRoom/resolver';
import { GetRoomAsListItemResolver } from './queries/getRoomAsListItem/resolver';
import { GetRoomConnectionsResolver } from './queries/getRoomConnections/resolver';
import { GetRoomsListResolver } from './queries/getRoomsList/resolver';
import { GetServerInfoResolver } from './queries/getServerInfo/resolver';
import { RoomEventResolver } from './subsciptions/roomEvent/resolver';

export const allResolvers = [
    AnswerRollCallResolver,
    ChangeParticipantNameResolver,
    CloseRollCallResolver,
    CreateCustomDeckTemplateResolver,
    CreateFileTagResolver,
    CreateRoomResolver,
    DeleteCustomDeckTemplateResolver,
    DeleteFilesResolver,
    DeleteFileTagResolver,
    DeleteMessageResolver,
    DeleteRoomResolver,
    DeleteRoomAsAdminResolver,
    EditFileTagsResolver,
    EditMessageResolver,
    EntryWithPasswordResolver,
    JoinRoomAsPlayerResolver,
    JoinRoomAsSpectatorResolver,
    LeaveRoomResolver,
    MakeMessageNotSecretResolver,
    OperateRoomResolver,
    PerformRollCallResolver,
    PromoteToPlayerResolver,
    RenameFilesResolver,
    ResetMessagesResolver,
    UpdateBookmarkResolver,
    UpdateDeckTemplateResolver,
    UpdateWritingMessageStatusResolver,
    WritePrivateMessageResolver,
    WritePublicMessageResolver,
    WriteRoomSoundEffectResolver,

    GetAvailableGameSystemsResolver,
    GetCustomDeckTemplateResolver,
    GetDefaultDeckTemplatesListResolver,
    GetCustomDeckTemplatesListResolver,
    GetDiceHelpMessageResolver,
    GetFilesResolver,
    GetLogResolver,
    GetRoomMessagesResolver,
    GetMyRolesResolver,
    GetRoomResolver,
    GetRoomAsListItemResolver,
    GetRoomConnectionsResolver,
    GetRoomsListResolver,
    GetServerInfoResolver,

    RoomEventResolver,
] as const;
