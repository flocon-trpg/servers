import { Args, ArgsType, Field, Mutation, Resolver } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { DeleteMessageFailureType } from '../../../../enums/DeleteMessageFailureType';
import { RoomPrvMsg, RoomPubMsg } from '../../../../mikro-orm/entities/roomMessage/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
import {
    DeleteMessageResult,
    RoomPrivateMessageUpdate,
    RoomPublicMessageUpdate,
} from '../../../objects/roomMessage';
import {
    createRoomPrivateMessageUpdate,
    createRoomPublicMessageUpdate,
    findRoomAndMyParticipant,
} from '../../utils/utils';

@ArgsType()
class MessageIdArgs {
    @Field()
    public roomId!: string;

    @Field()
    public messageId!: string;
}

@Resolver(() => DeleteMessageResult)
export class DeleteMessageResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
    ) {}

    @Mutation(() => DeleteMessageResult)
    @Auth(ENTRY)
    public async deleteMessage(
        @Args() args: MessageIdArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<DeleteMessageResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const authorizedUserUid = auth.user.userUid;
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
            const createdBy = await publicMsg.createdBy?.loadProperty('userUid');
            if (createdBy !== authorizedUserUid) {
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
            this.pubSubService.roomEvent.next({
                type: 'messageUpdatePayload',
                sendTo: findResult.participantIds(),
                roomId: room.id,
                visibleTo: undefined,
                createdBy,
                value: payloadValue,
            });
            return {};
        }
        const privateMsg = await em.findOne(RoomPrvMsg, { id: args.messageId });
        if (privateMsg != null) {
            const createdBy = await privateMsg.createdBy?.loadProperty('userUid');
            if (createdBy !== authorizedUserUid) {
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
            this.pubSubService.roomEvent.next({
                type: 'messageUpdatePayload',
                sendTo: findResult.participantIds(),
                roomId: room.id,
                visibleTo: (await privateMsg.visibleTo.loadItems()).map(user => user.userUid),
                createdBy,
                value: payloadValue,
            });
            return {};
        }
        return {
            failureType: DeleteMessageFailureType.MessageNotFound,
        };
    }
}
