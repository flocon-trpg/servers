'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var entity = require('../../../../entities/fileTag/entity.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var utils = require('../../utils/utils.js');

exports.FileTag = class FileTag {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], exports.FileTag.prototype, "id", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], exports.FileTag.prototype, "name", void 0);
exports.FileTag = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.FileTag);
exports.CreateFileTagResolver = class CreateFileTagResolver {
    async createFileTag(context, tagName) {
        const maxTagsCount = 10;
        const user = utils.ensureAuthorizedUser(context);
        const tagsCount = await context.em.count(entity.FileTag, { user });
        if (maxTagsCount <= tagsCount) {
            return null;
        }
        const newFileTag = context.em.create(entity.FileTag, { name: tagName, user: user });
        await context.em.persistAndFlush(newFileTag);
        return {
            id: newFileTag.id,
            name: newFileTag.name,
        };
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => exports.FileTag, {
        nullable: true,
        deprecationReason: 'Use screenname to group files by folders instead.',
    }),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Ctx()),
    tslib.__param(1, typeGraphql.Arg('tagName')),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [Object, String]),
    tslib.__metadata("design:returntype", Promise)
], exports.CreateFileTagResolver.prototype, "createFileTag", null);
exports.CreateFileTagResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.CreateFileTagResolver);
//# sourceMappingURL=resolver.js.map
