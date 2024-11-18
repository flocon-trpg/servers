import { Args, ArgsType, Field, Mutation, Resolver } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { ConnectionManagerService } from '../../../../connection-manager/connection-manager.service';
import { WritingMessageStatusInputType } from '../../../../enums/WritingMessageStatusInputType';
import { WritingMessageStatusType } from '../../../../enums/WritingMessageStatusType';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
import { all } from '../../types';

@ArgsType()
class UpdateWritingMessageStateArgs {
    @Field()
    public roomId!: string;

    @Field(() => WritingMessageStatusInputType)
    public newStatus!: WritingMessageStatusInputType;
}

@Resolver()
export class UpdateWritingMessageStatusResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
        private readonly connectionManagerService: ConnectionManagerService,
    ) {}

    @Mutation(() => Boolean, {
        description:
            'この Mutation を直接実行することは非推奨です。代わりに @flocon-trpg/sdk を用いてください。',
    })
    @Auth(ENTRY)
    public async updateWritingMessageStatus(
        @Args() args: UpdateWritingMessageStateArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<boolean> {
        let status: WritingMessageStatusType;
        switch (args.newStatus) {
            case WritingMessageStatusInputType.Cleared:
                status = WritingMessageStatusType.Cleared;
                break;
            case WritingMessageStatusInputType.StartWriting:
                status = WritingMessageStatusType.Writing;
                break;
            case WritingMessageStatusInputType.KeepWriting:
                status = WritingMessageStatusType.Writing;
                break;
        }

        const returns = await this.connectionManagerService.value.onWritingMessageStatusUpdate({
            roomId: args.roomId,
            userUid: auth.user.userUid,
            status,
        });
        if (returns != null) {
            this.pubSubService.roomEvent.next({
                type: 'writingMessageStatusUpdatePayload',
                roomId: args.roomId,
                userUid: auth.user.userUid,
                status: returns,
                updatedAt: new Date().getTime(),

                // 比較的頻繁に呼び出されるoperationであると考えられるため、Roomのparticipantの取得を省略して動作を軽量化させている
                sendTo: all,
            });
        }
        return true;
    }
}
