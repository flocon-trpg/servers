import { Field, ObjectType, Query, Resolver, createUnionType } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import * as RoomAsListItemGlobal from '../../../../entities-graphql/roomAsListItem';
import { GetRoomFailureType } from '../../../../enums/GetRoomFailureType';
import * as Room$MikroORM from '../../../../mikro-orm/entities/room/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { RoomAsListItem } from '../../../objects/room';

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
    public constructor(private readonly mikroOrmService: MikroOrmService) {}

    @Query(() => GetRoomsListResult)
    @Auth(ENTRY)
    public async getRoomsList(@AuthData() auth: AuthDataType): Promise<typeof GetRoomsListResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const authorizedUserUid = auth.user.userUid;

        // TODO: すべてを取得しているので重い
        const roomModels = await em.find(Room$MikroORM.Room, {});
        const rooms = [];
        for (const model of roomModels) {
            rooms.push(
                await RoomAsListItemGlobal.stateToGraphQL({
                    roomEntity: model,
                    myUserUid: authorizedUserUid,
                }),
            );
        }
        return {
            rooms,
        };
    }
}
