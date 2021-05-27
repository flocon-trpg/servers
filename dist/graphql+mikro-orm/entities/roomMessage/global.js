"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyValueLog = void 0;
const graphql_1 = require("./graphql");
const flocon_core_1 = require("@kizahasi/flocon-core");
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
                    valueJson: JSON.stringify(flocon_core_1.decodeMyNumberValue(entity.value)),
                };
            };
        })(ToGraphQL = MikroORM.ToGraphQL || (MikroORM.ToGraphQL = {}));
    })(MikroORM = MyValueLog.MikroORM || (MyValueLog.MikroORM = {}));
})(MyValueLog = exports.MyValueLog || (exports.MyValueLog = {}));
