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
import { State, characterTemplate } from '@flocon-trpg/core';
import { MessageUpdatePayload } from '../../subsciptions/roomEvent/payload';
import { SendTo } from '../../types';
import {
    createRoomPrivateMessageUpdate,
    createRoomPublicMessageUpdate,
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    publishRoomEvent,
} from '../../utils';
import { MakeMessageNotSecretResult } from '../../../entities/roomMessage/graphql';
import { RoomPrvMsg, RoomPubMsg } from '../../../entities/roomMessage/mikro-orm';
import { MakeMessageNotSecretFailureType } from '../../../../enums/MakeMessageNotSecretFailureType';

type CharacterState = State<typeof characterTemplate>;

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
    @UseMiddleware(RateLimitMiddleware(2))
    public async makeMessageNotSecret(
        @Args() args: MessageIdArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<MakeMessageNotSecretResult> {
        const queue = async (): Promise<
            Result<{ result: MakeMessageNotSecretResult; payload?: MessageUpdatePayload & SendTo }>
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
                        failureType: MakeMessageNotSecretFailureType.RoomNotFound,
                    },
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return Result.ok({
                    result: {
                        failureType: MakeMessageNotSecretFailureType.NotParticipant,
                    },
                });
            }
            const publicMsg = await em.findOne(RoomPubMsg, { id: args.messageId });
            if (publicMsg != null) {
                if (publicMsg.createdBy?.userUid !== authorizedUserUid) {
                    return Result.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType.NotYourMessage,
                        },
                    });
                }
                if (!publicMsg.isSecret) {
                    return Result.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType.NotSecret,
                        },
                    });
                }
                publicMsg.isSecret = false;
                room.completeUpdatedAt = new Date();
                await em.flush();

                const payloadValue = createRoomPublicMessageUpdate(publicMsg);
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
                            failureType: MakeMessageNotSecretFailureType.NotYourMessage,
                        },
                    });
                }
                if (!privateMsg.isSecret) {
                    return Result.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType.NotSecret,
                        },
                    });
                }
                privateMsg.isSecret = false;
                room.completeUpdatedAt = new Date();
                await em.flush();

                const payloadValue = createRoomPrivateMessageUpdate(privateMsg);
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
                    failureType: MakeMessageNotSecretFailureType.MessageNotFound,
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
