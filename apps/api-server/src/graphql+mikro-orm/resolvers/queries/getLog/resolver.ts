import { $system, Spectator } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
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
import { ENTRY } from '../../../../roles';
import { queueLimitReached } from '../../../../utils/promiseQueue';
import {
    GetRoomLogFailureResultType,
    GetRoomLogResult,
} from '../../../entities/roomMessage/graphql';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { ResolverContext } from '../../../utils/Contexts';
import { MessageUpdatePayload } from '../../subsciptions/roomEvent/payload';
import {
    createRoomPublicMessage,
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    getRoomMessagesFromDb,
    publishRoomEvent,
} from '../../utils';
import { SendTo } from '../../types';
import { EM } from '../../../../utils/types';
import { Room } from '../../../entities/room/mikro-orm';
import { RoomPubCh, RoomPubMsg } from '../../../entities/roomMessage/mikro-orm';
import { Reference } from '@mikro-orm/core';
import { serverTooBusyMessage } from '../../messages';

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
    @UseMiddleware(RateLimitMiddleware(10))
    public async getLog(
        @Args() args: GetLogArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<typeof GetRoomLogResult> {
        const queue = async (): Promise<
            Result<{ result: typeof GetRoomLogResult; payload?: MessageUpdatePayload & SendTo }>
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
                        __tstype: GetRoomLogFailureResultType,
                        failureType: GetRoomLogFailureType.RoomNotFound,
                    },
                });
            }
            const { room, me } = findResult;
            if (me?.role === undefined) {
                return Result.ok({
                    result: {
                        __tstype: GetRoomLogFailureResultType,
                        failureType: GetRoomLogFailureType.NotParticipant,
                    },
                });
            }
            if (me.role === Spectator) {
                return Result.ok({
                    result: {
                        __tstype: GetRoomLogFailureResultType,
                        failureType: GetRoomLogFailureType.NotAuthorized,
                    },
                });
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

            return Result.ok({
                result: messages,
                payload: {
                    type: 'messageUpdatePayload',
                    sendTo: findResult.participantIds(),
                    roomId: room.id,
                    value: createRoomPublicMessage({
                        msg: systemMessageEntity,
                        channelKey: $system,
                    }),
                    createdBy: undefined,
                    visibleTo: undefined,
                },
            });
        };
        const coreResult = await context.promiseQueue.next(queue);
        if (coreResult.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        if (coreResult.value.isError) {
            throw coreResult.value.error;
        }
        if (coreResult.value.value.payload != null) {
            await publishRoomEvent(pubSub, coreResult.value.value.payload);
        }
        return coreResult.value.value.result;
    }
}
