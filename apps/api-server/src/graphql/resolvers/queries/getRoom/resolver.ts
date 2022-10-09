import {
    Args,
    ArgsType,
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
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import {
    ParticipantRoleType,
    stringToParticipantRoleType,
} from '../../../../enums/ParticipantRoleType';
import { RoomAsListItem, RoomGetState } from '../../../objects/room';
import { GlobalRoom } from '../../../../entities-graphql/room';
import { client } from '@flocon-trpg/core';
import { ensureAuthorizedUser, findRoomAndMyParticipant } from '../../utils/utils';
import { stateToGraphQL } from '../../../../entities-graphql/roomAsListItem';
import { ResolverContext } from '../../../../types';
import { isBookmarked } from '../../../../entities/room/isBookmarked';
import { role } from '../../../../entities/room/role';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';

@ArgsType()
class GetRoomArgs {
    @Field()
    public id!: string;
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
    @Query(() => GetRoomResult)
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async getRoom(
        @Args() args: GetRoomArgs,
        @Ctx() context: ResolverContext
    ): Promise<typeof GetRoomResult> {
        const em = context.em;
        const authorizedUserUid = ensureAuthorizedUser(context).userUid;
        const findResult = await findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId: args.id,
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
}
