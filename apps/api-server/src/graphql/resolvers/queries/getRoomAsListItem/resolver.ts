import { Args, Field, ObjectType, Query, Resolver, createUnionType } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType, AuthGuard } from '../../../../auth/auth.guard';
import * as RoomAsListItemGlobal from '../../../../entities-graphql/roomAsListItem';
import { GetRoomFailureType } from '../../../../enums/GetRoomFailureType';
import * as Room$MikroORM from '../../../../mikro-orm/entities/room/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { lockByRoomId } from '../../../../utils/asyncLock';
import { RoomAsListItem } from '../../../objects/room';

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
    public constructor(private readonly mikroOrmService: MikroOrmService) {}

    async #getRoomAsListItemCore(
        roomId: string,
        auth: AuthDataType,
    ): Promise<typeof GetRoomAsListItemResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const authorizedUserUid = auth.user.userUid;
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

    @Query(() => GetRoomAsListItemResult)
    @Auth(ENTRY)
    public async getRoomAsListItem(
        @Args('roomId') roomId: string,
        @AuthData() auth: AuthDataType,
    ): Promise<typeof GetRoomAsListItemResult> {
        // lock が必要かどうかは微妙
        return await lockByRoomId(
            roomId,
            async () => await this.#getRoomAsListItemCore(roomId, auth),
        );
    }
}
