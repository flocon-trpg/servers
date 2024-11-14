'use strict';

var tslib = require('tslib');
var FilePathModule = require('@flocon-trpg/core');
var core = require('@mikro-orm/core');
var typeGraphql = require('type-graphql');
var entity = require('../../../../entities/roomMessage/entity.js');
var GetRoomLogFailureType = require('../../../../enums/GetRoomLogFailureType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var roomMessage = require('../../../objects/roomMessage.js');
var utils = require('../../utils/utils.js');

let GetLogArgs = class GetLogArgs {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], GetLogArgs.prototype, "roomId", void 0);
GetLogArgs = tslib.__decorate([
    typeGraphql.ArgsType()
], GetLogArgs);
const writeSystemMessage = async ({ em, text, room, }) => {
    const entity$1 = new entity.RoomPubMsg({ initText: text, initTextSource: undefined });
    entity$1.initText = text;
    let ch = await em.findOne(entity.RoomPubCh, { key: FilePathModule.$system, room: room.id });
    if (ch == null) {
        ch = new entity.RoomPubCh({ key: FilePathModule.$system });
        ch.room = core.ref(room);
        em.persist(ch);
    }
    entity$1.roomPubCh = core.ref(ch);
    em.persist(entity$1);
    return entity$1;
};
exports.GetLogResolver = class GetLogResolver {
    async getLog(args, context, pubSub) {
        const em = context.em;
        const authorizedUserUid = utils.ensureAuthorizedUser(context).userUid;
        const findResult = await utils.findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                __tstype: roomMessage.GetRoomLogFailureResultType,
                failureType: GetRoomLogFailureType.GetRoomLogFailureType.RoomNotFound,
            };
        }
        const { room, me } = findResult;
        if (me?.role === undefined) {
            return {
                __tstype: roomMessage.GetRoomLogFailureResultType,
                failureType: GetRoomLogFailureType.GetRoomLogFailureType.NotParticipant,
            };
        }
        if (me.role === FilePathModule.Spectator) {
            return {
                __tstype: roomMessage.GetRoomLogFailureResultType,
                failureType: GetRoomLogFailureType.GetRoomLogFailureType.NotAuthorized,
            };
        }
        const messages = await utils.getRoomMessagesFromDb(room, authorizedUserUid, 'log');
        em.clear();
        const systemMessageEntity = await writeSystemMessage({
            em,
            text: `${me.name}(${authorizedUserUid}) が全てのログを出力しました。`,
            room: room,
        });
        await em.flush();
        await utils.publishRoomEvent(pubSub, {
            type: 'messageUpdatePayload',
            sendTo: findResult.participantIds(),
            roomId: room.id,
            value: await utils.createRoomPublicMessage({
                msg: systemMessageEntity,
                channelKey: FilePathModule.$system,
            }),
            createdBy: undefined,
            visibleTo: undefined,
        });
        return messages;
    }
};
tslib.__decorate([
    typeGraphql.Query(() => roomMessage.GetRoomLogResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(10)),
    tslib.__param(0, typeGraphql.Args()),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [GetLogArgs, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.GetLogResolver.prototype, "getLog", null);
exports.GetLogResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.GetLogResolver);

exports.writeSystemMessage = writeSystemMessage;
//# sourceMappingURL=resolver.js.map
