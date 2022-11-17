'use strict';

var tslib = require('tslib');
var FilePathModule = require('@flocon-trpg/core');
var typeGraphql = require('type-graphql');
var JoinRoomFailureType = require('../../../../enums/JoinRoomFailureType.js');
var convertToMaxLength100String = require('../../../../utils/convertToMaxLength100String.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var room = require('../../../objects/room.js');
var utils = require('../../utils/utils.js');

let JoinRoomSuccessResult = class JoinRoomSuccessResult {
};
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", room.RoomOperation)
], JoinRoomSuccessResult.prototype, "operation", void 0);
JoinRoomSuccessResult = tslib.__decorate([
    typeGraphql.ObjectType()
], JoinRoomSuccessResult);
let JoinRoomFailureResult = class JoinRoomFailureResult {
};
tslib.__decorate([
    typeGraphql.Field(() => JoinRoomFailureType.JoinRoomFailureType),
    tslib.__metadata("design:type", String)
], JoinRoomFailureResult.prototype, "failureType", void 0);
JoinRoomFailureResult = tslib.__decorate([
    typeGraphql.ObjectType()
], JoinRoomFailureResult);
const JoinRoomResult = typeGraphql.createUnionType({
    name: 'JoinRoomResult',
    types: () => [JoinRoomSuccessResult, JoinRoomFailureResult],
    resolveType: value => {
        if ('operation' in value) {
            return JoinRoomSuccessResult;
        }
        if ('failureType' in value) {
            return JoinRoomFailureResult;
        }
        return undefined;
    },
});
let JoinRoomArgs = class JoinRoomArgs {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], JoinRoomArgs.prototype, "id", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], JoinRoomArgs.prototype, "name", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], JoinRoomArgs.prototype, "password", void 0);
JoinRoomArgs = tslib.__decorate([
    typeGraphql.ArgsType()
], JoinRoomArgs);
const joinRoomCore = async ({ args, context, strategy, }) => {
    const em = context.em;
    const authorizedUser = utils.ensureAuthorizedUser(context);
    const findResult = await utils.findRoomAndMyParticipant({
        em,
        userUid: authorizedUser.userUid,
        roomId: args.id,
    });
    if (findResult == null) {
        return {
            result: {
                failureType: JoinRoomFailureType.JoinRoomFailureType.NotFound,
            },
            payload: undefined,
        };
    }
    const { room, me } = findResult;
    const participantUserUids = findResult.participantIds();
    const strategyResult = await strategy({ me, room, args });
    switch (strategyResult) {
        case 'id': {
            return {
                result: {
                    operation: undefined,
                },
                payload: undefined,
            };
        }
        case JoinRoomFailureType.JoinRoomFailureType.WrongPassword: {
            return {
                result: {
                    failureType: JoinRoomFailureType.JoinRoomFailureType.WrongPassword,
                },
                payload: undefined,
            };
        }
        case JoinRoomFailureType.JoinRoomFailureType.AlreadyParticipant: {
            return {
                result: {
                    failureType: JoinRoomFailureType.JoinRoomFailureType.AlreadyParticipant,
                },
                payload: undefined,
            };
        }
        default: {
            return await utils.operateParticipantAndFlush({
                em,
                room,
                roomHistCount: context.serverConfig.roomHistCount,
                participantUserUids,
                myUserUid: authorizedUser.userUid,
                create: {
                    name: convertToMaxLength100String.convertToMaxLength100String(args.name),
                    role: strategyResult,
                },
                update: {
                    role: { newValue: strategyResult },
                },
            });
        }
    }
};
exports.JoinRoomResolver = class JoinRoomResolver {
    async joinRoomAsPlayer(args, context, pubSub) {
        const { result, payload } = await joinRoomCore({
            args,
            context,
            strategy: async ({ me, room }) => {
                if (me != null) {
                    switch (me.role) {
                        case undefined:
                            break;
                        default:
                            return JoinRoomFailureType.JoinRoomFailureType.AlreadyParticipant;
                    }
                }
                if (!(await utils.bcryptCompareNullable(args.password, room.playerPasswordHash))) {
                    return JoinRoomFailureType.JoinRoomFailureType.WrongPassword;
                }
                return FilePathModule.Player;
            },
        });
        if (payload != null) {
            await utils.publishRoomEvent(pubSub, payload);
        }
        return result;
    }
    async joinRoomAsSpectator(args, context, pubSub) {
        const { result, payload } = await joinRoomCore({
            args,
            context,
            strategy: async ({ me, room }) => {
                if (me != null) {
                    switch (me.role) {
                        case undefined:
                            break;
                        default:
                            return JoinRoomFailureType.JoinRoomFailureType.AlreadyParticipant;
                    }
                }
                if (!(await utils.bcryptCompareNullable(args.password, room.spectatorPasswordHash))) {
                    return JoinRoomFailureType.JoinRoomFailureType.WrongPassword;
                }
                return FilePathModule.Spectator;
            },
        });
        if (payload != null) {
            await utils.publishRoomEvent(pubSub, payload);
        }
        return result;
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => JoinRoomResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Args()),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [JoinRoomArgs, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.JoinRoomResolver.prototype, "joinRoomAsPlayer", null);
tslib.__decorate([
    typeGraphql.Mutation(() => JoinRoomResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Args()),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [JoinRoomArgs, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.JoinRoomResolver.prototype, "joinRoomAsSpectator", null);
exports.JoinRoomResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.JoinRoomResolver);

exports.JoinRoomResult = JoinRoomResult;
//# sourceMappingURL=resolver.js.map
