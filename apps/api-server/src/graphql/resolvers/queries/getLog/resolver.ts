import { $system, Spectator } from '@flocon-trpg/core';
import { ref } from '@mikro-orm/core';
import { Args, ArgsType, Field, Query, Resolver } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { GetRoomLogFailureType } from '../../../../enums/GetRoomLogFailureType';
import { Room } from '../../../../mikro-orm/entities/room/entity';
import { RoomPubCh, RoomPubMsg } from '../../../../mikro-orm/entities/roomMessage/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
import { EM } from '../../../../types';
import { lockByRoomId } from '../../../../utils/asyncLock';
import { GetRoomLogFailureResultType, GetRoomLogResult } from '../../../objects/roomMessage';
import {
    createRoomPublicMessage,
    findRoomAndMyParticipant,
    getRoomMessagesFromDb,
} from '../../utils/utils';

@ArgsType()
class GetLogArgs {
    @Field()
    public roomId!: string;
}

// flushはこのメソッドでは行われないため、flushのし忘れに注意。
const writeSystemMessage = async ({ em, text, room }: { em: EM; text: string; room: Room }) => {
    const entity = new RoomPubMsg({ initText: text, initTextSource: undefined });
    entity.initText = text;
    let ch = await em.findOne(RoomPubCh, { key: $system, room: room.id });
    if (ch == null) {
        ch = new RoomPubCh({ key: $system });
        ch.room = ref(room);
        em.persist(ch);
    }
    entity.roomPubCh = ref(ch);
    em.persist(entity);
    return entity;
};

@Resolver()
export class GetLogResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
    ) {}

    async #getLogCore(args: GetLogArgs, auth: AuthDataType): Promise<typeof GetRoomLogResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const authorizedUserUid = auth.user.userUid;
        const findResult = await findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                __tstype: GetRoomLogFailureResultType,
                failureType: GetRoomLogFailureType.RoomNotFound,
            };
        }
        const { room, me } = findResult;
        if (me?.role === undefined) {
            return {
                __tstype: GetRoomLogFailureResultType,
                failureType: GetRoomLogFailureType.NotParticipant,
            };
        }
        if (me.role === Spectator) {
            return {
                __tstype: GetRoomLogFailureResultType,
                failureType: GetRoomLogFailureType.NotAuthorized,
            };
        }

        const messages = await getRoomMessagesFromDb(room, authorizedUserUid, 'log');

        // em.clear() しないと下にあるem.flush()で非常に重くなり、ログサイズが大きいときに大きな問題となる。
        // おそらく大量のエンティティ取得でem内部に大量のエンティティが保持され、flushされるときにこれら全てに変更がないかチェックされるため、異常な重さになる。そのため、clear()することで高速化できていると思われる。
        em.clear();
        const systemMessageEntity = await writeSystemMessage({
            em,
            text: `${me.name}(${authorizedUserUid}) が全てのログを出力しました。`,
            room: room,
        });
        await em.flush();

        this.pubSubService.roomEvent.next({
            type: 'messageUpdatePayload',
            sendTo: findResult.participantIds(),
            roomId: room.id,
            value: await createRoomPublicMessage({
                msg: systemMessageEntity,
                channelKey: $system,
            }),
            createdBy: undefined,
            visibleTo: undefined,
        });
        return messages;
    }

    @Query(() => GetRoomLogResult)
    @Auth(ENTRY)
    public async getLog(
        @Args() args: GetLogArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<typeof GetRoomLogResult> {
        // lock が必要かどうかは微妙
        return await lockByRoomId(args.roomId, async () => await this.#getLogCore(args, auth));
    }
}
