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
import { EditMessageFailureType } from '../../../../enums/EditMessageFailureType';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import {
    EditMessageResult,
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
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async editMessage(
        @Args() args: EditMessageArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine,
    ): Promise<EditMessageResult> {
        const em = context.em;
        const authorizedUserUid = ensureAuthorizedUser(context).userUid;
        const findResult = await findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                failureType: EditMessageFailureType.RoomNotFound,
            };
        }
        const { room, me } = findResult;
        if (me === undefined) {
            return {
                failureType: EditMessageFailureType.NotParticipant,
            };
        }
        const publicMsg = await em.findOne(RoomPubMsg, { id: args.messageId });
        if (publicMsg != null) {
            if ((await publicMsg.createdBy?.loadProperty('userUid')) !== authorizedUserUid) {
                return {
                    failureType: EditMessageFailureType.NotYourMessage,
                };
            }
            if (isDeleted(publicMsg)) {
                return {
                    failureType: EditMessageFailureType.MessageDeleted,
                };
            }
            publicMsg.updatedText = args.text;
            publicMsg.textUpdatedAt3 = new Date();
            room.completeUpdatedAt = new Date();
            await em.flush();

            const payloadValue: RoomPublicMessageUpdate = createRoomPublicMessageUpdate(publicMsg);
            await publishRoomEvent(pubSub, {
                type: 'messageUpdatePayload',
                sendTo: findResult.participantIds(),
                roomId: room.id,
                visibleTo: undefined,
                createdBy: await publicMsg.createdBy?.loadProperty('userUid'),
                value: payloadValue,
            });
            return {};
        }
        const privateMsg = await em.findOne(RoomPrvMsg, { id: args.messageId });
        if (privateMsg != null) {
            if ((await privateMsg.createdBy?.loadProperty('userUid')) !== authorizedUserUid) {
                return {
                    failureType: EditMessageFailureType.NotYourMessage,
                };
            }
            if (privateMsg.initText == null) {
                return {
                    failureType: EditMessageFailureType.MessageDeleted,
                };
            }
            privateMsg.updatedText = args.text;
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
                createdBy: await privateMsg.createdBy?.loadProperty('userUid'),
                value: payloadValue,
            });
            return {};
        }

        return {
            failureType: EditMessageFailureType.MessageNotFound,
        };
    }
}
