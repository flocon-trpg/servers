import { ParticipantRole, Player, Spectator, State, participantTemplate } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import produce from 'immer';
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
import * as Room$MikroORM from '../../../../entities/room/entity';
import { JoinRoomFailureType } from '../../../../enums/JoinRoomFailureType';
import { ResolverContext } from '../../../../types';
import { convertToMaxLength100String } from '../../../../utils/convertToMaxLength100String';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { RoomOperation } from '../../../objects/room';
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

/** @deprecated Operation を渡す手段は Mutation の戻り値と RoomEvent の 2 つがありますが、Operate Mutation 以外では Mutation の戻り値を用いる必要性が薄いため、RoomEvent に一本化される可能性があります。 */
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
    const em = context.em;
    const authorizedUser = ensureAuthorizedUser(context);
    const result = await operateAsAdminAndFlush({
        em,
        roomId: args.id,
        roomHistCount: context.serverConfig.roomHistCount,
        operationType: 'state',
        operation: async (roomState, { room }) => {
            const me = roomState.participants?.[authorizedUser.userUid];
            const strategyResult = await strategy({ room, args, me });
            switch (strategyResult) {
                case JoinRoomFailureType.WrongPassword:
                case JoinRoomFailureType.AlreadyParticipant:
                    return Result.error({ failureType: strategyResult });
                case 'id':
                    return Result.ok(roomState);
                default:
                    break;
            }
            const nextRoomState = produce(roomState, roomState => {
                const target = roomState.participants?.[authorizedUser.userUid];
                if (target != null) {
                    target.role = strategyResult;
                    return;
                }
                if (roomState.participants == null) {
                    roomState.participants = {};
                }
                roomState.participants[authorizedUser.userUid] = {
                    $v: 2,
                    $r: 1,
                    name: convertToMaxLength100String(args.name),
                    role: strategyResult,
                };
            });
            return Result.ok(nextRoomState);
        },
    });

    if (result.isError) {
        if (result.error.type === 'custom') {
            return { result: { failureType: result.error.error.failureType }, payload: undefined };
        }
        return { result: { failureType: JoinRoomFailureType.TransformError }, payload: undefined };
    }
    switch (result.value) {
        case RoomNotFound:
            return { result: { failureType: JoinRoomFailureType.NotFound }, payload: undefined };
        case IdOperation:
            return { result: {}, payload: undefined };
        default:
            break;
    }
    return {
        result: {
            operation: result.value.generateOperation(authorizedUser.userUid),
        },
        payload: result.value,
    };
};

@Resolver()
export class JoinRoomResolver {
    @Mutation(() => JoinRoomResult)
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
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
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
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
