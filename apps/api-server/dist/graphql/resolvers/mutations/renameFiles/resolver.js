'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var entity = require('../../../../entities/file/entity.js');
var FilePermissionType = require('../../../../enums/FilePermissionType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var utils = require('../../utils/utils.js');

let RenameFileInput = class RenameFileInput {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], RenameFileInput.prototype, "filename", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], RenameFileInput.prototype, "newScreenname", void 0);
RenameFileInput = tslib.__decorate([
    typeGraphql.InputType()
], RenameFileInput);
exports.RenameFilesResolver = class RenameFilesResolver {
    async renameFiles(input, context) {
        const result = [];
        const user = utils.ensureAuthorizedUser(context);
        for (const elem of input) {
            const file = await context.em.findOne(entity.File, { filename: elem.filename });
            if (file == null) {
                continue;
            }
            const createdByUserUid = await file.createdBy.loadProperty('userUid');
            if (createdByUserUid !== user.userUid &&
                file.renamePermission !== FilePermissionType.FilePermissionType.Entry) {
                continue;
            }
            file.screenname = elem.newScreenname;
            result.push(elem.filename);
        }
        await context.em.flush();
        return result;
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => [String]),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Arg('input', () => [RenameFileInput])),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [Array, Object]),
    tslib.__metadata("design:returntype", Promise)
], exports.RenameFilesResolver.prototype, "renameFiles", null);
exports.RenameFilesResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.RenameFilesResolver);
//# sourceMappingURL=resolver.js.map
