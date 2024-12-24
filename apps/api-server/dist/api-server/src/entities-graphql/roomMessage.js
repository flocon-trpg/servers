'use strict';

var FilePathModule = require('@flocon-trpg/core');
var PieceLogType = require('../enums/PieceLogType.js');
var roomMessage = require('../graphql/objects/roomMessage.js');

exports.DicePieceLog = void 0;
(function (DicePieceLog) {
    (function (MikroORM) {
        (function (ToGraphQL) {
            ToGraphQL.state = (entity) => {
                return {
                    __tstype: roomMessage.PieceLogType,
                    messageId: entity.id,
                    stateId: entity.stateId,
                    createdAt: entity.createdAt.getTime(),
                    logType: PieceLogType.PieceLogType.Dice,
                    valueJson: JSON.stringify(FilePathModule.decodeDicePiece(entity.value)),
                };
            };
        })(MikroORM.ToGraphQL || (MikroORM.ToGraphQL = {}));
    })(DicePieceLog.MikroORM || (DicePieceLog.MikroORM = {}));
})(exports.DicePieceLog || (exports.DicePieceLog = {}));
exports.StringPieceLog = void 0;
(function (StringPieceLog) {
    (function (MikroORM) {
        (function (ToGraphQL) {
            ToGraphQL.state = (entity) => {
                return {
                    __tstype: roomMessage.PieceLogType,
                    messageId: entity.id,
                    stateId: entity.stateId,
                    createdAt: entity.createdAt.getTime(),
                    logType: PieceLogType.PieceLogType.String,
                    valueJson: JSON.stringify(FilePathModule.decodeStringPiece(entity.value)),
                };
            };
        })(MikroORM.ToGraphQL || (MikroORM.ToGraphQL = {}));
    })(StringPieceLog.MikroORM || (StringPieceLog.MikroORM = {}));
})(exports.StringPieceLog || (exports.StringPieceLog = {}));
//# sourceMappingURL=roomMessage.js.map
