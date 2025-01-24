import { ParticipantRole, Player, Spectator, State, participantTemplate } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import {
    Args,
    ArgsType,
    Field,
    Mutation,
    ObjectType,
    Resolver,
    createUnionType,
} from '@nestjs/graphql';
import { produce } from 'immer';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { JoinRoomFailureType } from '../../../../enums/JoinRoomFailureType';
import * as Room$MikroORM from '../../../../mikro-orm/entities/room/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
import { ServerConfig, ServerConfigService } from '../../../../server-config/server-config.service';
import { EM } from '../../../../types';
import { lockByRoomId } from '../../../../utils/asyncLock';
import { convertToMaxLength100String } from '../../../../utils/convertToMaxLength100String';
import { RoomOperation } from '../../../objects/room';
import { RoomEventPayload } from '../../subsciptions/roomEvent/payload';
import {
    IdOperation,
    RoomNotFound,
    bcryptCompareNullable,
    operateAsAdminAndFlush,
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

const joinRoomCoreWithoutLock = async ({
    args,
    serverConfig,
    em,
    userUid,
    strategy,
}: {
    args: JoinRoomArgs;
    serverConfig: ServerConfig;
    em: EM;
    userUid: string;
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
    const result = await operateAsAdminAndFlush({
        em,
        roomId: args.id,
        roomHistCount: serverConfig.roomHistCount,
        operationType: 'state',
        operation: async (roomState, { room }) => {
            const me = roomState.participants?.[userUid];
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
                const target = roomState.participants?.[userUid];
                if (target != null) {
                    target.role = strategyResult;
                    return;
                }
                if (roomState.participants == null) {
                    roomState.participants = {};
                }
                roomState.participants[userUid] = {
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
            operation: result.value.generateOperation(userUid),
        },
        payload: result.value,
    };
};

const joinRoomCore = async (functionArgs: Parameters<typeof joinRoomCoreWithoutLock>[0]) => {
    return await lockByRoomId(functionArgs.args.id, async () => {
        return await joinRoomCoreWithoutLock(functionArgs);
    });
};

@Resolver(() => JoinRoomResult)
export class JoinRoomAsPlayerResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
        private readonly serverConfigService: ServerConfigService,
    ) {}

    @Mutation(() => JoinRoomResult)
    @Auth(ENTRY)
    public async joinRoomAsPlayer(
        @Args() args: JoinRoomArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<typeof JoinRoomResult> {
        const { result, payload } = await joinRoomCore({
            args,
            serverConfig: this.serverConfigService.getValueForce(),
            em: await this.mikroOrmService.forkEmForMain(),
            userUid: auth.user.userUid,
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
            this.pubSubService.roomEvent.next(payload);
        }
        return result;
    }
}

@Resolver(() => JoinRoomResult)
export class JoinRoomAsSpectatorResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
        private readonly serverConfigService: ServerConfigService,
    ) {}
    @Mutation(() => JoinRoomResult)
    @Auth(ENTRY)
    public async joinRoomAsSpectator(
        @Args() args: JoinRoomArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<typeof JoinRoomResult> {
        const { result, payload } = await joinRoomCore({
            args,
            serverConfig: this.serverConfigService.getValueForce(),
            em: await this.mikroOrmService.forkEmForMain(),
            userUid: auth.user.userUid,
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
            this.pubSubService.roomEvent.next(payload);
        }
        return result;
    }
}
