import { client } from '@flocon-trpg/core';
import {
    Args,
    ArgsType,
    Field,
    ObjectType,
    Query,
    Resolver,
    createUnionType,
} from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { GlobalRoom } from '../../../../entities-graphql/room';
import { stateToGraphQL } from '../../../../entities-graphql/roomAsListItem';
import { GetRoomFailureType } from '../../../../enums/GetRoomFailureType';
import {
    ParticipantRoleType,
    stringToParticipantRoleType,
} from '../../../../enums/ParticipantRoleType';
import { isBookmarked } from '../../../../mikro-orm/entities/room/isBookmarked';
import { role } from '../../../../mikro-orm/entities/room/role';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { lockByRoomId } from '../../../../utils/asyncLock';
import { RoomAsListItem, RoomGetState } from '../../../objects/room';
import { findRoomAndMyParticipant } from '../../utils/utils';

@ArgsType()
class GetRoomArgs {
    @Field()
    public roomId!: string;
}

@ObjectType()
class GetJoinedRoomResult {
    @Field(() => ParticipantRoleType, {
        description: '自分の現在のParticipantRoleType。room.roleと同じ値をとる。',
    })
    public role!: ParticipantRoleType;

    @Field()
    public room!: RoomGetState;
}

@ObjectType()
class GetNonJoinedRoomResult {
    @Field()
    public roomAsListItem!: RoomAsListItem;
}

@ObjectType()
class GetRoomFailureResult {
    @Field(() => GetRoomFailureType)
    public failureType!: GetRoomFailureType;
}

const GetRoomResult = createUnionType({
    name: 'GetRoomResult',
    types: () => [GetJoinedRoomResult, GetNonJoinedRoomResult, GetRoomFailureResult] as const,
    resolveType: value => {
        if ('room' in value) {
            return GetJoinedRoomResult;
        }
        if ('roomAsListItem' in value) {
            return GetNonJoinedRoomResult;
        }
        if ('failureType' in value) {
            return GetRoomFailureResult;
        }
        return undefined;
    },
});

@Resolver()
export class GetRoomResolver {
    public constructor(private readonly mikroOrmService: MikroOrmService) {}

    async #getRoomCore(args: GetRoomArgs, auth: AuthDataType): Promise<typeof GetRoomResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const authorizedUserUid = auth.user.userUid;
        const findResult = await findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                failureType: GetRoomFailureType.NotFound,
            };
        }
        const { room, me } = findResult;
        if (me?.role == null) {
            return {
                roomAsListItem: await stateToGraphQL({
                    roomEntity: room,
                    myUserUid: authorizedUserUid,
                }),
            };
        }

        const roomState = await GlobalRoom.MikroORM.ToGlobal.state(room, em);
        return {
            role: stringToParticipantRoleType(me.role),
            room: {
                ...GlobalRoom.Global.ToGraphQL.state({
                    source: roomState,
                    requestedBy: { type: client, userUid: authorizedUserUid },
                }),
                revision: room.revision,
                createdBy: room.createdBy,
                createdAt: room.createdAt?.getTime(),
                updatedAt: room.completeUpdatedAt?.getTime(),
                role: await role({
                    roomEntity: room,
                    myUserUid: authorizedUserUid,
                }),
                isBookmarked: await isBookmarked({
                    roomEntity: room,
                    myUserUid: authorizedUserUid,
                }),
            },
        };
    }

    @Query(() => GetRoomResult, {
        description:
            '通常はこの Query を直接実行する必要はありません。@flocon-trpg/sdk を用いることで、リアルタイムに Room を取得および自動更新できます。',
    })
    @Auth(ENTRY)
    public async getRoom(
        @Args() args: GetRoomArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<typeof GetRoomResult> {
        // lock が必要かどうかは微妙
        return await lockByRoomId(args.roomId, async () => await this.#getRoomCore(args, auth));
    }
}
