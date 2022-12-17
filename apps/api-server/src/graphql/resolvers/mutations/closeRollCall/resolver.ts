import { Master, Player, toOtError } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { produce } from 'immer';
import {
    Arg,
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
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import {
    IdOperation,
    RoomNotFound,
    ensureUserUid,
    operateAsAdminAndFlush,
    publishRoomEvent,
} from '../../utils/utils';
import { CloseRollCallFailureType } from '@/enums/CloseRollCallFailureType';

@ObjectType()
class CloseRollCallResult {
    @Field(() => CloseRollCallFailureType, { nullable: true })
    public failureType?: CloseRollCallFailureType;
}

@Resolver()
export class CloseRollCallResolver {
    // TODO: テストを書く
    @Mutation(() => CloseRollCallResult, { description: 'since v0.7.13' })
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async closeRollCall(
        @Arg('roomId') roomId: string,
        @Arg('rollCallId') rollCallId: string,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<CloseRollCallResult> {
        const myUserUid = ensureUserUid(context);
        const result = await operateAsAdminAndFlush({
            em: context.em,
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
        await publishRoomEvent(pubSub, result.value);
        return {};
    }
}
