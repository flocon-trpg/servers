import { MyValueLog as MyValueLog$MikroORM } from './mikro-orm';
import { MyValueLog as MyValueLog$GraphQL, MyValueLogType } from './graphql';
import { decodeMyNumberValue } from '@kizahasi/flocon-core';

export namespace MyValueLog {
    export namespace MikroORM {
        export namespace ToGraphQL {
            export const state = ( entity: MyValueLog$MikroORM): MyValueLog$GraphQL => {
                return {
                    __tstype: MyValueLogType,
                    messageId: entity.id,
                    stateId: entity.stateId,
                    stateUserUid: entity.createdBy,
                    createdAt: entity.createdAt.getTime(),
                    valueJson: JSON.stringify(decodeMyNumberValue(entity.value)),
                };
            };
        }
    }
}