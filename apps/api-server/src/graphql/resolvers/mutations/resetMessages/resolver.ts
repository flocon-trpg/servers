import { Result } from '@kizahasi/result';
import {
    Arg,
    Authorized,
    Ctx,
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
import { Spectator } from '@flocon-trpg/core';
import { RoomMessagesResetPayload } from '../../subsciptions/roomEvent/payload';
import { SendTo } from '../../types';
import {
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    publishRoomEvent,
} from '../../utils/utils';
import { ResetRoomMessagesResult, ResetRoomMessagesResultType } from '../../../objects/roomMessage';
import { ResetRoomMessagesFailureType } from '../../../../enums/ResetRoomMessagesFailureType';
import { ResolverContext } from '../../../../types';

@Resolver()
export class ResetMessagesResolver {
    // TODO: テストを書く
    @Mutation(() => ResetRoomMessagesResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(5))
    public async resetMessages(
        @Arg('roomId') roomId: string,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ResetRoomMessagesResult> {
        const queue = async (): Promise<
            Result<{ result: ResetRoomMessagesResult; payload?: RoomMessagesResetPayload & SendTo }>
        > => {
            const em = context.em;
            const authorizedUser = ensureAuthorizedUser(context);
            const findResult = await findRoomAndMyParticipant({
                em,
                userUid: authorizedUser.userUid,
                roomId,
            });
            if (findResult == null) {
                return Result.ok({
                    result: {
                        __tstype: ResetRoomMessagesResultType,
                        failureType: ResetRoomMessagesFailureType.RoomNotFound,
                    },
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return Result.ok({
                    result: {
                        __tstype: ResetRoomMessagesResultType,
                        failureType: ResetRoomMessagesFailureType.NotParticipant,
                    },
                });
            }
            if (me.role === Spectator) {
                return Result.ok({
                    result: {
                        __tstype: ResetRoomMessagesResultType,
                        failureType: ResetRoomMessagesFailureType.NotAuthorized,
                    },
                });
            }

            for (const chatCh of await room.roomChatChs.loadItems()) {
                await chatCh.roomPubMsgs.init();
                chatCh.roomPubMsgs.getItems().forEach(x => em.remove(x));
                chatCh.roomPubMsgs.removeAll();
                em.persist(chatCh);
            }

            await room.roomPrvMsgs.init();
            room.roomPrvMsgs.getItems().forEach(x => em.remove(x));
            room.roomPrvMsgs.removeAll();

            await room.dicePieceLogs.init();
            room.dicePieceLogs.getItems().forEach(x => em.remove(x));
            room.dicePieceLogs.removeAll();

            await room.stringPieceLogs.init();
            room.stringPieceLogs.getItems().forEach(x => em.remove(x));
            room.stringPieceLogs.removeAll();

            room.completeUpdatedAt = new Date();

            em.persist(room);
            await em.flush();

            return Result.ok({
                result: {
                    __tstype: 'ResetRoomMessagesResult',
                },
                payload: {
                    type: 'roomMessagesResetPayload',
                    sendTo: findResult.participantIds(),
                    roomId,
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
