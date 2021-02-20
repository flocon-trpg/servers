import { Reference } from '@mikro-orm/core';
import { plainToClass } from 'class-transformer';
import Color from 'color';
import { Arg, Args, ArgsType, Ctx, Field, Mutation, PubSub, PubSubEngine, Query, Resolver, Root, Subscription } from 'type-graphql';
import { GameType } from '../../../@shared/bcdice';
import { __ } from '../../../@shared/collection';
import { $free, $system } from '../../../@shared/Constants';
import { Result, ResultModule } from '../../../@shared/Result';
import { groupJoin } from '../../../@shared/Set';
import { left } from '../../../@shared/Types';
import { loadServerConfigAsMain } from '../../../config';
import { DeleteMessageFailureType } from '../../../enums/DeleteMessageFailureType';
import { EditMessageFailureType } from '../../../enums/EditMessageFailureType';
import { GetRoomLogFailureType } from '../../../enums/GetRoomLogFailureType';
import { GetRoomMessagesFailureType } from '../../../enums/GetRoomMessagesFailureType';
import { MakeMessageNotSecretFailureType } from '../../../enums/MakeMessageNotSecretFailureType';
import { ParticipantRole } from '../../../enums/ParticipantRole';
import { WritePrivateRoomMessageFailureType } from '../../../enums/WritePrivateRoomMessageFailureType';
import { WritePublicRoomMessageFailureType } from '../../../enums/WritePublicRoomMessageFailureType';
import { WriteRoomSoundEffectFailureType } from '../../../enums/WriteRoomSoundEffectFailureType';
import { analyze, plain } from '../../../messageAnalyzer/main';
import { queueLimitReached } from '../../../utils/PromiseQueue';
import { EM } from '../../../utils/types';
import { Chara } from '../../entities/character/mikro-orm';
import { FilePath } from '../../entities/filePath/graphql';
import { Room } from '../../entities/room/mikro-orm';
import { DeleteMessageResult, EditMessageResult, GetRoomLogFailureResultType, GetRoomLogResult, GetRoomMessagesFailureResultType, GetRoomMessagesResult, MakeMessageNotSecretResult, RoomMessage, RoomMessageEvent, RoomMessages, RoomMessagesType, RoomPrivateMessage, RoomPrivateMessageType, RoomPrivateMessageUpdateType, RoomPublicChannel, RoomPublicChannelType, RoomPublicMessage, RoomPublicMessageType, RoomPublicMessageUpdateType, RoomSoundEffect, RoomSoundEffectType, WritePrivateRoomMessageFailureResultType, WritePrivateRoomMessageResult, WritePublicRoomMessageFailureResultType, WritePublicRoomMessageResult, WriteRoomSoundEffectFailureResultType, WriteRoomSoundEffectResult } from '../../entities/roomMessage/graphql';
import { RoomPrvMsg, RoomPubCh, RoomPubMsg, RoomSe } from '../../entities/roomMessage/mikro-orm';
import { User } from '../../entities/user/mikro-orm';
import { ResolverContext } from '../../utils/Contexts';
import { ROOM_MESSAGE_UPDATE } from '../../utils/Topics';
import { checkEntry, checkSignIn, findRoomAndMyParticipant, findRoomAndMyParticipantAndParitipantUserUids, NotSignIn } from '../utils/helpers';
import { serverTooBusyMessage } from '../utils/messages';
import { writeSystemMessage } from '../utils/roomMessage';

@ArgsType()
class WritePublicMessageArgs {
    @Field()
    public roomId!: string;

    @Field()
    public text!: string;

    @Field({ nullable: true })
    public textColor?: string;

    @Field()
    public channelKey!: string;

    @Field({ nullable: true })
    public characterStateId?: string;

    @Field({ nullable: true })
    public customName?: string;

    @Field({ nullable: true, description: 'BCDiceのgameType。' })
    public gameType?: string;
}

@ArgsType()
class WritePrivateMessageArgs {
    @Field()
    public roomId!: string;

    @Field(() => [String])
    public visibleTo!: string[];

    @Field()
    public text!: string;

    @Field({ nullable: true })
    public textColor?: string;

    @Field({ nullable: true })
    public characterStateId?: string;

    @Field({ nullable: true })
    public customName?: string;
}

@ArgsType()
class WriteRoomSoundEffectArgs {
    @Field()
    public roomId!: string;

    @Field()
    public file!: FilePath;

    @Field()
    public volume!: number;
}

@ArgsType()
class MessageIdArgs {
    @Field()
    public roomId!: string;

    @Field()
    public messageId!: string;
}

@ArgsType()
class EditMessageArgs {
    @Field()
    public roomId!: string;

    @Field()
    public messageId!: string;

    @Field()
    public text!: string;
}

@ArgsType()
class GetMessagesArgs {
    @Field()
    public roomId!: string;
}

@ArgsType()
class GetLogArgs {
    @Field()
    public roomId!: string;
}

type MessageUpdatePayload = {
    roomId: string;

    // RoomPublicMessageなどのcreatedByと等しい。RoomPublicChannelの場合はnullish。
    // Update系においてcreatedByが必要だが、RoomMessageEventに含まれていないためここで定義している。
    createdBy: string | undefined;

    // RoomPrivateMessageUpdateのときにvisibleToが必要だが、RoomPrivateMessageUpdateに含まれていないためここで定義している。
    // visibleToが存在しない場合はnullish。
    visibleTo: string[] | undefined;

    value: typeof RoomMessageEvent;
}

