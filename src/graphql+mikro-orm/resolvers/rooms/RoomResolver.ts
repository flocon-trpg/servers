import { Resolver, Query, Args, Mutation, Ctx, PubSub, Subscription, Root, ArgsType, Field, Arg, InputType, PubSubEngine, Int, ObjectType } from 'type-graphql';
import { ResolverContext } from '../../utils/Contexts';
import { ParticipantRole } from '../../../enums/ParticipantRole';
import { GetRoomFailureType } from '../../../enums/GetRoomFailureType';
import { GetRoomsListFailureType } from '../../../enums/GetRoomsListFailureType';
import { CreateRoomFailureType } from '../../../enums/CreateRoomFailureType';
import { checkEntry, checkSignIn, findRoomAndMyParticipant, findRoomAndMyParticipantAndParitipantUserUids, getUserIfEntry, NotSignIn } from '../utils/helpers';
import { JoinRoomFailureType } from '../../../enums/JoinRoomFailureType';
import * as Room$MikroORM from '../../entities/room/mikro-orm';
import { stateToGraphQL as stateToGraphql$RoomAsListItem } from '../../entities/roomAsListItem/global';
import { queueLimitReached } from '../../../utils/PromiseQueue';
import { serverTooBusyMessage } from '../utils/messages';
import { RoomOperation, RoomOperationInput, deleteRoomOperation, DeleteRoomOperation } from '../../entities/room/graphql';
import { OperateRoomFailureType } from '../../../enums/OperateRoomFailureType';
import { Result, ResultModule } from '../../../@shared/Result';
import { LeaveRoomFailureType } from '../../../enums/LeaveRoomFailureType';
import { loadServerConfigAsMain } from '../../../config';
import { Partici } from '../../entities/room/participant/mikro-orm';
import { RequiresPhraseFailureType } from '../../../enums/RequiresPhraseFailureType';
import { OperateRoomFailureResult, OperateRoomIdResult, OperateRoomNonJoinedResult, OperateRoomResult, OperateRoomSuccessResult } from '../../results/OperateRoomResult';
import { JoinRoomResult } from '../../results/JoinRoomResult';
import { GetRoomsListResult } from '../../results/GetRoomsListResult';
import { RequiresPhraseResult } from '../../results/RequiresPhraseResult';
import { CreateRoomResult } from '../../results/CreateRoomResult';
import { GetRoomResult } from '../../results/GetRoomResult';
import { LeaveRoomResult } from '../../results/LeaveRoomResult';
import { PromoteResult } from '../../results/PromoteMeResult';
import { PromoteFailureType } from '../../../enums/PromoteFailureType';
import { ChangeParticipantNameResult } from '../../results/ChangeParticipantNameResult';
import { ChangeParticipantNameFailureType } from '../../../enums/ChangeParticipantNameFailureType';
import { DeleteRoomResult } from '../../results/DeleteRoomResult';
import { DeleteRoomFailureType } from '../../../enums/DeleteRoomFailureType';
import { GlobalRoom } from '../../entities/room/global';
import { client, RequestedBy, server } from '../../Types';
import { GlobalParticipant } from '../../entities/room/participant/global';
import { MapTwoWayOperationElementUnion, replace, update } from '../../mapOperations';
import { EM } from '../../../utils/types';
import { MaxLength } from 'class-validator';
import { GlobalMyValue } from '../../entities/room/participant/myValue/global';
import { __ } from '../../../@shared/collection';
import { RoomPrvMsg, RoomPubCh, RoomPubMsg, RoomSe, MyValueLog as MyValueLog$MikroORM } from '../../entities/roomMessage/mikro-orm';
import { ChangeParticipantNameArgs, CreateRoomInput, DeleteRoomArgs, EditMessageArgs, GetLogArgs, GetMessagesArgs, GetRoomArgs, JoinRoomArgs, MessageIdArgs, OperateArgs, PromoteArgs, WritePrivateMessageArgs, WritePublicMessageArgs, WriteRoomSoundEffectArgs } from './args+input';
import { CharacterValueForMessage, DeleteMessageResult, EditMessageResult, GetRoomLogFailureResultType, GetRoomLogResult, GetRoomMessagesFailureResultType, GetRoomMessagesResult, MakeMessageNotSecretResult, MyValueLog as MyValueLog$GraphQL, MyValueLogType, RoomMessageEvent, RoomMessagesType, RoomPrivateMessage, RoomPrivateMessageType, RoomPrivateMessageUpdate, RoomPrivateMessageUpdateType, RoomPublicChannel, RoomPublicChannelType, RoomPublicMessage, RoomPublicMessageType, RoomPublicMessageUpdate, RoomPublicMessageUpdateType, RoomSoundEffect, RoomSoundEffectType, WritePrivateRoomMessageFailureResultType, WritePrivateRoomMessageResult, WritePublicRoomMessageFailureResultType, WritePublicRoomMessageResult, WriteRoomSoundEffectFailureResultType, WriteRoomSoundEffectResult } from '../../entities/roomMessage/graphql';
import { WritePublicRoomMessageFailureType } from '../../../enums/WritePublicRoomMessageFailureType';
import { $free, $system } from '../../../@shared/Constants';
import { Chara } from '../../entities/room/character/mikro-orm';
import { GameType } from '../../../@shared/bcdice';
import { analyze, plain } from '../../../messageAnalyzer/main';
import Color from 'color';
import { GetRoomMessagesFailureType } from '../../../enums/GetRoomMessagesFailureType';
import { MyValueLog as MyValueLogNameSpace } from '../../entities/roomMessage/global';
import { GetRoomLogFailureType } from '../../../enums/GetRoomLogFailureType';
import { writeSystemMessage } from '../utils/roomMessage';
import { Reference } from '@mikro-orm/core';
import { User } from '../../entities/user/mikro-orm';
import { WritePrivateRoomMessageFailureType } from '../../../enums/WritePrivateRoomMessageFailureType';
import { groupJoin } from '../../../@shared/Set';
import { left } from '../../../@shared/Types';
import { WriteRoomSoundEffectFailureType } from '../../../enums/WriteRoomSoundEffectFailureType';
import { MakeMessageNotSecretFailureType } from '../../../enums/MakeMessageNotSecretFailureType';
import { DeleteMessageFailureType } from '../../../enums/DeleteMessageFailureType';
import { EditMessageFailureType } from '../../../enums/EditMessageFailureType';
import { ROOM_EVENT } from '../../utils/Topics';

