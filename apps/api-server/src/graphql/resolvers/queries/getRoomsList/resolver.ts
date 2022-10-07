import {
    Authorized,
    Ctx,
    Field,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware,
    createUnionType,
} from 'type-graphql';
import { ENTRY } from '../../../../utils/roles';
import { RoomAsListItem } from '../../../objects/room';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import * as Room$MikroORM from '../../../../entities/room/entity';
import * as RoomAsListItemGlobal from '../../../../entities-graphql/roomAsListItem';
import { queueLimitReached } from '../../../../utils/promiseQueue';
import { serverTooBusyMessage } from '../../messages';
import { GetRoomFailureType } from '../../../../enums/GetRoomFailureType';
import { ensureAuthorizedUser } from '../../utils/utils';
import { ResolverContext } from '../../../../types';

@ObjectType()
class GetRoomsListSuccessResult {
    @Field(() => [RoomAsListItem])
    public rooms!: RoomAsListItem[];
}

@ObjectType()
class GetRoomsListFailureResult {
    @Field(() => GetRoomFailureType)
    public failureType!: GetRoomFailureType;
}

const GetRoomsListResult = createUnionType({
    name: 'GetRoomsListResult',
    types: () => [GetRoomsListSuccessResult, GetRoomsListFailureResult] as const,
    resolveType: value => {
        if ('rooms' in value) {
            return GetRoomsListSuccessResult;
        }
        if ('failureType' in value) {
            return GetRoomsListFailureResult;
        }
        return undefined;
    },
});

@Resolver()
export class GetRoomsListResolver {
    @Query(() => GetRoomsListResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async getRoomsList(@Ctx() context: ResolverContext): Promise<typeof GetRoomsListResult> {
        const queue = async () => {
            const em = context.em;
            const authorizedUserUid = ensureAuthorizedUser(context).userUid;

            // TODO: すべてを取得しているので重い
            const roomModels = await em.find(Room$MikroORM.Room, {});
            const rooms = [];
            for (const model of roomModels) {
                rooms.push(
                    await RoomAsListItemGlobal.stateToGraphQL({
                        roomEntity: model,
                        myUserUid: authorizedUserUid,
                    })
                );
            }
            return {
                rooms,
            };
        };

        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        return result.value;
    }
}
