import {
    $free,
    $system,
    Spectator,
    State,
    characterTemplate,
    client,
    isCharacterOwner,
} from '@flocon-trpg/core';
import { Reference, ref } from '@mikro-orm/core';
import { MaxLength } from 'class-validator';
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
import { RoomPubCh, RoomPubMsg } from '../../../../entities/roomMessage/entity';
import { FileSourceTypeModule } from '../../../../enums/FileSourceType';
import { WriteRoomPublicMessageFailureType } from '../../../../enums/WriteRoomPublicMessageFailureType';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import {
    RoomMessageSyntaxErrorType,
    RoomPublicMessage,
    WriteRoomPublicMessageFailureResultType,
    WriteRoomPublicMessageResult,
} from '../../../objects/roomMessage';
import { MessageUpdatePayload } from '../../subsciptions/roomEvent/payload';
import { SendTo } from '../../types';
import {
    analyzeTextAndSetToEntity,
    createRoomPublicMessage,
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    fixTextColor,
    publishRoomEvent,
} from '../../utils/utils';

type CharacterState = State<typeof characterTemplate>;

@ArgsType()
class WritePublicMessageArgs {
    @Field()
    public roomId!: string;

    @Field()
    @MaxLength(10_000)
    public text!: string;

    @Field({ nullable: true })
    @MaxLength(50)
    public textColor?: string;

    @Field()
    public channelKey!: string;

    @Field({ nullable: true })
    public characterId?: string;

    @Field({ nullable: true })
    @MaxLength(1_000)
    public customName?: string;

    @Field({ nullable: true, description: 'BCDiceのgameType。' })
    public gameType?: string;
}

const checkChannelKey = (channelKey: string, isSpectator: boolean) => {
    switch (channelKey) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case '10':
            if (isSpectator) {
                return WriteRoomPublicMessageFailureType.NotAuthorized;
            }
            return null;
        case $free:
            return null;
        case $system:
            return WriteRoomPublicMessageFailureType.NotAuthorized;
        default:
            return WriteRoomPublicMessageFailureType.NotAllowedChannelKey;
    }
};

@Resolver()
export class WritePublicMessageResolver {
    @Mutation(() => WriteRoomPublicMessageResult)
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(3))
    public async writePublicMessage(
        @Args() args: WritePublicMessageArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine,
    ): Promise<typeof WriteRoomPublicMessageResult> {
        const channelKey = args.channelKey;
        const em = context.em;
        const authorizedUser = ensureAuthorizedUser(context);
        const findResult = await findRoomAndMyParticipant({
            em,
            userUid: authorizedUser.userUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                __tstype: WriteRoomPublicMessageFailureResultType,
                failureType: WriteRoomPublicMessageFailureType.RoomNotFound,
            };
        }
        const { room, me, roomState } = findResult;
        if (me === undefined) {
            return {
                __tstype: WriteRoomPublicMessageFailureResultType,
                failureType: WriteRoomPublicMessageFailureType.NotParticipant,
            };
        }
        const channelKeyFailureType = checkChannelKey(channelKey, me.role === Spectator);
        if (channelKeyFailureType != null) {
            return {
                __tstype: WriteRoomPublicMessageFailureResultType,
                failureType: WriteRoomPublicMessageFailureType.NotAuthorized,
            };
        }

        let chara: CharacterState | undefined = undefined;
        if (args.characterId != null) {
            if (
                isCharacterOwner({
                    requestedBy: { type: client, userUid: authorizedUser.userUid },
                    characterId: args.characterId,
                    currentRoomState: roomState,
                }) === true
            )
                chara = roomState.characters?.[args.characterId];
        }
        const entityResult = await analyzeTextAndSetToEntity({
            type: 'RoomPubMsg',
            textSource: args.text,
            context: chara == null ? null : { type: 'chara', value: chara },
            createdBy: authorizedUser,
            room: roomState,
            gameType: args.gameType,
        });
        if (entityResult.isError) {
            return {
                __tstype: RoomMessageSyntaxErrorType,
                errorMessage: entityResult.error,
            };
        }
        const entity = entityResult.value as RoomPubMsg;
        entity.textColor = args.textColor == null ? undefined : fixTextColor(args.textColor);
        let ch = await em.findOne(RoomPubCh, { key: channelKey, room: room.id });
        if (ch == null) {
            ch = new RoomPubCh({ key: channelKey });
            ch.room = ref(room);
            em.persist(ch);
        }
        entity.customName = args.customName;

        if (chara != null) {
            entity.charaStateId = args.characterId;
            entity.charaName = chara.name;
            entity.charaIsPrivate = chara.isPrivate;
            entity.charaImagePath = chara.image?.path;
            entity.charaImageSourceType = FileSourceTypeModule.ofNullishString(
                chara.image?.sourceType,
            );
            entity.charaPortraitImagePath = chara.portraitImage?.path;
            entity.charaPortraitImageSourceType = FileSourceTypeModule.ofNullishString(
                chara.portraitImage?.sourceType,
            );
        }

        entity.roomPubCh = ref(ch);
        room.completeUpdatedAt = new Date();
        await em.persistAndFlush(entity);

        const result: RoomPublicMessage = await createRoomPublicMessage({
            msg: entity,
            channelKey,
        });

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
