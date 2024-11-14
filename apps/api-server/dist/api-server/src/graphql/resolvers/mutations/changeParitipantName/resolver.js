'use strict';

var tslib = require('tslib');
var FilePathModule = require('@flocon-trpg/core');
var utils$1 = require('@flocon-trpg/utils');
var result = require('@kizahasi/result');
var immer = require('immer');
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
        const flushResult = await utils.operateAsAdminAndFlush({
            em,
            operationType: 'state',
            operation: roomState => {
                const me = roomState.participants?.[authorizedUserUid];
                if (me == null || me.role == null) {
                    return result.Result.error(ChangeParticipantNameFailureType.ChangeParticipantNameFailureType.NotParticipant);
                }
                const result$1 = immer.produce(roomState, roomState => {
                    const me = roomState.participants?.[authorizedUserUid];
                    if (me == null) {
                        return;
                    }
                    me.name = convertToMaxLength100String.convertToMaxLength100String(args.newName);
                });
                return result.Result.ok(result$1);
            },
            roomId: args.roomId,
            roomHistCount: undefined,
        });
        if (flushResult.isError) {
            if (flushResult.error.type === 'custom') {
                return { failureType: flushResult.error.error };
            }
            throw FilePathModule.toOtError(flushResult.error.error);
        }
        switch (flushResult.value) {
            case utils.RoomNotFound:
                return { failureType: ChangeParticipantNameFailureType.ChangeParticipantNameFailureType.NotFound };
            case utils.IdOperation:
                utils$1.loggerRef.debug('An operation in changeParticipantName is id. This should not happen.');
                return { failureType: ChangeParticipantNameFailureType.ChangeParticipantNameFailureType.NotParticipant };
        }
        await utils.publishRoomEvent(pubSub, flushResult.value);
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
