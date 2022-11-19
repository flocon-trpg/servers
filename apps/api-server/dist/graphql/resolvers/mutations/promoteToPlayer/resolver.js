'use strict';

var tslib = require('tslib');
var FilePathModule = require('@flocon-trpg/core');
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
    const findResult = await utils.findRoomAndMyParticipant({
        em,
        userUid: authorizedUser.userUid,
        roomId,
    });
    if (findResult == null) {
        return {
            result: {
                failureType: PromoteFailureType.PromoteFailureType.NotFound,
            },
            payload: undefined,
        };
    }
    const { room, me } = findResult;
    const participantUserUids = findResult.participantIds();
    if (me == null) {
        return {
            result: {
                failureType: PromoteFailureType.PromoteFailureType.NotParticipant,
            },
            payload: undefined,
        };
    }
    const strategyResult = await strategy({ me, room });
    switch (strategyResult) {
        case PromoteFailureType.PromoteFailureType.NoNeedToPromote: {
            return {
                result: {
                    failureType: PromoteFailureType.PromoteFailureType.NoNeedToPromote,
                },
                payload: undefined,
            };
        }
        case PromoteFailureType.PromoteFailureType.WrongPassword: {
            return {
                result: {
                    failureType: PromoteFailureType.PromoteFailureType.WrongPassword,
                },
                payload: undefined,
            };
        }
        case PromoteFailureType.PromoteFailureType.NotParticipant: {
            return {
                result: {
                    failureType: PromoteFailureType.PromoteFailureType.NotParticipant,
                },
                payload: undefined,
            };
        }
        default: {
            return {
                result: {
                    failureType: undefined,
                },
                payload: (await utils.operateParticipantAndFlush({
                    em,
                    room,
                    roomHistCount: context.serverConfig.roomHistCount,
                    participantUserUids,
                    myUserUid: authorizedUser.userUid,
                    update: {
                        role: { newValue: strategyResult },
                    },
                }))?.payload,
            };
        }
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
