'use strict';

var tslib = require('tslib');
var FilePathModule = require('@flocon-trpg/core');
var core = require('@mikro-orm/core');
var typeGraphql = require('type-graphql');
var entity = require('../../../../entities/roomMessage/entity.js');
var WriteRoomSoundEffectFailureType = require('../../../../enums/WriteRoomSoundEffectFailureType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var filePath = require('../../../objects/filePath.js');
var roomMessage = require('../../../objects/roomMessage.js');
var utils = require('../../utils/utils.js');

let WriteRoomSoundEffectArgs = class WriteRoomSoundEffectArgs {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], WriteRoomSoundEffectArgs.prototype, "roomId", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", filePath.FilePath)
], WriteRoomSoundEffectArgs.prototype, "file", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Number)
], WriteRoomSoundEffectArgs.prototype, "volume", void 0);
WriteRoomSoundEffectArgs = tslib.__decorate([
    typeGraphql.ArgsType()
], WriteRoomSoundEffectArgs);
exports.WriteRoomSoundEffectResolver = class WriteRoomSoundEffectResolver {
    async writeRoomSoundEffect(args, context, pubSub) {
        const em = context.em;
        const authorizedUser = utils.ensureAuthorizedUser(context);
        const findResult = await utils.findRoomAndMyParticipant({
            em,
            userUid: authorizedUser.userUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                __tstype: roomMessage.WriteRoomSoundEffectFailureResultType,
                failureType: WriteRoomSoundEffectFailureType.WriteRoomSoundEffectFailureType.RoomNotFound,
            };
        }
        const { room, me } = findResult;
        if (me === undefined) {
            return {
                __tstype: roomMessage.WriteRoomSoundEffectFailureResultType,
                failureType: WriteRoomSoundEffectFailureType.WriteRoomSoundEffectFailureType.NotParticipant,
            };
        }
        if (me.role === FilePathModule.Spectator) {
            return {
                __tstype: roomMessage.WriteRoomSoundEffectFailureResultType,
                failureType: WriteRoomSoundEffectFailureType.WriteRoomSoundEffectFailureType.NotAuthorized,
            };
        }
        const entity$1 = new entity.RoomSe({
            filePath: args.file.path,
            fileSourceType: args.file.sourceType,
            volume: args.volume,
        });
        entity$1.createdBy = core.ref(authorizedUser);
        entity$1.room = core.ref(room);
        room.completeUpdatedAt = new Date();
        await em.persistAndFlush(entity$1);
        const result = {
            ...entity$1,
            __tstype: roomMessage.RoomSoundEffectType,
            messageId: entity$1.id,
            createdBy: authorizedUser.userUid,
            createdAt: entity$1.createdAt.getTime(),
            file: {
                path: entity$1.filePath,
                sourceType: entity$1.fileSourceType,
            },
        };
        const payload = {
            type: 'messageUpdatePayload',
            sendTo: findResult.participantIds(),
            roomId: args.roomId,
            createdBy: authorizedUser.userUid,
            visibleTo: undefined,
            value: result,
        };
        await utils.publishRoomEvent(pubSub, payload);
        return result;
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => roomMessage.WriteRoomSoundEffectResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(3)),
    tslib.__param(0, typeGraphql.Args()),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [WriteRoomSoundEffectArgs, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.WriteRoomSoundEffectResolver.prototype, "writeRoomSoundEffect", null);
exports.WriteRoomSoundEffectResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.WriteRoomSoundEffectResolver);
//# sourceMappingURL=resolver.js.map
