import { toOtError } from '@flocon-trpg/core';
import {
    Arg,
    Args,
    Authorized,
    Ctx,
    Field,
    InputType,
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
import { FilePath } from '@/graphql/objects/filePath';

@ObjectType()
class PerformRollCallResult {
    @Field(() => PerformRollCallFailureType, { nullable: true })
    failureType?: PerformRollCallFailureType;
}

@InputType()
class PerformRollCallInput {
    @Field()
    roomId!: string;

    @Field(() => FilePath, {
        nullable: true,
        description:
            'SE を設定する場合、これと併せて soundEffectVolume もセットする必要があります。',
    })
    soundEffectFile?: FilePath;

    @Field({
        nullable: true,
        description: 'SE を設定する場合、これと併せて soundEffectFile もセットする必要があります。',
    })
    soundEffectVolume?: number;
}

// 過去の点呼の自動削除や、作成日時をサーバーでセットする必要があるため、Operate mutation ではなくこの mutation で点呼を作成するようにしている。
@Resolver()
export class PerformRollCallResolver {
    // TODO: テストを書く
    @Mutation(() => PerformRollCallResult, { description: 'since v0.7.13' })
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async performRollCall(
        @Arg('input') input: PerformRollCallInput,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<PerformRollCallResult> {
        const myUserUid = ensureUserUid(context);
        const result = await operateAsAdminAndFlush({
            em: context.em,
            roomId: input.roomId,
            roomHistCount: undefined,
            operationType: 'state',
            operation: roomState => {
                const soundEffect =
                    input.soundEffectFile != null && input.soundEffectVolume != null
                        ? {
                              file: { ...input.soundEffectFile, $v: 1, $r: 1 } as const,
                              volume: input.soundEffectVolume,
                          }
                        : undefined;
                return performRollCall(roomState, myUserUid, soundEffect);
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
