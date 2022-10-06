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
import { Spectator, State, characterTemplate } from '@flocon-trpg/core';
import { MessageUpdatePayload } from '../../subsciptions/roomEvent/payload';
import { SendTo } from '../../types';
import { ensureAuthorizedUser, findRoomAndMyParticipant, publishRoomEvent } from '../../utils';
import {
    RoomSoundEffect,
    RoomSoundEffectType,
    WriteRoomSoundEffectFailureResultType,
    WriteRoomSoundEffectResult,
} from '../../../entities/roomMessage/graphql';
import { Reference } from '@mikro-orm/core';
import { RoomSe } from '../../../entities/roomMessage/mikro-orm';
import { WriteRoomSoundEffectFailureType } from '../../../../enums/WriteRoomSoundEffectFailureType';
import { User } from '../../../entities/user/mikro-orm';
import { FilePath } from '../../../entities/filePath/graphql';

type CharacterState = State<typeof characterTemplate>;

@ArgsType()
class WriteRoomSoundEffectArgs {
    @Field()
    public roomId!: string;

    @Field()
    public file!: FilePath;

    @Field()
    public volume!: number;
}

@Resolver()
export class WriteRoomSoundEffectResolver {
    @Mutation(() => WriteRoomSoundEffectResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(3))
    public async writeRoomSoundEffect(
        @Args() args: WriteRoomSoundEffectArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<typeof WriteRoomSoundEffectResult> {
        const queue = async (): Promise<
            Result<{
                result: typeof WriteRoomSoundEffectResult;
                payload?: MessageUpdatePayload & SendTo;
            }>
        > => {
            const em = context.em;
            const authorizedUser = ensureAuthorizedUser(context);
            const findResult = await findRoomAndMyParticipant({
                em,
                userUid: authorizedUser.userUid,
                roomId: args.roomId,
            });
            if (findResult == null) {
                return Result.ok({
                    result: {
                        __tstype: WriteRoomSoundEffectFailureResultType,
                        failureType: WriteRoomSoundEffectFailureType.RoomNotFound,
                    },
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return Result.ok({
                    result: {
                        __tstype: WriteRoomSoundEffectFailureResultType,
                        failureType: WriteRoomSoundEffectFailureType.NotParticipant,
                    },
                });
            }
            if (me.role === Spectator) {
                return Result.ok({
                    result: {
                        __tstype: WriteRoomSoundEffectFailureResultType,
                        failureType: WriteRoomSoundEffectFailureType.NotAuthorized,
                    },
                });
            }

            const entity = new RoomSe({
                filePath: args.file.path,
                fileSourceType: args.file.sourceType,
                volume: args.volume,
            });
            entity.createdBy = Reference.create<User, 'userUid'>(authorizedUser);
            entity.room = Reference.create(room);
            room.completeUpdatedAt = new Date();
            await em.persistAndFlush(entity);

            const result: RoomSoundEffect = {
                ...entity,
                __tstype: RoomSoundEffectType,
                messageId: entity.id,
                createdBy: authorizedUser.userUid,
                createdAt: entity.createdAt.getTime(),
                file: {
                    path: entity.filePath,
                    sourceType: entity.fileSourceType,
                },
            };

            const payload: MessageUpdatePayload & SendTo = {
                type: 'messageUpdatePayload',
                sendTo: findResult.participantIds(),
                roomId: args.roomId,
                createdBy: authorizedUser.userUid,
                visibleTo: undefined,
                value: result,
            };

            return Result.ok({ result, payload });
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
