'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var WritingMessageStatusInputType = require('../../../../enums/WritingMessageStatusInputType.js');
var WritingMessageStatusType = require('../../../../enums/WritingMessageStatusType.js');
var roles = require('../../../../utils/roles.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var types = require('../../types.js');
var utils = require('../../utils/utils.js');

let UpdateWritingMessageStateArgs = class UpdateWritingMessageStateArgs {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], UpdateWritingMessageStateArgs.prototype, "roomId", void 0);
tslib.__decorate([
    typeGraphql.Field(() => WritingMessageStatusInputType.WritingMessageStatusInputType),
    tslib.__metadata("design:type", String)
], UpdateWritingMessageStateArgs.prototype, "newStatus", void 0);
UpdateWritingMessageStateArgs = tslib.__decorate([
    typeGraphql.ArgsType()
], UpdateWritingMessageStateArgs);
exports.UpdateWritingMessageStatusResolver = class UpdateWritingMessageStatusResolver {
    async updateWritingMessageStatus(args, context, pubSub) {
        const authorizedUserUid = utils.ensureAuthorizedUser(context).userUid;
        let status;
        switch (args.newStatus) {
            case WritingMessageStatusInputType.WritingMessageStatusInputType.Cleared:
                status = WritingMessageStatusType.WritingMessageStatusType.Cleared;
                break;
            case WritingMessageStatusInputType.WritingMessageStatusInputType.StartWriting:
                status = WritingMessageStatusType.WritingMessageStatusType.Writing;
                break;
            case WritingMessageStatusInputType.WritingMessageStatusInputType.KeepWriting:
                status = WritingMessageStatusType.WritingMessageStatusType.Writing;
                break;
        }
        const returns = await context.connectionManager.onWritingMessageStatusUpdate({
            roomId: args.roomId,
            userUid: authorizedUserUid,
            status,
        });
        if (returns != null) {
            await utils.publishRoomEvent(pubSub, {
                type: 'writingMessageStatusUpdatePayload',
                roomId: args.roomId,
                userUid: authorizedUserUid,
                status: returns,
                updatedAt: new Date().getTime(),
                sendTo: types.all,
            });
        }
        return true;
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => Boolean, {
        description: 'この Mutation を直接実行することは非推奨です。代わりに @flocon-trpg/sdk を用いてください。',
    }),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Args()),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [UpdateWritingMessageStateArgs, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.UpdateWritingMessageStatusResolver.prototype, "updateWritingMessageStatus", null);
exports.UpdateWritingMessageStatusResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.UpdateWritingMessageStatusResolver);
//# sourceMappingURL=resolver.js.map
