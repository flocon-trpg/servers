import {
    DicePieceValueLog as DicePieceValueLog$MikroORM,
    StringPieceValueLog as StringPieceValueLog$MikroORM,
} from './mikro-orm';
import { PieceValueLog, PieceValueLogType } from './graphql';
import { decodeDicePieceValue, decodeStringPieceValue } from '@flocon-trpg/core';
import { PieceValueLogType as PieceValueLogTypeEnum } from '../../../enums/PieceValueLogType';

export namespace DicePieceValueLog {
    export namespace MikroORM {
        export namespace ToGraphQL {
            export const state = (entity: DicePieceValueLog$MikroORM): PieceValueLog => {
                return {
                    __tstype: PieceValueLogType,
                    messageId: entity.id,
                    stateId: entity.stateId,
                    characterCreatedBy: entity.characterCreatedBy,
                    characterId: entity.characterId,
                    createdAt: entity.createdAt.getTime(),
                    logType: PieceValueLogTypeEnum.Dice,
                    valueJson: JSON.stringify(decodeDicePieceValue(entity.value)),
                };
            };
        }
    }
}

export namespace StringPieceValueLog {
    export namespace MikroORM {
        export namespace ToGraphQL {
            export const state = (entity: StringPieceValueLog$MikroORM): PieceValueLog => {
                return {
                    __tstype: PieceValueLogType,
                    messageId: entity.id,
                    stateId: entity.stateId,
                    characterCreatedBy: entity.characterCreatedBy,
                    characterId: entity.characterId,
                    createdAt: entity.createdAt.getTime(),
                    logType: PieceValueLogTypeEnum.Number,
                    valueJson: JSON.stringify(decodeStringPieceValue(entity.value)),
                };
            };
        }
    }
}
