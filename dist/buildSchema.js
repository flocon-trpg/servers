"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSchemaSync = exports.buildSchema = exports.noAuthCheck = void 0;
const type_graphql_1 = require("type-graphql");
const path_1 = __importDefault(require("path"));
const registerEnumTypes_1 = __importDefault(require("./graphql+mikro-orm/registerEnumTypes"));
const RoomResolver_1 = require("./graphql+mikro-orm/resolvers/rooms/RoomResolver");
const MainResolver_1 = require("./graphql+mikro-orm/resolvers/MainResolver");
const helpers_1 = require("./graphql+mikro-orm/resolvers/utils/helpers");
const BaasType_1 = require("./enums/BaasType");
const roles_1 = require("./roles");
exports.noAuthCheck = 'noAuthCheck';
const authChecker = (serverConfig) => async ({ context }, roles) => {
    if (serverConfig === exports.noAuthCheck) {
        throw new Error('authChecker is disbled');
    }
    let role = null;
    if (roles.includes(roles_1.ADMIN)) {
        role = roles_1.ADMIN;
    }
    else if (roles.includes(roles_1.ENTRY)) {
        role = roles_1.ENTRY;
    }
    const decodedIdToken = (0, helpers_1.checkSignIn)(context);
    if (decodedIdToken === helpers_1.NotSignIn) {
        return false;
    }
    if (role == null) {
        return true;
    }
    const adminConfig = serverConfig.admin;
    let adminUserUids;
    if (typeof adminConfig === 'string') {
        adminUserUids = [adminConfig];
    }
    else if (adminConfig == null) {
        adminUserUids = [];
    }
    else {
        adminUserUids = adminConfig;
    }
    if (role === roles_1.ADMIN) {
        if (!adminUserUids.includes(decodedIdToken.uid)) {
            return false;
        }
    }
    const user = await (0, helpers_1.getUserIfEntry)({
        em: context.em,
        userUid: decodedIdToken.uid,
        baasType: BaasType_1.BaasType.Firebase,
        serverConfig,
    });
    if (user == null) {
        return false;
    }
    context.authorizedUser = user;
    return true;
};
const resolvers = [RoomResolver_1.RoomResolver, MainResolver_1.MainResolver];
const optionBase = {
    resolvers,
};
const emitSchemaFileOptions = {
    path: path_1.default.resolve(process.cwd(), '../graphql/generated/schema.gql'),
    commentDescriptions: true,
};
const buildSchema = (serverConfig) => async (options) => {
    (0, registerEnumTypes_1.default)();
    let emitSchemaFile = undefined;
    if (options.emitSchemaFile) {
        emitSchemaFile = emitSchemaFileOptions;
    }
    return await (0, type_graphql_1.buildSchema)(Object.assign(Object.assign({}, optionBase), { authChecker: authChecker(serverConfig), emitSchemaFile, pubSub: options.pubSub }));
};
exports.buildSchema = buildSchema;
const buildSchemaSync = (serverConfig) => (options) => {
    (0, registerEnumTypes_1.default)();
    let emitSchemaFile = undefined;
    if (options.emitSchemaFile) {
        emitSchemaFile = emitSchemaFileOptions;
    }
    return (0, type_graphql_1.buildSchemaSync)(Object.assign(Object.assign({}, optionBase), { authChecker: authChecker(serverConfig), emitSchemaFile, pubSub: options.pubSub }));
};
exports.buildSchemaSync = buildSchemaSync;
