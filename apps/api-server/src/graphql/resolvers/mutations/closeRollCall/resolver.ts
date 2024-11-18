import { Master, Player, toOtError } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { Args, Field, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import { produce } from 'immer';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { CloseRollCallFailureType } from '../../../../enums/CloseRollCallFailureType';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
import { IdOperation, RoomNotFound, operateAsAdminAndFlush } from '../../utils/utils';

@ObjectType()
class CloseRollCallResult {
    @Field(() => CloseRollCallFailureType, { nullable: true })
    public failureType?: CloseRollCallFailureType;
}

@Resolver(() => CloseRollCallResult)
export class CloseRollCallResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
    ) {}

    // TODO: テストを書く
    @Mutation(() => CloseRollCallResult, { description: 'since v0.7.13' })
    @Auth(ENTRY)
    public async closeRollCall(
        @Args('roomId') roomId: string,
        @Args('rollCallId') rollCallId: string,
        @AuthData() auth: AuthDataType,
    ): Promise<CloseRollCallResult> {
        const myUserUid = auth.user.userUid;
        const em = await this.mikroOrmService.forkEmForMain();
        const result = await operateAsAdminAndFlush({
            em,
            roomId,
            roomHistCount: undefined,
            operationType: 'state',
            operation: roomState => {
                const me = roomState.participants?.[myUserUid];
                switch (me?.role) {
                    case Master:
                    case Player:
                        break;
                    default:
                        return Result.error(CloseRollCallFailureType.NotAuthorizedParticipant);
                }
                const rollCall = roomState.rollCalls?.[rollCallId];
                if (rollCall == null) {
                    return Result.error(CloseRollCallFailureType.RollCallNotFound);
                }
                if (rollCall.closeStatus != null) {
                    return Result.error(CloseRollCallFailureType.AlreadyClosed);
                }
                const nextRoomState = produce(roomState, roomState => {
                    const rollCall = roomState.rollCalls?.[rollCallId];
                    if (rollCall == null) {
                        return;
                    }
                    rollCall.closeStatus = { closedBy: myUserUid, reason: 'Closed' };
                });
                return Result.ok(nextRoomState);
            },
        });
        if (result.isError) {
            if (result.error.type === 'custom') {
                return { failureType: result.error.error };
            }
            throw toOtError(result.error.error);
        }
        switch (result.value) {
            case RoomNotFound:
                return { failureType: CloseRollCallFailureType.RoomNotFound };
            case IdOperation:
                return {};
            default:
                break;
        }
        this.pubSubService.roomEvent.next(result.value);
        return {};
    }
}
