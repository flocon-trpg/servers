import { MyValueLog as MyValueLog$MikroORM } from './mikro-orm';
import { MyValueLog as MyValueLog$GraphQL, MyValueLogType } from './graphql';

export namespace MyValueLog {
    export namespace MikroORM {
        export namespace ToGraphQL {
            export const state = ({ entity, stateUserUid }: { entity: MyValueLog$MikroORM; stateUserUid: string}): MyValueLog$GraphQL => {
                return {
                    __tstype: MyValueLogType,
                    messageId: entity.id,
                    stateId: entity.stateId,
                    stateUserUid,
                    createdAt: entity.createdAt.getTime(),
                    myValueType: entity.myValueType,
                    replaceType: entity.replaceType,
                    valueChanged: entity.valueChanged,
                    isValuePrivateChanged: entity.isValuePrivateChanged,
                    createdPieces: entity.createdPieces,
                    deletedPieces: entity.deletedPieces,
                    movedPieces: entity.movedPieces,
                    resizedPieces: entity.resizedPieces,
                };
            };
        }
    }
}