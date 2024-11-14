'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var entity = require('../../../../entities/roomMessage/entity.js');
var MakeMessageNotSecretFailureType = require('../../../../enums/MakeMessageNotSecretFailureType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var roomMessage = require('../../../objects/roomMessage.js');
var utils = require('../../utils/utils.js');

let MessageIdArgs = class MessageIdArgs {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], MessageIdArgs.prototype, "roomId", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], MessageIdArgs.prototype, "messageId", void 0);
MessageIdArgs = tslib.__decorate([
    typeGraphql.ArgsType()
], MessageIdArgs);
exports.MakeMessageNotSecretResolver = class MakeMessageNotSecretResolver {
    async makeMessageNotSecret(args, context, pubSub) {
        const em = context.em;
        const authorizedUserUid = utils.ensureAuthorizedUser(context).userUid;
        const findResult = await utils.findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                failureType: MakeMessageNotSecretFailureType.MakeMessageNotSecretFailureType.RoomNotFound,
            };
        }
        const { room, me } = findResult;
        if (me === undefined) {
            return {
                failureType: MakeMessageNotSecretFailureType.MakeMessageNotSecretFailureType.NotParticipant,
            };
        }
        const publicMsg = await em.findOne(entity.RoomPubMsg, { id: args.messageId });
        if (publicMsg != null) {
            const createdBy = await publicMsg.createdBy?.loadProperty('userUid');
            if (createdBy !== authorizedUserUid) {
                return {
                    failureType: MakeMessageNotSecretFailureType.MakeMessageNotSecretFailureType.NotYourMessage,
                };
            }
            if (!publicMsg.isSecret) {
                return {
                    failureType: MakeMessageNotSecretFailureType.MakeMessageNotSecretFailureType.NotSecret,
                };
            }
            publicMsg.isSecret = false;
            room.completeUpdatedAt = new Date();
            await em.flush();
            const payloadValue = utils.createRoomPublicMessageUpdate(publicMsg);
            await utils.publishRoomEvent(pubSub, {
                type: 'messageUpdatePayload',
                sendTo: findResult.participantIds(),
                roomId: room.id,
                visibleTo: undefined,
                createdBy,
                value: payloadValue,
            });
            return {};
        }
        const privateMsg = await em.findOne(entity.RoomPrvMsg, { id: args.messageId });
        if (privateMsg != null) {
            const createdBy = await privateMsg.createdBy?.loadProperty('userUid');
            if (createdBy !== authorizedUserUid) {
                return {
                    failureType: MakeMessageNotSecretFailureType.MakeMessageNotSecretFailureType.NotYourMessage,
                };
            }
            if (!privateMsg.isSecret) {
                return {
                    failureType: MakeMessageNotSecretFailureType.MakeMessageNotSecretFailureType.NotSecret,
                };
            }
            privateMsg.isSecret = false;
            room.completeUpdatedAt = new Date();
            await em.flush();
            const payloadValue = utils.createRoomPrivateMessageUpdate(privateMsg);
            await utils.publishRoomEvent(pubSub, {
                type: 'messageUpdatePayload',
                sendTo: findResult.participantIds(),
                roomId: room.id,
                visibleTo: (await privateMsg.visibleTo.loadItems()).map(user => user.userUid),
                createdBy,
                value: payloadValue,
            });
            return {};
        }
        return {
            failureType: MakeMessageNotSecretFailureType.MakeMessageNotSecretFailureType.MessageNotFound,
        };
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => roomMessage.MakeMessageNotSecretResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Args()),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [MessageIdArgs, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.MakeMessageNotSecretResolver.prototype, "makeMessageNotSecret", null);
exports.MakeMessageNotSecretResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.MakeMessageNotSecretResolver);
//# sourceMappingURL=resolver.js.map
