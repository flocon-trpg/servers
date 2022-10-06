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
import { State, characterTemplate, client, isCharacterOwner } from '@flocon-trpg/core';
import { MessageUpdatePayload } from '../../subsciptions/roomEvent/payload';
import { SendTo } from '../../types';
import {
    analyzeTextAndSetToEntity,
    createRoomPrivateMessage,
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    fixTextColor,
    publishRoomEvent,
} from '../../utils';
import {
    RoomMessageSyntaxErrorType,
    WriteRoomPrivateMessageFailureResultType,
    WriteRoomPrivateMessageResult,
} from '../../../entities/roomMessage/graphql';
import { MaxLength } from 'class-validator';
import { Reference } from '@mikro-orm/core';
import { RoomPrvMsg } from '../../../entities/roomMessage/mikro-orm';
import { FileSourceTypeModule } from '../../../../enums/FileSourceType';
import { WriteRoomPrivateMessageFailureType } from '../../../../enums/WriteRoomPrivateMessageFailureType';
import { User } from '../../../entities/user/mikro-orm';

type CharacterState = State<typeof characterTemplate>;

@ArgsType()
class WritePrivateMessageArgs {
    @Field()
    public roomId!: string;

    @Field(() => [String])
    public visibleTo!: string[];

    @Field()
    @MaxLength(10_000)
    public text!: string;

    @Field({ nullable: true })
    @MaxLength(50)
    public textColor?: string;

    @Field({ nullable: true })
    public characterId?: string;

    @Field({ nullable: true })
    @MaxLength(1_000)
    public customName?: string;

    @Field({ nullable: true, description: 'BCDiceのgameType。' })
    public gameType?: string;
}

@Resolver()
export class WritePrivateMessageResolver {
    @Mutation(() => WriteRoomPrivateMessageResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(3))
    public async writePrivateMessage(
        @Args() args: WritePrivateMessageArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<typeof WriteRoomPrivateMessageResult> {
        // **** args guard ****

        if (args.visibleTo.length >= 1000) {
            throw new Error('visibleTo.length is too large');
        }

        // **** main ****

        const queue = async (): Promise<
            Result<{
                result: typeof WriteRoomPrivateMessageResult;
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
                        __tstype: WriteRoomPrivateMessageFailureResultType,
                        failureType: WriteRoomPrivateMessageFailureType.RoomNotFound,
                    },
                });
            }
            const { room, me, roomState } = findResult;
            if (me === undefined) {
                return Result.ok({
                    result: {
                        __tstype: WriteRoomPrivateMessageFailureResultType,
                        failureType: WriteRoomPrivateMessageFailureType.NotParticipant,
                    },
                });
            }

            const visibleTo = new Set(args.visibleTo);
            visibleTo.add(authorizedUser.userUid);

            await authorizedUser.visibleRoomPrvMsgs.init({ where: { room: { id: room.id } } });

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
                type: 'RoomPrvMsg',
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
            const entity = entityResult.value as RoomPrvMsg;
            args.textColor == null ? undefined : fixTextColor(args.textColor);

            for (const visibleToElement of visibleTo) {
                const user = await em.findOne(User, { userUid: visibleToElement });
                if (user == null) {
                    return Result.ok({
                        result: {
                            __tstype: WriteRoomPrivateMessageFailureResultType,
                            failureType: WriteRoomPrivateMessageFailureType.VisibleToIsInvalid,
                        },
                    });
                }
                entity.visibleTo.add(user);
                user.visibleRoomPrvMsgs.add(entity);
            }
            entity.customName = args.customName;

            if (chara != null) {
                entity.charaStateId = args.characterId;
                entity.charaName = chara.name;
                entity.charaIsPrivate = chara.isPrivate;
                entity.charaImagePath = chara.image?.path;
                entity.charaImageSourceType = FileSourceTypeModule.ofNullishString(
                    chara.portraitImage?.sourceType
                );
                entity.charaPortraitImagePath = chara.portraitImage?.path;
                entity.charaPortraitImageSourceType = FileSourceTypeModule.ofNullishString(
                    chara.portraitImage?.sourceType
                );
            }

            entity.room = Reference.create(room);
            room.completeUpdatedAt = new Date();
            await em.persistAndFlush(entity);

            const visibleToArray = [...visibleTo].sort();
            const result = createRoomPrivateMessage({
                msg: entity,
                visibleTo: visibleToArray,
            });

            const payload: MessageUpdatePayload & SendTo = {
                type: 'messageUpdatePayload',
                sendTo: findResult.participantIds(),
                roomId: args.roomId,
                createdBy: authorizedUser.userUid,
                visibleTo: visibleToArray,
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
