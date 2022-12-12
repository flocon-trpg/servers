import { toOtError } from '@flocon-trpg/core';
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
import { performRollCall } from './performRollCall';
import { PerformRollCallFailureType } from '@/enums/PerformRollCallFailureType';

@ObjectType()
class PerformRollCallResult {
    @Field(() => PerformRollCallFailureType, { nullable: true })
    public failureType?: PerformRollCallFailureType;
}

// 過去の点呼の自動削除や、作成日時をサーバーでセットする必要があるため、Operate mutation ではなくこの mutation で点呼を作成するようにしている。
@Resolver()
export class PerformRollCallResolver {
    // TODO: テストを書く
    @Mutation(() => PerformRollCallResult, { description: 'since v0.7.13' })
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async performRollCall(
        @Arg('roomId') roomId: string,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<PerformRollCallResult> {
        const myUserUid = ensureUserUid(context);
        const result = await operateAsAdminAndFlush({
            em: context.em,
            roomId,
            roomHistCount: undefined,
            operationType: 'state',
            operation: roomState => performRollCall(roomState, myUserUid),
        });
        if (result.isError) {
            if (result.error.type === 'custom') {
                return { failureType: result.error.error };
            }
            throw toOtError(result.error.error);
        }
        switch (result.value) {
            case RoomNotFound:
                return { failureType: PerformRollCallFailureType.NotFound };
            case IdOperation:
                return {};
            default:
                break;
        }
        await publishRoomEvent(pubSub, result.value);
        return {};
    }
}
