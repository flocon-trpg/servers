'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var entity = require('../../../../entities/user/entity.js');
var BaasType = require('../../../../enums/BaasType.js');
var EntryToServerResultType = require('../../../../enums/EntryToServerResultType.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var utils = require('../../utils/utils.js');

let EntryToServerResult = class EntryToServerResult {
};
tslib.__decorate([
    typeGraphql.Field(() => EntryToServerResultType.EntryToServerResultType),
    tslib.__metadata("design:type", String)
], EntryToServerResult.prototype, "type", void 0);
EntryToServerResult = tslib.__decorate([
    typeGraphql.ObjectType()
], EntryToServerResult);
exports.EntryToServerResolver = class EntryToServerResolver {
    async entryToServer(password, context) {
        const em = context.em;
        const serverConfig = context.serverConfig;
        const decodedIdToken = utils.checkSignIn(context);
        if (decodedIdToken === utils.NotSignIn) {
            return {
                type: EntryToServerResultType.EntryToServerResultType.NotSignIn,
            };
        }
        let user = await em.findOne(entity.User, { userUid: decodedIdToken.uid });
        if (user == null) {
            user = new entity.User({ userUid: decodedIdToken.uid, baasType: BaasType.BaasType.Firebase });
            user.isEntry = false;
            em.persist(user);
        }
        if (user.isEntry) {
            return {
                type: EntryToServerResultType.EntryToServerResultType.AlreadyEntried,
            };
        }
        if (serverConfig.entryPassword == null) {
            user.isEntry = true;
            await em.flush();
            return {
                type: password == null
                    ? EntryToServerResultType.EntryToServerResultType.Success
                    : EntryToServerResultType.EntryToServerResultType.NoPasswordRequired,
            };
        }
        if (password == null || !(await utils.comparePassword(password, serverConfig.entryPassword))) {
            return {
                type: EntryToServerResultType.EntryToServerResultType.WrongPassword,
            };
        }
        user.isEntry = true;
        await em.flush();
        return {
            type: EntryToServerResultType.EntryToServerResultType.Success,
        };
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => EntryToServerResult),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware),
    tslib.__param(0, typeGraphql.Arg('password', () => String, { nullable: true })),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [Object, Object]),
    tslib.__metadata("design:returntype", Promise)
], exports.EntryToServerResolver.prototype, "entryToServer", null);
exports.EntryToServerResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.EntryToServerResolver);
//# sourceMappingURL=resolver.js.map
