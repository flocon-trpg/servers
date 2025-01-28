import { Spectator } from '@flocon-trpg/core';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { ResetRoomMessagesFailureType } from '../../../../enums/ResetRoomMessagesFailureType';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
import { lockByRoomId } from '../../../../utils/asyncLock';
import { ResetRoomMessagesResult, ResetRoomMessagesResultType } from '../../../objects/roomMessage';
import { findRoomAndMyParticipant } from '../../utils/utils';

@Resolver(() => ResetRoomMessagesResult)
export class ResetMessagesResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
    ) {}

    async #resetMessagesCore(roomId: string, auth: AuthDataType): Promise<ResetRoomMessagesResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const findResult = await findRoomAndMyParticipant({
            em,
            userUid: auth.user.userUid,
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

        this.pubSubService.roomEvent.next({
            type: 'roomMessagesResetPayload',
            sendTo: findResult.participantIds(),
            roomId,
        });
        return {
            __tstype: 'ResetRoomMessagesResult',
        };
    }

    // TODO: テストを書く
    @Mutation(() => ResetRoomMessagesResult)
    @Auth(ENTRY)
    public async resetMessages(
        @Args('roomId') roomId: string,
        @AuthData() auth: AuthDataType,
    ): Promise<ResetRoomMessagesResult> {
        return await lockByRoomId(roomId, async () => {
            return await this.#resetMessagesCore(roomId, auth);
        });
    }
}
