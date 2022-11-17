'use strict';

var resolver = require('./mutations/changeParitipantName/resolver.js');
var resolver$1 = require('./mutations/createFileTag/resolver.js');
var resolver$2 = require('./mutations/createRoom/resolver.js');
var resolver$4 = require('./mutations/deleteFileTag/resolver.js');
var resolver$3 = require('./mutations/deleteFiles/resolver.js');
var resolver$5 = require('./mutations/deleteMessage/resolver.js');
var resolver$6 = require('./mutations/deleteRoom/resolver.js');
var resolver$7 = require('./mutations/deleteRoomAsAdmin/resolver.js');
var resolver$8 = require('./mutations/editFileTags/resolver.js');
var resolver$9 = require('./mutations/editMessage/resolver.js');
var resolver$a = require('./mutations/entryToServer/resolver.js');
var resolver$b = require('./mutations/joinRoom/resolver.js');
var resolver$c = require('./mutations/leaveRoom/resolver.js');
var resolver$d = require('./mutations/makeMessageNotSecret/resolver.js');
var resolver$e = require('./mutations/operate/resolver.js');
var resolver$f = require('./mutations/ping/resolver.js');
var resolver$g = require('./mutations/promoteToPlayer/resolver.js');
var resolver$h = require('./mutations/renameFiles/resolver.js');
var resolver$i = require('./mutations/resetMessages/resolver.js');
var resolver$j = require('./mutations/updateBookmark/resolver.js');
var resolver$k = require('./mutations/updateWritingMessageStatus/resolver.js');
var resolver$l = require('./mutations/writePrivateMessage/resolver.js');
var resolver$m = require('./mutations/writePublicMessage/resolver.js');
var resolver$n = require('./mutations/writeRoomSoundEffect/resolver.js');
var resolver$o = require('./queries/getAvailableGameSystems/resolver.js');
var resolver$p = require('./queries/getDiceHelpMessage/resolver.js');
var resolver$q = require('./queries/getFiles/resolver.js');
var resolver$r = require('./queries/getLog/resolver.js');
var resolver$s = require('./queries/getMessages/resolver.js');
var resolver$t = require('./queries/getMyRoles/resolver.js');
var resolver$u = require('./queries/getRoom/resolver.js');
var resolver$v = require('./queries/getRoomAsListItem/resolver.js');
var resolver$w = require('./queries/getRoomConnections/resolver.js');
var resolver$x = require('./queries/getRoomsList/resolver.js');
var resolver$y = require('./queries/getServerInfo/resolver.js');
var resolver$z = require('./queries/isEntry/resolver.js');
var resolver$A = require('./subsciptions/pong/resolver.js');
var resolver$B = require('./subsciptions/roomEvent/resolver.js');

const allResolvers = [
    resolver.ChangeParticipantNameResolver,
    resolver$1.CreateFileTagResolver,
    resolver$2.CreateRoomResolver,
    resolver$3.DeleteFilesResolver,
    resolver$4.DeleteFileTagResolver,
    resolver$5.DeleteMessageResolver,
    resolver$6.DeleteRoomResolver,
    resolver$7.DeleteRoomAsAdminResolver,
    resolver$8.EditFileTagsResolver,
    resolver$9.EditMessageResolver,
    resolver$a.EntryToServerResolver,
    resolver$b.JoinRoomResolver,
    resolver$c.LeaveRoomResolver,
    resolver$d.MakeMessageNotSecretResolver,
    resolver$e.OperateResolver,
    resolver$f.PingResolver,
    resolver$g.PromoteToPlayerResolver,
    resolver$h.RenameFilesResolver,
    resolver$i.ResetMessagesResolver,
    resolver$j.UpdateBookmarkResolver,
    resolver$k.UpdateWritingMessageStatusResolver,
    resolver$l.WritePrivateMessageResolver,
    resolver$m.WritePublicMessageResolver,
    resolver$n.WriteRoomSoundEffectResolver,
    resolver$o.GetAvailableGameSystemsResolver,
    resolver$p.GetDiceHelpMessageResolver,
    resolver$q.GetFilesResolver,
    resolver$r.GetLogResolver,
    resolver$s.GetRoomMessagesResolver,
    resolver$t.GetMyRolesResolver,
    resolver$u.GetRoomResolver,
    resolver$v.GetRoomAsListItemResolver,
    resolver$w.GetRoomConnectionsResolver,
    resolver$x.GetRoomsListResolver,
    resolver$y.GetServerInfoResolver,
    resolver$z.IsEntryResolver,
    resolver$A.PongResolver,
    resolver$B.RoomEventResolver,
];

exports.allResolvers = allResolvers;
//# sourceMappingURL=allResolvers.js.map
