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
import { AnswerRollCallFailureType } from '@/enums/AnswerRollCallFailureType';

@ObjectType()
class AnswerRollCallResult {
    @Field(() => AnswerRollCallFailureType, { nullable: true })
    public failureType?: AnswerRollCallFailureType;
}

// StateManager 等を経由せずなるべく速やかに変更させたいと思われるため、Operate mutation ではなくこの mutation で点呼状況を変更させるようにしている。
// また、もし Operate mutation を用いるとすると、クライアント側から渡された answeredAt は現在時刻と大きく異なる可能性があるので、serverTransform ではクライアントから渡された時刻を無視して API サーバー側の現在時刻に置き換える必要があるが、これはあまり綺麗な処理方法ではない、といった理由もある。
@Resolver()
export class AnswerRollCallResolver {
    // TODO: テストを書く
    @Mutation(() => AnswerRollCallResult, { description: 'since v0.7.13' })
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async answerRollCall(
        @Arg('roomId') roomId: string,
        @Arg('rollCallId') rollCallId: string,
        @Arg('answer') answer: boolean,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine,
    ): Promise<AnswerRollCallResult> {
        const myUserUid = ensureUserUid(context);
        const result = await operateAsAdminAndFlush({
            em: context.em,
            roomId,
            roomHistCount: undefined,
            operationType: 'state',
            operation: roomState => {
                const me = roomState.participants?.[myUserUid];
                // Spectator は点呼に参加できないが、参加できるようにこのコードを変更しても構わない。ただ、観戦者の点呼の需要が少ないと思われるため、現時点では実装していない。
                switch (me?.role) {
                    case Master:
                    case Player:
                        break;
                    default:
                        return Result.error(AnswerRollCallFailureType.NotAuthorizedParticipant);
                }
                const rollCall = roomState.rollCalls?.[rollCallId];
                if (rollCall == null) {
                    return Result.error(AnswerRollCallFailureType.RollCallNotFound);
                }
                const nextRoomState = produce(roomState, roomState => {
                    const rollCall = roomState.rollCalls?.[rollCallId];
                    if (rollCall == null) {
                        return;
                    }
                    const prevValue = rollCall.participants?.[myUserUid]?.answeredAt;
                    const newValue = answer ? new Date().getTime() : undefined;

                    // 大量実行への防御的対策として、1 秒以内に実行された場合は拒否するようにしている。
                    if (prevValue != null && newValue != null && newValue - prevValue < 1_000) {
                        return;
                    }

                    if (rollCall.participants == null) {
                        rollCall.participants = {};
                    }
                    const targetParticipant = rollCall.participants[myUserUid];
                    if (targetParticipant == null) {
                        rollCall.participants[myUserUid] = {
                            $v: 1,
                            $r: 1,
                            answeredAt: newValue,
                        };
                    } else {
                        targetParticipant.answeredAt = newValue;
                    }
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
                return { failureType: AnswerRollCallFailureType.RoomNotFound };
            case IdOperation:
                return {};
            default:
                break;
        }
        await publishRoomEvent(pubSub, result.value);
        return {};
    }
}
