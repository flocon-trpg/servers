import { $system, Spectator } from '@flocon-trpg/core';
import {
    Args,
    ArgsType,
    Authorized,
    Ctx,
    Field,
    PubSub,
    PubSubEngine,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { GetRoomLogFailureType } from '../../../../enums/GetRoomLogFailureType';
import { ENTRY } from '../../../../utils/roles';
import { GetRoomLogFailureResultType, GetRoomLogResult } from '../../../objects/roomMessage';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import {
    createRoomPublicMessage,
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    getRoomMessagesFromDb,
    publishRoomEvent,
} from '../../utils/utils';
import { EM, ResolverContext } from '../../../../types';
import { Room } from '../../../../entities/room/entity';
import { RoomPubCh, RoomPubMsg } from '../../../../entities/roomMessage/entity';
import { Reference } from '@mikro-orm/core';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';

@ArgsType()
class GetLogArgs {
    @Field()
    public roomId!: string;
}

// flushはこのメソッドでは行われないため、flushのし忘れに注意。
export const writeSystemMessage = async ({
    em,
    text,
    room,
}: {
    em: EM;
    text: string;
    room: Room;
}) => {
    const entity = new RoomPubMsg({ initText: text, initTextSource: undefined });
    entity.initText = text;
    let ch = await em.findOne(RoomPubCh, { key: $system, room: room.id });
    if (ch == null) {
        ch = new RoomPubCh({ key: $system });
        ch.room = Reference.create(room);
        em.persist(ch);
    }
    entity.roomPubCh = Reference.create(ch);
    em.persist(entity);
    return entity;
};

@Resolver()
export class GetLogResolver {
    @Query(() => GetRoomLogResult)
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(10))
    public async getLog(
        @Args() args: GetLogArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<typeof GetRoomLogResult> {
        const em = context.em;
        const authorizedUserUid = ensureAuthorizedUser(context).userUid;
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

        await publishRoomEvent(pubSub, {
            type: 'messageUpdatePayload',
            sendTo: findResult.participantIds(),
            roomId: room.id,
            value: createRoomPublicMessage({
                msg: systemMessageEntity,
                channelKey: $system,
            }),
            createdBy: undefined,
            visibleTo: undefined,
        });
        return messages;
    }
}
