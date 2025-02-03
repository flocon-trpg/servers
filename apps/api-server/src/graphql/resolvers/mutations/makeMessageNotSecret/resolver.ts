import { Args, ArgsType, Field, Mutation, Resolver } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { MakeMessageNotSecretFailureType } from '../../../../enums/MakeMessageNotSecretFailureType';
import { RoomPrvMsg, RoomPubMsg } from '../../../../mikro-orm/entities/roomMessage/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
import { lockByRoomId } from '../../../../utils/asyncLock';
import { MakeMessageNotSecretResult } from '../../../objects/roomMessage';
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

@Resolver(() => MakeMessageNotSecretResult)
export class MakeMessageNotSecretResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
    ) {}

    async #makeMessageNotSecretCore(
        args: MessageIdArgs,
        auth: AuthDataType,
    ): Promise<MakeMessageNotSecretResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const authorizedUserUid = auth.user.userUid;
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
            failureType: MakeMessageNotSecretFailureType.MessageNotFound,
        };
    }

    @Mutation(() => MakeMessageNotSecretResult)
    @Auth(ENTRY)
    public async makeMessageNotSecret(
        @Args() args: MessageIdArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<MakeMessageNotSecretResult> {
        return await lockByRoomId(
            args.roomId,
            async () => await this.#makeMessageNotSecretCore(args, auth),
        );
    }
}
