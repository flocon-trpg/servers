'use strict';

var tslib = require('tslib');
var FilePathModule = require('@flocon-trpg/core');
var result = require('@kizahasi/result');
var produce = require('immer');
var typeGraphql = require('type-graphql');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var utils = require('../../utils/utils.js');
var AnswerRollCallFailureType = require('../../../../enums/AnswerRollCallFailureType.js');

let AnswerRollCallResult = class AnswerRollCallResult {
};
tslib.__decorate([
    typeGraphql.Field(() => AnswerRollCallFailureType.AnswerRollCallFailureType, { nullable: true }),
    tslib.__metadata("design:type", String)
], AnswerRollCallResult.prototype, "failureType", void 0);
AnswerRollCallResult = tslib.__decorate([
    typeGraphql.ObjectType()
], AnswerRollCallResult);
exports.AnswerRollCallResolver = class AnswerRollCallResolver {
    async answerRollCall(roomId, rollCallId, answer, context, pubSub) {
        const myUserUid = utils.ensureUserUid(context);
        const result$1 = await utils.operateAsAdminAndFlush({
            em: context.em,
            roomId,
            roomHistCount: undefined,
            operationType: 'state',
            operation: roomState => {
                const me = roomState.participants?.[myUserUid];
                switch (me?.role) {
                    case FilePathModule.Master:
                    case FilePathModule.Player:
                        break;
                    default:
                        return result.Result.error(AnswerRollCallFailureType.AnswerRollCallFailureType.NotAuthorizedParticipant);
                }
                const rollCall = roomState.rollCalls?.[rollCallId];
                if (rollCall == null) {
                    return result.Result.error(AnswerRollCallFailureType.AnswerRollCallFailureType.RollCallNotFound);
                }
                const nextRoomState = produce.produce(roomState, roomState => {
                    const rollCall = roomState.rollCalls?.[rollCallId];
                    if (rollCall == null) {
                        return;
                    }
                    const prevValue = rollCall.participants?.[myUserUid]?.answeredAt;
                    const newValue = answer ? new Date().getTime() : undefined;
                    if (prevValue != null && newValue != null && newValue - prevValue < 1000) {
                        return;
                    }
                    if (rollCall.participants == null) {
                        rollCall.participants = {};
                    }
                    const targetParticipant = rollCall.participants[myUserUid];
                    if (targetParticipant == null) {
                        rollCall.participants[myUserUid] = {
                            $v: 1,
                            $r: 1,
                            answeredAt: newValue,
                        };
                    }
                    else {
                        targetParticipant.answeredAt = newValue;
                    }
                });
                return result.Result.ok(nextRoomState);
            },
        });
        if (result$1.isError) {
            if (result$1.error.type === 'custom') {
                return { failureType: result$1.error.error };
            }
            throw FilePathModule.toOtError(result$1.error.error);
        }
        switch (result$1.value) {
            case utils.RoomNotFound:
                return { failureType: AnswerRollCallFailureType.AnswerRollCallFailureType.RoomNotFound };
            case utils.IdOperation:
                return {};
        }
        await utils.publishRoomEvent(pubSub, result$1.value);
        return {};
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => AnswerRollCallResult, { description: 'since v0.7.13' }),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Arg('roomId')),
    tslib.__param(1, typeGraphql.Arg('rollCallId')),
    tslib.__param(2, typeGraphql.Arg('answer')),
    tslib.__param(3, typeGraphql.Ctx()),
    tslib.__param(4, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [String, String, Boolean, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.AnswerRollCallResolver.prototype, "answerRollCall", null);
exports.AnswerRollCallResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.AnswerRollCallResolver);
//# sourceMappingURL=resolver.js.map