type MessageUpdatePayload = {
    type: 'messageUpdatePayload';

    roomId: string;

    // RoomPublicMessageなどのcreatedByと等しい。RoomPublicChannelの場合はnullish。
    // Update系においてcreatedByが必要だが、RoomMessageEventに含まれていないためここで定義している。
    createdBy: string | undefined;

    // RoomPrivateMessageUpdateのときにvisibleToが必要だが、RoomPrivateMessageUpdateに含まれていないためここで定義している。
    // visibleToが存在しない場合はnullish。
    visibleTo: string[] | undefined;

    value: typeof RoomMessageEvent;
}

type RoomOperationPayload = {
    type: 'roomOperationPayload';
    roomId: string;
    participants: ReadonlySet<string>; // UserUid
    generateOperation: (deliverTo: string) => RoomOperation;
}

type DeleteRoomPayload = {
    type: 'deleteRoomPayload';
    roomId: string;
    deletedBy: string;
}

type RoomEventPayload = MessageUpdatePayload | RoomOperationPayload | DeleteRoomPayload;

@ObjectType()
export class RoomEvent {
    // 現状は、2つ以上同時にnon-nullishになることはない。

    @Field(() => RoomOperation, { nullable: true })
    public roomOperation?: RoomOperation;

    @Field(() => DeleteRoomOperation, { nullable: true })
    public deleteRoomOperation?: DeleteRoomOperation;

    @Field(() => RoomMessageEvent, { nullable: true })
    public roomMessageEvent?: typeof RoomMessageEvent;
}

type OperateCoreResult = {
    type: 'success';
    result: OperateRoomSuccessResult;
    roomOperationPayload: RoomOperationPayload;
    messageUpdatePayload: MessageUpdatePayload[];
} | {
    type: 'id';
    result: OperateRoomIdResult;
} | {
    type: 'nonJoined';
    result: OperateRoomNonJoinedResult;
} | {
    type: 'failure';
    result: OperateRoomFailureResult;
}

const operateParticipantAndFlush = async ({
    myUserUid,
    em,
    room,
    participantUserUids,
    create,
    update,
}: {
    myUserUid: string;
    em: EM;
    room: Room$MikroORM.Room;
    participantUserUids: ReadonlySet<string>;
    create?: {
        role: ParticipantRole | undefined;
        name: string;
    };
    update?: {
        role?: { newValue: ParticipantRole | undefined };
        name?: { newValue: string };
    };
}): Promise<{ result: typeof JoinRoomResult; payload: RoomEventPayload | undefined }> => {
    const prevRevision = room.revision;
    const roomState = await GlobalRoom.MikroORM.ToGlobal.state(room);
    const me = roomState.participants.get(myUserUid);
    const participantsOperation = new Map<string, MapTwoWayOperationElementUnion<GlobalParticipant.StateType, GlobalParticipant.TwoWayOperationType>>();
    if (me == null) {
        if (create != null) {
            participantsOperation.set(myUserUid, {
                type: replace,
                operation: {
                    oldValue: undefined,
                    newValue: {
                        name: create.name,
                        role: create.role,
                        myNumberValues: new Map(),
                    }
                },
            });
        }
    } else {
        if (update != null) {
            const operation = GlobalParticipant.transformerFactory({ type: server }).diff({
                key: myUserUid,
                prevState: me,
                nextState: {
                    ...me,
                    role: update.role === undefined ? me.role : update.role.newValue,
                    name: update.name === undefined ? me.name : update.name.newValue,
                },
            });
            if (operation !== undefined) {
                participantsOperation.set(myUserUid, {
                    type: 'update',
                    operation,
                });
            }
        }
    }

    const roomOperation: GlobalRoom.TwoWayOperationType = {
        ...GlobalRoom.Global.emptyTwoWayOperation(),
        participants: participantsOperation,
    };
    await GlobalRoom.Global.applyToEntity({ em, target: room, operation: roomOperation });
    await em.flush();
    const nextRoomState = await GlobalRoom.MikroORM.ToGlobal.state(room);
    const generateOperation = (deliverTo: string): RoomOperation => {
        const value = GlobalRoom.Global.ToGraphQL.operation({
            operation: roomOperation,
            prevState: roomState,
            nextState: nextRoomState,
            requestedBy: { type: client, userUid: deliverTo },
        });
        return {
            __tstype: 'RoomOperation',
            revisionTo: prevRevision + 1,
            operatedBy: undefined,
            value,
        };
    };
    return {
        result: {
            operation: generateOperation(myUserUid),
        },
        payload: {
            type: 'roomOperationPayload',
            // Roomに参加したばかりの場合、decodedToken.uidはparticipantUserUidsに含まれないためSubscriptionは実行されない。だが、そのようなユーザーにroomOperatedで通知する必要はないため問題ない。
            participants: participantUserUids,
            generateOperation,
            roomId: room.id,
        },
    };
};

