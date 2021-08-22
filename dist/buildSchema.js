"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSchemaSync = exports.buildSchema = exports.customAuthChecker = void 0;
const type_graphql_1 = require("type-graphql");
const path_1 = __importDefault(require("path"));
const registerEnumTypes_1 = __importDefault(require("./graphql+mikro-orm/registerEnumTypes"));
const RoomResolver_1 = require("./graphql+mikro-orm/resolvers/rooms/RoomResolver");
const MainResolver_1 = require("./graphql+mikro-orm/resolvers/MainResolver");
const customAuthChecker = ({ context }, roles) => {
    return true;
};
exports.customAuthChecker = customAuthChecker;
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
    return await type_graphql_1.buildSchema(Object.assign(Object.assign({}, optionBase), { emitSchemaFile, pubSub: options.pubSub }));
};
exports.buildSchema = buildSchema;
const buildSchemaSync = (options) => {
    registerEnumTypes_1.default();
    let emitSchemaFile = undefined;
    if (options.emitSchemaFile) {
        emitSchemaFile = emitSchemaFileOptions;
    }
    return type_graphql_1.buildSchemaSync(Object.assign(Object.assign({}, optionBase), { emitSchemaFile }));
};
exports.buildSchemaSync = buildSchemaSync;
