import { decodeDicePiece, decodeStringPiece } from '@flocon-trpg/core';
import {
    DicePieceLog as DicePieceLog$MikroORM,
    StringPieceLog as StringPieceLog$MikroORM,
} from '../entities/roomMessage/entity';

import { PieceLogType as PieceLogTypeEnum } from '../enums/PieceLogType';
import { PieceLog, PieceLogType } from '../graphql/objects/roomMessage';

export namespace DicePieceLog {
    export namespace MikroORM {
        export namespace ToGraphQL {
            export const state = (entity: DicePieceLog$MikroORM): PieceLog => {
                return {
                    __tstype: PieceLogType,
                    messageId: entity.id,
                    stateId: entity.stateId,
                    createdAt: entity.createdAt.getTime(),
                    logType: PieceLogTypeEnum.Dice,
                    valueJson: JSON.stringify(decodeDicePiece(entity.value)),
                };
            };
        }
    }
}

export namespace StringPieceLog {
    export namespace MikroORM {
        export namespace ToGraphQL {
            export const state = (entity: StringPieceLog$MikroORM): PieceLog => {
                return {
                    __tstype: PieceLogType,
                    messageId: entity.id,
                    stateId: entity.stateId,
                    createdAt: entity.createdAt.getTime(),
                    logType: PieceLogTypeEnum.String,
                    valueJson: JSON.stringify(decodeStringPiece(entity.value)),
                };
            };
        }
    }
}
