"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverConfigJson = exports.bcrypt = exports.plain = exports.sqlite = exports.postgresql = void 0;
const flocon_core_1 = require("@kizahasi/flocon-core");
const t = __importStar(require("io-ts"));
exports.postgresql = 'postgresql';
exports.sqlite = 'sqlite';
exports.plain = 'plain';
exports.bcrypt = 'bcrypt';
const database = t.type({
    postgresql: flocon_core_1.maybe(t.type({
        dbName: t.string,
        clientUrl: t.string,
    })),
    sqlite: flocon_core_1.maybe(t.type({
        dbName: t.string,
    })),
});
const entryPassword = t.type({
    type: t.union([t.literal(exports.plain), t.literal(exports.bcrypt)]),
    value: t.string,
});
const uploader = t.type({
    enabled: t.boolean,
    maxFileSize: t.number,
    sizeQuota: t.number,
    countQuota: t.number,
    directory: t.string,
});
exports.serverConfigJson = t.type({
    admin: flocon_core_1.maybe(t.union([t.string, t.array(t.string)])),
    database: database,
    entryPassword: flocon_core_1.maybe(entryPassword),
    uploader: flocon_core_1.maybe(uploader),
    accessControlAllowOrigin: flocon_core_1.maybe(t.string),
});
