'use strict';

var tslib = require('tslib');
var utils$1 = require('@flocon-trpg/utils');
var typeGraphql = require('type-graphql');
var entity = require('../../../../entities/file/entity.js');
var entity$1 = require('../../../../entities/fileTag/entity.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var utils = require('../../utils/utils.js');

let EditFileTagActionInput = class EditFileTagActionInput {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], EditFileTagActionInput.prototype, "filename", void 0);
tslib.__decorate([
    typeGraphql.Field(() => [String]),
    tslib.__metadata("design:type", Array)
], EditFileTagActionInput.prototype, "add", void 0);
tslib.__decorate([
    typeGraphql.Field(() => [String]),
    tslib.__metadata("design:type", Array)
], EditFileTagActionInput.prototype, "remove", void 0);
EditFileTagActionInput = tslib.__decorate([
    typeGraphql.InputType()
], EditFileTagActionInput);
let EditFileTagsInput = class EditFileTagsInput {
};
tslib.__decorate([
    typeGraphql.Field(() => [EditFileTagActionInput]),
    tslib.__metadata("design:type", Array)
], EditFileTagsInput.prototype, "actions", void 0);
EditFileTagsInput = tslib.__decorate([
    typeGraphql.InputType()
], EditFileTagsInput);
exports.EditFileTagsResolver = class EditFileTagsResolver {
    async editFileTags(input, context) {
        const user = utils.ensureAuthorizedUser(context);
        const map = new utils$1.DualKeyMap();
        input.actions.forEach(action => {
            action.add.forEach(a => {
                const value = map.get({ first: action.filename, second: a });
                map.set({ first: action.filename, second: a }, (value ?? 0) + 1);
            });
            action.remove.forEach(r => {
                const value = map.get({ first: action.filename, second: r });
                map.set({ first: action.filename, second: r }, (value ?? 0) - 1);
            });
        });
        for (const [filename, actions] of map.toMap()) {
            let fileEntity = null;
            for (const [fileTagId, action] of actions) {
                if (action === 0) {
                    continue;
                }
                if (fileEntity == null) {
                    fileEntity = await context.em.findOne(entity.File, {
                        filename,
                        createdBy: { userUid: user.userUid },
                    });
                }
                if (fileEntity == null) {
                    break;
                }
                const fileTag = await context.em.findOne(entity$1.FileTag, { id: fileTagId });
                if (fileTag == null) {
                    continue;
                }
                if (0 < action) {
                    fileEntity.fileTags.add(fileTag);
                    fileTag.files.add(fileEntity);
                }
                else {
                    fileEntity.fileTags.remove(fileTag);
                    fileTag.files.remove(fileEntity);
                }
            }
        }
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
    tslib.__param(0, typeGraphql.Arg('input')),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [EditFileTagsInput, Object]),
    tslib.__metadata("design:returntype", Promise)
], exports.EditFileTagsResolver.prototype, "editFileTags", null);
exports.EditFileTagsResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.EditFileTagsResolver);
//# sourceMappingURL=resolver.js.map
