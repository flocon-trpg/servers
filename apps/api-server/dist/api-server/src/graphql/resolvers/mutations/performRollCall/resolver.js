'use strict';

var tslib = require('tslib');
var FilePathModule = require('@flocon-trpg/core');
var typeGraphql = require('type-graphql');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var utils = require('../../utils/utils.js');
var performRollCall = require('./performRollCall.js');
var PerformRollCallFailureType = require('../../../../enums/PerformRollCallFailureType.js');
var filePath = require('../../../objects/filePath.js');

let PerformRollCallResult = class PerformRollCallResult {
};
tslib.__decorate([
    typeGraphql.Field(() => PerformRollCallFailureType.PerformRollCallFailureType, { nullable: true }),
    tslib.__metadata("design:type", String)
], PerformRollCallResult.prototype, "failureType", void 0);
PerformRollCallResult = tslib.__decorate([
    typeGraphql.ObjectType()
], PerformRollCallResult);
let PerformRollCallInput = class PerformRollCallInput {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], PerformRollCallInput.prototype, "roomId", void 0);
tslib.__decorate([
    typeGraphql.Field(() => filePath.FilePath, {
        nullable: true,
        description: 'SE を設定する場合、これと併せて soundEffectVolume もセットする必要があります。',
    }),
    tslib.__metadata("design:type", filePath.FilePath)
], PerformRollCallInput.prototype, "soundEffectFile", void 0);
tslib.__decorate([
    typeGraphql.Field({
        nullable: true,
        description: 'SE を設定する場合、これと併せて soundEffectFile もセットする必要があります。',
    }),
    tslib.__metadata("design:type", Number)
], PerformRollCallInput.prototype, "soundEffectVolume", void 0);
PerformRollCallInput = tslib.__decorate([
    typeGraphql.InputType()
], PerformRollCallInput);
exports.PerformRollCallResolver = class PerformRollCallResolver {
    async performRollCall(input, context, pubSub) {
        const myUserUid = utils.ensureUserUid(context);
        const result = await utils.operateAsAdminAndFlush({
            em: context.em,
            roomId: input.roomId,
            roomHistCount: undefined,
            operationType: 'state',
            operation: roomState => {
                const soundEffect = input.soundEffectFile != null && input.soundEffectVolume != null
                    ? {
                        file: { ...input.soundEffectFile, $v: 1, $r: 1 },
                        volume: input.soundEffectVolume,
                    }
                    : undefined;
                return performRollCall.performRollCall(roomState, myUserUid, soundEffect);
            },
        });
        if (result.isError) {
            if (result.error.type === 'custom') {
                return { failureType: result.error.error };
            }
            throw FilePathModule.toOtError(result.error.error);
        }
        switch (result.value) {
            case utils.RoomNotFound:
                return { failureType: PerformRollCallFailureType.PerformRollCallFailureType.NotFound };
            case utils.IdOperation:
                return {};
        }
        await utils.publishRoomEvent(pubSub, result.value);
        return {};
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => PerformRollCallResult, { description: 'since v0.7.13' }),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Arg('input')),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [PerformRollCallInput, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.PerformRollCallResolver.prototype, "performRollCall", null);
exports.PerformRollCallResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.PerformRollCallResolver);
//# sourceMappingURL=resolver.js.map