const checkChannelKey = (channelKey: string, isSpectator: boolean) => {
    switch (channelKey) {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            if (isSpectator) {
                return WritePublicRoomMessageFailureType.NotAuthorized;
            }
            return null;
        case $free:
            return null;
        case $system:
            return WritePublicRoomMessageFailureType.NotAuthorized;
        default:
            return WritePublicRoomMessageFailureType.NotAllowedChannelKey;
    }
};

const analyzeTextAndSetToEntity = async (params: {
    targetEntity: RoomPubMsg | RoomPrvMsg;
    em: EM;
    text: string;
    chara: Chara | null;
    gameType: string | undefined;
    room: Room;
}) => {
    const defaultGameType: GameType = 'DiceBot';
    const gameType = params.gameType ?? defaultGameType;
    const rolled = await analyze({ ...params, gameType });
    if (rolled.type === plain) {
        params.targetEntity.text = params.text;
    } else {
        if (rolled.isSecret) {
            params.targetEntity.isSecret = true;
            params.targetEntity.text = params.text;
            params.targetEntity.altTextToSecret = 'シークレットダイス';
            params.targetEntity.commandResult = rolled.result;
            params.targetEntity.commandIsSuccess = rolled.isSuccess ?? undefined;
        } else {
            params.targetEntity.text = params.text;
            params.targetEntity.commandResult = rolled.result;
            params.targetEntity.commandIsSuccess = rolled.isSuccess ?? undefined;
        }
    }
};

const createRoomPublicMessage = ({
    msg,
    channelKey,
}: {
    msg: RoomPubMsg;
    channelKey: string;
}): RoomPublicMessage => {
    return {
        __tstype: RoomPublicMessageType,
        channelKey,
        messageId: msg.id,
        text: msg.text ?? undefined,
        textColor: msg.textColor ?? undefined,
        commandResult: msg.commandResult == null ? undefined : {
            text: msg.commandResult,
            isSuccess: msg.commandIsSuccess,
        },
        altTextToSecret: msg.altTextToSecret ?? undefined,
        isSecret: msg.isSecret,
        createdBy: msg.createdBy?.userUid,
        characterStateId: msg.charaStateId ?? undefined,
        characterName: msg.charaName ?? undefined,
        customName: msg.customName,
        createdAt: msg.createdAt.getTime(),
        updatedAt: msg.textUpdatedAt,
    };
};

const createRoomPrivateMessage = async ({
    msg,
    myUserUid,
    visibleTo: visibleToCore,
    visibleToMe: visibleToMeCore,
}: {
    msg: RoomPrvMsg;
    myUserUid: string;
    visibleTo?: string[];
    visibleToMe?: boolean;
}): Promise<RoomPrivateMessage | null> => {
    const visibleTo = visibleToCore ?? (await msg.visibleTo.loadItems()).map(user => user.userUid);
    const visibleToMe = visibleToMeCore ?? visibleTo.find(userUid => userUid === myUserUid);
    if (!visibleToMe) {
        return null;
    }
    return {
        __tstype: RoomPrivateMessageType,
        messageId: msg.id,
        visibleTo: [...visibleTo].sort(),
        createdBy: msg.createdBy?.userUid,
        characterStateId: msg.charaStateId ?? undefined,
        characterName: msg.charaName ?? undefined,
        customName: msg.customName,
        createdAt: msg.createdAt.getTime(),
        updatedAt: msg.textUpdatedAt,
        text: msg.text ?? undefined,
        textColor: msg.textColor ?? undefined,
        commandResult: msg.commandResult == null ? undefined : {
            text: msg.commandResult,
            isSuccess: msg.commandIsSuccess,
        },
        altTextToSecret: msg.altTextToSecret ?? undefined,
        isSecret: msg.isSecret,
    };
};

const fixTextColor = (color: string) => {
    return Color(color).rgb().string();
};

