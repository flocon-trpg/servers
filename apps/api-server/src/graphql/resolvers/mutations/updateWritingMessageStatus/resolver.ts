import {
    Args,
    ArgsType,
    Authorized,
    Ctx,
    Field,
    Mutation,
    PubSub,
    PubSubEngine,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { WritingMessageStatusInputType } from '../../../../enums/WritingMessageStatusInputType';
import { WritingMessageStatusType } from '../../../../enums/WritingMessageStatusType';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { all } from '../../types';
import { ensureAuthorizedUser, publishRoomEvent } from '../../utils/utils';

@ArgsType()
class UpdateWritingMessageStateArgs {
    @Field()
    public roomId!: string;

    @Field(() => WritingMessageStatusInputType)
    public newStatus!: WritingMessageStatusInputType;
}

@Resolver()
export class UpdateWritingMessageStatusResolver {
    @Mutation(() => Boolean, {
        description:
            'この Mutation を直接実行することは非推奨です。代わりに @flocon-trpg/sdk を用いてください。',
    })
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async updateWritingMessageStatus(
        @Args() args: UpdateWritingMessageStateArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine,
    ): Promise<boolean> {
        const authorizedUserUid = ensureAuthorizedUser(context).userUid;
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

        const returns = await context.connectionManager.onWritingMessageStatusUpdate({
            roomId: args.roomId,
            userUid: authorizedUserUid,
            status,
        });
        if (returns != null) {
            await publishRoomEvent(pubSub, {
                type: 'writingMessageStatusUpdatePayload',
                roomId: args.roomId,
                userUid: authorizedUserUid,
                status: returns,
                updatedAt: new Date().getTime(),

                // 比較的頻繁に呼び出されるoperationであると考えられるため、Roomのparticipantの取得を省略して動作を軽量化させている
                sendTo: all,
            });
        }
        return true;
    }
}
