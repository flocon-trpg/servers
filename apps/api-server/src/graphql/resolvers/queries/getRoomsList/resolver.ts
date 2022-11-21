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
import * as RoomAsListItemGlobal from '../../../../entities-graphql/roomAsListItem';
import * as Room$MikroORM from '../../../../entities/room/entity';
import { GetRoomFailureType } from '../../../../enums/GetRoomFailureType';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { RoomAsListItem } from '../../../objects/room';
import { ensureAuthorizedUser } from '../../utils/utils';

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
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async getRoomsList(@Ctx() context: ResolverContext): Promise<typeof GetRoomsListResult> {
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
    }
}
