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
import { ENTRY } from '../../../../utils/roles';
import { RoomAsListItem } from '../../../objects/room';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import * as Room$MikroORM from '../../../../entities/room/entity';
import * as RoomAsListItemGlobal from '../../../../entities-graphql/roomAsListItem';
import { ensureAuthorizedUser } from '../../utils/utils';
import { ResolverContext } from '../../../../types';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';

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
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(1))
    public async getRoomAsListItem(
        @Arg('roomId') roomId: string,
        @Ctx() context: ResolverContext
    ): Promise<typeof GetRoomAsListItemResult> {
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
    }
}
