import {
    Arg,
    Authorized,
    Ctx,
    Field,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware,
    createUnionType,
} from 'type-graphql';
import { GetRoomFailureType } from '../../../../enums/GetRoomFailureType';
import { ENTRY } from '../../../../roles';
import { RoomAsListItem } from '../../../entities/roomAsListItem/graphql';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { ResolverContext } from '../../../utils/Contexts';
import * as Room$MikroORM from '../../../entities/room/mikro-orm';
import * as RoomAsListItemGlobal from '../../../entities/roomAsListItem/global';
import { queueLimitReached } from '../../../../utils/promiseQueue';
import { serverTooBusyMessage } from '../../messages';
import { ensureAuthorizedUser } from '../../utils';

@ObjectType()
class GetRoomAsListItemSuccessResult {
    @Field(() => RoomAsListItem)
    public room!: RoomAsListItem;
}

@ObjectType()
class GetRoomAsListItemFailureResult {
    @Field(() => GetRoomFailureType)
    public failureType!: GetRoomFailureType;
}

const GetRoomAsListItemResult = createUnionType({
    name: 'GetRoomAsListItemResult',
    types: () => [GetRoomAsListItemSuccessResult, GetRoomAsListItemFailureResult] as const,
    resolveType: value => {
        if ('room' in value) {
            return GetRoomAsListItemSuccessResult;
        }
        if ('failureType' in value) {
            return GetRoomAsListItemFailureResult;
        }
        return undefined;
    },
});

@Resolver()
export class GetRoomAsListItemResolver {
    @Query(() => GetRoomAsListItemResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(1))
    public async getRoomAsListItem(
        @Arg('roomId') roomId: string,
        @Ctx() context: ResolverContext
    ): Promise<typeof GetRoomAsListItemResult> {
        const queue = async () => {
            const em = context.em;
            const authorizedUserUid = ensureAuthorizedUser(context).userUid;
            const roomEntity = await em.findOne(Room$MikroORM.Room, { id: roomId });
            if (roomEntity == null) {
                return {
                    failureType: GetRoomFailureType.NotFound,
                };
            }
            const room = await RoomAsListItemGlobal.stateToGraphQL({
                roomEntity: roomEntity,
                myUserUid: authorizedUserUid,
            });
            return { room };
        };

        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        return result.value;
    }
}
