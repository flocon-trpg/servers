import { Spectator } from '@flocon-trpg/core';
import { ref } from '@mikro-orm/core';
import { Args, ArgsType, Field, Mutation, Resolver } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { WriteRoomSoundEffectFailureType } from '../../../../enums/WriteRoomSoundEffectFailureType';
import { RoomSe } from '../../../../mikro-orm/entities/roomMessage/entity';
import { User } from '../../../../mikro-orm/entities/user/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
import { FilePath } from '../../../objects/filePath';
import {
    RoomSoundEffect,
    RoomSoundEffectType,
    WriteRoomSoundEffectFailureResultType,
    WriteRoomSoundEffectResult,
} from '../../../objects/roomMessage';
import { MessageUpdatePayload } from '../../subsciptions/roomEvent/payload';
import { SendTo } from '../../types';
import { findRoomAndMyParticipant } from '../../utils/utils';

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
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
    ) {}

    @Mutation(() => WriteRoomSoundEffectResult)
    @Auth(ENTRY)
    public async writeRoomSoundEffect(
        @Args() args: WriteRoomSoundEffectArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<typeof WriteRoomSoundEffectResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const authorizedUser = await em.findOneOrFail(User, { userUid: auth.user.userUid });
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
        entity.createdBy = ref(authorizedUser);
        entity.room = ref(room);
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

        this.pubSubService.roomEvent.next(payload);
        return result;
    }
}
