"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyValueLog = void 0;
const graphql_1 = require("./graphql");
var MyValueLog;
(function (MyValueLog) {
    let MikroORM;
    (function (MikroORM) {
        let ToGraphQL;
        (function (ToGraphQL) {
            ToGraphQL.state = ({ entity, stateUserUid }) => {
                return {
                    __tstype: graphql_1.MyValueLogType,
                    messageId: entity.id,
                    stateId: entity.stateId,
                    stateUserUid,
                    createdAt: entity.createdAt.getTime(),
                    myValueType: entity.myValueType,
                    replaceType: entity.replaceType,
                    valueChanged: entity.valueChanged,
                    createdPieces: entity.createdPieces,
                    deletedPieces: entity.deletedPieces,
                    movedPieces: entity.movedPieces,
                    resizedPieces: entity.resizedPieces,
                };
            };
        })(ToGraphQL = MikroORM.ToGraphQL || (MikroORM.ToGraphQL = {}));
    })(MikroORM = MyValueLog.MikroORM || (MyValueLog.MikroORM = {}));
})(MyValueLog = exports.MyValueLog || (exports.MyValueLog = {}));
