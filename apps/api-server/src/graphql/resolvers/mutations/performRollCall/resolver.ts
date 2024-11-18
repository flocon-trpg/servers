import { toOtError } from '@flocon-trpg/core';
import { Args, Field, InputType, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { PerformRollCallFailureType } from '../../../../enums/PerformRollCallFailureType';
import { FilePath } from '../../../../graphql/objects/filePath';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
import { IdOperation, RoomNotFound, operateAsAdminAndFlush } from '../../utils/utils';
import { performRollCall } from './performRollCall';

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
@Resolver(() => PerformRollCallResult)
export class PerformRollCallResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
    ) {}

    // TODO: テストを書く
    @Mutation(() => PerformRollCallResult, { description: 'since v0.7.13' })
    @Auth(ENTRY)
    public async performRollCall(
        @Args('input') input: PerformRollCallInput,
        @AuthData() auth: AuthDataType,
    ): Promise<PerformRollCallResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const myUserUid = auth.user.userUid;
        const result = await operateAsAdminAndFlush({
            em,
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
        this.pubSubService.roomEvent.next(result.value);
        return {};
    }
}
