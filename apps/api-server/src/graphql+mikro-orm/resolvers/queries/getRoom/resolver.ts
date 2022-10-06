import {
    Arg,
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
import { ENTRY } from '../../../../roles';
import { RoomAsListItem } from '../../../entities/roomAsListItem/graphql';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { ResolverContext } from '../../../utils/Contexts';
import * as Room$MikroORM from '../../../entities/room/mikro-orm';
import * as RoomAsListItemGlobal from '../../../entities/roomAsListItem/global';
import { queueLimitReached } from '../../../../utils/promiseQueue';
import { serverTooBusyMessage } from '../../messages';
import {
    ParticipantRoleType,
    stringToParticipantRoleType,
} from '../../../../enums/ParticipantRoleType';
import { RoomGetState } from '../../../entities/room/graphql';
import { Result } from '@kizahasi/result';
import { GlobalRoom } from '../../../entities/room/global';
import { client } from '@flocon-trpg/core';
import { ensureAuthorizedUser, findRoomAndMyParticipant } from '../../utils';

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
    @UseMiddleware(RateLimitMiddleware(2))
    public async getRoom(
        @Args() args: GetRoomArgs,
        @Ctx() context: ResolverContext
    ): Promise<typeof GetRoomResult> {
        const queue = async (): Promise<Result<typeof GetRoomResult>> => {
            const em = context.em;
            const authorizedUserUid = ensureAuthorizedUser(context).userUid;
            const findResult = await findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: args.id,
            });
            if (findResult == null) {
                return Result.ok({
                    failureType: GetRoomFailureType.NotFound,
                });
            }
            const { room, me } = findResult;
            if (me?.role == null) {
                return Result.ok({
                    roomAsListItem: await RoomAsListItemGlobal.stateToGraphQL({
                        roomEntity: room,
                        myUserUid: authorizedUserUid,
                    }),
                });
            }

            const roomState = await GlobalRoom.MikroORM.ToGlobal.state(room, em);
            return Result.ok({
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
                    role: await RoomAsListItemGlobal.role({
                        roomEntity: room,
                        myUserUid: authorizedUserUid,
                    }),
                    isBookmarked: await RoomAsListItemGlobal.isBookmarked({
                        roomEntity: room,
                        myUserUid: authorizedUserUid,
                    }),
                },
            });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }
}
