import {
    Resolver,
    Query,
    Args,
    Mutation,
    Ctx,
    PubSub,
    Subscription,
    Root,
    Arg,
    PubSubEngine,
    Authorized,
    UseMiddleware,
} from 'type-graphql';
import { ResolverContext } from '../../utils/Contexts';
import { GetRoomFailureType } from '../../../enums/GetRoomFailureType';
import { ensureAuthorizedUser, findRoomAndMyParticipant } from '../utils/helpers';
import { JoinRoomFailureType } from '../../../enums/JoinRoomFailureType';
import * as Room$MikroORM from '../../entities/room/mikro-orm';
import * as Participant$MikroORM from '../../entities/participant/mikro-orm';
import { stateToGraphQL as stateToGraphql$RoomAsListItem } from '../../entities/roomAsListItem/global';
import { queueLimitReached } from '../../../utils/promiseQueue';
import { serverTooBusyMessage } from '../utils/messages';
import { RoomOperation, deleteRoomOperation } from '../../entities/room/graphql';
import { OperateRoomFailureType } from '../../../enums/OperateRoomFailureType';
import { LeaveRoomFailureType } from '../../../enums/LeaveRoomFailureType';
import { RequiresPhraseFailureType } from '../../../enums/RequiresPhraseFailureType';
import {
    OperateRoomFailureResult,
    OperateRoomIdResult,
    OperateRoomNonJoinedResult,
    OperateRoomResult,
    OperateRoomSuccessResult,
} from '../../results/OperateRoomResult';
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
import { EM } from '../../../utils/types';
import {
    RoomPrvMsg,
    RoomPubCh,
    RoomPubMsg,
    RoomSe,
    StringPieceValueLog as StringPieceValueLog$MikroORM,
    DicePieceValueLog as DicePieceValueLog$MikroORM,
} from '../../entities/roomMessage/mikro-orm';
import {
    ChangeParticipantNameArgs,
    CreateRoomInput,
    DeleteRoomArgs,
    EditMessageArgs,
    GetLogArgs,
    GetMessagesArgs,
    GetRoomArgs,
    GetRoomConnectionFailureResultType,
    GetRoomConnectionsResult,
    GetRoomConnectionSuccessResultType,
    JoinRoomArgs,
    MessageIdArgs,
    OperateArgs,
    PromoteArgs,
    RoomEvent,
    UpdateWritingMessageStateArgs,
    WritePrivateMessageArgs,
    WritePublicMessageArgs,
    WriteRoomSoundEffectArgs,
} from './object+args+input';
import {
    CharacterValueForMessage,
    DeleteMessageResult,
    EditMessageResult,
    GetRoomLogFailureResultType,
    GetRoomLogResult,
    GetRoomMessagesFailureResultType,
    GetRoomMessagesResult,
    MakeMessageNotSecretResult,
    PieceValueLog,
    RoomMessageEvent,
    RoomMessages,
    RoomMessagesType,
    RoomPrivateMessage,
    RoomPrivateMessageType,
    RoomPrivateMessageUpdate,
    RoomPrivateMessageUpdateType,
    RoomPublicChannel,
    RoomPublicChannelType,
    RoomPublicMessage,
    RoomPublicMessageType,
    RoomPublicMessageUpdate,
    RoomPublicMessageUpdateType,
    RoomSoundEffect,
    RoomSoundEffectType,
    UpdatedText,
    WriteRoomPrivateMessageFailureResultType,
    WriteRoomPrivateMessageResult,
    WriteRoomPublicMessageFailureResultType,
    WriteRoomPublicMessageResult,
    WriteRoomSoundEffectFailureResultType,
    WriteRoomSoundEffectResult,
} from '../../entities/roomMessage/graphql';
import { WriteRoomPublicMessageFailureType } from '../../../enums/WriteRoomPublicMessageFailureType';
import { analyze, Context } from '../../../messageAnalyzer/main';
import Color from 'color';
import { GetRoomMessagesFailureType } from '../../../enums/GetRoomMessagesFailureType';
import {
    DicePieceValueLog as DicePieceValueLogNameSpace,
    StringPieceValueLog as StringPieceValueLogNameSpace,
} from '../../entities/roomMessage/global';
import { GetRoomLogFailureType } from '../../../enums/GetRoomLogFailureType';
import { writeSystemMessage } from '../utils/roomMessage';
import { Reference } from '@mikro-orm/core';
import { User } from '../../entities/user/mikro-orm';
import { WriteRoomPrivateMessageFailureType } from '../../../enums/WriteRoomPrivateMessageFailureType';
import { WriteRoomSoundEffectFailureType } from '../../../enums/WriteRoomSoundEffectFailureType';
import { MakeMessageNotSecretFailureType } from '../../../enums/MakeMessageNotSecretFailureType';
import { DeleteMessageFailureType } from '../../../enums/DeleteMessageFailureType';
import { EditMessageFailureType } from '../../../enums/EditMessageFailureType';
import { ROOM_EVENT } from '../../utils/Topics';
import { GetRoomConnectionFailureType } from '../../../enums/GetRoomConnectionFailureType';
import { WritingMessageStatusType } from '../../../enums/WritingMessageStatusType';
import { WritingMessageStatusInputType } from '../../../enums/WritingMessageStatusInputType';
import { FileSourceTypeModule } from '../../../enums/FileSourceType';
import { Result } from '@kizahasi/result';
import {
    Master,
    Player,
    serverTransform,
    Spectator,
    State,
    TwoWayOperation,
    restore,
    CharacterState,
    UpOperation,
    RecordUpOperationElement,
    ParticipantState,
    ParticipantUpOperation,
    replace,
    ParticipantRole,
    createLogs,
    admin,
    client,
    $free,
    $system,
    MaxLength100String,
} from '@kizahasi/flocon-core';
import { ApplyError, ComposeAndTransformError, PositiveInt } from '@kizahasi/ot-string';
import { ParticipantRole as ParticipantRoleEnum } from '../../../enums/ParticipantRole';
import { ENTRY } from '../../../roles';
import { ParticipantRoleType } from '../../../enums/ParticipantRoleType';
import { RateLimitMiddleware } from '../../middlewares/RateLimitMiddleware';
import { convertToMaxLength100String } from '../../../utils/convertToMaxLength100String';

const find = <T>(source: Record<string, T | undefined>, key: string): T | undefined => source[key];

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
};

type RoomOperationPayload = {
    type: 'roomOperationPayload';
    roomId: string;
    participants: ReadonlySet<string>; // UserUid
    generateOperation: (deliverTo: string) => RoomOperation;
};

