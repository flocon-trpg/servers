import {
    Args,
    ArgsType,
    Authorized,
    Ctx,
    Field,
    Mutation,
    ObjectType,
    PubSub,
    PubSubEngine,
    Resolver,
    UseMiddleware,
    createUnionType,
} from 'type-graphql';
import { ENTRY } from '../../../../roles';
import { queueLimitReached } from '../../../../utils/promiseQueue';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { ResolverContext } from '../../../utils/Contexts';
import { serverTooBusyMessage } from '../../messages';
import * as Room$MikroORM from '../../../entities/room/mikro-orm';
import { RoomOperation } from '../../../entities/room/graphql';
import { ParticipantRole, Player, Spectator, State, participantTemplate } from '@flocon-trpg/core';
import { RoomEventPayload } from '../../subsciptions/roomEvent/payload';
import {
    bcryptCompareNullable,
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    operateParticipantAndFlush,
    publishRoomEvent,
} from '../../utils';
import { JoinRoomFailureType } from '../../../../enums/JoinRoomFailureType';
import { convertToMaxLength100String } from '../../../../utils/convertToMaxLength100String';

type ParticipantState = State<typeof participantTemplate>;

@ObjectType()
class JoinRoomSuccessResult {
    @Field({ nullable: true })
    public operation?: RoomOperation;
}

@ObjectType()
class JoinRoomFailureResult {
    @Field(() => JoinRoomFailureType)
    public failureType!: JoinRoomFailureType;
}

export const JoinRoomResult = createUnionType({
    name: 'JoinRoomResult',
    types: () => [JoinRoomSuccessResult, JoinRoomFailureResult] as const,
    resolveType: value => {
        if ('operation' in value) {
            return JoinRoomSuccessResult;
        }
        if ('failureType' in value) {
            return JoinRoomFailureResult;
        }
        return undefined;
    },
});

@ArgsType()
class JoinRoomArgs {
    @Field()
    public id!: string;

    @Field()
    public name!: string;

    @Field({ nullable: true })
    public password?: string;
}

const joinRoomCore = async ({
    args,
    context,
    strategy,
}: {
    args: JoinRoomArgs;
    context: ResolverContext;
    // 新たにRoleを設定する場合はParticipantRoleを返す。Roleを変えない場合は'id'を返す。
    strategy: (params: {
        room: Room$MikroORM.Room;
        args: JoinRoomArgs;
        me: ParticipantState | undefined;
    }) => Promise<
        | ParticipantRole
        | JoinRoomFailureType.WrongPassword
        | JoinRoomFailureType.AlreadyParticipant
        | 'id'
    >;
}): Promise<{ result: typeof JoinRoomResult; payload: RoomEventPayload | undefined }> => {
    const queue = async (): Promise<{
        result: typeof JoinRoomResult;
        payload: RoomEventPayload | undefined;
    }> => {
        const em = context.em;
        const authorizedUser = ensureAuthorizedUser(context);
        const findResult = await findRoomAndMyParticipant({
            em,
            userUid: authorizedUser.userUid,
            roomId: args.id,
        });
        if (findResult == null) {
            return {
                result: {
                    failureType: JoinRoomFailureType.NotFound,
                },
                payload: undefined,
            };
        }
        const { room, me } = findResult;
        const participantUserUids = findResult.participantIds();
        const strategyResult = await strategy({ me, room, args });
        switch (strategyResult) {
            case 'id': {
                return {
                    result: {
                        operation: undefined,
                    },
                    payload: undefined,
                };
            }
            case JoinRoomFailureType.WrongPassword: {
                return {
                    result: {
                        failureType: JoinRoomFailureType.WrongPassword,
                    },
                    payload: undefined,
                };
            }
            case JoinRoomFailureType.AlreadyParticipant: {
                return {
                    result: {
                        failureType: JoinRoomFailureType.AlreadyParticipant,
                    },
                    payload: undefined,
                };
            }
            default: {
                return await operateParticipantAndFlush({
                    em,
                    room,
                    roomHistCount: context.serverConfig.roomHistCount,
                    participantUserUids,
                    myUserUid: authorizedUser.userUid,
                    create: {
                        name: convertToMaxLength100String(args.name),
                        role: strategyResult,
                    },
                    update: {
                        role: { newValue: strategyResult },
                    },
                });
            }
        }
    };

    const result = await context.promiseQueue.next(queue);
    if (result.type === queueLimitReached) {
        throw serverTooBusyMessage;
    }
    return result.value;
};

@Resolver()
export class JoinRoomResolver {
    @Mutation(() => JoinRoomResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async joinRoomAsPlayer(
        @Args() args: JoinRoomArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<typeof JoinRoomResult> {
        const { result, payload } = await joinRoomCore({
            args,
            context,
            strategy: async ({ me, room }) => {
                if (me != null) {
                    switch (me.role) {
                        case undefined:
                            break;
                        default:
                            return JoinRoomFailureType.AlreadyParticipant;
                    }
                }
                if (!(await bcryptCompareNullable(args.password, room.playerPasswordHash))) {
                    return JoinRoomFailureType.WrongPassword;
                }
                return Player;
            },
        });
        if (payload != null) {
            await publishRoomEvent(pubSub, payload);
        }
        return result;
    }

    @Mutation(() => JoinRoomResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async joinRoomAsSpectator(
        @Args() args: JoinRoomArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<typeof JoinRoomResult> {
        const { result, payload } = await joinRoomCore({
            args,
            context,
            strategy: async ({ me, room }) => {
                if (me != null) {
                    switch (me.role) {
                        case undefined:
                            break;
                        default:
                            return JoinRoomFailureType.AlreadyParticipant;
                    }
                }
                if (!(await bcryptCompareNullable(args.password, room.spectatorPasswordHash))) {
                    return JoinRoomFailureType.WrongPassword;
                }
                return Spectator;
            },
        });
        if (payload != null) {
            await publishRoomEvent(pubSub, payload);
        }
        return result;
    }
}
