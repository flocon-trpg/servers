'use strict';

var tslib = require('tslib');
var FilePathModule = require('@flocon-trpg/core');
var typeGraphql = require('type-graphql');
var ResetRoomMessagesFailureType = require('../../../../enums/ResetRoomMessagesFailureType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var roomMessage = require('../../../objects/roomMessage.js');
var utils = require('../../utils/utils.js');

exports.ResetMessagesResolver = class ResetMessagesResolver {
    async resetMessages(roomId, context, pubSub) {
        const em = context.em;
        const authorizedUser = utils.ensureAuthorizedUser(context);
        const findResult = await utils.findRoomAndMyParticipant({
            em,
            userUid: authorizedUser.userUid,
            roomId,
        });
        if (findResult == null) {
            return {
                __tstype: roomMessage.ResetRoomMessagesResultType,
                failureType: ResetRoomMessagesFailureType.ResetRoomMessagesFailureType.RoomNotFound,
            };
        }
        const { room, me } = findResult;
        if (me === undefined) {
            return {
                __tstype: roomMessage.ResetRoomMessagesResultType,
                failureType: ResetRoomMessagesFailureType.ResetRoomMessagesFailureType.NotParticipant,
            };
        }
        if (me.role === FilePathModule.Spectator) {
            return {
                __tstype: roomMessage.ResetRoomMessagesResultType,
                failureType: ResetRoomMessagesFailureType.ResetRoomMessagesFailureType.NotAuthorized,
            };
        }
        for (const chatCh of await room.roomChatChs.loadItems()) {
            await chatCh.roomPubMsgs.init();
            chatCh.roomPubMsgs.getItems().forEach(x => em.remove(x));
            chatCh.roomPubMsgs.removeAll();
            em.persist(chatCh);
        }
        await room.roomPrvMsgs.init();
        room.roomPrvMsgs.getItems().forEach(x => em.remove(x));
        room.roomPrvMsgs.removeAll();
        await room.dicePieceLogs.init();
        room.dicePieceLogs.getItems().forEach(x => em.remove(x));
        room.dicePieceLogs.removeAll();
        await room.stringPieceLogs.init();
        room.stringPieceLogs.getItems().forEach(x => em.remove(x));
        room.stringPieceLogs.removeAll();
        room.completeUpdatedAt = new Date();
        em.persist(room);
        await em.flush();
        await utils.publishRoomEvent(pubSub, {
            type: 'roomMessagesResetPayload',
            sendTo: findResult.participantIds(),
            roomId,
        });
        return {
            __tstype: 'ResetRoomMessagesResult',
        };
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => roomMessage.ResetRoomMessagesResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(5)),
    tslib.__param(0, typeGraphql.Arg('roomId')),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [String, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.ResetMessagesResolver.prototype, "resetMessages", null);
exports.ResetMessagesResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.ResetMessagesResolver);
//# sourceMappingURL=resolver.js.map
