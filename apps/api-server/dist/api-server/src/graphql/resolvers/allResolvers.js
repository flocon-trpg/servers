'use strict';

var resolver = require('./mutations/answerRollCall/resolver.js');
var resolver$1 = require('./mutations/changeParitipantName/resolver.js');
var resolver$2 = require('./mutations/closeRollCall/resolver.js');
var resolver$3 = require('./mutations/createFileTag/resolver.js');
var resolver$4 = require('./mutations/createRoom/resolver.js');
var resolver$6 = require('./mutations/deleteFileTag/resolver.js');
var resolver$5 = require('./mutations/deleteFiles/resolver.js');
var resolver$7 = require('./mutations/deleteMessage/resolver.js');
var resolver$8 = require('./mutations/deleteRoom/resolver.js');
var resolver$9 = require('./mutations/deleteRoomAsAdmin/resolver.js');
var resolver$a = require('./mutations/editFileTags/resolver.js');
var resolver$b = require('./mutations/editMessage/resolver.js');
var resolver$c = require('./mutations/entryToServer/resolver.js');
var resolver$d = require('./mutations/joinRoom/resolver.js');
var resolver$e = require('./mutations/leaveRoom/resolver.js');
var resolver$f = require('./mutations/makeMessageNotSecret/resolver.js');
var resolver$g = require('./mutations/operate/resolver.js');
var resolver$h = require('./mutations/performRollCall/resolver.js');
var resolver$i = require('./mutations/ping/resolver.js');
var resolver$j = require('./mutations/promoteToPlayer/resolver.js');
var resolver$k = require('./mutations/renameFiles/resolver.js');
var resolver$l = require('./mutations/resetMessages/resolver.js');
var resolver$m = require('./mutations/updateBookmark/resolver.js');
var resolver$n = require('./mutations/updateWritingMessageStatus/resolver.js');
var resolver$o = require('./mutations/writePrivateMessage/resolver.js');
var resolver$p = require('./mutations/writePublicMessage/resolver.js');
var resolver$q = require('./mutations/writeRoomSoundEffect/resolver.js');
var resolver$r = require('./queries/getAvailableGameSystems/resolver.js');
var resolver$s = require('./queries/getDiceHelpMessage/resolver.js');
var resolver$t = require('./queries/getFiles/resolver.js');
var resolver$u = require('./queries/getLog/resolver.js');
var resolver$v = require('./queries/getMessages/resolver.js');
var resolver$w = require('./queries/getMyRoles/resolver.js');
var resolver$x = require('./queries/getRoom/resolver.js');
var resolver$y = require('./queries/getRoomAsListItem/resolver.js');
var resolver$z = require('./queries/getRoomConnections/resolver.js');
var resolver$A = require('./queries/getRoomsList/resolver.js');
var resolver$B = require('./queries/getServerInfo/resolver.js');
var resolver$C = require('./queries/isEntry/resolver.js');
var resolver$D = require('./subsciptions/pong/resolver.js');
var resolver$E = require('./subsciptions/roomEvent/resolver.js');

const allResolvers = [
    resolver.AnswerRollCallResolver,
    resolver$1.ChangeParticipantNameResolver,
    resolver$2.CloseRollCallResolver,
    resolver$3.CreateFileTagResolver,
    resolver$4.CreateRoomResolver,
    resolver$5.DeleteFilesResolver,
    resolver$6.DeleteFileTagResolver,
    resolver$7.DeleteMessageResolver,
    resolver$8.DeleteRoomResolver,
    resolver$9.DeleteRoomAsAdminResolver,
    resolver$a.EditFileTagsResolver,
    resolver$b.EditMessageResolver,
    resolver$c.EntryToServerResolver,
    resolver$d.JoinRoomResolver,
    resolver$e.LeaveRoomResolver,
    resolver$f.MakeMessageNotSecretResolver,
    resolver$g.OperateResolver,
    resolver$h.PerformRollCallResolver,
    resolver$i.PingResolver,
    resolver$j.PromoteToPlayerResolver,
    resolver$k.RenameFilesResolver,
    resolver$l.ResetMessagesResolver,
    resolver$m.UpdateBookmarkResolver,
    resolver$n.UpdateWritingMessageStatusResolver,
    resolver$o.WritePrivateMessageResolver,
    resolver$p.WritePublicMessageResolver,
    resolver$q.WriteRoomSoundEffectResolver,
    resolver$r.GetAvailableGameSystemsResolver,
    resolver$s.GetDiceHelpMessageResolver,
    resolver$t.GetFilesResolver,
    resolver$u.GetLogResolver,
    resolver$v.GetRoomMessagesResolver,
    resolver$w.GetMyRolesResolver,
    resolver$x.GetRoomResolver,
    resolver$y.GetRoomAsListItemResolver,
    resolver$z.GetRoomConnectionsResolver,
    resolver$A.GetRoomsListResolver,
    resolver$B.GetServerInfoResolver,
    resolver$C.IsEntryResolver,
    resolver$D.PongResolver,
    resolver$E.RoomEventResolver,
];

exports.allResolvers = allResolvers;
//# sourceMappingURL=allResolvers.js.map
