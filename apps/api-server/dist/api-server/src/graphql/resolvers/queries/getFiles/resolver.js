'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var entity = require('../../../../entities/file/entity.js');
var FileListType = require('../../../../enums/FileListType.js');
var FilePermissionType = require('../../../../enums/FilePermissionType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var fileItem = require('../../../objects/fileItem.js');
var utils = require('../../utils/utils.js');

let GetFilesInput = class GetFilesInput {
};
tslib.__decorate([
    typeGraphql.Field(() => [String], {
        description: 'FileTagのidを指定することで、指定したタグが付いているファイルのみを抽出して表示する。例えばidがx,yの3つのタグが付いているファイルは、[]や[x]や[x,y]と指定した場合にマッチするが、[x,y,z]と指定された場合は除外される。',
    }),
    tslib.__metadata("design:type", Array)
], GetFilesInput.prototype, "fileTagIds", void 0);
GetFilesInput = tslib.__decorate([
    typeGraphql.InputType()
], GetFilesInput);
let GetFilesResult = class GetFilesResult {
};
tslib.__decorate([
    typeGraphql.Field(() => [fileItem.FileItem]),
    tslib.__metadata("design:type", Array)
], GetFilesResult.prototype, "files", void 0);
GetFilesResult = tslib.__decorate([
    typeGraphql.ObjectType()
], GetFilesResult);
exports.GetFilesResolver = class GetFilesResolver {
    async getFiles(input, context) {
        const user = utils.ensureAuthorizedUser(context);
        const fileTagsFilter = input.fileTagIds.map(id => ({
            fileTags: {
                id,
            },
        }));
        const files = await context.em.find(entity.File, {
            $and: [
                ...fileTagsFilter,
                {
                    $or: [
                        { listPermission: FilePermissionType.FilePermissionType.Entry },
                        { createdBy: { userUid: user.userUid } },
                    ],
                },
            ],
        });
        const filePromises = files.map(async (file) => ({
            ...file,
            screenname: file.screenname ?? 'null',
            createdBy: await file.createdBy.loadProperty('userUid'),
            createdAt: file.createdAt?.getTime(),
            listType: file.listPermission === FilePermissionType.FilePermissionType.Private
                ? FileListType.FileListType.Unlisted
                : FileListType.FileListType.Public,
        }));
        return {
            files: await Promise.all(filePromises),
        };
    }
};
tslib.__decorate([
    typeGraphql.Query(() => GetFilesResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Arg('input')),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [GetFilesInput, Object]),
    tslib.__metadata("design:returntype", Promise)
], exports.GetFilesResolver.prototype, "getFiles", null);
exports.GetFilesResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.GetFilesResolver);
//# sourceMappingURL=resolver.js.map
