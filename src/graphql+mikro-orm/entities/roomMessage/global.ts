import { DicePieceValueLog as DicePieceValueLog$MikroORM, NumberPieceValueLog as NumberPieceValueLog$MikroORM } from './mikro-orm';
import { PieceValueLog, PieceValueLogType } from './graphql';
import { decodeDicePieceValue, decodeNumberPieceValue } from '@kizahasi/flocon-core';
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

export namespace NumberPieceValueLog {
    export namespace MikroORM {
        export namespace ToGraphQL {
            export const state = (entity: NumberPieceValueLog$MikroORM): PieceValueLog => {
                return {
                    __tstype: PieceValueLogType,
                    messageId: entity.id,
                    stateId: entity.stateId,
                    characterCreatedBy: entity.characterCreatedBy,
                    characterId: entity.characterId,
                    createdAt: entity.createdAt.getTime(),
                    logType: PieceValueLogTypeEnum.Number,
                    valueJson: JSON.stringify(decodeNumberPieceValue(entity.value)),
                };
            };
        }
    }
}