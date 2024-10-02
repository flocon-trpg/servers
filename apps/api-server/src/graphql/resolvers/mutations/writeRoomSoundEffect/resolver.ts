import { Spectator } from '@flocon-trpg/core';
import { Reference } from '@mikro-orm/core';
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
import { RoomSe } from '../../../../entities/roomMessage/entity';
import { User } from '../../../../entities/user/entity';
import { WriteRoomSoundEffectFailureType } from '../../../../enums/WriteRoomSoundEffectFailureType';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { FilePath } from '../../../objects/filePath';
import {
    RoomSoundEffect,
    RoomSoundEffectType,
    WriteRoomSoundEffectFailureResultType,
    WriteRoomSoundEffectResult,
} from '../../../objects/roomMessage';
import { MessageUpdatePayload } from '../../subsciptions/roomEvent/payload';
import { SendTo } from '../../types';
import {
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    publishRoomEvent,
} from '../../utils/utils';

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
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(3))
    public async writeRoomSoundEffect(
        @Args() args: WriteRoomSoundEffectArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine,
    ): Promise<typeof WriteRoomSoundEffectResult> {
        const em = context.em;
        const authorizedUser = ensureAuthorizedUser(context);
        const findResult = await findRoomAndMyParticipant({
            em,
            userUid: authorizedUser.userUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                __tstype: WriteRoomSoundEffectFailureResultType,
                failureType: WriteRoomSoundEffectFailureType.RoomNotFound,
            };
        }
        const { room, me } = findResult;
        if (me === undefined) {
            return {
                __tstype: WriteRoomSoundEffectFailureResultType,
                failureType: WriteRoomSoundEffectFailureType.NotParticipant,
            };
        }
        if (me.role === Spectator) {
            return {
                __tstype: WriteRoomSoundEffectFailureResultType,
                failureType: WriteRoomSoundEffectFailureType.NotAuthorized,
            };
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

        await publishRoomEvent(pubSub, payload);
        return result;
    }
}
