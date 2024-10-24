'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var roles = require('../../../../utils/roles.js');
var utils = require('../../utils/utils.js');

exports.Roles = class Roles {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Boolean)
], exports.Roles.prototype, "admin", void 0);
exports.Roles = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.Roles);
exports.GetMyRolesResolver = class GetMyRolesResolver {
    async getMyRoles(context) {
        const roles$1 = roles.getRoles({ context, isEntry: false });
        if (roles$1 === utils.NotSignIn) {
            throw new Error('This should not happen');
        }
        return {
            admin: roles$1.value.has(roles.ADMIN),
        };
    }
};
tslib.__decorate([
    typeGraphql.Query(() => exports.Roles, {
        description: 'since v0.7.2',
    }),
    typeGraphql.Authorized(),
    tslib.__param(0, typeGraphql.Ctx()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [Object]),
    tslib.__metadata("design:returntype", Promise)
], exports.GetMyRolesResolver.prototype, "getMyRoles", null);
exports.GetMyRolesResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.GetMyRolesResolver);
//# sourceMappingURL=resolver.js.map
