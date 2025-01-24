import { State, characterTemplate, client, isCharacterOwner } from '@flocon-trpg/core';
import { ref } from '@mikro-orm/core';
import { Args, ArgsType, Field, Mutation, Resolver } from '@nestjs/graphql';
import { MaxLength, ValidateIf } from 'class-validator';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { FileSourceTypeModule } from '../../../../enums/FileSourceType';
import { WriteRoomPrivateMessageFailureType } from '../../../../enums/WriteRoomPrivateMessageFailureType';
import { RoomPrvMsg } from '../../../../mikro-orm/entities/roomMessage/entity';
import { User } from '../../../../mikro-orm/entities/user/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
import { lockByRoomId } from '../../../../utils/asyncLock';
import {
    RoomMessageSyntaxErrorType,
    WriteRoomPrivateMessageFailureResultType,
    WriteRoomPrivateMessageResult,
} from '../../../objects/roomMessage';
import { MessageUpdatePayload } from '../../subsciptions/roomEvent/payload';
import { SendTo } from '../../types';
import {
    analyzeTextAndSetToEntity,
    createRoomPrivateMessage,
    findRoomAndMyParticipant,
    fixTextColor,
} from '../../utils/utils';

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
    @ValidateIf((_, value) => value != null)
    public textColor?: string;

    @Field({ nullable: true })
    public characterId?: string;

    @Field({ nullable: true })
    @MaxLength(1_000)
    @ValidateIf((_, value) => value != null)
    public customName?: string;

    @Field({ nullable: true, description: 'BCDiceのgameType。' })
    public gameType?: string;
}

@Resolver()
export class WritePrivateMessageResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
    ) {}

    async #writePrivateMessageCore(
        args: WritePrivateMessageArgs,
        auth: AuthDataType,
    ): Promise<typeof WriteRoomPrivateMessageResult> {
        // **** args guard ****

        if (args.visibleTo.length >= 1000) {
            throw new Error('visibleTo.length is too large');
        }

        // **** main ****

        const em = await this.mikroOrmService.forkEmForMain();
        const authorizedUser = await em.findOneOrFail(User, { userUid: auth.user.userUid });
        const findResult = await findRoomAndMyParticipant({
            em,
            userUid: authorizedUser.userUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                __tstype: WriteRoomPrivateMessageFailureResultType,
                failureType: WriteRoomPrivateMessageFailureType.RoomNotFound,
            };
        }
        const { room, me, roomState } = findResult;
        if (me === undefined) {
            return {
                __tstype: WriteRoomPrivateMessageFailureResultType,
                failureType: WriteRoomPrivateMessageFailureType.NotParticipant,
            };
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
                }) === true
            ) {
                chara = roomState.characters?.[args.characterId];
            }
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
            return {
                __tstype: RoomMessageSyntaxErrorType,
                errorMessage: entityResult.error,
            };
        }
        const entity = entityResult.value as RoomPrvMsg;
        if (args.textColor != null) {
            fixTextColor(args.textColor);
        }

        for (const visibleToElement of visibleTo) {
            const user = await em.findOne(User, { userUid: visibleToElement });
            if (user == null) {
                return {
                    __tstype: WriteRoomPrivateMessageFailureResultType,
                    failureType: WriteRoomPrivateMessageFailureType.VisibleToIsInvalid,
                };
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
                chara.portraitImage?.sourceType,
            );
            entity.charaPortraitImagePath = chara.portraitImage?.path;
            entity.charaPortraitImageSourceType = FileSourceTypeModule.ofNullishString(
                chara.portraitImage?.sourceType,
            );
        }

        entity.room = ref(room);
        room.completeUpdatedAt = new Date();
        await em.persistAndFlush(entity);

        const visibleToArray = [...visibleTo].sort();
        const result = await createRoomPrivateMessage({
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

        this.pubSubService.roomEvent.next(payload);
        return result;
    }

    @Mutation(() => WriteRoomPrivateMessageResult)
    @Auth(ENTRY)
    public async writePrivateMessage(
        @Args() args: WritePrivateMessageArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<typeof WriteRoomPrivateMessageResult> {
        return await lockByRoomId(
            args.roomId,
            async () => await this.#writePrivateMessageCore(args, auth),
        );
    }
}
