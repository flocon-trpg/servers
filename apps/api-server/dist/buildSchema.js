'use strict';

var path = require('path');
var typeGraphql = require('type-graphql');
var registerEnumTypes = require('./graphql/registerEnumTypes.js');
var allResolvers = require('./graphql/resolvers/allResolvers.js');
var utils = require('./graphql/resolvers/utils/utils.js');
var roles = require('./utils/roles.js');

const noAuthCheck = 'noAuthCheck';
const authChecker = (serverConfig) => async ({ context }, roles$1) => {
    if (serverConfig === noAuthCheck) {
        throw new Error('authChecker is disbled');
    }
    const myRoles = await roles.getRolesAndCheckEntry({
        context,
        serverConfig,
        setAuthorizedUserToResolverContext: true,
    });
    if (myRoles === utils.NotSignIn) {
        return false;
    }
    return myRoles.isPermitted(roles$1);
};
const optionBase = {
    resolvers: allResolvers.allResolvers,
};
const emitSchemaFileOptions = {
    path: path.resolve(process.cwd(), './tmp/schema.gql'),
};
const validate = { forbidUnknownValues: false };
const buildSchema = (serverConfig) => async (options) => {
    registerEnumTypes.registerEnumTypes();
    let emitSchemaFile = undefined;
    if (options.emitSchemaFile) {
        emitSchemaFile = emitSchemaFileOptions;
    }
    return await typeGraphql.buildSchema({
        ...optionBase,
        authChecker: authChecker(serverConfig),
        emitSchemaFile,
        pubSub: options.pubSub,
        validate
    });
};
const buildSchemaSync = (serverConfig) => (options) => {
    registerEnumTypes.registerEnumTypes();
    let emitSchemaFile = undefined;
    if (options.emitSchemaFile) {
        emitSchemaFile = emitSchemaFileOptions;
    }
    return typeGraphql.buildSchemaSync({
        ...optionBase,
        authChecker: authChecker(serverConfig),
        emitSchemaFile,
        pubSub: options.pubSub,
        validate
    });
};

exports.buildSchema = buildSchema;
exports.buildSchemaSync = buildSchemaSync;
exports.noAuthCheck = noAuthCheck;
//# sourceMappingURL=buildSchema.js.map
