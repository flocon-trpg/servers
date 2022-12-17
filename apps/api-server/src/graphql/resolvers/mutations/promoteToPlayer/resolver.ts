import {
    Master,
    ParticipantRole,
    Player,
    Spectator,
    State,
    participantTemplate,
    toOtError,
} from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { produce } from 'immer';
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
import * as Room$MikroORM from '../../../../entities/room/entity';
import { PromoteFailureType } from '../../../../enums/PromoteFailureType';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { RoomEventPayload } from '../../subsciptions/roomEvent/payload';
import {
    IdOperation,
    RoomNotFound,
    bcryptCompareNullable,
    ensureAuthorizedUser,
    operateAsAdminAndFlush,
    publishRoomEvent,
} from '../../utils/utils';

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
    const flushResult = await operateAsAdminAndFlush({
        operationType: 'state',
        em,
        roomId,
        roomHistCount: undefined,
        operation: async (roomState, { room }) => {
            const me = roomState.participants?.[authorizedUser.userUid];
            if (me == null) {
                return Result.error(PromoteFailureType.NotParticipant);
            }
            const strategyResult = await strategy({ me, room });
            switch (strategyResult) {
                case 'Master':
                case 'Player':
                case 'Spectator': {
                    const result = produce(roomState, roomState => {
                        const me = roomState.participants?.[authorizedUser.userUid];
                        if (me == null) {
                            return;
                        }
                        me.role = strategyResult;
                    });
                    return Result.ok(result);
                }
                default:
                    return Result.error(strategyResult);
            }
        },
    });
    if (flushResult.isError) {
        if (flushResult.error.type === 'custom') {
            return { result: { failureType: flushResult.error.error }, payload: undefined };
        }
        throw toOtError(flushResult.error.error);
    }
    switch (flushResult.value) {
        case RoomNotFound:
            return { result: { failureType: PromoteFailureType.NotFound }, payload: undefined };
        case IdOperation:
            return {
                result: { failureType: PromoteFailureType.NoNeedToPromote },
                payload: undefined,
            };
        default:
            return { result: {}, payload: flushResult.value };
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
