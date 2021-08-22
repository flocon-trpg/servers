"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSchemaSync = exports.buildSchema = void 0;
const type_graphql_1 = require("type-graphql");
const path_1 = __importDefault(require("path"));
const registerEnumTypes_1 = __importDefault(require("./graphql+mikro-orm/registerEnumTypes"));
const RoomResolver_1 = require("./graphql+mikro-orm/resolvers/rooms/RoomResolver");
const MainResolver_1 = require("./graphql+mikro-orm/resolvers/MainResolver");
const helpers_1 = require("./graphql+mikro-orm/resolvers/utils/helpers");
const flocon_core_1 = require("@kizahasi/flocon-core");
const config_1 = require("./config");
const BaasType_1 = require("./enums/BaasType");
const authChecker = async ({ context }, roles) => {
    const decodedIdToken = helpers_1.checkSignIn(context);
    if (decodedIdToken === helpers_1.NotSignIn) {
        return false;
    }
    let role = null;
    if (roles.includes(flocon_core_1.admin)) {
        role = flocon_core_1.admin;
    }
    const serverConfig = await config_1.loadServerConfigAsMain();
    let adminUserUids;
    if (typeof serverConfig.admin === 'string') {
        adminUserUids = [serverConfig.admin];
    }
    else if (serverConfig.admin == null) {
        adminUserUids = [];
    }
    else {
        adminUserUids = serverConfig.admin;
    }
    if (role === flocon_core_1.admin) {
        if (!adminUserUids.includes(decodedIdToken.uid)) {
            return false;
        }
    }
    const user = await helpers_1.getUserIfEntry({
        em: context.em,
        userUid: decodedIdToken.uid,
        baasType: BaasType_1.BaasType.Firebase,
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
const buildSchema = async (options) => {
    registerEnumTypes_1.default();
    let emitSchemaFile = undefined;
    if (options.emitSchemaFile) {
        emitSchemaFile = emitSchemaFileOptions;
    }
    return await type_graphql_1.buildSchema(Object.assign(Object.assign({}, optionBase), { authChecker,
        emitSchemaFile, pubSub: options.pubSub }));
};
exports.buildSchema = buildSchema;
const buildSchemaSync = (options) => {
    registerEnumTypes_1.default();
    let emitSchemaFile = undefined;
    if (options.emitSchemaFile) {
        emitSchemaFile = emitSchemaFileOptions;
    }
    return type_graphql_1.buildSchemaSync(Object.assign(Object.assign({}, optionBase), { authChecker,
        emitSchemaFile, pubSub: options.pubSub }));
};
exports.buildSchemaSync = buildSchemaSync;
