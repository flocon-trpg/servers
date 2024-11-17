'use strict';

var tslib = require('tslib');
var FilePathModule = require('@flocon-trpg/core');
var core = require('@mikro-orm/core');
var classValidator = require('class-validator');
var typeGraphql = require('type-graphql');
var entity = require('../../../../entities/user/entity.js');
var FileSourceType = require('../../../../enums/FileSourceType.js');
var WriteRoomPrivateMessageFailureType = require('../../../../enums/WriteRoomPrivateMessageFailureType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var roomMessage = require('../../../objects/roomMessage.js');
var utils = require('../../utils/utils.js');

let WritePrivateMessageArgs = class WritePrivateMessageArgs {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], WritePrivateMessageArgs.prototype, "roomId", void 0);
tslib.__decorate([
    typeGraphql.Field(() => [String]),
    tslib.__metadata("design:type", Array)
], WritePrivateMessageArgs.prototype, "visibleTo", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    classValidator.MaxLength(10000),
    tslib.__metadata("design:type", String)
], WritePrivateMessageArgs.prototype, "text", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    classValidator.MaxLength(50),
    tslib.__metadata("design:type", String)
], WritePrivateMessageArgs.prototype, "textColor", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], WritePrivateMessageArgs.prototype, "characterId", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    classValidator.MaxLength(1000),
    tslib.__metadata("design:type", String)
], WritePrivateMessageArgs.prototype, "customName", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true, description: 'BCDiceのgameType。' }),
    tslib.__metadata("design:type", String)
], WritePrivateMessageArgs.prototype, "gameType", void 0);
WritePrivateMessageArgs = tslib.__decorate([
    typeGraphql.ArgsType()
], WritePrivateMessageArgs);
exports.WritePrivateMessageResolver = class WritePrivateMessageResolver {
    async writePrivateMessage(args, context, pubSub) {
        if (args.visibleTo.length >= 1000) {
            throw new Error('visibleTo.length is too large');
        }
        const em = context.em;
        const authorizedUser = utils.ensureAuthorizedUser(context);
        const findResult = await utils.findRoomAndMyParticipant({
            em,
            userUid: authorizedUser.userUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                __tstype: roomMessage.WriteRoomPrivateMessageFailureResultType,
                failureType: WriteRoomPrivateMessageFailureType.WriteRoomPrivateMessageFailureType.RoomNotFound,
            };
        }
        const { room, me, roomState } = findResult;
        if (me === undefined) {
            return {
                __tstype: roomMessage.WriteRoomPrivateMessageFailureResultType,
                failureType: WriteRoomPrivateMessageFailureType.WriteRoomPrivateMessageFailureType.NotParticipant,
            };
        }
        const visibleTo = new Set(args.visibleTo);
        visibleTo.add(authorizedUser.userUid);
        await authorizedUser.visibleRoomPrvMsgs.init({ where: { room: { id: room.id } } });
        let chara = undefined;
        if (args.characterId != null) {
            if (FilePathModule.isCharacterOwner({
                requestedBy: { type: FilePathModule.client, userUid: authorizedUser.userUid },
                characterId: args.characterId,
                currentRoomState: roomState,
            }) === true) {
                chara = roomState.characters?.[args.characterId];
            }
        }
        const entityResult = await utils.analyzeTextAndSetToEntity({
            type: 'RoomPrvMsg',
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
        if (args.textColor != null) {
            utils.fixTextColor(args.textColor);
        }
        for (const visibleToElement of visibleTo) {
            const user = await em.findOne(entity.User, { userUid: visibleToElement });
            if (user == null) {
                return {
                    __tstype: roomMessage.WriteRoomPrivateMessageFailureResultType,
                    failureType: WriteRoomPrivateMessageFailureType.WriteRoomPrivateMessageFailureType.VisibleToIsInvalid,
                };
            }
            entity$1.visibleTo.add(user);
            user.visibleRoomPrvMsgs.add(entity$1);
        }
        entity$1.customName = args.customName;
        if (chara != null) {
            entity$1.charaStateId = args.characterId;
            entity$1.charaName = chara.name;
            entity$1.charaIsPrivate = chara.isPrivate;
            entity$1.charaImagePath = chara.image?.path;
            entity$1.charaImageSourceType = FileSourceType.FileSourceTypeModule.ofNullishString(chara.portraitImage?.sourceType);
            entity$1.charaPortraitImagePath = chara.portraitImage?.path;
            entity$1.charaPortraitImageSourceType = FileSourceType.FileSourceTypeModule.ofNullishString(chara.portraitImage?.sourceType);
        }
        entity$1.room = core.ref(room);
        room.completeUpdatedAt = new Date();
        await em.persistAndFlush(entity$1);
        const visibleToArray = [...visibleTo].sort();
        const result = await utils.createRoomPrivateMessage({
            msg: entity$1,
            visibleTo: visibleToArray,
        });
        const payload = {
            type: 'messageUpdatePayload',
            sendTo: findResult.participantIds(),
            roomId: args.roomId,
            createdBy: authorizedUser.userUid,
            visibleTo: visibleToArray,
            value: result,
        };
        await utils.publishRoomEvent(pubSub, payload);
        return result;
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => roomMessage.WriteRoomPrivateMessageResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(3)),
    tslib.__param(0, typeGraphql.Args()),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [WritePrivateMessageArgs, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.WritePrivateMessageResolver.prototype, "writePrivateMessage", null);
exports.WritePrivateMessageResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.WritePrivateMessageResolver);
//# sourceMappingURL=resolver.js.map
