import { Spectator } from '@flocon-trpg/core';
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
import { ResetRoomMessagesFailureType } from '../../../../enums/ResetRoomMessagesFailureType';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { ResetRoomMessagesResult, ResetRoomMessagesResultType } from '../../../objects/roomMessage';
import {
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    publishRoomEvent,
} from '../../utils/utils';

@Resolver()
export class ResetMessagesResolver {
    // TODO: テストを書く
    @Mutation(() => ResetRoomMessagesResult)
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(5))
    public async resetMessages(
        @Arg('roomId') roomId: string,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine,
    ): Promise<ResetRoomMessagesResult> {
        const em = context.em;
        const authorizedUser = ensureAuthorizedUser(context);
        const findResult = await findRoomAndMyParticipant({
            em,
            userUid: authorizedUser.userUid,
            roomId,
        });
        if (findResult == null) {
            return {
                __tstype: ResetRoomMessagesResultType,
                failureType: ResetRoomMessagesFailureType.RoomNotFound,
            };
        }
        const { room, me } = findResult;
        if (me === undefined) {
            return {
                __tstype: ResetRoomMessagesResultType,
                failureType: ResetRoomMessagesFailureType.NotParticipant,
            };
        }
        if (me.role === Spectator) {
            return {
                __tstype: ResetRoomMessagesResultType,
                failureType: ResetRoomMessagesFailureType.NotAuthorized,
            };
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

        await publishRoomEvent(pubSub, {
            type: 'roomMessagesResetPayload',
            sendTo: findResult.participantIds(),
            roomId,
        });
        return {
            __tstype: 'ResetRoomMessagesResult',
        };
    }
}
