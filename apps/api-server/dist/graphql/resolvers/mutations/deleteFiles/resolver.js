'use strict';

var tslib = require('tslib');
var path = require('path');
var fs = require('fs-extra');
var typeGraphql = require('type-graphql');
var entity = require('../../../../entities/file/entity.js');
var logger = require('../../../../logger.js');
var roles = require('../../../../utils/roles.js');
var thumbsDir = require('../../../../utils/thumbsDir.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var utils = require('../../utils/utils.js');

exports.DeleteFilesResolver = class DeleteFilesResolver {
    async deleteFiles(filenames, context) {
        const directory = context.serverConfig.uploader?.directory;
        if (directory == null) {
            return [];
        }
        const filenamesToDelete = [];
        const thumbFilenamesToDelete = [];
        const user = utils.ensureAuthorizedUser(context);
        for (const filename of filenames) {
            const file = await context.em.findOne(entity.File, {
                createdBy: user,
                filename,
            });
            if (file != null) {
                if (file.thumbFilename != null) {
                    thumbFilenamesToDelete.push(file.thumbFilename);
                }
                filenamesToDelete.push(file.filename);
                await user.files.init();
                user.files.remove(file);
                await file.fileTags.init();
                file.fileTags.removeAll();
                context.em.remove(file);
            }
        }
        await context.em.flush();
        for (const filename of filenamesToDelete) {
            const filePath = path.resolve(directory, filename);
            const statResult = await fs.stat(filePath).catch(err => {
                logger.logger.warn('stat(%s) threw an error. Maybe the file was not found?: %o', filePath, err);
                return false;
            });
            if (statResult === false) {
                continue;
            }
            if (statResult.isFile()) {
                await fs.remove(filePath);
            }
            else {
                logger.logger.warn('%s is not a file', filePath);
            }
        }
        for (const filename of thumbFilenamesToDelete) {
            const filePath = path.resolve(directory, thumbsDir.thumbsDir, filename);
            const statResult = await fs.stat(filePath).catch(err => {
                logger.logger.warn('stat(%s) threw an error. Maybe the file was not found?: %o', filePath, err);
                return false;
            });
            if (statResult === false) {
                continue;
            }
            if (statResult.isFile()) {
                await fs.remove(filePath);
            }
            else {
                logger.logger.warn('%s is not a file', filePath);
            }
        }
        return filenamesToDelete;
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => [String], { description: 'since v0.7.8' }),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Arg('filenames', () => [String])),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [Array, Object]),
    tslib.__metadata("design:returntype", Promise)
], exports.DeleteFilesResolver.prototype, "deleteFiles", null);
exports.DeleteFilesResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.DeleteFilesResolver);
//# sourceMappingURL=resolver.js.map
