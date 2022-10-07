import { Result } from '@kizahasi/result';
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
import { ENTRY } from '../../../../utils/roles';
import { queueLimitReached } from '../../../../utils/promiseQueue';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { serverTooBusyMessage } from '../../messages';
import { MessageUpdatePayload } from '../../subsciptions/roomEvent/payload';
import { SendTo } from '../../types';
import {
    createRoomPrivateMessageUpdate,
    createRoomPublicMessageUpdate,
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    publishRoomEvent,
} from '../../utils/utils';
import {
    DeleteMessageResult,
    RoomPrivateMessageUpdate,
    RoomPublicMessageUpdate,
} from '../../../objects/roomMessage';
import { RoomPrvMsg, RoomPubMsg } from '../../../../entities/roomMessage/entity';
import { DeleteMessageFailureType } from '../../../../enums/DeleteMessageFailureType';
import { ResolverContext } from '../../../../types';

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
    @UseMiddleware(RateLimitMiddleware(2))
    public async deleteMessage(
        @Args() args: MessageIdArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<DeleteMessageResult> {
        const queue = async (): Promise<
            Result<{ result: DeleteMessageResult; payload?: MessageUpdatePayload & SendTo }>
        > => {
            const em = context.em;
            const authorizedUserUid = ensureAuthorizedUser(context).userUid;
            const findResult = await findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: args.roomId,
            });
            if (findResult == null) {
                return Result.ok({
                    result: {
                        failureType: DeleteMessageFailureType.RoomNotFound,
                    },
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return Result.ok({
                    result: {
                        failureType: DeleteMessageFailureType.NotParticipant,
                    },
                });
            }
            const publicMsg = await em.findOne(RoomPubMsg, { id: args.messageId });
            if (publicMsg != null) {
                if (publicMsg.createdBy?.userUid !== authorizedUserUid) {
                    return Result.ok({
                        result: {
                            failureType: DeleteMessageFailureType.NotYourMessage,
                        },
                    });
                }
                if (publicMsg.updatedText == null && publicMsg.textUpdatedAtValue != null) {
                    return Result.ok({
                        result: {
                            failureType: DeleteMessageFailureType.MessageDeleted,
                        },
                    });
                }
                publicMsg.updatedText = undefined;
                publicMsg.textUpdatedAt3 = new Date();
                room.completeUpdatedAt = new Date();
                await em.flush();

                const payloadValue: RoomPublicMessageUpdate =
                    createRoomPublicMessageUpdate(publicMsg);
                return Result.ok({
                    result: {},
                    payload: {
                        type: 'messageUpdatePayload',
                        sendTo: findResult.participantIds(),
                        roomId: room.id,
                        visibleTo: undefined,
                        createdBy: publicMsg.createdBy?.userUid,
                        value: payloadValue,
                    },
                });
            }
            const privateMsg = await em.findOne(RoomPrvMsg, { id: args.messageId });
            if (privateMsg != null) {
                if (privateMsg.createdBy?.userUid !== authorizedUserUid) {
                    return Result.ok({
                        result: {
                            failureType: DeleteMessageFailureType.NotYourMessage,
                        },
                    });
                }
                if (privateMsg.updatedText == null && privateMsg.textUpdatedAtValue != null) {
                    return Result.ok({
                        result: {
                            failureType: DeleteMessageFailureType.MessageDeleted,
                        },
                    });
                }
                privateMsg.updatedText = undefined;
                privateMsg.textUpdatedAt3 = new Date();
                room.completeUpdatedAt = new Date();
                await em.flush();

                const payloadValue: RoomPrivateMessageUpdate =
                    createRoomPrivateMessageUpdate(privateMsg);
                return Result.ok({
                    result: {},
                    payload: {
                        type: 'messageUpdatePayload',
                        sendTo: findResult.participantIds(),
                        roomId: room.id,
                        visibleTo: (await privateMsg.visibleTo.loadItems()).map(
                            user => user.userUid
                        ),
                        createdBy: privateMsg.createdBy?.userUid,
                        value: payloadValue,
                    },
                });
            }

            return Result.ok({
                result: {
                    failureType: DeleteMessageFailureType.MessageNotFound,
                },
            });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        if (result.value.value.payload != null) {
            await publishRoomEvent(pubSub, result.value.value.payload);
        }
        return result.value.value.result;
    }
}
