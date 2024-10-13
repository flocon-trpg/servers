'use strict';

var tslib = require('tslib');
var FilePathModule = require('@flocon-trpg/core');
var core = require('@mikro-orm/core');
var classValidator = require('class-validator');
var typeGraphql = require('type-graphql');
var entity = require('../../../../entities/roomMessage/entity.js');
var FileSourceType = require('../../../../enums/FileSourceType.js');
var WriteRoomPublicMessageFailureType = require('../../../../enums/WriteRoomPublicMessageFailureType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var roomMessage = require('../../../objects/roomMessage.js');
var utils = require('../../utils/utils.js');

let WritePublicMessageArgs = class WritePublicMessageArgs {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], WritePublicMessageArgs.prototype, "roomId", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    classValidator.MaxLength(10000),
    tslib.__metadata("design:type", String)
], WritePublicMessageArgs.prototype, "text", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    classValidator.MaxLength(50),
    tslib.__metadata("design:type", String)
], WritePublicMessageArgs.prototype, "textColor", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], WritePublicMessageArgs.prototype, "channelKey", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], WritePublicMessageArgs.prototype, "characterId", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    classValidator.MaxLength(1000),
    tslib.__metadata("design:type", String)
], WritePublicMessageArgs.prototype, "customName", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true, description: 'BCDiceのgameType。' }),
    tslib.__metadata("design:type", String)
], WritePublicMessageArgs.prototype, "gameType", void 0);
WritePublicMessageArgs = tslib.__decorate([
    typeGraphql.ArgsType()
], WritePublicMessageArgs);
const checkChannelKey = (channelKey, isSpectator) => {
    switch (channelKey) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case '10':
            if (isSpectator) {
                return WriteRoomPublicMessageFailureType.WriteRoomPublicMessageFailureType.NotAuthorized;
            }
            return null;
        case FilePathModule.$free:
            return null;
        case FilePathModule.$system:
            return WriteRoomPublicMessageFailureType.WriteRoomPublicMessageFailureType.NotAuthorized;
        default:
            return WriteRoomPublicMessageFailureType.WriteRoomPublicMessageFailureType.NotAllowedChannelKey;
    }
};
exports.WritePublicMessageResolver = class WritePublicMessageResolver {
    async writePublicMessage(args, context, pubSub) {
        const channelKey = args.channelKey;
        const em = context.em;
        const authorizedUser = utils.ensureAuthorizedUser(context);
        const findResult = await utils.findRoomAndMyParticipant({
            em,
            userUid: authorizedUser.userUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                __tstype: roomMessage.WriteRoomPublicMessageFailureResultType,
                failureType: WriteRoomPublicMessageFailureType.WriteRoomPublicMessageFailureType.RoomNotFound,
            };
        }
        const { room, me, roomState } = findResult;
        if (me === undefined) {
            return {
                __tstype: roomMessage.WriteRoomPublicMessageFailureResultType,
                failureType: WriteRoomPublicMessageFailureType.WriteRoomPublicMessageFailureType.NotParticipant,
            };
        }
        const channelKeyFailureType = checkChannelKey(channelKey, me.role === FilePathModule.Spectator);
        if (channelKeyFailureType != null) {
            return {
                __tstype: roomMessage.WriteRoomPublicMessageFailureResultType,
                failureType: WriteRoomPublicMessageFailureType.WriteRoomPublicMessageFailureType.NotAuthorized,
            };
        }
        let chara = undefined;
        if (args.characterId != null) {
            if (FilePathModule.isCharacterOwner({
                requestedBy: { type: FilePathModule.client, userUid: authorizedUser.userUid },
                characterId: args.characterId,
                currentRoomState: roomState,
            }) === true)
                chara = roomState.characters?.[args.characterId];
        }
        const entityResult = await utils.analyzeTextAndSetToEntity({
            type: 'RoomPubMsg',
            textSource: args.text,
            context: chara == null ? null : { type: 'chara', value: chara },
            createdBy: authorizedUser,
            room: roomState,
            gameType: args.gameType,
        });
        if (entityResult.isError) {
            return {
                __tstype: roomMessage.RoomMessageSyntaxErrorType,
                errorMessage: entityResult.error,
            };
        }
        const entity$1 = entityResult.value;
        entity$1.textColor = args.textColor == null ? undefined : utils.fixTextColor(args.textColor);
        let ch = await em.findOne(entity.RoomPubCh, { key: channelKey, room: room.id });
        if (ch == null) {
            ch = new entity.RoomPubCh({ key: channelKey });
            ch.room = core.ref(room);
            em.persist(ch);
        }
        entity$1.customName = args.customName;
        if (chara != null) {
            entity$1.charaStateId = args.characterId;
            entity$1.charaName = chara.name;
            entity$1.charaIsPrivate = chara.isPrivate;
            entity$1.charaImagePath = chara.image?.path;
            entity$1.charaImageSourceType = FileSourceType.FileSourceTypeModule.ofNullishString(chara.image?.sourceType);
            entity$1.charaPortraitImagePath = chara.portraitImage?.path;
            entity$1.charaPortraitImageSourceType = FileSourceType.FileSourceTypeModule.ofNullishString(chara.portraitImage?.sourceType);
        }
        entity$1.roomPubCh = core.ref(ch);
        room.completeUpdatedAt = new Date();
        await em.persistAndFlush(entity$1);
        const result = await utils.createRoomPublicMessage({
            msg: entity$1,
            channelKey,
        });
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
    typeGraphql.Mutation(() => roomMessage.WriteRoomPublicMessageResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(3)),
    tslib.__param(0, typeGraphql.Args()),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [WritePublicMessageArgs, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.WritePublicMessageResolver.prototype, "writePublicMessage", null);
exports.WritePublicMessageResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.WritePublicMessageResolver);
//# sourceMappingURL=resolver.js.map
