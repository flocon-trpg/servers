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
import { RoomPrvMsg, RoomPubMsg } from '../../../../entities/roomMessage/entity';
import { DeleteMessageFailureType } from '../../../../enums/DeleteMessageFailureType';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import {
    DeleteMessageResult,
    RoomPrivateMessageUpdate,
    RoomPublicMessageUpdate,
} from '../../../objects/roomMessage';
import {
    createRoomPrivateMessageUpdate,
    createRoomPublicMessageUpdate,
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    publishRoomEvent,
} from '../../utils/utils';

@ArgsType()
class MessageIdArgs {
    @Field()
    public roomId!: string;

    @Field()
    public messageId!: string;
}

@Resolver()
export class DeleteMessageResolver {
    @Mutation(() => DeleteMessageResult)
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async deleteMessage(
        @Args() args: MessageIdArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<DeleteMessageResult> {
        const em = context.em;
        const authorizedUserUid = ensureAuthorizedUser(context).userUid;
        const findResult = await findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                failureType: DeleteMessageFailureType.RoomNotFound,
            };
        }
        const { room, me } = findResult;
        if (me === undefined) {
            return {
                failureType: DeleteMessageFailureType.NotParticipant,
            };
        }
        const publicMsg = await em.findOne(RoomPubMsg, { id: args.messageId });
        if (publicMsg != null) {
            if (publicMsg.createdBy?.userUid !== authorizedUserUid) {
                return {
                    failureType: DeleteMessageFailureType.NotYourMessage,
                };
            }
            if (publicMsg.updatedText == null && publicMsg.textUpdatedAtValue != null) {
                return {
                    failureType: DeleteMessageFailureType.MessageDeleted,
                };
            }
            publicMsg.updatedText = undefined;
            publicMsg.textUpdatedAt3 = new Date();
            room.completeUpdatedAt = new Date();
            await em.flush();

            const payloadValue: RoomPublicMessageUpdate = createRoomPublicMessageUpdate(publicMsg);
            await publishRoomEvent(pubSub, {
                type: 'messageUpdatePayload',
                sendTo: findResult.participantIds(),
                roomId: room.id,
                visibleTo: undefined,
                createdBy: publicMsg.createdBy?.userUid,
                value: payloadValue,
            });
            return {};
        }
        const privateMsg = await em.findOne(RoomPrvMsg, { id: args.messageId });
        if (privateMsg != null) {
            if (privateMsg.createdBy?.userUid !== authorizedUserUid) {
                return {
                    failureType: DeleteMessageFailureType.NotYourMessage,
                };
            }
            if (privateMsg.updatedText == null && privateMsg.textUpdatedAtValue != null) {
                return {
                    failureType: DeleteMessageFailureType.MessageDeleted,
                };
            }
            privateMsg.updatedText = undefined;
            privateMsg.textUpdatedAt3 = new Date();
            room.completeUpdatedAt = new Date();
            await em.flush();

            const payloadValue: RoomPrivateMessageUpdate =
                createRoomPrivateMessageUpdate(privateMsg);
            await publishRoomEvent(pubSub, {
                type: 'messageUpdatePayload',
                sendTo: findResult.participantIds(),
                roomId: room.id,
                visibleTo: (await privateMsg.visibleTo.loadItems()).map(user => user.userUid),
                createdBy: privateMsg.createdBy?.userUid,
                value: payloadValue,
            });
            return {};
        }
        return {
            failureType: DeleteMessageFailureType.MessageNotFound,
        };
    }
}