@Resolver()
export class RoomMessageResolver {
    public async getMessagesCore({ args, context }: { args: GetMessagesArgs; context: ResolverContext }): Promise<typeof GetRoomMessagesResult> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return { __tstype: GetRoomMessagesFailureResultType, failureType: GetRoomMessagesFailureType.NotSignIn };
        }

        const queue = async (): Promise<Result<typeof GetRoomMessagesResult>> => {
            const em = context.createEm();
            const entry = await checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return ResultModule.ok({
                    __tstype: GetRoomMessagesFailureResultType,
                    failureType: GetRoomMessagesFailureType.NotEntry,
                });
            }
            const findResult = await findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return ResultModule.ok({
                    __tstype: GetRoomMessagesFailureResultType,
                    failureType: GetRoomMessagesFailureType.RoomNotFound,
                });
            }
            const { room, me } = findResult;
            if (me?.role === undefined) {
                return ResultModule.ok({
                    __tstype: GetRoomMessagesFailureResultType,
                    failureType: GetRoomMessagesFailureType.NotParticipant,
                });
            }

            const publicMessages: RoomPublicMessage[] = [];
            const publicChannels: RoomPublicChannel[] = [];
            for (const ch of await room.roomChatChs.loadItems()) {
                publicChannels.push({
                    __tstype: RoomPublicChannelType,
                    key: ch.key,
                    name: ch.name,
                });
                for (const msg of await ch.roomPubMsgs.loadItems()) {
                    const createdBy = msg.createdBy?.userUid;
                    if (msg.isSecret && (createdBy !== decodedIdToken.uid)) {
                        continue;
                    }
                    publicMessages.push(createRoomPublicMessage({ msg, channelKey: ch.key }));
                }
            }

            const privateMessages: RoomPrivateMessage[] = [];
            for (const msg of await room.roomPrvMsgs.loadItems()) {
                const createdBy = msg.createdBy?.userUid;
                if (msg.isSecret && (createdBy !== decodedIdToken.uid)) {
                    continue;
                }
                const graphQLValue = await createRoomPrivateMessage({
                    msg,
                    myUserUid: decodedIdToken.uid,
                });
                if (graphQLValue == null) {
                    continue;
                }
                privateMessages.push(graphQLValue);
            }

            const soundEffects: RoomSoundEffect[] = [];
            for (const se of await room.roomSes.loadItems()) {
                const createdBy = se.createdBy?.userUid;
                const graphQLValue: RoomSoundEffect = {
                    __tstype: RoomSoundEffectType,
                    messageId: se.id,
                    createdBy,
                    createdAt: se.createdAt.getTime(),
                    file: {
                        path: se.filePath,
                        sourceType: se.fileSourceType,
                    },
                    volume: se.volume,
                };
                soundEffects.push(graphQLValue);
            }

            return ResultModule.ok({
                __tstype: RoomMessagesType,
                publicMessages,
                privateMessages,
                publicChannels,
                soundEffects,
            });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }

    @Query(() => GetRoomMessagesResult)
    public getMessages(@Args() args: GetMessagesArgs, @Ctx() context: ResolverContext): Promise<typeof GetRoomMessagesResult> {
        return this.getMessagesCore({ args, context });
    }

    public async getLogCore({ args, context }: { args: GetLogArgs; context: ResolverContext }): Promise<{ result: typeof GetRoomLogResult; payload?: MessageUpdatePayload }> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return {
                result: {
                    __tstype: GetRoomLogFailureResultType,
                    failureType: GetRoomLogFailureType.NotSignIn
                }
            };
        }

        const queue = async (): Promise<Result<{ result: typeof GetRoomLogResult; payload?: MessageUpdatePayload }>> => {
            const em = context.createEm();
            const entry = await checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return ResultModule.ok({
                    result: {
                        __tstype: GetRoomLogFailureResultType,
                        failureType: GetRoomLogFailureType.NotEntry,
                    }
                });
            }
            const findResult = await findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return ResultModule.ok({
                    result: {
                        __tstype: GetRoomLogFailureResultType,
                        failureType: GetRoomLogFailureType.RoomNotFound,
                    }
                });
            }
            const { room, me } = findResult;
            if (me?.role === undefined) {
                return ResultModule.ok({
                    result: {
                        __tstype: GetRoomLogFailureResultType,
                        failureType: GetRoomLogFailureType.NotParticipant,
                    }
                });
            }
            if (me.role === ParticipantRole.Spectator) {
                return ResultModule.ok({
                    result: {
                        __tstype: GetRoomLogFailureResultType,
                        failureType: GetRoomLogFailureType.NotAuthorized,
                    }
                });
            }

            const publicMessages: RoomPublicMessage[] = [];
            const publicChannels: RoomPublicChannel[] = [];
            for (const ch of await room.roomChatChs.loadItems()) {
                publicChannels.push({
                    __tstype: RoomPublicChannelType,
                    key: ch.key,
                    name: ch.name,
                });
                for (const msg of await ch.roomPubMsgs.loadItems()) {
                    publicMessages.push(createRoomPublicMessage({ msg, channelKey: ch.key }));
                }
            }

            const privateMessages: RoomPrivateMessage[] = [];
            for (const msg of await room.roomPrvMsgs.loadItems()) {
                const createdBy = msg.createdBy?.userUid;
                if (msg.isSecret && (createdBy !== decodedIdToken.uid)) {
                    continue;
                }
                const graphQLValue = await createRoomPrivateMessage({
                    msg,
                    myUserUid: decodedIdToken.uid,
                });
                if (graphQLValue == null) {
                    continue;
                }
                privateMessages.push(graphQLValue);
            }

            const soundEffects: RoomSoundEffect[] = [];
            for (const se of await room.roomSes.loadItems()) {
                const createdBy = se.createdBy?.userUid;
                const graphQLValue: RoomSoundEffect = {
                    __tstype: RoomSoundEffectType,
                    messageId: se.id,
                    createdBy,
                    createdAt: se.createdAt.getTime(),
                    file: {
                        path: se.filePath,
                        sourceType: se.fileSourceType,
                    },
                    volume: se.volume,
                };
                soundEffects.push(graphQLValue);
            }

            const systemMessageEntity = await writeSystemMessage({ em, text: `${me.name}(${decodedIdToken.uid}) が全てのログを出力しました。`, room: room });
            await em.flush();

            return ResultModule.ok({
                result: {
                    __tstype: RoomMessagesType,
                    publicMessages,
                    privateMessages,
                    publicChannels,
                    soundEffects,
                },
                payload: {
                    roomId: room.id,
                    value: createRoomPublicMessage({ msg: systemMessageEntity, channelKey: $system }),
                    createdBy: undefined,
                    visibleTo: undefined,
                }
            });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }

    @Query(() => GetRoomLogResult)
    public async getLog(@Args() args: GetLogArgs, @Ctx() context: ResolverContext, @PubSub() pubSub: PubSubEngine): Promise<typeof GetRoomLogResult> {
        const coreResult = await this.getLogCore({ args, context });
        if (coreResult.payload != null) {
            await pubSub.publish(ROOM_MESSAGE_UPDATE, coreResult.payload);
        }
        return coreResult.result;
    }

    public async writePublicMessageCore({ args, context, channelKey }: { args: WritePublicMessageArgs; context: ResolverContext; channelKey: string }): Promise<{ result: typeof WritePublicRoomMessageResult; payload?: MessageUpdatePayload }> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return {
                result: {
                    __tstype: WritePublicRoomMessageFailureResultType,
                    failureType: WritePublicRoomMessageFailureType.NotSignIn,
                }
            };
        }

        const queue = async (): Promise<Result<{ result: typeof WritePublicRoomMessageResult; payload?: MessageUpdatePayload }>> => {
            const em = context.createEm();
            const entry = await checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return ResultModule.ok({
                    result: {
                        __tstype: WritePublicRoomMessageFailureResultType,
                        failureType: WritePublicRoomMessageFailureType.NotEntry,
                    }
                });
            }
            const findResult = await findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return ResultModule.ok({
                    result: {
                        __tstype: WritePublicRoomMessageFailureResultType,
                        failureType: WritePublicRoomMessageFailureType.RoomNotFound,
                    }
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return ResultModule.ok({
                    result: {
                        __tstype: WritePublicRoomMessageFailureResultType,
                        failureType: WritePublicRoomMessageFailureType.NotParticipant,
                    }
                });
            }
            const channelKeyFailureType = checkChannelKey(channelKey, me.role === ParticipantRole.Spectator);
            if (channelKeyFailureType != null) {
                return ResultModule.ok({
                    result: {
                        __tstype: WritePublicRoomMessageFailureResultType,
                        failureType: WritePublicRoomMessageFailureType.NotAuthorized,
                    }
                });
            }

            const meAsUser = await me.user.load();

            const entity = new RoomPubMsg();
            entity.text = args.text;
            entity.textColor = args.textColor == null ? undefined : fixTextColor(args.textColor);
            entity.createdBy = Reference.create<User, 'userUid'>(meAsUser);
            let ch = await em.findOne(RoomPubCh, { key: channelKey, room: room.id });
            if (ch == null) {
                ch = new RoomPubCh({ key: channelKey });
                ch.room = Reference.create(room);
                em.persist(ch);
            }
            entity.customName = args.customName;

            let chara: Chara | null = null;
            if (args.characterStateId != null) {
                chara = await em.findOne(Chara, { createdBy: decodedIdToken.uid, stateId: args.characterStateId });
            }
            if (chara != null) {
                entity.charaStateId = chara.stateId;
                entity.charaName = chara.name;
            }

            await analyzeTextAndSetToEntity({
                targetEntity: entity,
                em,
                text: args.text,
                chara,
                room,
                gameType: args.gameType,
            });

            entity.roomPubCh = Reference.create(ch);
            await em.persistAndFlush(entity);

            const result: RoomPublicMessage = createRoomPublicMessage({ msg: entity, channelKey });

            const payload: MessageUpdatePayload = {
                roomId: args.roomId,
                createdBy: meAsUser.userUid,
                visibleTo: undefined,
                value: result,
            };

            return ResultModule.ok({ result, payload });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }

    @Mutation(() => WritePublicRoomMessageResult)
    public async writePublicMessage(@Args() args: WritePublicMessageArgs, @Ctx() context: ResolverContext, @PubSub() pubSub: PubSubEngine): Promise<typeof WritePublicRoomMessageResult> {
        const coreResult = await this.writePublicMessageCore({ args, context, channelKey: args.channelKey });
        if (coreResult.payload != null) {
            await pubSub.publish(ROOM_MESSAGE_UPDATE, coreResult.payload);
        }
        return coreResult.result;
    }

    public async writePrivateMessageCore({ args, context }: { args: WritePrivateMessageArgs; context: ResolverContext }): Promise<{ result: typeof WritePrivateRoomMessageResult; payload?: MessageUpdatePayload }> {
        // **** args guard ****

        if (args.visibleTo.length >= 1000) {
            throw 'visibleTo.length is too large';
        }

        // **** main ****

        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return {
                result: {
                    __tstype: WritePrivateRoomMessageFailureResultType,
                    failureType: WritePrivateRoomMessageFailureType.NotSignIn,
                }
            };
        }

        const queue = async (): Promise<Result<{ result: typeof WritePrivateRoomMessageResult; payload?: MessageUpdatePayload }>> => {
            const em = context.createEm();
            const entry = await checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return ResultModule.ok({
                    result: {
                        __tstype: WritePrivateRoomMessageFailureResultType,
                        failureType: WritePrivateRoomMessageFailureType.NotEntry,
                    }
                });
            }
            const findResult = await findRoomAndMyParticipantAndParitipantUserUids({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return ResultModule.ok({
                    result: {
                        __tstype: WritePrivateRoomMessageFailureResultType,
                        failureType: WritePrivateRoomMessageFailureType.RoomNotFound,
                    }
                });
            }
            const { room, me, participantUserUids, participantUsers } = findResult;
            if (me === undefined) {
                return ResultModule.ok({
                    result: {
                        __tstype: WritePrivateRoomMessageFailureResultType,
                        failureType: WritePrivateRoomMessageFailureType.NotParticipant,
                    }
                });
            }

            const meAsUser = await me.user.load();

            const visibleTo = new Set(args.visibleTo);
            visibleTo.add(decodedIdToken.uid);
            const visibleToIsOk = __(groupJoin(visibleTo, new Set(participantUserUids))).forAll(({ value }) => value !== left);

            if (!visibleToIsOk) {
                return ResultModule.ok({
                    result: {
                        __tstype: WritePrivateRoomMessageFailureResultType,
                        failureType: WritePrivateRoomMessageFailureType.VisibleToIsInvalid,
                    }
                });
            }

            await meAsUser.visibleRoomPrvMsgs.init({ where: { room: { id: room.id } } });

            const entity = new RoomPrvMsg();
            entity.text = args.text;
            args.textColor == null ? undefined : fixTextColor(args.textColor);
            entity.createdBy = Reference.create<User, 'userUid'>(meAsUser);
            for (const participantUserRef of participantUsers) {
                const participantUser = await participantUserRef.load();
                if (visibleTo.has(participantUser.userUid)) {
                    participantUser.visibleRoomPrvMsgs.add(entity);
                    entity.visibleTo.add(participantUser);
                }
            }
            entity.customName = args.customName;

            let chara: Chara | null = null;
            if (args.characterStateId != null) {
                chara = await em.findOne(Chara, { createdBy: decodedIdToken.uid, stateId: args.characterStateId });
            }
            if (chara != null) {
                entity.charaStateId = chara.stateId;
                entity.charaName = chara.name;
            }

            entity.room = Reference.create(room);
            await em.persistAndFlush(entity);

            const visibleToArray = [...visibleTo].sort();
            const result = await createRoomPrivateMessage({ msg: entity, myUserUid: meAsUser.userUid, visibleTo: visibleToArray, visibleToMe: true });
            if (result == null) {
                throw 'This should not happen';
            }

            const payload: MessageUpdatePayload = {
                roomId: args.roomId,
                createdBy: meAsUser.userUid,
                visibleTo: visibleToArray,
                value: result,
            };

            return ResultModule.ok({ result, payload });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }

    @Mutation(() => WritePrivateRoomMessageResult)
    public async writePrivateMessage(@Args() args: WritePrivateMessageArgs, @Ctx() context: ResolverContext, @PubSub() pubSub: PubSubEngine): Promise<typeof WritePrivateRoomMessageResult> {
        const coreResult = await this.writePrivateMessageCore({ args, context });
        if (coreResult.payload != null) {
            await pubSub.publish(ROOM_MESSAGE_UPDATE, coreResult.payload);
        }
        return coreResult.result;
    }

    public async writeRoomSoundEffectCore({ args, context }: { args: WriteRoomSoundEffectArgs; context: ResolverContext }): Promise<{ result: typeof WriteRoomSoundEffectResult; payload?: MessageUpdatePayload }> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return {
                result: {
                    __tstype: WriteRoomSoundEffectFailureResultType,
                    failureType: WriteRoomSoundEffectFailureType.NotSignIn
                }
            };
        }

        const queue = async (): Promise<Result<{ result: typeof WriteRoomSoundEffectResult; payload?: MessageUpdatePayload }>> => {
            const em = context.createEm();
            const entry = await checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return ResultModule.ok({
                    result: {
                        __tstype: WriteRoomSoundEffectFailureResultType,
                        failureType: WriteRoomSoundEffectFailureType.NotEntry,
                    }
                });
            }
            const findResult = await findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return ResultModule.ok({
                    result: {
                        __tstype: WriteRoomSoundEffectFailureResultType,
                        failureType: WriteRoomSoundEffectFailureType.RoomNotFound,
                    }
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return ResultModule.ok({
                    result: {
                        __tstype: WriteRoomSoundEffectFailureResultType,
                        failureType: WriteRoomSoundEffectFailureType.NotParticipant,
                    }
                });
            }
            if (me.role === ParticipantRole.Spectator) {
                return ResultModule.ok({
                    result: {
                        __tstype: WriteRoomSoundEffectFailureResultType,
                        failureType: WriteRoomSoundEffectFailureType.NotAuthorized,
                    }
                });
            }

            const meAsUser = await me.user.load();
            const entity = new RoomSe({
                filePath: args.file.path,
                fileSourceType: args.file.sourceType,
                volume: args.volume,
            });
            entity.createdBy = Reference.create<User, 'userUid'>(meAsUser);
            entity.room = Reference.create(room);
            await em.persistAndFlush(entity);

            const result: RoomSoundEffect = {
                ...entity,
                __tstype: RoomSoundEffectType,
                messageId: entity.id,
                createdBy: meAsUser.userUid,
                createdAt: entity.createdAt.getTime(),
                file: {
                    path: entity.filePath,
                    sourceType: entity.fileSourceType,
                },
            };

            const payload: MessageUpdatePayload = {
                roomId: args.roomId,
                createdBy: meAsUser.userUid,
                visibleTo: undefined,
                value: result,
            };

            return ResultModule.ok({ result, payload });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }

    @Mutation(() => WriteRoomSoundEffectResult)
    public async writeRoomSoundEffect(@Args() args: WriteRoomSoundEffectArgs, @Ctx() context: ResolverContext, @PubSub() pubSub: PubSubEngine): Promise<typeof WriteRoomSoundEffectResult> {
        const coreResult = await this.writeRoomSoundEffectCore({ args, context });
        if (coreResult.payload != null) {
            await pubSub.publish(ROOM_MESSAGE_UPDATE, coreResult.payload);
        }
        return coreResult.result;
    }

    public async makeMessageNotSecretCore({ args, context }: { args: MessageIdArgs; context: ResolverContext }): Promise<{ result: MakeMessageNotSecretResult; payload?: MessageUpdatePayload }> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return {
                result: {
                    failureType: MakeMessageNotSecretFailureType.NotSignIn
                }
            };
        }

        const queue = async (): Promise<Result<{ result: MakeMessageNotSecretResult; payload?: MessageUpdatePayload }>> => {
            const em = context.createEm();
            const entry = await checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return ResultModule.ok({
                    result: {
                        failureType: MakeMessageNotSecretFailureType.NotEntry,
                    }
                });
            }
            const findResult = await findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return ResultModule.ok({
                    result: {
                        failureType: MakeMessageNotSecretFailureType.RoomNotFound,
                    }
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return ResultModule.ok({
                    result: {
                        failureType: MakeMessageNotSecretFailureType.NotParticipant,
                    }
                });
            }
            const publicMsg = await em.findOne(RoomPubMsg, { id: args.messageId });
            if (publicMsg != null) {
                if (publicMsg.createdBy?.userUid !== decodedIdToken.uid) {
                    return ResultModule.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType.NotYourMessage,
                        }
                    });
                }
                if (!publicMsg.isSecret) {
                    return ResultModule.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType.NotSecret,
                        }
                    });
                }
                publicMsg.isSecret = false;
                await em.flush();
                return ResultModule.ok({
                    result: {},
                    payload: {
                        roomId: room.id,
                        visibleTo: undefined,
                        createdBy: publicMsg.createdBy?.userUid,
                        value: {
                            __tstype: RoomPublicMessageUpdateType,
                            messageId: publicMsg.id,
                            characterStateId: publicMsg.charaStateId,
                            characterName: publicMsg.charaName,
                            isSecret: publicMsg.isSecret,
                            text: publicMsg.text,
                            commandResult: publicMsg.commandResult == null ? undefined : {
                                text: publicMsg.commandResult ,
                                isSuccess: publicMsg.commandIsSuccess,
                            },
                            altTextToSecret: publicMsg.altTextToSecret,
                            updatedAt: publicMsg.textUpdatedAt,
                        }
                    }
                });
            }
            const privateMsg = await em.findOne(RoomPrvMsg, { id: args.messageId });
            if (privateMsg != null) {
                if (privateMsg.createdBy?.userUid !== decodedIdToken.uid) {
                    return ResultModule.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType.NotYourMessage,
                        }
                    });
                }
                if (!privateMsg.isSecret) {
                    return ResultModule.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType.NotSecret,
                        }
                    });
                }
                privateMsg.isSecret = false;
                await em.flush();
                return ResultModule.ok({
                    result: {},
                    payload: {
                        roomId: room.id,
                        visibleTo: (await privateMsg.visibleTo.loadItems()).map(user => user.userUid),
                        createdBy: privateMsg.createdBy?.userUid,
                        value: {
                            __tstype: RoomPrivateMessageUpdateType,
                            messageId: privateMsg.id,
                            characterStateId: privateMsg.charaStateId,
                            characterName: privateMsg.charaName,
                            isSecret: privateMsg.isSecret,
                            text: privateMsg.text,
                            commandResult: privateMsg.commandResult == null ? undefined : {
                                text: privateMsg.commandResult,
                                isSuccess: privateMsg.commandIsSuccess,
                            },
                            altTextToSecret: privateMsg.altTextToSecret,
                            updatedAt: privateMsg.textUpdatedAt,
                        }
                    }
                });
            }

            return ResultModule.ok({
                result: {
                    failureType: MakeMessageNotSecretFailureType.MessageNotFound,
                }
            });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }

    @Mutation(() => MakeMessageNotSecretResult)
    public async makeMessageNotSecret(@Args() args: MessageIdArgs, @Ctx() context: ResolverContext, @PubSub() pubSub: PubSubEngine): Promise<MakeMessageNotSecretResult> {
        const coreResult = await this.makeMessageNotSecretCore({ args, context });
        if (coreResult.payload != null) {
            await pubSub.publish(ROOM_MESSAGE_UPDATE, coreResult.payload);
        }
        return coreResult.result;
    }

    public async deleteMessageCore({ args, context }: { args: MessageIdArgs; context: ResolverContext }): Promise<{ result: DeleteMessageResult; payload?: MessageUpdatePayload }> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return {
                result: {
                    failureType: DeleteMessageFailureType.NotSignIn
                }
            };
        }

        const queue = async (): Promise<Result<{ result: DeleteMessageResult; payload?: MessageUpdatePayload }>> => {
            const em = context.createEm();
            const entry = await checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return ResultModule.ok({
                    result: {
                        failureType: DeleteMessageFailureType.NotEntry,
                    }
                });
            }
            const findResult = await findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return ResultModule.ok({
                    result: {
                        failureType: DeleteMessageFailureType.RoomNotFound,
                    }
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return ResultModule.ok({
                    result: {
                        failureType: DeleteMessageFailureType.NotParticipant,
                    }
                });
            }
            const publicMsg = await em.findOne(RoomPubMsg, { id: args.messageId });
            if (publicMsg != null) {
                if (publicMsg.createdBy?.userUid !== decodedIdToken.uid) {
                    return ResultModule.ok({
                        result: {
                            failureType: DeleteMessageFailureType.NotYourMessage,
                        }
                    });
                }
                if (publicMsg.text == null && publicMsg.altTextToSecret == null && publicMsg.commandResult == null) {
                    return ResultModule.ok({
                        result: {
                            failureType: DeleteMessageFailureType.MessageDeleted,
                        }
                    });
                }
                publicMsg.text = undefined;
                publicMsg.altTextToSecret = undefined;
                publicMsg.commandResult = undefined;
                publicMsg.isSecret = false;
                publicMsg.textUpdatedAt = new Date().getTime();
                await em.flush();
                return ResultModule.ok({
                    result: {},
                    payload: {
                        roomId: room.id,
                        visibleTo: undefined,
                        createdBy: publicMsg.createdBy?.userUid,
                        value: {
                            __tstype: RoomPublicMessageUpdateType,
                            messageId: publicMsg.id,
                            characterStateId: publicMsg.charaStateId,
                            characterName: publicMsg.charaName,
                            isSecret: publicMsg.isSecret,
                            text: publicMsg.text,
                            commandResult: publicMsg.commandResult == null ? undefined : {
                                text: publicMsg.commandResult,
                                isSuccess: publicMsg.commandIsSuccess,
                            },
                            altTextToSecret: publicMsg.altTextToSecret,
                            updatedAt: publicMsg.textUpdatedAt,
                        }
                    }
                });
            }
            const privateMsg = await em.findOne(RoomPrvMsg, { id: args.messageId });
            if (privateMsg != null) {
                if (privateMsg.createdBy?.userUid !== decodedIdToken.uid) {
                    return ResultModule.ok({
                        result: {
                            failureType: DeleteMessageFailureType.NotYourMessage,
                        }
                    });
                }
                if (privateMsg.text == null && privateMsg.altTextToSecret == null && privateMsg.commandResult == null) {
                    return ResultModule.ok({
                        result: {
                            failureType: DeleteMessageFailureType.MessageDeleted,
                        }
                    });
                }
                privateMsg.text = undefined;
                privateMsg.altTextToSecret = undefined;
                privateMsg.commandResult = undefined;
                privateMsg.isSecret = false;
                privateMsg.textUpdatedAt = new Date().getTime();
                await em.flush();
                return ResultModule.ok({
                    result: {},
                    payload: {
                        roomId: room.id,
                        visibleTo: (await privateMsg.visibleTo.loadItems()).map(user => user.userUid),
                        createdBy: privateMsg.createdBy?.userUid,
                        value: {
                            __tstype: RoomPrivateMessageUpdateType,
                            messageId: privateMsg.id,
                            characterStateId: privateMsg.charaStateId,
                            characterName: privateMsg.charaName,
                            isSecret: privateMsg.isSecret,
                            text: privateMsg.text,
                            commandResult: privateMsg.commandResult == null ? undefined : {
                                text: privateMsg.commandResult,
                                isSuccess: privateMsg.commandIsSuccess,
                            },
                            altTextToSecret: privateMsg.altTextToSecret,
                            updatedAt: privateMsg.textUpdatedAt,
                        }
                    }
                });
            }

            return ResultModule.ok({
                result: {
                    failureType: DeleteMessageFailureType.MessageNotFound,
                }
            });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }

    @Mutation(() => DeleteMessageResult)
    public async deleteMessage(@Args() args: MessageIdArgs, @Ctx() context: ResolverContext, @PubSub() pubSub: PubSubEngine): Promise<DeleteMessageResult> {
        const coreResult = await this.deleteMessageCore({ args, context });
        if (coreResult.payload != null) {
            await pubSub.publish(ROOM_MESSAGE_UPDATE, coreResult.payload);
        }
        return coreResult.result;
    }

    public async editMessageCore({ args, context }: { args: EditMessageArgs; context: ResolverContext }): Promise<{ result: EditMessageResult; payload?: MessageUpdatePayload }> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return {
                result: {
                    failureType: EditMessageFailureType.NotSignIn
                }
            };
        }

        const queue = async (): Promise<Result<{ result: EditMessageResult; payload?: MessageUpdatePayload }>> => {
            const em = context.createEm();
            const entry = await checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return ResultModule.ok({
                    result: {
                        failureType: EditMessageFailureType.NotEntry,
                    }
                });
            }
            const findResult = await findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return ResultModule.ok({
                    result: {
                        failureType: EditMessageFailureType.RoomNotFound,
                    }
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return ResultModule.ok({
                    result: {
                        failureType: EditMessageFailureType.NotParticipant,
                    }
                });
            }
            const publicMsg = await em.findOne(RoomPubMsg, { id: args.messageId });
            if (publicMsg != null) {
                if (publicMsg.createdBy?.userUid !== decodedIdToken.uid) {
                    return ResultModule.ok({
                        result: {
                            failureType: EditMessageFailureType.NotYourMessage,
                        }
                    });
                }
                if (publicMsg.text == null) {
                    return ResultModule.ok({
                        result: {
                            failureType: EditMessageFailureType.MessageDeleted,
                        }
                    });
                }
                publicMsg.text = args.text;
                publicMsg.textUpdatedAt = new Date().getTime();
                await em.flush();
                return ResultModule.ok({
                    result: {},
                    payload: {
                        roomId: room.id,
                        visibleTo: undefined,
                        createdBy: publicMsg.createdBy?.userUid,
                        value: {
                            __tstype: RoomPublicMessageUpdateType,
                            messageId: publicMsg.id,
                            characterStateId: publicMsg.charaStateId,
                            characterName: publicMsg.charaName,
                            isSecret: publicMsg.isSecret,
                            text: publicMsg.text,
                            commandResult: publicMsg.commandResult == null ? undefined : {
                                text: publicMsg.commandResult,
                                isSuccess: publicMsg.commandIsSuccess,
                            },
                            altTextToSecret: publicMsg.altTextToSecret,
                            updatedAt: publicMsg.textUpdatedAt,
                        }
                    }
                });
            }
            const privateMsg = await em.findOne(RoomPrvMsg, { id: args.messageId });
            if (privateMsg != null) {
                if (privateMsg.createdBy?.userUid !== decodedIdToken.uid) {
                    return ResultModule.ok({
                        result: {
                            failureType: EditMessageFailureType.NotYourMessage,
                        }
                    });
                }
                if (privateMsg.text == null) {
                    return ResultModule.ok({
                        result: {
                            failureType: EditMessageFailureType.MessageDeleted,
                        }
                    });
                }
                privateMsg.text = args.text;
                privateMsg.textUpdatedAt = new Date().getTime();
                await em.flush();
                return ResultModule.ok({
                    result: {},
                    payload: {
                        roomId: room.id,
                        visibleTo: (await privateMsg.visibleTo.loadItems()).map(user => user.userUid),
                        createdBy: privateMsg.createdBy?.userUid,
                        value: {
                            __tstype: RoomPrivateMessageUpdateType,
                            messageId: privateMsg.id,
                            characterStateId: privateMsg.charaStateId,
                            characterName: privateMsg.charaName,
                            isSecret: privateMsg.isSecret,
                            text: privateMsg.text,
                            commandResult: privateMsg.commandResult == null ? undefined : {
                                text: privateMsg.commandResult,
                                isSuccess: privateMsg.commandIsSuccess,
                            },
                            altTextToSecret: privateMsg.altTextToSecret,
                            updatedAt: privateMsg.textUpdatedAt,
                        }
                    }
                });
            }

            return ResultModule.ok({
                result: {
                    failureType: EditMessageFailureType.MessageNotFound,
                }
            });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }

    @Mutation(() => EditMessageResult)
    public async editMessage(@Args() args: EditMessageArgs, @Ctx() context: ResolverContext, @PubSub() pubSub: PubSubEngine): Promise<EditMessageResult> {
        const coreResult = await this.editMessageCore({ args, context });
        if (coreResult.payload != null) {
            await pubSub.publish(ROOM_MESSAGE_UPDATE, coreResult.payload);
        }
        return coreResult.result;
    }

    @Subscription(() => RoomMessageEvent, { topics: ROOM_MESSAGE_UPDATE, nullable: true })
    public messageEvent(@Root() payload: MessageUpdatePayload | null | undefined, @Arg('roomId') roomId: string, @Ctx() context: ResolverContext): typeof RoomMessageEvent | undefined {
        if (payload == null) {
            return undefined;
        }
        if (roomId !== payload.roomId) {
            return undefined;
        }
        if (context.decodedIdToken == null || context.decodedIdToken.isError) {
            return undefined;
        }
        const userUid: string = context.decodedIdToken.value.uid;

        if (payload.value.__tstype === RoomPrivateMessageType) {
            if (payload.value.visibleTo.find(vt => vt === userUid) === undefined) {
                return undefined;
            }
        }
        if (payload.value.__tstype === RoomPrivateMessageUpdateType) {
            if (payload.visibleTo == null) {
                throw 'payload.visibleTo is required.';
            }
            if (payload.visibleTo.find(vt => vt === userUid) === undefined) {
                return undefined;
            }
        }

        switch (payload.value.__tstype) {
            case RoomPrivateMessageType:
            case RoomPublicMessageType: {
                if (payload.value.isSecret && (payload.value.createdBy !== userUid)) {
                    return {
                        ...payload.value,
                        text: undefined,
                        commandResult: undefined,
                    };
                }
                break;
            }
            case RoomPrivateMessageUpdateType:
            case RoomPublicMessageUpdateType:
                if (payload.value.isSecret && (payload.createdBy !== userUid)) {
                    return {
                        ...payload.value,
                        text: undefined,
                        commandResult: undefined,
                    };
                }
                break;
        }

        return payload.value;
    }
}