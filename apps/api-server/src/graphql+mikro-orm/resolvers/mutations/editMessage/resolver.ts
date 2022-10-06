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
import { ENTRY } from '../../../../roles';
import { queueLimitReached } from '../../../../utils/promiseQueue';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { ResolverContext } from '../../../utils/Contexts';
import { serverTooBusyMessage } from '../../messages';
import { MessageUpdatePayload } from '../../subsciptions/roomEvent/payload';
import { SendTo } from '../../types';
import {
    createRoomPrivateMessageUpdate,
    createRoomPublicMessageUpdate,
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    publishRoomEvent,
} from '../../utils';
import {
    EditMessageResult,
    RoomPrivateMessageUpdate,
    RoomPublicMessageUpdate,
} from '../../../entities/roomMessage/graphql';
import { RoomPrvMsg, RoomPubMsg } from '../../../entities/roomMessage/mikro-orm';
import { EditMessageFailureType } from '../../../../enums/EditMessageFailureType';

@ArgsType()
class EditMessageArgs {
    @Field()
    public roomId!: string;

    @Field()
    public messageId!: string;

    @Field()
    public text!: string;
}

const isDeleted = (entity: RoomPubMsg | RoomPrvMsg): boolean => {
    if (entity.textUpdatedAtValue == null) {
        return false;
    }
    return entity.updatedText == null;
};

@Resolver()
export class EditMessageResolver {
    // CONSIDER: 例えば'1d100'などダイスを振るメッセージでも現在はedit可能だが、editされてもinitTextなどを参照すれば問題ない。ただしロジックが少しややこしくなるので、そのようなケースはeditを拒否するように仕様変更したほうがいいのかも？
    @Mutation(() => EditMessageResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async editMessage(
        @Args() args: EditMessageArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<EditMessageResult> {
        const queue = async (): Promise<
            Result<{ result: EditMessageResult; payload?: MessageUpdatePayload & SendTo }>
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
                        failureType: EditMessageFailureType.RoomNotFound,
                    },
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return Result.ok({
                    result: {
                        failureType: EditMessageFailureType.NotParticipant,
                    },
                });
            }
            const publicMsg = await em.findOne(RoomPubMsg, { id: args.messageId });
            if (publicMsg != null) {
                if (publicMsg.createdBy?.userUid !== authorizedUserUid) {
                    return Result.ok({
                        result: {
                            failureType: EditMessageFailureType.NotYourMessage,
                        },
                    });
                }
                if (isDeleted(publicMsg)) {
                    return Result.ok({
                        result: {
                            failureType: EditMessageFailureType.MessageDeleted,
                        },
                    });
                }
                publicMsg.updatedText = args.text;
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
                            failureType: EditMessageFailureType.NotYourMessage,
                        },
                    });
                }
                if (privateMsg.initText == null) {
                    return Result.ok({
                        result: {
                            failureType: EditMessageFailureType.MessageDeleted,
                        },
                    });
                }
                privateMsg.updatedText = args.text;
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
                    failureType: EditMessageFailureType.MessageNotFound,
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