const joinRoomCore = async ({
    args,
    context,
    globalEntryPhrase,
    strategy,
}: {
    args: JoinRoomArgs;
    context: ResolverContext;
    globalEntryPhrase: string | undefined;
    // 新たにRoleを設定する場合はParticipantRoleを返す。Roleを変えない場合は'id'を返す。
    strategy: (params: {
        room: Room$MikroORM.Room;
        args: JoinRoomArgs;
        me: Partici | undefined;
    }) => ParticipantRole | JoinRoomFailureType.WrongPhrase | JoinRoomFailureType.AlreadyParticipant | 'id';
}): Promise<{ result: typeof JoinRoomResult; payload: RoomEventPayload | undefined }> => {
    const decodedIdToken = checkSignIn(context);
    if (decodedIdToken === NotSignIn) {
        return { result: { failureType: JoinRoomFailureType.NotSignIn }, payload: undefined };
    }

    const queue = async (): Promise<{ result: typeof JoinRoomResult; payload: RoomEventPayload | undefined }> => {
        const em = context.createEm();
        const entryUser = await getUserIfEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase, });
        await em.flush();
        if (entryUser == null) {
            return {
                result: {
                    failureType: JoinRoomFailureType.NotEntry,
                },
                payload: undefined,
            };
        }
        const findResult = await findRoomAndMyParticipantAndParitipantUserUids({ em, userUid: decodedIdToken.uid, roomId: args.id });
        if (findResult == null) {
            return {
                result: {
                    failureType: JoinRoomFailureType.NotFound,
                },
                payload: undefined,
            };
        }
        const { room, me, participantUserUids } = findResult;
        const strategyResult = strategy({ me, room, args });
        switch (strategyResult) {
            case 'id': {
                return {
                    result: {
                        operation: undefined,
                    },
                    payload: undefined,
                };
            }
            case JoinRoomFailureType.WrongPhrase: {
                return {
                    result: {
                        failureType: JoinRoomFailureType.WrongPhrase,
                    },
                    payload: undefined,
                };
            }
            case JoinRoomFailureType.AlreadyParticipant: {
                return {
                    result: {
                        failureType: JoinRoomFailureType.AlreadyParticipant,
                    },
                    payload: undefined,
                };
            }
            default: {
                return await operateParticipantAndFlush({
                    em,
                    room,
                    participantUserUids,
                    myUserUid: decodedIdToken.uid,
                    create: {
                        name: args.name,
                        role: strategyResult,
                    },
                    update: {
                        role: { newValue: strategyResult },
                    }
                });
            }
        }
    };

    const result = await context.promiseQueue.next(queue);
    if (result.type === queueLimitReached) {
        throw serverTooBusyMessage;
    }
    return result.value;
};

const promoteMeCore = async ({
    roomId,
    context,
    globalEntryPhrase,
    strategy,
}: {
    roomId: string;
    context: ResolverContext;
    globalEntryPhrase: string | undefined;
    strategy: (params: {
        room: Room$MikroORM.Room;
        me: Partici;
    }) => ParticipantRole | PromoteFailureType.WrongPhrase | PromoteFailureType.NoNeedToPromote | PromoteFailureType.NotParticipant;
}): Promise<{ result: PromoteResult; payload: RoomEventPayload | undefined }> => {
    const decodedIdToken = checkSignIn(context);
    if (decodedIdToken === NotSignIn) {
        return { result: { failureType: PromoteFailureType.NotSignIn }, payload: undefined };
    }

    const queue = async (): Promise<{ result: PromoteResult; payload: RoomEventPayload | undefined }> => {
        const em = context.createEm();
        const entryUser = await getUserIfEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase, });
        await em.flush();
        if (entryUser == null) {
            return {
                result: {
                    failureType: PromoteFailureType.NotEntry,
                },
                payload: undefined,
            };
        }
        const findResult = await findRoomAndMyParticipantAndParitipantUserUids({ em, userUid: decodedIdToken.uid, roomId });
        if (findResult == null) {
            return {
                result: {
                    failureType: PromoteFailureType.NotFound,
                },
                payload: undefined,
            };
        }
        const { room, me, participantUserUids } = findResult;
        if (me == null) {
            return {
                result: {
                    failureType: PromoteFailureType.NotParticipant,
                },
                payload: undefined,
            };
        }
        const strategyResult = strategy({ me, room });
        switch (strategyResult) {
            case PromoteFailureType.NoNeedToPromote: {
                return {
                    result: {
                        failureType: PromoteFailureType.NoNeedToPromote,
                    },
                    payload: undefined,
                };
            }
            case PromoteFailureType.WrongPhrase: {
                return {
                    result: {
                        failureType: PromoteFailureType.WrongPhrase,
                    },
                    payload: undefined,
                };
            }
            case PromoteFailureType.NotParticipant: {
                return {
                    result: {
                        failureType: PromoteFailureType.NotParticipant,
                    },
                    payload: undefined,
                };
            }
            default: {
                return {
                    result: {
                        failureType: undefined,
                    },
                    payload: (await operateParticipantAndFlush({
                        em,
                        room,
                        participantUserUids,
                        myUserUid: decodedIdToken.uid,
                        update: {
                            role: { newValue: strategyResult },
                        }
                    })).payload,
                };
            }
        }
    };

    const result = await context.promiseQueue.next(queue);
    if (result.type === queueLimitReached) {
        throw serverTooBusyMessage;
    }
    return result.value;
};

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
    room: Room$MikroORM.Room;
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

const toCharacterValueForMessage = (message: RoomPubMsg | RoomPrvMsg): CharacterValueForMessage | undefined => {
    if (message.charaStateId == null || message.charaName == null || message.charaIsPrivate == null) {
        return undefined;
    }
    return {
        stateId: message.charaStateId,
        isPrivate: message.charaIsPrivate,
        name: message.charaName,
        image: message.charaImagePath == null || message.charaImageSourceType == null ? undefined : {
            path: message.charaImagePath,
            sourceType: message.charaImageSourceType,
        },
        tachieImage: message.charaTachieImagePath == null || message.charaTachieImageSourceType == null ? undefined : {
            path: message.charaTachieImagePath,
            sourceType: message.charaTachieImageSourceType,
        },
    };
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
        character: toCharacterValueForMessage(msg),
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
        character: toCharacterValueForMessage(msg),
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
    try {
        return Color(color).hex();
    } catch {
        return undefined
    }
};

