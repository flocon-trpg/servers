'use strict';

var tslib = require('tslib');
var FilePathModule = require('@flocon-trpg/core');
var result = require('@kizahasi/result');
var produce = require('immer');
var typeGraphql = require('type-graphql');
var PromoteFailureType = require('../../../../enums/PromoteFailureType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var utils = require('../../utils/utils.js');

let PromoteArgs = class PromoteArgs {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], PromoteArgs.prototype, "roomId", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], PromoteArgs.prototype, "password", void 0);
PromoteArgs = tslib.__decorate([
    typeGraphql.ArgsType()
], PromoteArgs);
let PromoteResult = class PromoteResult {
};
tslib.__decorate([
    typeGraphql.Field(() => PromoteFailureType.PromoteFailureType, { nullable: true }),
    tslib.__metadata("design:type", String)
], PromoteResult.prototype, "failureType", void 0);
PromoteResult = tslib.__decorate([
    typeGraphql.ObjectType()
], PromoteResult);
const promoteMeCore = async ({ roomId, context, strategy, }) => {
    const em = context.em;
    const authorizedUser = utils.ensureAuthorizedUser(context);
    const flushResult = await utils.operateAsAdminAndFlush({
        operationType: 'state',
        em,
        roomId,
        roomHistCount: undefined,
        operation: async (roomState, { room }) => {
            const me = roomState.participants?.[authorizedUser.userUid];
            if (me == null) {
                return result.Result.error(PromoteFailureType.PromoteFailureType.NotParticipant);
            }
            const strategyResult = await strategy({ me, room });
            switch (strategyResult) {
                case 'Master':
                case 'Player':
                case 'Spectator': {
                    const result$1 = produce(roomState, roomState => {
                        const me = roomState.participants?.[authorizedUser.userUid];
                        if (me == null) {
                            return;
                        }
                        me.role = strategyResult;
                    });
                    return result.Result.ok(result$1);
                }
                default:
                    return result.Result.error(strategyResult);
            }
        },
    });
    if (flushResult.isError) {
        if (flushResult.error.type === 'custom') {
            return { result: { failureType: flushResult.error.error }, payload: undefined };
        }
        throw FilePathModule.toOtError(flushResult.error.error);
    }
    switch (flushResult.value) {
        case utils.RoomNotFound:
            return { result: { failureType: PromoteFailureType.PromoteFailureType.NotFound }, payload: undefined };
        case utils.IdOperation:
            return {
                result: { failureType: PromoteFailureType.PromoteFailureType.NoNeedToPromote },
                payload: undefined,
            };
        default:
            return { result: {}, payload: flushResult.value };
    }
};
exports.PromoteToPlayerResolver = class PromoteToPlayerResolver {
    async promoteToPlayer(args, context, pubSub) {
        const { result, payload } = await promoteMeCore({
            ...args,
            context,
            strategy: async ({ me, room }) => {
                switch (me.role) {
                    case FilePathModule.Master:
                    case FilePathModule.Player:
                        return PromoteFailureType.PromoteFailureType.NoNeedToPromote;
                    case FilePathModule.Spectator: {
                        if (!(await utils.bcryptCompareNullable(args.password, room.playerPasswordHash))) {
                            return PromoteFailureType.PromoteFailureType.WrongPassword;
                        }
                        return FilePathModule.Player;
                    }
                    case null:
                    case undefined:
                        return PromoteFailureType.PromoteFailureType.NotParticipant;
                }
            },
        });
        if (payload != null) {
            await utils.publishRoomEvent(pubSub, payload);
        }
        return result;
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => PromoteResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Args()),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [PromoteArgs, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.PromoteToPlayerResolver.prototype, "promoteToPlayer", null);
exports.PromoteToPlayerResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.PromoteToPlayerResolver);
//# sourceMappingURL=resolver.js.map
