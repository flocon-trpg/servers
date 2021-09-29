"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringPieceValueLog = exports.DicePieceValueLog = void 0;
const graphql_1 = require("./graphql");
const flocon_core_1 = require("@kizahasi/flocon-core");
const PieceValueLogType_1 = require("../../../enums/PieceValueLogType");
var DicePieceValueLog;
(function (DicePieceValueLog) {
    let MikroORM;
    (function (MikroORM) {
        let ToGraphQL;
        (function (ToGraphQL) {
            ToGraphQL.state = (entity) => {
                return {
                    __tstype: graphql_1.PieceValueLogType,
                    messageId: entity.id,
                    stateId: entity.stateId,
                    characterCreatedBy: entity.characterCreatedBy,
                    characterId: entity.characterId,
                    createdAt: entity.createdAt.getTime(),
                    logType: PieceValueLogType_1.PieceValueLogType.Dice,
                    valueJson: JSON.stringify((0, flocon_core_1.decodeDicePieceValue)(entity.value)),
                };
            };
        })(ToGraphQL = MikroORM.ToGraphQL || (MikroORM.ToGraphQL = {}));
    })(MikroORM = DicePieceValueLog.MikroORM || (DicePieceValueLog.MikroORM = {}));
})(DicePieceValueLog = exports.DicePieceValueLog || (exports.DicePieceValueLog = {}));
var StringPieceValueLog;
(function (StringPieceValueLog) {
    let MikroORM;
    (function (MikroORM) {
        let ToGraphQL;
        (function (ToGraphQL) {
            ToGraphQL.state = (entity) => {
                return {
                    __tstype: graphql_1.PieceValueLogType,
                    messageId: entity.id,
                    stateId: entity.stateId,
                    characterCreatedBy: entity.characterCreatedBy,
                    characterId: entity.characterId,
                    createdAt: entity.createdAt.getTime(),
                    logType: PieceValueLogType_1.PieceValueLogType.Number,
                    valueJson: JSON.stringify((0, flocon_core_1.decodeStringPieceValue)(entity.value)),
                };
            };
        })(ToGraphQL = MikroORM.ToGraphQL || (MikroORM.ToGraphQL = {}));
    })(MikroORM = StringPieceValueLog.MikroORM || (StringPieceValueLog.MikroORM = {}));
})(StringPieceValueLog = exports.StringPieceValueLog || (exports.StringPieceValueLog = {}));
