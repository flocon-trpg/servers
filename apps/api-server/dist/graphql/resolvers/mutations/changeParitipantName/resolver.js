'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var ChangeParticipantNameFailureType = require('../../../../enums/ChangeParticipantNameFailureType.js');
var convertToMaxLength100String = require('../../../../utils/convertToMaxLength100String.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var utils = require('../../utils/utils.js');

let ChangeParticipantNameArgs = class ChangeParticipantNameArgs {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], ChangeParticipantNameArgs.prototype, "roomId", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], ChangeParticipantNameArgs.prototype, "newName", void 0);
ChangeParticipantNameArgs = tslib.__decorate([
    typeGraphql.ArgsType()
], ChangeParticipantNameArgs);
let ChangeParticipantNameResult = class ChangeParticipantNameResult {
};
tslib.__decorate([
    typeGraphql.Field(() => ChangeParticipantNameFailureType.ChangeParticipantNameFailureType, { nullable: true }),
    tslib.__metadata("design:type", String)
], ChangeParticipantNameResult.prototype, "failureType", void 0);
ChangeParticipantNameResult = tslib.__decorate([
    typeGraphql.ObjectType()
], ChangeParticipantNameResult);
exports.ChangeParticipantNameResolver = class ChangeParticipantNameResolver {
    async changeParticipantName(args, context, pubSub) {
        const em = context.em;
        const authorizedUserUid = utils.ensureAuthorizedUser(context).userUid;
        const findResult = await utils.findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                failureType: ChangeParticipantNameFailureType.ChangeParticipantNameFailureType.NotFound,
            };
        }
        const { room, me } = findResult;
        const participantUserUids = findResult.participantIds();
        if (me == null || me.role == null) {
            return {
                failureType: ChangeParticipantNameFailureType.ChangeParticipantNameFailureType.NotParticipant,
            };
        }
        const { payload } = await utils.operateParticipantAndFlush({
            em,
            myUserUid: authorizedUserUid,
            update: {
                name: { newValue: convertToMaxLength100String.convertToMaxLength100String(args.newName) },
            },
            room,
            roomHistCount: context.serverConfig.roomHistCount,
            participantUserUids,
        });
        if (payload != null) {
            await utils.publishRoomEvent(pubSub, payload);
        }
        return {
            failureType: undefined,
        };
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => ChangeParticipantNameResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Args()),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [ChangeParticipantNameArgs, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.ChangeParticipantNameResolver.prototype, "changeParticipantName", null);
exports.ChangeParticipantNameResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.ChangeParticipantNameResolver);
//# sourceMappingURL=resolver.js.map
