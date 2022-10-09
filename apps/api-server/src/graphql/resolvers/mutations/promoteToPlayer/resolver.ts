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
} from 'type-graphql';
import { ENTRY } from '../../../../utils/roles';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import * as Room$MikroORM from '../../../../entities/room/entity';
import {
    Master,
    ParticipantRole,
    Player,
    Spectator,
    State,
    participantTemplate,
} from '@flocon-trpg/core';
import { RoomEventPayload } from '../../subsciptions/roomEvent/payload';
import {
    bcryptCompareNullable,
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    operateParticipantAndFlush,
    publishRoomEvent,
} from '../../utils/utils';
import { PromoteFailureType } from '../../../../enums/PromoteFailureType';
import { ResolverContext } from '../../../../types';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';

type ParticipantState = State<typeof participantTemplate>;

@ArgsType()
class PromoteArgs {
    @Field()
    public roomId!: string;

    @Field({ nullable: true })
    public password?: string;
}

@ObjectType()
class PromoteResult {
    @Field(() => PromoteFailureType, { nullable: true })
    public failureType?: PromoteFailureType;
}

const promoteMeCore = async ({
    roomId,
    context,
    strategy,
}: {
    roomId: string;
    context: ResolverContext;
    strategy: (params: {
        room: Room$MikroORM.Room;
        me: ParticipantState;
    }) => Promise<
        | ParticipantRole
        | PromoteFailureType.WrongPassword
        | PromoteFailureType.NoNeedToPromote
        | PromoteFailureType.NotParticipant
    >;
}): Promise<{ result: PromoteResult; payload: RoomEventPayload | undefined }> => {
    const em = context.em;
    const authorizedUser = ensureAuthorizedUser(context);
    const findResult = await findRoomAndMyParticipant({
        em,
        userUid: authorizedUser.userUid,
        roomId,
    });
    if (findResult == null) {
        return {
            result: {
                failureType: PromoteFailureType.NotFound,
            },
            payload: undefined,
        };
    }
    const { room, me } = findResult;
    const participantUserUids = findResult.participantIds();
    if (me == null) {
        return {
            result: {
                failureType: PromoteFailureType.NotParticipant,
            },
            payload: undefined,
        };
    }
    const strategyResult = await strategy({ me, room });
    switch (strategyResult) {
        case PromoteFailureType.NoNeedToPromote: {
            return {
                result: {
                    failureType: PromoteFailureType.NoNeedToPromote,
                },
                payload: undefined,
            };
        }
        case PromoteFailureType.WrongPassword: {
            return {
                result: {
                    failureType: PromoteFailureType.WrongPassword,
                },
                payload: undefined,
            };
        }
        case PromoteFailureType.NotParticipant: {
            return {
                result: {
                    failureType: PromoteFailureType.NotParticipant,
                },
                payload: undefined,
            };
        }
        default: {
            return {
                result: {
                    failureType: undefined,
                },
                payload: (
                    await operateParticipantAndFlush({
                        em,
                        room,
                        roomHistCount: context.serverConfig.roomHistCount,
                        participantUserUids,
                        myUserUid: authorizedUser.userUid,
                        update: {
                            role: { newValue: strategyResult },
                        },
                    })
                )?.payload,
            };
        }
    }
};

@Resolver()
export class PromoteToPlayerResolver {
    @Mutation(() => PromoteResult)
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async promoteToPlayer(
        @Args() args: PromoteArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<PromoteResult> {
        const { result, payload } = await promoteMeCore({
            ...args,
            context,
            strategy: async ({ me, room }) => {
                switch (me.role) {
                    case Master:
                    case Player:
                        return PromoteFailureType.NoNeedToPromote;
                    case Spectator: {
                        if (
                            !(await bcryptCompareNullable(args.password, room.playerPasswordHash))
                        ) {
                            return PromoteFailureType.WrongPassword;
                        }
                        return Player;
                    }
                    case null:
                    case undefined:
                        return PromoteFailureType.NotParticipant;
                }
            },
        });
        if (payload != null) {
            await publishRoomEvent(pubSub, payload);
        }
        return result;
    }
}
