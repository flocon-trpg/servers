import { Args, ArgsType, Field, Mutation, Resolver } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { EditMessageFailureType } from '../../../../enums/EditMessageFailureType';
import { RoomPrvMsg, RoomPubMsg } from '../../../../mikro-orm/entities/roomMessage/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
import { lockByRoomId } from '../../../../utils/asyncLock';
import {
    EditMessageResult,
    RoomPrivateMessageUpdate,
    RoomPublicMessageUpdate,
} from '../../../objects/roomMessage';
import {
    createRoomPrivateMessageUpdate,
    createRoomPublicMessageUpdate,
    findRoomAndMyParticipant,
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

@Resolver(() => EditMessageResult)
export class EditMessageResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
    ) {}

    // CONSIDER: 例えば'1d100'などダイスを振るメッセージでも現在はedit可能だが、editされてもinitTextなどを参照すれば問題ない。ただしロジックが少しややこしくなるので、そのようなケースはeditを拒否するように仕様変更したほうがいいのかも？
    async #editMessageCore(args: EditMessageArgs, auth: AuthDataType): Promise<EditMessageResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const authorizedUserUid = auth.user.userUid;
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
            this.pubSubService.roomEvent.next({
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
            this.pubSubService.roomEvent.next({
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

    @Mutation(() => EditMessageResult)
    @Auth(ENTRY)
    public async editMessage(
        @Args() args: EditMessageArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<EditMessageResult> {
        return await lockByRoomId(args.roomId, async () => await this.#editMessageCore(args, auth));
    }
}
