import { ChangeParticipantNameResolver } from './mutations/changeParitipantName/resolver';
import { CreateFileTagResolver } from './mutations/createFileTag/resolver';
import { CreateRoomResolver } from './mutations/createRoom/resolver';
import { DeleteFilesResolver } from './mutations/deleteFiles/resolver';
import { DeleteFileTagResolver } from './mutations/deleteFileTag/resolver';
import { DeleteMessageResolver } from './mutations/deleteMessage/resolver';
import { DeleteRoomResolver } from './mutations/deleteRoom/resolver';
import { DeleteRoomAsAdminResolver } from './mutations/deleteRoomAsAdmin/resolver';
import { EditFileTagsResolver } from './mutations/editFileTags/resolver';
import { EditMessageResolver } from './mutations/editMessage/resolver';
import { EntryToServerResolver } from './mutations/entryToServer/resolver';
import { JoinRoomResolver } from './mutations/joinRoom/resolver';
import { LeaveRoomResolver } from './mutations/leaveRoom/resolver';
import { MakeMessageNotSecretResolver } from './mutations/makeMessageNotSecret/resolver';
import { OperateResolver } from './mutations/operate/resolver';
import { PingResolver } from './mutations/ping/resolver';
import { PromoteToPlayerResolver } from './mutations/promoteToPlayer/resolver';
import { RenameFilesResolver } from './mutations/renameFiles/resolver';
import { ResetMessagesResolver } from './mutations/resetMessages/resolver';
import { UpdateBookmarkResolver } from './mutations/updateBookmark/resolver';
import { UpdateWritingMessageStatusResolver } from './mutations/updateWritingMessageStatus/resolver';
import { WritePrivateMessageResolver } from './mutations/writePrivateMessage/resolver';
import { WritePublicMessageResolver } from './mutations/writePublicMessage/resolver';
import { WriteRoomSoundEffectResolver } from './mutations/writeRoomSoundEffect/resolver';
import { GetAvailableGameSystemsResolver } from './queries/getAvailableGameSystems/resolver';
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
import { IsEntryResolver } from './queries/isEntry/resolver';
import { PongResolver } from './subsciptions/pong/resolver';
import { RoomEventResolver } from './subsciptions/roomEvent/resolver';

export const allResolvers = [
    ChangeParticipantNameResolver,
    CreateFileTagResolver,
    CreateRoomResolver,
    DeleteFilesResolver,
    DeleteFileTagResolver,
    DeleteMessageResolver,
    DeleteRoomResolver,
    DeleteRoomAsAdminResolver,
    EditFileTagsResolver,
    EditMessageResolver,
    EntryToServerResolver,
    JoinRoomResolver,
    LeaveRoomResolver,
    MakeMessageNotSecretResolver,
    OperateResolver,
    PingResolver,
    PromoteToPlayerResolver,
    RenameFilesResolver,
    ResetMessagesResolver,
    UpdateBookmarkResolver,
    UpdateWritingMessageStatusResolver,
    WritePrivateMessageResolver,
    WritePublicMessageResolver,
    WriteRoomSoundEffectResolver,

    GetAvailableGameSystemsResolver,
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
    IsEntryResolver,

    PongResolver,
    RoomEventResolver,
] as const;
