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
exports.MyValueLog = void 0;
const graphql_1 = require("./graphql");
const Converter = __importStar(require("../../../@shared/ot/room/participant/myNumberValue/converter"));
var MyValueLog;
(function (MyValueLog) {
    let MikroORM;
    (function (MikroORM) {
        let ToGraphQL;
        (function (ToGraphQL) {
            ToGraphQL.state = (entity) => {
                return {
                    __tstype: graphql_1.MyValueLogType,
                    messageId: entity.id,
                    stateId: entity.stateId,
                    stateUserUid: entity.createdBy,
                    createdAt: entity.createdAt.getTime(),
                    valueJson: JSON.stringify(Converter.decode(entity.value)),
                };
            };
        })(ToGraphQL = MikroORM.ToGraphQL || (MikroORM.ToGraphQL = {}));
    })(MikroORM = MyValueLog.MikroORM || (MyValueLog.MikroORM = {}));
})(MyValueLog = exports.MyValueLog || (exports.MyValueLog = {}));
