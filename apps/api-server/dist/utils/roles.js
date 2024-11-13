'use strict';

var tslib = require('tslib');
var getUserIfEntry = require('../entities/user/getUserIfEntry.js');
var BaasType = require('../enums/BaasType.js');
var utils = require('../graphql/resolvers/utils/utils.js');

var _Roles_roles;
const ADMIN = 'ADMIN';
const ENTRY = 'ENTRY';
class Roles {
    constructor(params) {
        _Roles_roles.set(this, void 0);
        const roles = new Set(params.roles);
        if (params.isEntry === true) {
            roles.add(ENTRY);
        }
        tslib.__classPrivateFieldSet(this, _Roles_roles, roles, "f");
    }
    isPermitted(roles) {
        if (roles.includes(ADMIN)) {
            return tslib.__classPrivateFieldGet(this, _Roles_roles, "f").has(ADMIN);
        }
        if (roles.includes(ENTRY)) {
            return tslib.__classPrivateFieldGet(this, _Roles_roles, "f").has(ENTRY);
        }
        return true;
    }
    get value() {
        return tslib.__classPrivateFieldGet(this, _Roles_roles, "f");
    }
}
_Roles_roles = new WeakMap();
const getRolesCore = ({ context, serverConfig, }) => {
    const roles = new Set();
    const decodedIdToken = utils.checkSignIn(context);
    if (decodedIdToken === utils.NotSignIn) {
        return utils.NotSignIn;
    }
    const adminUserUids = (serverConfig ?? context.serverConfig).admins;
    if (adminUserUids.includes(decodedIdToken.uid)) {
        roles.add(ADMIN);
    }
    return { roles, decodedIdToken };
};
const getRoles = (params) => {
    const result = getRolesCore(params);
    if (result === utils.NotSignIn) {
        return utils.NotSignIn;
    }
    return new Roles({ roles: result.roles, isEntry: params.isEntry });
};
const getRolesAndCheckEntry = async ({ context, serverConfig, setAuthorizedUserToResolverContext, }) => {
    const rolesCoreResult = getRolesCore({ context, serverConfig });
    if (rolesCoreResult === utils.NotSignIn) {
        return utils.NotSignIn;
    }
    const result = rolesCoreResult.roles;
    const user = await getUserIfEntry.getUserIfEntry({
        em: context.em,
        userUid: rolesCoreResult.decodedIdToken.uid,
        baasType: BaasType.BaasType.Firebase,
        serverConfig: serverConfig ?? context.serverConfig,
    });
    if (user == null) {
        return new Roles({ roles: result });
    }
    result.add(ENTRY);
    if (setAuthorizedUserToResolverContext) {
        context.authorizedUser = user;
    }
    return new Roles({ roles: result });
};

exports.ADMIN = ADMIN;
exports.ENTRY = ENTRY;
exports.getRoles = getRoles;
exports.getRolesAndCheckEntry = getRolesAndCheckEntry;
//# sourceMappingURL=roles.js.map
