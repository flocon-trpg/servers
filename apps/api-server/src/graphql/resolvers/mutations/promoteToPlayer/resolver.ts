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
import { Args, ArgsType, Field, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import { produce } from 'immer';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { PromoteFailureType } from '../../../../enums/PromoteFailureType';
import * as Room$MikroORM from '../../../../mikro-orm/entities/room/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
import { EM } from '../../../../types';
import { RoomEventPayload } from '../../subsciptions/roomEvent/payload';
import {
    IdOperation,
    RoomNotFound,
    bcryptCompareNullable,
    operateAsAdminAndFlush,
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
    userUid,
    em,
    strategy,
}: {
    roomId: string;
    userUid: string;
    em: EM;
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
    const flushResult = await operateAsAdminAndFlush({
        operationType: 'state',
        em,
        roomId,
        roomHistCount: undefined,
        operation: async (roomState, { room }) => {
            const me = roomState.participants?.[userUid];
            if (me == null) {
                return Result.error(PromoteFailureType.NotParticipant);
            }
            const strategyResult = await strategy({ me, room });
            switch (strategyResult) {
                case 'Master':
                case 'Player':
                case 'Spectator': {
                    const result = produce(roomState, roomState => {
                        const me = roomState.participants?.[userUid];
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

@Resolver(() => PromoteResult)
export class PromoteToPlayerResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
    ) {}

    @Mutation(() => PromoteResult)
    @Auth(ENTRY)
    public async promoteToPlayer(
        @Args() args: PromoteArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<PromoteResult> {
        const { result, payload } = await promoteMeCore({
            ...args,
            em: await this.mikroOrmService.forkEmForMain(),
            userUid: auth.user.userUid,
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
            this.pubSubService.roomEvent.next(payload);
        }
        return result;
    }
}