@Resolver()
export class RoomResolver {
    public async getRoomsListCore({ context, globalEntryPhrase }: { context: ResolverContext; globalEntryPhrase: string | undefined }): Promise<typeof GetRoomsListResult> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return { failureType: GetRoomsListFailureType.NotSignIn };
        }

        const queue = async () => {
            const em = context.createEm();
            const entry = await checkEntry({ em, userUid: decodedIdToken.uid, globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return {
                    failureType: GetRoomsListFailureType.NotEntry,
                };
            }

            // TODO: すべてを取得しているので重い
            const roomModels = await em.find(Room$MikroORM.Room, {});
            const rooms = roomModels.map(model => stateToGraphql$RoomAsListItem({ roomEntity: model }));
            return {
                rooms,
            };
        };

        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        return result.value;
    }

    @Query(() => GetRoomsListResult)
    public getRoomsList(@Ctx() context: ResolverContext): Promise<typeof GetRoomsListResult> {
        return this.getRoomsListCore({ context, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
    }

    public async requiresPhraseToJoinAsPlayerCore({ roomId, context, globalEntryPhrase }: { roomId: string; context: ResolverContext; globalEntryPhrase: string | undefined }): Promise<typeof RequiresPhraseResult> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return { failureType: RequiresPhraseFailureType.NotSignIn };
        }

        const queue = async () => {
            const em = context.createEm();
            const entry = await checkEntry({ em, userUid: decodedIdToken.uid, globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return {
                    failureType: RequiresPhraseFailureType.NotEntry,
                };
            }

            const room = await em.findOne(Room$MikroORM.Room, { id: roomId });
            if (room == null) {
                return {
                    failureType: RequiresPhraseFailureType.NotFound,
                };
            }
            return {
                value: room.joinAsPlayerPhrase != null,
            };
        };

        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        return result.value;
    }

    @Query(() => RequiresPhraseResult)
    public requiresPhraseToJoinAsPlayer(@Arg('roomId') roomId: string, @Ctx() context: ResolverContext): Promise<typeof RequiresPhraseResult> {
        return this.requiresPhraseToJoinAsPlayerCore({ roomId, context, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
    }

    public async createRoomCore({ input, context, globalEntryPhrase }: { input: CreateRoomInput; context: ResolverContext; globalEntryPhrase: string | undefined }): Promise<typeof CreateRoomResult> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return { failureType: CreateRoomFailureType.NotSignIn };
        }

        const queue = async (): Promise<typeof CreateRoomResult> => {
            const em = context.createEm();
            const entryUser = await getUserIfEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase, });
            await em.flush();
            if (entryUser == null) {
                return {
                    failureType: CreateRoomFailureType.NotEntry,
                };
            }
            const newRoom = new Room$MikroORM.Room({
                name: input.roomName,
                createdBy: decodedIdToken.uid,
                publicChannel1Name: 'メイン',
                publicChannel2Name: 'メイン2',
                publicChannel3Name: 'メイン3',
                publicChannel4Name: 'メイン4',
                publicChannel5Name: 'メイン5',
                publicChannel6Name: 'メイン6',
                publicChannel7Name: 'メイン7',
                publicChannel8Name: 'メイン8',
                publicChannel9Name: 'メイン9',
                publicChannel10Name: 'メイン10',
            });
            // このRoomのroomOperatedを購読しているユーザーはいないので、roomOperatedは実行する必要がない。
            const newParticipant = new Partici({ role: ParticipantRole.Master, name: input.participantName, user: entryUser, room: newRoom });
            newRoom.joinAsPlayerPhrase = input.joinAsPlayerPhrase;
            newRoom.joinAsSpectatorPhrase = input.joinAsSpectatorPhrase;
            const revision = newRoom.revision;
            em.persist(newParticipant);
            em.persist(newRoom);
            const roomState = await GlobalRoom.MikroORM.ToGlobal.state(newRoom);
            const graphqlState = GlobalRoom.Global.ToGraphQL.state({
                source: roomState,
                requestedBy: { type: client, userUid: decodedIdToken.uid },
            });
            await em.flush();
            return {
                room: {
                    ...graphqlState,
                    revision,
                    createdBy: decodedIdToken.uid,
                },
                id: newRoom.id,
            };
        };

        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        return result.value;
    }

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

            const myValueLogs: MyValueLog$GraphQL[] = [];
            for (const partici of await room.particis.loadItems()) {
                for (const msg of await partici.myValueLogs.loadItems()) {
                    myValueLogs.push(MyValueLogNameSpace.MikroORM.ToGraphQL.state({ entity: msg, stateUserUid: partici.user.userUid }));
                }
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
                myValueLogs,
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

            const myValueLogs: MyValueLog$GraphQL[] = [];
            for (const partici of await room.particis.loadItems()) {
                for (const msg of await partici.myValueLogs.loadItems()) {
                    myValueLogs.push(MyValueLogNameSpace.MikroORM.ToGraphQL.state({ entity: msg, stateUserUid: partici.user.userUid }));
                }
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
                    myValueLogs,
                    publicChannels,
                    soundEffects,
                },
                payload: {
                    type: 'messageUpdatePayload',
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
            await pubSub.publish(ROOM_EVENT, coreResult.payload);
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
                entity.charaIsPrivate = chara.isPrivate;
                entity.charaImagePath = chara.imagePath;
                entity.charaImageSourceType = chara.imageSourceType;
                entity.charaTachieImagePath = chara.tachieImagePath;
                entity.charaTachieImageSourceType = chara.tachieImageSourceType;
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
                type: 'messageUpdatePayload',
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
    @Mutation(() => CreateRoomResult)
    public createRoom(@Arg('input') input: CreateRoomInput, @Ctx() context: ResolverContext): Promise<typeof CreateRoomResult> {
        return this.createRoomCore({ input, context, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
    }

    public async deleteRoomCore({ args, context, globalEntryPhrase }: { args: DeleteRoomArgs; context: ResolverContext; globalEntryPhrase: string | undefined }): Promise<{ result: DeleteRoomResult; payload: RoomEventPayload | undefined }> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return {
                result: { failureType: DeleteRoomFailureType.NotSignIn },
                payload: undefined,
            };
        }

        const queue = async (): Promise<{ result: DeleteRoomResult; payload: RoomEventPayload | undefined }> => {
            const em = context.createEm();
            const entry = await checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase, });
            await em.flush();
            if (!entry) {
                return {
                    result: { failureType: DeleteRoomFailureType.NotEntry },
                    payload: undefined,
                };
            }

            // そのRoomのParticipantでない場合でも削除できるようになっている。ただし、もしキック機能が実装されて部屋作成者がキックされた場合は再考の余地があるか。

            const room = await em.findOne(Room$MikroORM.Room, { id: args.id });
            if (room == null) {
                return {
                    result: { failureType: DeleteRoomFailureType.NotFound },
                    payload: undefined,
                };
            }
            const roomId = room.id;
            if (room.createdBy !== decodedIdToken.uid) {
                return {
                    result: { failureType: DeleteRoomFailureType.NotCreatedByYou },
                    payload: undefined,
                };
            }
            await Room$MikroORM.deleteRoom(em, room);
            await em.flush();
            return {
                result: { failureType: undefined },
                payload: {
                    type: 'deleteRoomPayload',
                    roomId,
                    deletedBy: decodedIdToken.uid,
                },
            };
        };

        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        return result.value;
    }

    @Mutation(() => DeleteRoomResult)
    public async deleteRoom(@Args() args: DeleteRoomArgs, @Ctx() context: ResolverContext, @PubSub() pubSub: PubSubEngine): Promise<DeleteRoomResult> {
        const { result, payload } = await this.deleteRoomCore({ args, context, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
        if (payload != null) {
            await pubSub.publish(ROOM_EVENT, payload);
        }
        return result;
    }

    public async joinRoomAsPlayerCore({ args, context, globalEntryPhrase }: { args: JoinRoomArgs; context: ResolverContext; globalEntryPhrase: string | undefined }): Promise<{ result: typeof JoinRoomResult; payload: RoomEventPayload | undefined }> {
        return joinRoomCore({
            args,
            context,
            globalEntryPhrase,
            strategy: ({ me, room }) => {
                if (me != null) {
                    switch (me.role) {
                        case undefined:
                            break;
                        default:
                            return JoinRoomFailureType.AlreadyParticipant;
                    }
                }
                if (room.joinAsPlayerPhrase != null && room.joinAsPlayerPhrase !== args.phrase) {
                    return JoinRoomFailureType.WrongPhrase;
                }
                return ParticipantRole.Player;
            }
        });
    }

    @Mutation(() => JoinRoomResult)
    public async joinRoomAsPlayer(@Args() args: JoinRoomArgs, @Ctx() context: ResolverContext, @PubSub() pubSub: PubSubEngine): Promise<typeof JoinRoomResult> {
        const { result, payload } = await this.joinRoomAsPlayerCore({ args, context, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
        if (payload != null) {
            await pubSub.publish(ROOM_EVENT, payload);
        }
        return result;
    }

    public async joinRoomAsSpectatorCore({ args, context, globalEntryPhrase }: { args: JoinRoomArgs; context: ResolverContext; globalEntryPhrase: string | undefined }): Promise<{ result: typeof JoinRoomResult; payload: RoomEventPayload | undefined }> {
        return joinRoomCore({
            args,
            context,
            globalEntryPhrase,
            strategy: ({ me, room }) => {
                if (me != null) {
                    switch (me.role) {
                        case undefined:
                            break;
                        default:
                            return JoinRoomFailureType.AlreadyParticipant;
                    }
                }
                if (room.joinAsSpectatorPhrase != null && room.joinAsSpectatorPhrase !== args.phrase) {
                    return JoinRoomFailureType.WrongPhrase;
                }
                return ParticipantRole.Spectator;
            }
        });
    }

    @Mutation(() => JoinRoomResult)
    public async joinRoomAsSpectator(@Args() args: JoinRoomArgs, @Ctx() context: ResolverContext, @PubSub() pubSub: PubSubEngine): Promise<typeof JoinRoomResult> {
        const { result, payload } = await this.joinRoomAsSpectatorCore({ args, context, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
        if (payload != null) {
            await pubSub.publish(ROOM_EVENT, payload);
        }
        return result;
    }

    public async promoteToPlayerCore({ args, context, globalEntryPhrase }: { args: PromoteArgs; context: ResolverContext; globalEntryPhrase: string | undefined }): Promise<{ result: PromoteResult; payload: RoomEventPayload | undefined }> {
        return promoteMeCore({
            ...args,
            context,
            globalEntryPhrase,
            strategy: ({ me, room }) => {
                switch (me.role) {
                    case ParticipantRole.Master:
                    case ParticipantRole.Player:
                        return PromoteFailureType.NoNeedToPromote;
                    case ParticipantRole.Spectator: {
                        if (room.joinAsPlayerPhrase != null && room.joinAsPlayerPhrase !== args.phrase) {
                            return PromoteFailureType.WrongPhrase;
                        }
                        return ParticipantRole.Player;
                    }
                    case undefined:
                        return PromoteFailureType.NotParticipant;
                }
            }
        });
    }

    @Mutation(() => PromoteResult)
    public async promoteToPlayer(@Args() args: PromoteArgs, @Ctx() context: ResolverContext, @PubSub() pubSub: PubSubEngine): Promise<PromoteResult> {
        const { result, payload } = await this.promoteToPlayerCore({ args, context, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
        if (payload != null) {
            await pubSub.publish(ROOM_EVENT, payload);
        }
        return result;
    }

    public async changeParticipantNameCore({ args, context, globalEntryPhrase }: { args: ChangeParticipantNameArgs; context: ResolverContext; globalEntryPhrase: string | undefined }): Promise<{ result: ChangeParticipantNameResult; payload: RoomEventPayload | undefined }> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return { result: { failureType: ChangeParticipantNameFailureType.NotSignIn }, payload: undefined };
        }

        const queue = async (): Promise<{ result: ChangeParticipantNameResult; payload: RoomEventPayload | undefined }> => {
            const em = context.createEm();
            const entryUser = await getUserIfEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase, });
            await em.flush();
            if (entryUser == null) {
                return {
                    result: {
                        failureType: ChangeParticipantNameFailureType.NotEntry,
                    },
                    payload: undefined,
                };
            }
            const findResult = await findRoomAndMyParticipantAndParitipantUserUids({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return {
                    result: {
                        failureType: ChangeParticipantNameFailureType.NotFound,
                    },
                    payload: undefined,
                };
            }
            const { room, me, participantUserUids } = findResult;
            // me.role == nullのときは弾かないようにしてもいいかも？
            if (me == null || me.role == null) {
                return {
                    result: {
                        failureType: ChangeParticipantNameFailureType.NotParticipant,
                    },
                    payload: undefined,
                };
            }

            const { payload } = await operateParticipantAndFlush({
                em,
                myUserUid: decodedIdToken.uid,
                update: {
                    name: { newValue: args.newName },
                },
                room,
                participantUserUids,
            });

            return {
                result: {
                    failureType: undefined,
                },
                payload,
            };
        };

        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        return result.value;
    }

    @Mutation(() => ChangeParticipantNameResult)
    public async changeParticipantName(@Args() args: ChangeParticipantNameArgs, @Ctx() context: ResolverContext, @PubSub() pubSub: PubSubEngine): Promise<ChangeParticipantNameResult> {
        const { result, payload } = await this.changeParticipantNameCore({ args, context, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
        if (payload != null) {
            await pubSub.publish(ROOM_EVENT, payload);
        }
        return result;
    }

    public async getRoomCore({ args, context, globalEntryPhrase }: { args: GetRoomArgs; context: ResolverContext; globalEntryPhrase: string | undefined }): Promise<typeof GetRoomResult> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return { failureType: GetRoomFailureType.NotSignIn };
        }

        const queue = async (): Promise<Result<typeof GetRoomResult>> => {
            const em = context.createEm();
            const entry = await checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase, });
            await em.flush();
            if (!entry) {
                return ResultModule.ok({
                    failureType: GetRoomFailureType.NotEntry,
                });
            }
            const findResult = await findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.id });
            if (findResult == null) {
                return ResultModule.ok({
                    failureType: GetRoomFailureType.NotFound,
                });
            }
            const { room, me } = findResult;
            if (me?.role == null) {
                return ResultModule.ok({
                    roomAsListItem: stateToGraphql$RoomAsListItem({ roomEntity: room }),
                });
            }

            const roomState = await GlobalRoom.MikroORM.ToGlobal.state(room);
            return ResultModule.ok({
                role: me.role,
                room: {
                    ...GlobalRoom.Global.ToGraphQL.state({ source: roomState, requestedBy: { type: client, userUid: decodedIdToken.uid } }),
                    revision: room.revision,
                    createdBy: room.createdBy,
                },
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

    @Query(() => GetRoomResult)
    public getRoom(@Args() args: GetRoomArgs, @Ctx() context: ResolverContext): Promise<typeof GetRoomResult> {
        return this.getRoomCore({ args, context, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
    }

    public async leaveRoomCore({ id, context }: { id: string; context: ResolverContext }): Promise<{ result: LeaveRoomResult; payload: RoomEventPayload | undefined }> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return {
                result: { failureType: LeaveRoomFailureType.NotSignIn },
                payload: undefined,
            };
        }

        const queue = async (): Promise<Result<{ result: LeaveRoomResult; payload: RoomEventPayload | undefined }>> => {
            const em = context.createEm();
            // entryしていなくても呼べる
            const findResult = await findRoomAndMyParticipantAndParitipantUserUids({ em, userUid: decodedIdToken.uid, roomId: id });
            if (findResult == null) {
                return ResultModule.ok({
                    result: { failureType: LeaveRoomFailureType.NotFound },
                    payload: undefined,
                });
            }
            const { me, room, participantUserUids } = findResult;
            if (me === undefined || me.role == null) {
                return ResultModule.ok({
                    result: { failureType: LeaveRoomFailureType.NotEntry },
                    payload: undefined,
                });
            }
            const { payload } = await operateParticipantAndFlush({
                em,
                myUserUid: decodedIdToken.uid,
                update: {
                    role: { newValue: undefined },
                },
                room,
                participantUserUids,
            });
            return ResultModule.ok({
                result: {},
                payload,
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

    @Mutation(() => LeaveRoomResult)
    public async leaveRoom(@Arg('id') id: string, @Ctx() context: ResolverContext, @PubSub() pubSub: PubSubEngine): Promise<LeaveRoomResult> {
        const { result, payload } = await this.leaveRoomCore({ id, context });
        if (payload != null) {
            await pubSub.publish(ROOM_EVENT, payload);
        }
        return result;
    }

    public async operateCore({ args, context, globalEntryPhrase }: { args: OperateArgs; context: ResolverContext; globalEntryPhrase: string | undefined }): Promise<OperateCoreResult> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return {
                type: 'failure',
                result: { failureType: OperateRoomFailureType.NotSignIn }
            };
        }

        const queue = async (): Promise<Result<OperateCoreResult>> => {
            const em = context.createEm();
            const entry = await checkEntry({
                userUid: decodedIdToken.uid,
                em,
                globalEntryPhrase,
            });
            await em.flush();
            if (!entry) {
                return ResultModule.ok({
                    type: 'failure',
                    result: { failureType: OperateRoomFailureType.NotEntry }
                });
            }
            const findResult = await findRoomAndMyParticipantAndParitipantUserUids({ em, userUid: decodedIdToken.uid, roomId: args.id });
            if (findResult == null) {
                return ResultModule.ok({
                    type: 'failure',
                    result: { failureType: OperateRoomFailureType.NotFound }
                });
            }
            const { room, me, participantUserUids } = findResult;
            if (me === undefined) {
                return ResultModule.ok({
                    type: 'nonJoined',
                    result: { roomAsListItem: stateToGraphql$RoomAsListItem({ roomEntity: room }) }
                });
            }
            const clientOperation = GlobalRoom.GraphQL.ToGlobal.upOperation(args.operation);
            if (clientOperation.isError) {
                return clientOperation;
            }

            const roomState = await GlobalRoom.MikroORM.ToGlobal.state(room);
            const downOperation = await GlobalRoom.MikroORM.ToGlobal.downOperationMany({
                em,
                roomId: room.id,
                revisionRange: { from: args.prevRevision, expectedTo: room.revision },
            });
            if (downOperation.isError) {
                return downOperation;
            }

            const transformerFactory = GlobalRoom.transformerFactory({ type: client, userUid: decodedIdToken.uid });
            let prevState: GlobalRoom.StateType = roomState;
            let twoWayOperation: GlobalRoom.TwoWayOperationType | undefined = undefined;
            if (downOperation.value !== undefined) {
                const restoredRoom = transformerFactory.restore({
                    key: null,
                    nextState: roomState,
                    downOperation: downOperation.value
                });
                if (restoredRoom.isError) {
                    return restoredRoom;
                }
                prevState = restoredRoom.value.prevState;
                twoWayOperation = restoredRoom.value.twoWayOperation;
            }

            const transformed = transformerFactory.transform({
                key: null,
                prevState,
                currentState: roomState,
                clientOperation: clientOperation.value,
                serverOperation: twoWayOperation,
            });
            if (transformed.isError) {
                return transformed;
            }
            if (transformed.value === undefined) {
                return ResultModule.ok({ type: 'id', result: { requestId: args.requestId } });
            }

            const operation = transformed.value;
            const prevRevision = room.revision;

            const myValueLogs: { log: MyValueLog$MikroORM; stateUserUid: string }[] = [];
            for (const [userUid, participant] of operation.participants) {
                if (participant.type === replace) {
                    if (participant.operation.oldValue != null) {
                        const operation = __(participant.operation.oldValue.myNumberValues).toMap(([key, value]) => {
                            return { key, value: { type: replace, operation: { oldValue: value, newValue: undefined } } } as const;
                        });
                        const partici = await em.findOne(Partici, { user: { userUid } });
                        if (partici == null) {
                            console.warn('Partici not found');
                            continue;
                        }
                        myValueLogs.push(...GlobalMyValue.Global.toLogs({ operation, createdBy: partici }).map(log => ({ log, stateUserUid: partici.user.userUid })));
                    }
                    if (participant.operation.newValue != null) {
                        const operation = __(participant.operation.newValue.myNumberValues).toMap(([key, value]) => {
                            return { key, value: { type: replace, operation: { oldValue: undefined, newValue: value } } } as const;
                        });
                        const partici = await em.findOne(Partici, { user: { userUid } });
                        if (partici == null) {
                            console.warn('Partici not found');
                            continue;
                        }
                        myValueLogs.push(...GlobalMyValue.Global.toLogs({ operation, createdBy: partici }).map(log => ({ log, stateUserUid: partici.user.userUid })));
                    }
                }
                if (participant.type === update) {
                    const partici = await em.findOne(Partici, { user: { userUid } });
                    if (partici == null) {
                        console.warn('Partici not found');
                        continue;
                    }
                    myValueLogs.push(...GlobalMyValue.Global.toLogs({ operation: participant.operation.myNumberValues, createdBy: partici }).map(log => ({ log, stateUserUid: partici.user.userUid })));
                }
            }
            for (const { log } of myValueLogs) {
                em.persist(log);
            }

            await GlobalRoom.Global.applyToEntity({ em, target: room, operation });
            await em.flush();

            const nextRoomState = await GlobalRoom.MikroORM.ToGlobal.state(room);
            const generateOperation = (deliverTo: string): RoomOperation => {
                const value = GlobalRoom.Global.ToGraphQL.operation({
                    operation,
                    prevState: roomState,
                    nextState: nextRoomState,
                    requestedBy: { type: client, userUid: deliverTo },
                });
                return {
                    __tstype: 'RoomOperation',
                    revisionTo: prevRevision + 1,
                    operatedBy: {
                        userUid: decodedIdToken.uid,
                        clientId: args.operation.clientId,
                    },
                    value,
                };
            };

            const roomOperationPayload: RoomOperationPayload = {
                type: 'roomOperationPayload',
                roomId: args.id,
                participants: participantUserUids,
                generateOperation,
            };
            const result: OperateCoreResult = {
                type: 'success',
                roomOperationPayload,
                messageUpdatePayload: myValueLogs.map(({ log, stateUserUid }) => ({
                    type: 'messageUpdatePayload',
                    roomId: room.id,
                    createdBy: undefined,
                    visibleTo: undefined,
                    value: MyValueLogNameSpace.MikroORM.ToGraphQL.state({ entity: log, stateUserUid }),
                })),
                result: {
                    operation: generateOperation(decodedIdToken.uid)
                },
            };

            return ResultModule.ok(result);
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

    @Mutation(() => OperateRoomResult)
    public async operate(@Args() args: OperateArgs, @Ctx() context: ResolverContext, @PubSub() pubSub: PubSubEngine): Promise<typeof OperateRoomResult> {
        const operateResult = await this.operateCore({ args, context, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
        if (operateResult.type === 'success') {
            await pubSub.publish(ROOM_EVENT, operateResult.roomOperationPayload);
            for (const messageUpdate of operateResult.messageUpdatePayload) {
                await pubSub.publish(ROOM_EVENT, messageUpdate);
            }
        }
        return operateResult.result;
    }

    @Mutation(() => WritePublicRoomMessageResult)
    public async writePublicMessage(@Args() args: WritePublicMessageArgs, @Ctx() context: ResolverContext, @PubSub() pubSub: PubSubEngine): Promise<typeof WritePublicRoomMessageResult> {
        const coreResult = await this.writePublicMessageCore({ args, context, channelKey: args.channelKey });
        if (coreResult.payload != null) {
            await pubSub.publish(ROOM_EVENT, coreResult.payload);
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
                entity.charaIsPrivate = chara.isPrivate;
                entity.charaImagePath = chara.imagePath;
                entity.charaImageSourceType = chara.imageSourceType;
                entity.charaTachieImagePath = chara.tachieImagePath;
                entity.charaTachieImageSourceType = chara.tachieImageSourceType;
            }

            entity.room = Reference.create(room);
            await em.persistAndFlush(entity);

            const visibleToArray = [...visibleTo].sort();
            const result = await createRoomPrivateMessage({ msg: entity, myUserUid: meAsUser.userUid, visibleTo: visibleToArray, visibleToMe: true });
            if (result == null) {
                throw 'This should not happen';
            }

            const payload: MessageUpdatePayload = {
                type: 'messageUpdatePayload',
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
            await pubSub.publish(ROOM_EVENT, coreResult.payload);
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
                type: 'messageUpdatePayload',
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
            await pubSub.publish(ROOM_EVENT, coreResult.payload);
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

                const payloadValue: RoomPublicMessageUpdate = {
                    __tstype: RoomPublicMessageUpdateType,
                    messageId: publicMsg.id,
                    isSecret: publicMsg.isSecret,
                    text: publicMsg.text,
                    commandResult: publicMsg.commandResult == null ? undefined : {
                        text: publicMsg.commandResult,
                        isSuccess: publicMsg.commandIsSuccess,
                    },
                    altTextToSecret: publicMsg.altTextToSecret,
                    updatedAt: publicMsg.textUpdatedAt,
                };
                return ResultModule.ok({
                    result: {},
                    payload: {
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        visibleTo: undefined,
                        createdBy: publicMsg.createdBy?.userUid,
                        value: payloadValue,
                    },
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

                const payloadValue: RoomPrivateMessageUpdate = {
                    __tstype: RoomPrivateMessageUpdateType,
                    messageId: privateMsg.id,
                    isSecret: privateMsg.isSecret,
                    text: privateMsg.text,
                    commandResult: privateMsg.commandResult == null ? undefined : {
                        text: privateMsg.commandResult,
                        isSuccess: privateMsg.commandIsSuccess,
                    },
                    altTextToSecret: privateMsg.altTextToSecret,
                    updatedAt: privateMsg.textUpdatedAt,
                };
                return ResultModule.ok({
                    result: {},
                    payload: {
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        visibleTo: (await privateMsg.visibleTo.loadItems()).map(user => user.userUid),
                        createdBy: privateMsg.createdBy?.userUid,
                        value: payloadValue,
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
            await pubSub.publish(ROOM_EVENT, coreResult.payload);
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

                const payloadValue: RoomPublicMessageUpdate = {
                    __tstype: RoomPublicMessageUpdateType,
                    messageId: publicMsg.id,
                    isSecret: publicMsg.isSecret,
                    text: publicMsg.text,
                    commandResult: publicMsg.commandResult == null ? undefined : {
                        text: publicMsg.commandResult,
                        isSuccess: publicMsg.commandIsSuccess,
                    },
                    altTextToSecret: publicMsg.altTextToSecret,
                    updatedAt: publicMsg.textUpdatedAt,
                };
                return ResultModule.ok({
                    result: {},
                    payload: {
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        visibleTo: undefined,
                        createdBy: publicMsg.createdBy?.userUid,
                        value: payloadValue,
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

                const payloadValue: RoomPrivateMessageUpdate = {
                    __tstype: RoomPrivateMessageUpdateType,
                    messageId: privateMsg.id,
                    isSecret: privateMsg.isSecret,
                    text: privateMsg.text,
                    commandResult: privateMsg.commandResult == null ? undefined : {
                        text: privateMsg.commandResult,
                        isSuccess: privateMsg.commandIsSuccess,
                    },
                    altTextToSecret: privateMsg.altTextToSecret,
                    updatedAt: privateMsg.textUpdatedAt,
                };
                return ResultModule.ok({
                    result: {},
                    payload: {
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        visibleTo: (await privateMsg.visibleTo.loadItems()).map(user => user.userUid),
                        createdBy: privateMsg.createdBy?.userUid,
                        value: payloadValue,
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
            await pubSub.publish(ROOM_EVENT, coreResult.payload);
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

                const payloadValue: RoomPublicMessageUpdate = {
                    __tstype: RoomPublicMessageUpdateType,
                    messageId: publicMsg.id,
                    isSecret: publicMsg.isSecret,
                    text: publicMsg.text,
                    commandResult: publicMsg.commandResult == null ? undefined : {
                        text: publicMsg.commandResult,
                        isSuccess: publicMsg.commandIsSuccess,
                    },
                    altTextToSecret: publicMsg.altTextToSecret,
                    updatedAt: publicMsg.textUpdatedAt,
                };
                return ResultModule.ok({
                    result: {},
                    payload: {
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        visibleTo: undefined,
                        createdBy: publicMsg.createdBy?.userUid,
                        value: payloadValue,
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

                const payloadValue: RoomPrivateMessageUpdate = {
                    __tstype: RoomPrivateMessageUpdateType,
                    messageId: privateMsg.id,
                    isSecret: privateMsg.isSecret,
                    text: privateMsg.text,
                    commandResult: privateMsg.commandResult == null ? undefined : {
                        text: privateMsg.commandResult,
                        isSuccess: privateMsg.commandIsSuccess,
                    },
                    altTextToSecret: privateMsg.altTextToSecret,
                    updatedAt: privateMsg.textUpdatedAt,
                };
                return ResultModule.ok({
                    result: {},
                    payload: {
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        visibleTo: (await privateMsg.visibleTo.loadItems()).map(user => user.userUid),
                        createdBy: privateMsg.createdBy?.userUid,
                        value: payloadValue,
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
            await pubSub.publish(ROOM_EVENT, coreResult.payload);
        }
        return coreResult.result;
    }

    // graphql-wsでRoomOperatedのConnectionを検知しているので、もしこれがリネームもしくは削除されるときはそちらも変える。
    @Subscription(() => RoomEvent, { topics: ROOM_EVENT, nullable: true })
    public roomEvent(@Root() payload: RoomEventPayload | null | undefined, @Arg('id') id: string, @Ctx() context: ResolverContext): RoomEvent | undefined {
        if (payload == null) {
            return undefined;
        }
        if (id !== payload.roomId) {
            return undefined;
        }
        if (context.decodedIdToken == null || context.decodedIdToken.isError) {
            return undefined;
        }
        const userUid: string = context.decodedIdToken.value.uid;

        if (payload.type === 'messageUpdatePayload') {
            if (payload.value.__tstype === RoomPrivateMessageType) {
                if (payload.value.visibleTo.every(vt => vt !== userUid)) {
                    return undefined;
                }
            }
            if (payload.value.__tstype === RoomPrivateMessageUpdateType) {
                if (payload.visibleTo == null) {
                    throw 'payload.visibleTo is required.';
                }
                if (payload.visibleTo.every(vt => vt !== userUid)) {
                    return undefined;
                }
            }

            switch (payload.value.__tstype) {
                case RoomPrivateMessageType:
                case RoomPublicMessageType: {
                    if (payload.value.isSecret && (payload.value.createdBy !== userUid)) {
                        return {
                            roomMessageEvent: {
                                ...payload.value,
                                text: undefined,
                                commandResult: undefined,
                            }
                        };
                    }
                    break;
                }
                case RoomPrivateMessageUpdateType:
                case RoomPublicMessageUpdateType:
                    if (payload.value.isSecret && (payload.createdBy !== userUid)) {
                        return {
                            roomMessageEvent: {
                                ...payload.value,
                                text: undefined,
                                commandResult: undefined,
                            }
                        };
                    }
                    break;
            }

            return { roomMessageEvent: payload.value };
        }

        // userUidが同じでも例えば異なるタブで同じRoomを開いているケースがある。そのため、Mutationを行ったuserUidにだけSubscriptionを送信しないことで通信量を節約、ということはできない。 

        if (id !== payload.roomId) {
            return undefined;
        }
        if (payload.type === 'deleteRoomPayload') {
            // Roomが削除されたことは非公開にする必要はないので、このように全員に通知して構わない。
            return {
                deleteRoomOperation: {
                    __tstype: deleteRoomOperation,
                    deletedBy: payload.deletedBy,
                }
            };
        }
        if (!payload.participants.has(userUid)) {
            return undefined;
        }
        if (payload.type === 'roomOperationPayload') {
            // TODO: DeleteRoomOperationも返す
            return {
                roomOperation: payload.generateOperation(userUid)
            };
        }
    }
}