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
import { MakeMessageNotSecretFailureType } from '../../../../enums/MakeMessageNotSecretFailureType';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { MakeMessageNotSecretResult } from '../../../objects/roomMessage';
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
export class MakeMessageNotSecretResolver {
    @Mutation(() => MakeMessageNotSecretResult)
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async makeMessageNotSecret(
        @Args() args: MessageIdArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine,
    ): Promise<MakeMessageNotSecretResult> {
        const em = context.em;
        const authorizedUserUid = ensureAuthorizedUser(context).userUid;
        const findResult = await findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                failureType: MakeMessageNotSecretFailureType.RoomNotFound,
            };
        }
        const { room, me } = findResult;
        if (me === undefined) {
            return {
                failureType: MakeMessageNotSecretFailureType.NotParticipant,
            };
        }
        const publicMsg = await em.findOne(RoomPubMsg, { id: args.messageId });
        if (publicMsg != null) {
            const createdBy = await publicMsg.createdBy?.loadProperty('userUid');
            if (createdBy !== authorizedUserUid) {
                return {
                    failureType: MakeMessageNotSecretFailureType.NotYourMessage,
                };
            }
            if (!publicMsg.isSecret) {
                return {
                    failureType: MakeMessageNotSecretFailureType.NotSecret,
                };
            }
            publicMsg.isSecret = false;
            room.completeUpdatedAt = new Date();
            await em.flush();

            const payloadValue = createRoomPublicMessageUpdate(publicMsg);
            await publishRoomEvent(pubSub, {
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
                    failureType: MakeMessageNotSecretFailureType.NotYourMessage,
                };
            }
            if (!privateMsg.isSecret) {
                return {
                    failureType: MakeMessageNotSecretFailureType.NotSecret,
                };
            }
            privateMsg.isSecret = false;
            room.completeUpdatedAt = new Date();
            await em.flush();

            const payloadValue = createRoomPrivateMessageUpdate(privateMsg);
            await publishRoomEvent(pubSub, {
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
            failureType: MakeMessageNotSecretFailureType.MessageNotFound,
        };
    }
}
