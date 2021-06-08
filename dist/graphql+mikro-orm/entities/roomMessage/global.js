"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberPieceValueLog = exports.DicePieceValueLog = void 0;
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
                    valueJson: JSON.stringify(flocon_core_1.decodeDicePieceValue(entity.value)),
                };
            };
        })(ToGraphQL = MikroORM.ToGraphQL || (MikroORM.ToGraphQL = {}));
    })(MikroORM = DicePieceValueLog.MikroORM || (DicePieceValueLog.MikroORM = {}));
})(DicePieceValueLog = exports.DicePieceValueLog || (exports.DicePieceValueLog = {}));
var NumberPieceValueLog;
(function (NumberPieceValueLog) {
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
                    valueJson: JSON.stringify(flocon_core_1.decodeNumberPieceValue(entity.value)),
                };
            };
        })(ToGraphQL = MikroORM.ToGraphQL || (MikroORM.ToGraphQL = {}));
    })(MikroORM = NumberPieceValueLog.MikroORM || (NumberPieceValueLog.MikroORM = {}));
})(NumberPieceValueLog = exports.NumberPieceValueLog || (exports.NumberPieceValueLog = {}));
