'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var entity = require('../../../../entities/fileTag/entity.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var utils = require('../../utils/utils.js');

exports.DeleteFileTagResolver = class DeleteFileTagResolver {
    async deleteFileTag(context, tagId) {
        const user = utils.ensureAuthorizedUser(context);
        const fileTagToDelete = await context.em.findOne(entity.FileTag, { user, id: tagId });
        if (fileTagToDelete == null) {
            return false;
        }
        fileTagToDelete.files.getItems().forEach(x => context.em.remove(x));
        fileTagToDelete.files.removeAll();
        context.em.remove(fileTagToDelete);
        await context.em.flush();
        return true;
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => Boolean, {
        deprecationReason: 'Use screenname to group files by folders instead.',
    }),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Ctx()),
    tslib.__param(1, typeGraphql.Arg('tagId')),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [Object, String]),
    tslib.__metadata("design:returntype", Promise)
], exports.DeleteFileTagResolver.prototype, "deleteFileTag", null);
exports.DeleteFileTagResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.DeleteFileTagResolver);
//# sourceMappingURL=resolver.js.map
