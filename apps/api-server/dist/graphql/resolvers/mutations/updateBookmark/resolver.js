'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var entity = require('../../../../entities/room/entity.js');
var UpdateBookmarkFailureType = require('../../../../enums/UpdateBookmarkFailureType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var utils = require('../../utils/utils.js');

let UpdateBookmarkArgs = class UpdateBookmarkArgs {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], UpdateBookmarkArgs.prototype, "roomId", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Boolean)
], UpdateBookmarkArgs.prototype, "newValue", void 0);
UpdateBookmarkArgs = tslib.__decorate([
    typeGraphql.ArgsType()
], UpdateBookmarkArgs);
let UpdateBookmarkSuccessResult = class UpdateBookmarkSuccessResult {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Boolean)
], UpdateBookmarkSuccessResult.prototype, "prevValue", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Boolean)
], UpdateBookmarkSuccessResult.prototype, "currentValue", void 0);
UpdateBookmarkSuccessResult = tslib.__decorate([
    typeGraphql.ObjectType()
], UpdateBookmarkSuccessResult);
let UpdateBookmarkFailureResult = class UpdateBookmarkFailureResult {
};
tslib.__decorate([
    typeGraphql.Field(() => UpdateBookmarkFailureType.UpdateBookmarkFailureType),
    tslib.__metadata("design:type", String)
], UpdateBookmarkFailureResult.prototype, "failureType", void 0);
UpdateBookmarkFailureResult = tslib.__decorate([
    typeGraphql.ObjectType()
], UpdateBookmarkFailureResult);
const UpdateBookmarkResult = typeGraphql.createUnionType({
    name: 'UpdateBookmarkResult',
    types: () => [UpdateBookmarkSuccessResult, UpdateBookmarkFailureResult],
    resolveType: value => {
        if ('currentValue' in value) {
            return UpdateBookmarkSuccessResult;
        }
        if ('failureType' in value) {
            return UpdateBookmarkFailureResult;
        }
        return undefined;
    },
});
exports.UpdateBookmarkResolver = class UpdateBookmarkResolver {
    async updateBookmark(args, context) {
        const em = context.em;
        const authorizedUser = utils.ensureAuthorizedUser(context);
        const room = await em.findOne(entity.Room, { id: args.roomId });
        if (room == null) {
            return {
                failureType: UpdateBookmarkFailureType.UpdateBookmarkFailureType.NotFound,
            };
        }
        await authorizedUser.bookmarkedRooms.init();
        const isBookmarked = authorizedUser.bookmarkedRooms.contains(room);
        if (args.newValue) {
            if (isBookmarked) {
                return { prevValue: isBookmarked, currentValue: isBookmarked };
            }
        }
        else {
            if (!isBookmarked) {
                return { prevValue: isBookmarked, currentValue: isBookmarked };
            }
        }
        if (args.newValue) {
            authorizedUser.bookmarkedRooms.add(room);
        }
        else {
            authorizedUser.bookmarkedRooms.remove(room);
        }
        await em.flush();
        return { prevValue: isBookmarked, currentValue: args.newValue };
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => UpdateBookmarkResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Args()),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [UpdateBookmarkArgs, Object]),
    tslib.__metadata("design:returntype", Promise)
], exports.UpdateBookmarkResolver.prototype, "updateBookmark", null);
exports.UpdateBookmarkResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.UpdateBookmarkResolver);

exports.UpdateBookmarkResult = UpdateBookmarkResult;
//# sourceMappingURL=resolver.js.map