type DeleteRoomPayload = {
    type: 'deleteRoomPayload';
    roomId: string;
    deletedBy: string;
};

export type RoomConnectionUpdatePayload = {
    type: 'roomConnectionUpdatePayload';
    roomId: string;
    userUid: string;
    isConnected: boolean;
    updatedAt: number;
};

export type WritingMessageStatusUpdatePayload = {
    type: 'writingMessageStatusUpdatePayload';
    roomId: string;
    userUid: string;
    status: WritingMessageStatusType;
    updatedAt: number;
};

export type RoomEventPayload =
    | MessageUpdatePayload
    | RoomOperationPayload
    | DeleteRoomPayload
    | RoomConnectionUpdatePayload
    | WritingMessageStatusUpdatePayload;

type OperateCoreResult =
    | {
          type: 'success';
          result: OperateRoomSuccessResult;
          roomOperationPayload: RoomOperationPayload;
          messageUpdatePayload: MessageUpdatePayload[];
      }
    | {
          type: 'id';
          result: OperateRoomIdResult;
      }
    | {
          type: 'nonJoined';
          result: OperateRoomNonJoinedResult;
      }
    | {
          type: 'failure';
          result: OperateRoomFailureResult;
      };

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
        name: MaxLength100String;
    };
    update?: {
        role?: { newValue: ParticipantRole | undefined };
        name?: { newValue: MaxLength100String };
    };
}): Promise<{ result: typeof JoinRoomResult; payload: RoomEventPayload | undefined }> => {
    const prevRevision = room.revision;
    const roomState = await GlobalRoom.MikroORM.ToGlobal.state(room, em);
    const me = find(roomState.participants, myUserUid);
    let participantOperation:
        | RecordUpOperationElement<ParticipantState, ParticipantUpOperation>
        | undefined = undefined;
    if (me == null) {
        if (create != null) {
            participantOperation = {
                type: replace,
                replace: {
                    newValue: {
                        $v: 1,
                        $r: 2,
                        name: create.name,
                        role: create.role,
                        boards: {},
                        characters: {},
                        imagePieceValues: {},
                    },
                },
            };
        }
    } else {
        if (update != null) {
            participantOperation = {
                type: 'update',
                update: {
                    $v: 1,
                    $r: 2,
                    role: update.role,
                    name: update.name,
                },
            };
        }
    }

    if (participantOperation == null) {
        return {
            result: {},
            payload: undefined,
        };
    }

    const roomUpOperation: UpOperation = {
        $v: 1,
        $r: 2,
        participants: {
            [myUserUid]: participantOperation,
        },
    };

    const transformed = serverTransform({ type: admin })({
        prevState: roomState,
        currentState: roomState,
        clientOperation: roomUpOperation,
        serverOperation: undefined,
    });
    if (transformed.isError) {
        return {
            result: { failureType: JoinRoomFailureType.TransformError },
            payload: undefined,
        };
    }
    const transformedValue = transformed.value;
    if (transformedValue == null) {
        return {
            result: {},
            payload: undefined,
        };
    }

    const nextRoomState = await GlobalRoom.Global.applyToEntity({
        em,
        target: room,
        prevState: roomState,
        operation: transformedValue,
    });
    await em.flush();
    const generateOperation = (deliverTo: string): RoomOperation => {
        return {
            __tstype: 'RoomOperation',
            revisionTo: prevRevision + 1,
            operatedBy: undefined,
            valueJson: GlobalRoom.Global.ToGraphQL.operation({
                prevState: roomState,
                nextState: nextRoomState,
                requestedBy: { type: client, userUid: deliverTo },
            }),
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
    strategy,
}: {
    args: JoinRoomArgs;
    context: ResolverContext;
    // 新たにRoleを設定する場合はParticipantRoleを返す。Roleを変えない場合は'id'を返す。
    strategy: (params: {
        room: Room$MikroORM.Room;
        args: JoinRoomArgs;
        me: ParticipantState | undefined;
    }) =>
        | ParticipantRole
        | JoinRoomFailureType.WrongPhrase
        | JoinRoomFailureType.AlreadyParticipant
        | 'id';
}): Promise<{ result: typeof JoinRoomResult; payload: RoomEventPayload | undefined }> => {
    const queue = async (): Promise<{
        result: typeof JoinRoomResult;
        payload: RoomEventPayload | undefined;
    }> => {
        const em = context.em;
        const authorizedUser = ensureAuthorizedUser(context);
        const findResult = await findRoomAndMyParticipant({
            em,
            userUid: authorizedUser.userUid,
            roomId: args.id,
        });
        if (findResult == null) {
            return {
                result: {
                    failureType: JoinRoomFailureType.NotFound,
                },
                payload: undefined,
            };
        }
        const { room, me } = findResult;
        const participantUserUids = findResult.participantIds();
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
                    myUserUid: authorizedUser.userUid,
                    create: {
                        name: convertToMaxLength100String(args.name),
                        role: strategyResult,
                    },
                    update: {
                        role: { newValue: strategyResult },
                    },
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
    strategy,
}: {
    roomId: string;
    context: ResolverContext;
    strategy: (params: {
        room: Room$MikroORM.Room;
        me: ParticipantState;
    }) =>
        | ParticipantRole
        | PromoteFailureType.WrongPhrase
        | PromoteFailureType.NoNeedToPromote
        | PromoteFailureType.NotParticipant;
}): Promise<{ result: PromoteResult; payload: RoomEventPayload | undefined }> => {
    const queue = async (): Promise<{
        result: PromoteResult;
        payload: RoomEventPayload | undefined;
    }> => {
        const em = context.em;
        const authorizedUser = ensureAuthorizedUser(context);
        const findResult = await findRoomAndMyParticipant({
            em,
            userUid: authorizedUser.userUid,
            roomId,
        });
        if (findResult == null) {
            return {
                result: {
                    failureType: PromoteFailureType.NotFound,
                },
                payload: undefined,
            };
        }
        const { room, me } = findResult;
        const participantUserUids = findResult.participantIds();
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
                    payload: (
                        await operateParticipantAndFlush({
                            em,
                            room,
                            participantUserUids,
                            myUserUid: authorizedUser.userUid,
                            update: {
                                role: { newValue: strategyResult },
                            },
                        })
                    )?.payload,
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

const analyzeTextAndSetToEntity = async (params: {
    type: 'RoomPubMsg' | 'RoomPrvMsg';
    textSource: string;
    context: Context | null;
    gameType: string | undefined;
    createdBy: User;
    room: State;
}) => {
    const defaultGameType = 'DiceBot';
    const analyzed = await analyze({
        ...params,
        gameType: params.gameType ?? defaultGameType,
        text: params.textSource,
    });
    if (analyzed.isError) {
        return analyzed;
    }
    const targetEntity =
        params.type === 'RoomPubMsg'
            ? new RoomPubMsg({
                  initTextSource: params.textSource,
                  initText: analyzed.value.message,
              })
            : new RoomPrvMsg({
                  initTextSource: params.textSource,
                  initText: analyzed.value.message,
              });
    targetEntity.createdBy = Reference.create<User, 'userUid'>(params.createdBy);
    if (analyzed.value.diceResult != null) {
        if (analyzed.value.diceResult.isSecret) {
            targetEntity.isSecret = true;
            targetEntity.altTextToSecret = 'シークレットダイス';
            targetEntity.commandResult = analyzed.value.diceResult.result;
            targetEntity.commandIsSuccess = analyzed.value.diceResult.isSuccess ?? undefined;
        } else {
            targetEntity.commandResult = analyzed.value.diceResult.result;
            targetEntity.commandIsSuccess = analyzed.value.diceResult.isSuccess ?? undefined;
        }
    }
    return Result.ok(targetEntity);
};

const toCharacterValueForMessage = (
    message: RoomPubMsg | RoomPrvMsg
): CharacterValueForMessage | undefined => {
    if (
        message.charaStateId == null ||
        message.charaName == null ||
        message.charaIsPrivate == null
    ) {
        return undefined;
    }
    return {
        stateId: message.charaStateId,
        isPrivate: message.charaIsPrivate,
        name: message.charaName,
        image:
            message.charaImagePath == null || message.charaImageSourceType == null
                ? undefined
                : {
                      path: message.charaImagePath,
                      sourceType: message.charaImageSourceType,
                  },
        tachieImage:
            message.charaTachieImagePath == null || message.charaTachieImageSourceType == null
                ? undefined
                : {
                      path: message.charaTachieImagePath,
                      sourceType: message.charaTachieImageSourceType,
                  },
    };
};

const createUpdatedText = (entity: RoomPubMsg | RoomPrvMsg): UpdatedText | undefined => {
    if (entity.textUpdatedAt == null) {
        return undefined;
    }
    return { currentText: entity.updatedText, updatedAt: entity.textUpdatedAt };
};

const isDeleted = (entity: RoomPubMsg | RoomPrvMsg): boolean => {
    if (entity.textUpdatedAt == null) {
        return false;
    }
    return entity.updatedText == null;
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
        initText: msg.initText,
        initTextSource: msg.initTextSource ?? msg.initText,
        updatedText: createUpdatedText(msg),
        textColor: msg.textColor ?? undefined,
        commandResult:
            msg.commandResult == null
                ? undefined
                : {
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
    visibleTo,
}: {
    msg: RoomPrvMsg;
    visibleTo: string[];
}): Promise<RoomPrivateMessage> => {
    return {
        __tstype: RoomPrivateMessageType,
        messageId: msg.id,
        visibleTo: [...visibleTo].sort(),
        createdBy: msg.createdBy?.userUid,
        character: toCharacterValueForMessage(msg),
        customName: msg.customName,
        createdAt: msg.createdAt.getTime(),
        updatedAt: msg.textUpdatedAt,
        initText: msg.initText ?? undefined,
        initTextSource: msg.initTextSource ?? msg.initText,
        updatedText: createUpdatedText(msg),
        textColor: msg.textColor ?? undefined,
        commandResult:
            msg.commandResult == null
                ? undefined
                : {
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
        return undefined;
    }
};

const publishRoomEvent = async (pubSub: PubSubEngine, payload: RoomEventPayload) => {
    await pubSub.publish(ROOM_EVENT, payload);
};

@Resolver()
export class RoomResolver {
    @Query(() => GetRoomsListResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async getRoomsList(@Ctx() context: ResolverContext): Promise<typeof GetRoomsListResult> {
        const queue = async () => {
            const em = context.em;

            // TODO: すべてを取得しているので重い
            const roomModels = await em.find(Room$MikroORM.Room, {});
            const rooms = roomModels.map(model =>
                stateToGraphql$RoomAsListItem({ roomEntity: model })
            );
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

    @Query(() => RequiresPhraseResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async requiresPhraseToJoinAsPlayer(
        @Arg('roomId') roomId: string,
        @Ctx() context: ResolverContext
    ): Promise<typeof RequiresPhraseResult> {
        const queue = async () => {
            const em = context.em;
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

    private async getRoomMessagesFromDb(
        room: Room$MikroORM.Room,
        userUid: string,
        mode: 'log' | 'default'
    ): Promise<RoomMessages> {
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
                if (mode === 'default' && msg.isSecret && createdBy !== userUid) {
                    continue;
                }
                publicMessages.push(createRoomPublicMessage({ msg, channelKey: ch.key }));
            }
        }

        const privateMessages: RoomPrivateMessage[] = [];
        for (const msg of await room.roomPrvMsgs.loadItems()) {
            const createdBy = msg.createdBy?.userUid;
            if (mode === 'default') {
                if (msg.isSecret && createdBy !== userUid) {
                    continue;
                }
            }
            const visibleTo = await msg.visibleTo.loadItems();
            if (mode === 'default') {
                if (visibleTo.every(v => v.userUid !== userUid)) {
                    continue;
                }
            }
            const graphQLValue = await createRoomPrivateMessage({
                msg,
                visibleTo: visibleTo.map(user => user.userUid),
            });
            privateMessages.push(graphQLValue);
        }

        const pieceValueLogs: PieceValueLog[] = [];
        for (const msg of await room.dicePieceValueLogs.loadItems()) {
            pieceValueLogs.push(DicePieceValueLogNameSpace.MikroORM.ToGraphQL.state(msg));
        }
        for (const msg of await room.numberPieceValueLogs.loadItems()) {
            pieceValueLogs.push(StringPieceValueLogNameSpace.MikroORM.ToGraphQL.state(msg));
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
        return {
            __tstype: RoomMessagesType,
            publicMessages,
            privateMessages,
            pieceValueLogs,
            publicChannels,
            soundEffects,
        };
    }

    @Query(() => GetRoomMessagesResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(10))
    public async getMessages(
        @Args() args: GetMessagesArgs,
        @Ctx() context: ResolverContext
    ): Promise<typeof GetRoomMessagesResult> {
        const queue = async (): Promise<Result<typeof GetRoomMessagesResult>> => {
            const em = context.em;
            const authorizedUserUid = ensureAuthorizedUser(context).userUid;
            const findResult = await findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: args.roomId,
            });
            if (findResult == null) {
                return Result.ok({
                    __tstype: GetRoomMessagesFailureResultType,
                    failureType: GetRoomMessagesFailureType.RoomNotFound,
                });
            }
            const { room, me } = findResult;
            if (me?.role === undefined) {
                return Result.ok({
                    __tstype: GetRoomMessagesFailureResultType,
                    failureType: GetRoomMessagesFailureType.NotParticipant,
                });
            }

            const messages = await this.getRoomMessagesFromDb(room, authorizedUserUid, 'default');
            return Result.ok(messages);
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
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(10))
    public async getLog(
        @Args() args: GetLogArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<typeof GetRoomLogResult> {
        const queue = async (): Promise<
            Result<{ result: typeof GetRoomLogResult; payload?: MessageUpdatePayload }>
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

            const messages = await this.getRoomMessagesFromDb(room, authorizedUserUid, 'log');

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

    @Query(() => GetRoomConnectionsResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async getRoomConnections(
        @Arg('roomId') roomId: string,
        @Ctx() context: ResolverContext
    ): Promise<typeof GetRoomConnectionsResult> {
        const queue = async (): Promise<Result<typeof GetRoomConnectionsResult>> => {
            const em = context.em;
            const authorizedUserUid = ensureAuthorizedUser(context).userUid;
            const findResult = await findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId,
            });
            if (findResult == null) {
                return Result.ok({
                    __tstype: GetRoomConnectionFailureResultType,
                    failureType: GetRoomConnectionFailureType.RoomNotFound,
                });
            }
            const { me } = findResult;
            if (me?.role === undefined) {
                return Result.ok({
                    __tstype: GetRoomConnectionFailureResultType,
                    failureType: GetRoomConnectionFailureType.NotParticipant,
                });
            }

            return Result.ok({
                __tstype: GetRoomConnectionSuccessResultType,
                connectedUserUids: [
                    ...(await context.connectionManager.listRoomConnections({ roomId })),
                ]
                    .filter(([key, value]) => value > 0)
                    .map(([key]) => key),
                fetchedAt: new Date().getTime(),
            });
        };
        const coreResult = await context.promiseQueue.next(queue);
        if (coreResult.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        if (coreResult.value.isError) {
            throw coreResult.value.error;
        }
        return coreResult.value.value;
    }

    @Mutation(() => CreateRoomResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async createRoom(
        @Arg('input') input: CreateRoomInput,
        @Ctx() context: ResolverContext
    ): Promise<typeof CreateRoomResult> {
        const queue = async (): Promise<typeof CreateRoomResult> => {
            const em = context.em;
            const authorizedUser = ensureAuthorizedUser(context);

            const newRoom = new Room$MikroORM.Room({
                name: input.roomName,
                createdBy: authorizedUser.userUid,
                value: {
                    $v: 1,
                    $r: 2,
                    participants: {
                        [authorizedUser.userUid]: {
                            $v: 1,
                            $r: 2,
                            boards: {},
                            characters: {},
                            imagePieceValues: {},
                        },
                    },
                    activeBoardKey: null,
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
                    bgms: {},
                    boolParamNames: {},
                    numParamNames: {},
                    strParamNames: {},
                    memos: {},
                },
            });

            const newParticipant = new Participant$MikroORM.Participant();
            (newParticipant.name = input.participantName),
                (newParticipant.role = ParticipantRoleType.Master);
            em.persist(newParticipant);
            newRoom.participants.add(newParticipant);
            authorizedUser.participants.add(newParticipant);

            // このRoomのroomOperatedを購読しているユーザーはいないので、roomOperatedは実行する必要がない。
            newRoom.joinAsPlayerPhrase = input.joinAsPlayerPhrase;
            newRoom.joinAsSpectatorPhrase = input.joinAsSpectatorPhrase;
            const revision = newRoom.revision;
            em.persist(newRoom);

            const roomState = await GlobalRoom.MikroORM.ToGlobal.state(newRoom, em);
            const graphqlState = GlobalRoom.Global.ToGraphQL.state({
                source: roomState,
                requestedBy: { type: client, userUid: authorizedUser.userUid },
            });
            await em.flush();
            return {
                room: {
                    ...graphqlState,
                    revision,
                    createdBy: authorizedUser.userUid,
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

    @Mutation(() => DeleteRoomResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async deleteRoom(
        @Args() args: DeleteRoomArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<DeleteRoomResult> {
        const queue = async (): Promise<{
            result: DeleteRoomResult;
            payload: RoomEventPayload | undefined;
        }> => {
            const em = context.em;
            const authorizedUserUid = ensureAuthorizedUser(context).userUid;

            // そのRoomのParticipantでない場合でも削除できるようになっている。ただし、もしキック機能が実装されて部屋作成者がキックされた場合は再考の余地があるか。

            const room = await em.findOne(Room$MikroORM.Room, { id: args.id });
            if (room == null) {
                return {
                    result: { failureType: DeleteRoomFailureType.NotFound },
                    payload: undefined,
                };
            }
            const roomId = room.id;
            if (room.createdBy !== authorizedUserUid) {
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
                    deletedBy: authorizedUserUid,
                },
            };
        };

        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        if (result.value.payload != null) {
            await publishRoomEvent(pubSub, result.value.payload);
        }
        return result.value.result;
    }

    @Mutation(() => JoinRoomResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async joinRoomAsPlayer(
        @Args() args: JoinRoomArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<typeof JoinRoomResult> {
        const { result, payload } = await joinRoomCore({
            args,
            context,
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
                return Player;
            },
        });
        if (payload != null) {
            await publishRoomEvent(pubSub, payload);
        }
        return result;
    }

    @Mutation(() => JoinRoomResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async joinRoomAsSpectator(
        @Args() args: JoinRoomArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<typeof JoinRoomResult> {
        const { result, payload } = await joinRoomCore({
            args,
            context,
            strategy: ({ me, room }) => {
                if (me != null) {
                    switch (me.role) {
                        case undefined:
                            break;
                        default:
                            return JoinRoomFailureType.AlreadyParticipant;
                    }
                }
                if (
                    room.joinAsSpectatorPhrase != null &&
                    room.joinAsSpectatorPhrase !== args.phrase
                ) {
                    return JoinRoomFailureType.WrongPhrase;
                }
                return Spectator;
            },
        });
        if (payload != null) {
            await publishRoomEvent(pubSub, payload);
        }
        return result;
    }

    @Mutation(() => PromoteResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async promoteToPlayer(
        @Args() args: PromoteArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<PromoteResult> {
        const { result, payload } = await promoteMeCore({
            ...args,
            context,
            strategy: ({ me, room }) => {
                switch (me.role) {
                    case Master:
                    case Player:
                        return PromoteFailureType.NoNeedToPromote;
                    case Spectator: {
                        if (
                            room.joinAsPlayerPhrase != null &&
                            room.joinAsPlayerPhrase !== args.phrase
                        ) {
                            return PromoteFailureType.WrongPhrase;
                        }
                        return Player;
                    }
                    case null:
                    case undefined:
                        return PromoteFailureType.NotParticipant;
                }
            },
        });
        if (payload != null) {
            await publishRoomEvent(pubSub, payload);
        }
        return result;
    }

    @Mutation(() => ChangeParticipantNameResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async changeParticipantName(
        @Args() args: ChangeParticipantNameArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ChangeParticipantNameResult> {
        const queue = async (): Promise<{
            result: ChangeParticipantNameResult;
            payload: RoomEventPayload | undefined;
        }> => {
            const em = context.em;
            const authorizedUserUid = ensureAuthorizedUser(context).userUid;
            const findResult = await findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: args.roomId,
            });
            if (findResult == null) {
                return {
                    result: {
                        failureType: ChangeParticipantNameFailureType.NotFound,
                    },
                    payload: undefined,
                };
            }
            const { room, me, roomState } = findResult;
            const participantUserUids = findResult.participantIds();
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
                myUserUid: authorizedUserUid,
                update: {
                    name: { newValue: convertToMaxLength100String(args.newName) },
                },
                room,
                participantUserUids,
            });

            return {
                result: {
                    failureType: undefined,
                },
                payload: payload,
            };
        };

        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        if (result.value.payload != null) {
            await publishRoomEvent(pubSub, result.value.payload);
        }
        return result.value.result;
    }

    @Query(() => GetRoomResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async getRoom(
        @Args() args: GetRoomArgs,
        @Ctx() context: ResolverContext
    ): Promise<typeof GetRoomResult> {
        const queue = async (): Promise<Result<typeof GetRoomResult>> => {
            const em = context.em;
            const authorizedUserUid = ensureAuthorizedUser(context).userUid;
            const findResult = await findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: args.id,
            });
            if (findResult == null) {
                return Result.ok({
                    failureType: GetRoomFailureType.NotFound,
                });
            }
            const { room, me } = findResult;
            if (me?.role == null) {
                return Result.ok({
                    roomAsListItem: stateToGraphql$RoomAsListItem({ roomEntity: room }),
                });
            }

            const roomState = await GlobalRoom.MikroORM.ToGlobal.state(room, em);
            return Result.ok({
                role: ParticipantRoleEnum.ofString(me.role),
                room: {
                    ...GlobalRoom.Global.ToGraphQL.state({
                        source: roomState,
                        requestedBy: { type: client, userUid: authorizedUserUid },
                    }),
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

    @Mutation(() => LeaveRoomResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async leaveRoom(
        @Arg('id') id: string,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<LeaveRoomResult> {
        const queue = async (): Promise<
            Result<{ result: LeaveRoomResult; payload: RoomEventPayload | undefined }>
        > => {
            const em = context.em;
            const authorizedUserUid = ensureAuthorizedUser(context).userUid;
            // entryしていなくても呼べる
            const findResult = await findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: id,
            });
            if (findResult == null) {
                return Result.ok({
                    result: { failureType: LeaveRoomFailureType.NotFound },
                    payload: undefined,
                });
            }
            const { me, room } = findResult;
            const participantUserUids = findResult.participantIds();
            if (me === undefined || me.role == null) {
                return Result.ok({
                    result: { failureType: LeaveRoomFailureType.NotParticipant },
                    payload: undefined,
                });
            }
            const { payload } = await operateParticipantAndFlush({
                em,
                myUserUid: authorizedUserUid,
                update: {
                    role: { newValue: undefined },
                },
                room,
                participantUserUids,
            });
            return Result.ok({
                result: {},
                payload: payload,
            });
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

    private static async operateCore({
        args,
        context,
    }: {
        args: OperateArgs;
        context: ResolverContext;
    }): Promise<OperateCoreResult> {
        // Spectatorであっても自分の名前などはoperateで変更する必要があるため、Spectatorならば無条件で弾くという手法は使えない

        const queue = async (): Promise<
            Result<OperateCoreResult, string | ApplyError<PositiveInt> | ComposeAndTransformError>
        > => {
            const em = context.em;
            const authorizedUserUid = ensureAuthorizedUser(context).userUid;
            const findResult = await findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: args.id,
            });
            if (findResult == null) {
                return Result.ok({
                    type: 'failure',
                    result: { failureType: OperateRoomFailureType.NotFound },
                });
            }
            const { room, me, roomState } = findResult;
            if (me === undefined) {
                return Result.ok({
                    type: 'nonJoined',
                    result: { roomAsListItem: stateToGraphql$RoomAsListItem({ roomEntity: room }) },
                });
            }
            const participantUserUids = findResult.participantIds();
            const clientOperation = GlobalRoom.GraphQL.ToGlobal.upOperation(args.operation);

            const downOperation = await GlobalRoom.MikroORM.ToGlobal.downOperationMany({
                em,
                roomId: room.id,
                revisionRange: { from: args.prevRevision, expectedTo: room.revision },
            });
            if (downOperation.isError) {
                return downOperation;
            }

            let prevState: State = roomState;
            let twoWayOperation: TwoWayOperation | undefined = undefined;
            if (downOperation.value !== undefined) {
                const restoredRoom = restore({
                    nextState: roomState,
                    downOperation: downOperation.value,
                });
                if (restoredRoom.isError) {
                    return restoredRoom;
                }
                prevState = restoredRoom.value.prevState;
                twoWayOperation = restoredRoom.value.twoWayOperation;
            }

            const transformed = serverTransform({ type: client, userUid: authorizedUserUid })({
                prevState,
                currentState: roomState,
                clientOperation: clientOperation,
                serverOperation: twoWayOperation,
            });
            if (transformed.isError) {
                return transformed;
            }
            if (transformed.value === undefined) {
                return Result.ok({ type: 'id', result: { requestId: args.requestId } });
            }

            const operation = transformed.value;
            const prevRevision = room.revision;

            const nextRoomState = await GlobalRoom.Global.applyToEntity({
                em,
                target: room,
                prevState: roomState,
                operation,
            });

            const logs = createLogs({ prevState: roomState, nextState: nextRoomState });
            const dicePieceLogEntities: DicePieceValueLog$MikroORM[] = [];
            logs?.dicePieceValueLogs.forEach(log => {
                const entity = new DicePieceValueLog$MikroORM({
                    characterCreatedBy: log.characterKey.createdBy,
                    characterId: log.characterKey.id,
                    stateId: log.stateId,
                    room,
                    value: log.value,
                });
                dicePieceLogEntities.push(entity);
                em.persist(entity);
            });
            const stringPieceLogEntities: StringPieceValueLog$MikroORM[] = [];
            logs?.stringPieceValueLogs.forEach(log => {
                const entity = new StringPieceValueLog$MikroORM({
                    characterCreatedBy: log.characterKey.createdBy,
                    characterId: log.characterKey.id,
                    stateId: log.stateId,
                    room,
                    value: log.value,
                });
                stringPieceLogEntities.push(entity);
                em.persist(entity);
            });

            await em.flush();

            const generateOperation = (deliverTo: string): RoomOperation => {
                return {
                    __tstype: 'RoomOperation',
                    revisionTo: prevRevision + 1,
                    operatedBy: {
                        userUid: authorizedUserUid,
                        clientId: args.operation.clientId,
                    },
                    valueJson: GlobalRoom.Global.ToGraphQL.operation({
                        prevState: roomState,
                        nextState: nextRoomState,
                        requestedBy: { type: client, userUid: deliverTo },
                    }),
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
                messageUpdatePayload: [
                    ...dicePieceLogEntities.map(
                        log =>
                            ({
                                type: 'messageUpdatePayload',
                                roomId: room.id,
                                createdBy: undefined,
                                visibleTo: undefined,
                                value: DicePieceValueLogNameSpace.MikroORM.ToGraphQL.state(log),
                            } as const)
                    ),
                    ...stringPieceLogEntities.map(
                        log =>
                            ({
                                type: 'messageUpdatePayload',
                                roomId: room.id,
                                createdBy: undefined,
                                visibleTo: undefined,
                                value: StringPieceValueLogNameSpace.MikroORM.ToGraphQL.state(log),
                            } as const)
                    ),
                ],
                result: {
                    operation: generateOperation(authorizedUserUid),
                },
            };

            return Result.ok(result);
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
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(3))
    public async operate(
        @Args() args: OperateArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<typeof OperateRoomResult> {
        const operateResult = await RoomResolver.operateCore({
            args,
            context,
        });
        if (operateResult.type === 'success') {
            await publishRoomEvent(pubSub, operateResult.roomOperationPayload);
            for (const messageUpdate of operateResult.messageUpdatePayload) {
                await publishRoomEvent(pubSub, messageUpdate);
            }
        }
        return operateResult.result;
    }

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
            Result<{ result: typeof WriteRoomPublicMessageResult; payload?: MessageUpdatePayload }>
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
            if (args.characterStateId != null) {
                chara =
                    roomState.participants[authorizedUser.userUid]?.characters?.[
                        args.characterStateId
                    ];
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
                return entityResult;
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
                entity.charaStateId = args.characterStateId;
                entity.charaName = chara.name;
                entity.charaIsPrivate = chara.isPrivate;
                entity.charaImagePath = chara.image?.path;
                entity.charaImageSourceType = FileSourceTypeModule.ofNullishString(
                    chara.image?.sourceType
                );
                entity.charaTachieImagePath = chara.tachieImage?.path;
                entity.charaTachieImageSourceType = FileSourceTypeModule.ofNullishString(
                    chara.tachieImage?.sourceType
                );
            }

            entity.roomPubCh = Reference.create(ch);
            await em.persistAndFlush(entity);

            const result: RoomPublicMessage = createRoomPublicMessage({ msg: entity, channelKey });

            const payload: MessageUpdatePayload = {
                type: 'messageUpdatePayload',
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
            Result<{ result: typeof WriteRoomPrivateMessageResult; payload?: MessageUpdatePayload }>
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
            if (args.characterStateId != null) {
                chara =
                    roomState.participants[authorizedUser.userUid]?.characters?.[
                        args.characterStateId
                    ];
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
                return entityResult;
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
                entity.charaStateId = args.characterStateId;
                entity.charaName = chara.name;
                entity.charaIsPrivate = chara.isPrivate;
                entity.charaImagePath = chara.image?.path;
                entity.charaImageSourceType = FileSourceTypeModule.ofNullishString(
                    chara.tachieImage?.sourceType
                );
                entity.charaTachieImagePath = chara.tachieImage?.path;
                entity.charaTachieImageSourceType = FileSourceTypeModule.ofNullishString(
                    chara.tachieImage?.sourceType
                );
            }

            entity.room = Reference.create(room);
            await em.persistAndFlush(entity);

            const visibleToArray = [...visibleTo].sort();
            const result = await createRoomPrivateMessage({
                msg: entity,
                visibleTo: visibleToArray,
            });

            const payload: MessageUpdatePayload = {
                type: 'messageUpdatePayload',
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

    @Mutation(() => WriteRoomSoundEffectResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(3))
    public async writeRoomSoundEffect(
        @Args() args: WriteRoomSoundEffectArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<typeof WriteRoomSoundEffectResult> {
        const queue = async (): Promise<
            Result<{ result: typeof WriteRoomSoundEffectResult; payload?: MessageUpdatePayload }>
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

            const payload: MessageUpdatePayload = {
                type: 'messageUpdatePayload',
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

    @Mutation(() => MakeMessageNotSecretResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async makeMessageNotSecret(
        @Args() args: MessageIdArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<MakeMessageNotSecretResult> {
        const queue = async (): Promise<
            Result<{ result: MakeMessageNotSecretResult; payload?: MessageUpdatePayload }>
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
                        failureType: MakeMessageNotSecretFailureType.RoomNotFound,
                    },
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return Result.ok({
                    result: {
                        failureType: MakeMessageNotSecretFailureType.NotParticipant,
                    },
                });
            }
            const publicMsg = await em.findOne(RoomPubMsg, { id: args.messageId });
            if (publicMsg != null) {
                if (publicMsg.createdBy?.userUid !== authorizedUserUid) {
                    return Result.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType.NotYourMessage,
                        },
                    });
                }
                if (!publicMsg.isSecret) {
                    return Result.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType.NotSecret,
                        },
                    });
                }
                publicMsg.isSecret = false;
                await em.flush();

                const payloadValue: RoomPublicMessageUpdate = {
                    __tstype: RoomPublicMessageUpdateType,
                    messageId: publicMsg.id,
                    isSecret: publicMsg.isSecret,
                    updatedText: createUpdatedText(publicMsg),
                    commandResult:
                        publicMsg.commandResult == null
                            ? undefined
                            : {
                                  text: publicMsg.commandResult,
                                  isSuccess: publicMsg.commandIsSuccess,
                              },
                    altTextToSecret: publicMsg.altTextToSecret,
                    updatedAt: publicMsg.textUpdatedAt,
                };
                return Result.ok({
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
                if (privateMsg.createdBy?.userUid !== authorizedUserUid) {
                    return Result.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType.NotYourMessage,
                        },
                    });
                }
                if (!privateMsg.isSecret) {
                    return Result.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType.NotSecret,
                        },
                    });
                }
                privateMsg.isSecret = false;
                await em.flush();

                const payloadValue: RoomPrivateMessageUpdate = {
                    __tstype: RoomPrivateMessageUpdateType,
                    messageId: privateMsg.id,
                    isSecret: privateMsg.isSecret,
                    updatedText: createUpdatedText(privateMsg),
                    commandResult:
                        privateMsg.commandResult == null
                            ? undefined
                            : {
                                  text: privateMsg.commandResult,
                                  isSuccess: privateMsg.commandIsSuccess,
                              },
                    altTextToSecret: privateMsg.altTextToSecret,
                    updatedAt: privateMsg.textUpdatedAt,
                };
                return Result.ok({
                    result: {},
                    payload: {
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        visibleTo: (await privateMsg.visibleTo.loadItems()).map(
                            user => user.userUid
                        ),
                        createdBy: privateMsg.createdBy?.userUid,
                        value: payloadValue,
                    },
                });
            }

            return Result.ok({
                result: {
                    failureType: MakeMessageNotSecretFailureType.MessageNotFound,
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
        if (result.value.value.payload != null) {
            await publishRoomEvent(pubSub, result.value.value.payload);
        }
        return result.value.value.result;
    }

    @Mutation(() => DeleteMessageResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async deleteMessage(
        @Args() args: MessageIdArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<DeleteMessageResult> {
        const queue = async (): Promise<
            Result<{ result: DeleteMessageResult; payload?: MessageUpdatePayload }>
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
                        failureType: DeleteMessageFailureType.RoomNotFound,
                    },
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return Result.ok({
                    result: {
                        failureType: DeleteMessageFailureType.NotParticipant,
                    },
                });
            }
            const publicMsg = await em.findOne(RoomPubMsg, { id: args.messageId });
            if (publicMsg != null) {
                if (publicMsg.createdBy?.userUid !== authorizedUserUid) {
                    return Result.ok({
                        result: {
                            failureType: DeleteMessageFailureType.NotYourMessage,
                        },
                    });
                }
                if (
                    publicMsg.initText == null &&
                    publicMsg.altTextToSecret == null &&
                    publicMsg.commandResult == null
                ) {
                    return Result.ok({
                        result: {
                            failureType: DeleteMessageFailureType.MessageDeleted,
                        },
                    });
                }
                publicMsg.updatedText = undefined;
                publicMsg.textUpdatedAt = new Date().getTime();
                await em.flush();

                const payloadValue: RoomPublicMessageUpdate = {
                    __tstype: RoomPublicMessageUpdateType,
                    messageId: publicMsg.id,
                    isSecret: publicMsg.isSecret,
                    updatedText: createUpdatedText(publicMsg),
                    commandResult:
                        publicMsg.commandResult == null
                            ? undefined
                            : {
                                  text: publicMsg.commandResult,
                                  isSuccess: publicMsg.commandIsSuccess,
                              },
                    altTextToSecret: publicMsg.altTextToSecret,
                    updatedAt: publicMsg.textUpdatedAt,
                };
                return Result.ok({
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
                if (privateMsg.createdBy?.userUid !== authorizedUserUid) {
                    return Result.ok({
                        result: {
                            failureType: DeleteMessageFailureType.NotYourMessage,
                        },
                    });
                }
                if (
                    privateMsg.initText == null &&
                    privateMsg.altTextToSecret == null &&
                    privateMsg.commandResult == null
                ) {
                    return Result.ok({
                        result: {
                            failureType: DeleteMessageFailureType.MessageDeleted,
                        },
                    });
                }
                privateMsg.updatedText = undefined;
                privateMsg.textUpdatedAt = new Date().getTime();
                await em.flush();

                const payloadValue: RoomPrivateMessageUpdate = {
                    __tstype: RoomPrivateMessageUpdateType,
                    updatedText: privateMsg.updatedText,
                    messageId: privateMsg.id,
                    isSecret: privateMsg.isSecret,
                    updatedAt: privateMsg.textUpdatedAt,
                };
                return Result.ok({
                    result: {},
                    payload: {
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        visibleTo: (await privateMsg.visibleTo.loadItems()).map(
                            user => user.userUid
                        ),
                        createdBy: privateMsg.createdBy?.userUid,
                        value: payloadValue,
                    },
                });
            }

            return Result.ok({
                result: {
                    failureType: DeleteMessageFailureType.MessageNotFound,
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
        if (result.value.value.payload != null) {
            await publishRoomEvent(pubSub, result.value.value.payload);
        }
        return result.value.value.result;
    }

    @Mutation(() => EditMessageResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async editMessage(
        @Args() args: EditMessageArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<EditMessageResult> {
        const queue = async (): Promise<
            Result<{ result: EditMessageResult; payload?: MessageUpdatePayload }>
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
                        failureType: EditMessageFailureType.RoomNotFound,
                    },
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return Result.ok({
                    result: {
                        failureType: EditMessageFailureType.NotParticipant,
                    },
                });
            }
            const publicMsg = await em.findOne(RoomPubMsg, { id: args.messageId });
            if (publicMsg != null) {
                if (publicMsg.createdBy?.userUid !== authorizedUserUid) {
                    return Result.ok({
                        result: {
                            failureType: EditMessageFailureType.NotYourMessage,
                        },
                    });
                }
                if (isDeleted(publicMsg)) {
                    return Result.ok({
                        result: {
                            failureType: EditMessageFailureType.MessageDeleted,
                        },
                    });
                }
                publicMsg.updatedText = args.text;
                publicMsg.textUpdatedAt = new Date().getTime();
                await em.flush();

                const payloadValue: RoomPublicMessageUpdate = {
                    __tstype: RoomPublicMessageUpdateType,
                    messageId: publicMsg.id,
                    isSecret: publicMsg.isSecret,
                    updatedText: createUpdatedText(publicMsg),
                    commandResult:
                        publicMsg.commandResult == null
                            ? undefined
                            : {
                                  text: publicMsg.commandResult,
                                  isSuccess: publicMsg.commandIsSuccess,
                              },
                    altTextToSecret: publicMsg.altTextToSecret,
                    updatedAt: publicMsg.textUpdatedAt,
                };
                return Result.ok({
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
                if (privateMsg.createdBy?.userUid !== authorizedUserUid) {
                    return Result.ok({
                        result: {
                            failureType: EditMessageFailureType.NotYourMessage,
                        },
                    });
                }
                if (privateMsg.initText == null) {
                    return Result.ok({
                        result: {
                            failureType: EditMessageFailureType.MessageDeleted,
                        },
                    });
                }
                privateMsg.updatedText = args.text;
                privateMsg.textUpdatedAt = new Date().getTime();
                await em.flush();

                const payloadValue: RoomPrivateMessageUpdate = {
                    __tstype: RoomPrivateMessageUpdateType,
                    messageId: privateMsg.id,
                    isSecret: privateMsg.isSecret,
                    updatedText: createUpdatedText(privateMsg),
                    commandResult:
                        privateMsg.commandResult == null
                            ? undefined
                            : {
                                  text: privateMsg.commandResult,
                                  isSuccess: privateMsg.commandIsSuccess,
                              },
                    altTextToSecret: privateMsg.altTextToSecret,
                    updatedAt: privateMsg.textUpdatedAt,
                };
                return Result.ok({
                    result: {},
                    payload: {
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        visibleTo: (await privateMsg.visibleTo.loadItems()).map(
                            user => user.userUid
                        ),
                        createdBy: privateMsg.createdBy?.userUid,
                        value: payloadValue,
                    },
                });
            }

            return Result.ok({
                result: {
                    failureType: EditMessageFailureType.MessageNotFound,
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
        if (result.value.value.payload != null) {
            await publishRoomEvent(pubSub, result.value.value.payload);
        }
        return result.value.value.result;
    }

    @Mutation(() => Boolean)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async updateWritingMessageStatus(
        @Args() args: UpdateWritingMessageStateArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<boolean> {
        const authorizedUserUid = ensureAuthorizedUser(context).userUid;
        let status: WritingMessageStatusType;
        switch (args.newStatus) {
            case WritingMessageStatusInputType.Cleared:
                status = WritingMessageStatusType.Cleared;
                break;
            case WritingMessageStatusInputType.StartWriting:
                status = WritingMessageStatusType.Writing;
                break;
            case WritingMessageStatusInputType.KeepWriting:
                status = WritingMessageStatusType.Writing;
                break;
        }

        const returns = await context.connectionManager.onWritingMessageStatusUpdate({
            roomId: args.roomId,
            userUid: authorizedUserUid,
            status,
        });
        if (returns != null) {
            await publishRoomEvent(pubSub, {
                type: 'writingMessageStatusUpdatePayload',
                roomId: args.roomId,
                userUid: authorizedUserUid,
                status: returns,
                updatedAt: new Date().getTime(),
            });
        }
        return true;
    }

    // graphql-wsでRoomOperatedのConnectionを検知しているので、もしこれのメソッドやArgsがリネームもしくは削除されるときはそちらも変える。
    // CONSIDER: return undefined; とすると、{ roomEvent: null } というオブジェクトが全員に通知される。そのため、それを見るとイベントの内容を予想できてしまう可能性がある。例えば1セッションしか行われていない場合、秘話が送られた可能性が高い、など。この問題はおそらくfilterプロパティで解決できるかもしれない。
    @Subscription(() => RoomEvent, {
        topics: ROOM_EVENT,
        nullable: true,
    })
    public roomEvent(
        @Root() payload: RoomEventPayload | null | undefined,
        @Arg('id') id: string,
        @Ctx() context: ResolverContext
    ): RoomEvent | undefined {
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

        if (payload.type === 'roomConnectionUpdatePayload') {
            return {
                roomConnectionEvent: {
                    userUid: payload.userUid,
                    isConnected: payload.isConnected,
                    updatedAt: payload.updatedAt,
                },
            };
        }

        if (payload.type === 'writingMessageStatusUpdatePayload') {
            return {
                writingMessageStatus: {
                    userUid: payload.userUid,
                    status: payload.status,
                    updatedAt: payload.updatedAt,
                },
            };
        }

        if (payload.type === 'messageUpdatePayload') {
            if (payload.value.__tstype === RoomPrivateMessageType) {
                if (payload.value.visibleTo.every(vt => vt !== userUid)) {
                    return undefined;
                }
            }
            if (payload.value.__tstype === RoomPrivateMessageUpdateType) {
                if (payload.visibleTo == null) {
                    throw new Error('payload.visibleTo is required.');
                }
                if (payload.visibleTo.every(vt => vt !== userUid)) {
                    return undefined;
                }
            }

            switch (payload.value.__tstype) {
                case RoomPrivateMessageType:
                case RoomPublicMessageType: {
                    if (payload.value.isSecret && payload.value.createdBy !== userUid) {
                        return {
                            roomMessageEvent: {
                                ...payload.value,
                                initText: undefined,
                                initTextSource: undefined,
                                commandResult: undefined,
                            },
                        };
                    }
                    break;
                }
                case RoomPrivateMessageUpdateType:
                case RoomPublicMessageUpdateType:
                    if (payload.value.isSecret && payload.createdBy !== userUid) {
                        return {
                            roomMessageEvent: {
                                ...payload.value,
                                initText: undefined,
                                initTextSource: undefined,
                                commandResult: undefined,
                            },
                        };
                    }
                    break;
            }

            return { roomMessageEvent: payload.value };
        }

        // userUidが同じでも例えば異なるタブで同じRoomを開いているケースがある。そのため、Mutationを行ったuserUidにだけSubscriptionを送信しないことで通信量を節約、ということはできない。

        if (payload.type === 'deleteRoomPayload') {
            // Roomが削除されたことは非公開にする必要はないので、このように全員に通知して構わない。
            return {
                deleteRoomOperation: {
                    __tstype: deleteRoomOperation,
                    deletedBy: payload.deletedBy,
                },
            };
        }
        if (!payload.participants.has(userUid)) {
            return undefined;
        }
        if (payload.type === 'roomOperationPayload') {
            // TODO: DeleteRoomOperationも返す
            return {
                roomOperation: payload.generateOperation(userUid),
            };
        }
    }
}
