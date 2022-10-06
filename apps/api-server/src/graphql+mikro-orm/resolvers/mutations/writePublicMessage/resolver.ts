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
import {
    $free,
    $system,
    Spectator,
    State,
    characterTemplate,
    client,
    isCharacterOwner,
} from '@flocon-trpg/core';
import { MessageUpdatePayload } from '../../subsciptions/roomEvent/payload';
import { SendTo } from '../../types';
import {
    analyzeTextAndSetToEntity,
    createRoomPublicMessage,
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    fixTextColor,
    publishRoomEvent,
} from '../../utils';
import {
    RoomMessageSyntaxErrorType,
    RoomPublicMessage,
    WriteRoomPublicMessageFailureResultType,
    WriteRoomPublicMessageResult,
} from '../../../entities/roomMessage/graphql';
import { MaxLength } from 'class-validator';
import { WriteRoomPublicMessageFailureType } from '../../../../enums/WriteRoomPublicMessageFailureType';
import { Reference } from '@mikro-orm/core';
import { RoomPubCh, RoomPubMsg } from '../../../entities/roomMessage/mikro-orm';
import { FileSourceTypeModule } from '../../../../enums/FileSourceType';

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
    @UseMiddleware(RateLimitMiddleware(3))
    public async writePublicMessage(
        @Args() args: WritePublicMessageArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<typeof WriteRoomPublicMessageResult> {
        const channelKey = args.channelKey;
        const queue = async (): Promise<
            Result<{
                result: typeof WriteRoomPublicMessageResult;
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
                        __tstype: WriteRoomPublicMessageFailureResultType,
                        failureType: WriteRoomPublicMessageFailureType.RoomNotFound,
                    },
                });
            }
            const { room, me, roomState } = findResult;
            if (me === undefined) {
                return Result.ok({
                    result: {
                        __tstype: WriteRoomPublicMessageFailureResultType,
                        failureType: WriteRoomPublicMessageFailureType.NotParticipant,
                    },
                });
            }
            const channelKeyFailureType = checkChannelKey(channelKey, me.role === Spectator);
            if (channelKeyFailureType != null) {
                return Result.ok({
                    result: {
                        __tstype: WriteRoomPublicMessageFailureResultType,
                        failureType: WriteRoomPublicMessageFailureType.NotAuthorized,
                    },
                });
            }

            let chara: CharacterState | undefined = undefined;
            if (args.characterId != null) {
                if (
                    isCharacterOwner({
                        requestedBy: { type: client, userUid: authorizedUser.userUid },
                        characterId: args.characterId,
                        currentRoomState: roomState,
                    })
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
                return Result.ok({
                    result: {
                        __tstype: RoomMessageSyntaxErrorType,
                        errorMessage: entityResult.error,
                    },
                });
            }
            const entity = entityResult.value as RoomPubMsg;
            entity.textColor = args.textColor == null ? undefined : fixTextColor(args.textColor);
            let ch = await em.findOne(RoomPubCh, { key: channelKey, room: room.id });
            if (ch == null) {
                ch = new RoomPubCh({ key: channelKey });
                ch.room = Reference.create(room);
                em.persist(ch);
            }
            entity.customName = args.customName;

            if (chara != null) {
                entity.charaStateId = args.characterId;
                entity.charaName = chara.name;
                entity.charaIsPrivate = chara.isPrivate;
                entity.charaImagePath = chara.image?.path;
                entity.charaImageSourceType = FileSourceTypeModule.ofNullishString(
                    chara.image?.sourceType
                );
                entity.charaPortraitImagePath = chara.portraitImage?.path;
                entity.charaPortraitImageSourceType = FileSourceTypeModule.ofNullishString(
                    chara.portraitImage?.sourceType
                );
            }

            entity.roomPubCh = Reference.create(ch);
            room.completeUpdatedAt = new Date();
            await em.persistAndFlush(entity);

            const result: RoomPublicMessage = createRoomPublicMessage({ msg: entity, channelKey });

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
