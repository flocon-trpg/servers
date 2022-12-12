import {
    State,
    UpOperation,
    admin,
    anonymous,
    client,
    diff,
    participantTemplate,
    roomTemplate,
    serverTransform,
    toUpOperation,
} from '@flocon-trpg/core';
import { recordToArray } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { Reference } from '@mikro-orm/core';
import bcrypt from 'bcrypt';
import Color from 'color';
import safeCompare from 'safe-compare';
import { PubSubEngine } from 'type-graphql';
import { EntryPasswordConfig, ServerConfig, plain } from '../../../config/types';
import { GlobalRoom } from '../../../entities-graphql/room';
import {
    DicePieceLog as DicePieceLogNameSpace,
    StringPieceLog as StringPieceLogNameSpace,
} from '../../../entities-graphql/roomMessage';
import * as Room$MikroORM from '../../../entities/room/entity';
import { RoomPrvMsg, RoomPubMsg } from '../../../entities/roomMessage/entity';
import { User } from '../../../entities/user/entity';
import { getUserIfEntry } from '../../../entities/user/getUserIfEntry';
import { BaasType } from '../../../enums/BaasType';
import { DecodedIdToken, EM, ResolverContext } from '../../../types';
import { RoomOperation } from '../../objects/room';
import {
    CharacterValueForMessage,
    PieceLog,
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
} from '../../objects/roomMessage';
import { RoomEventPayload } from '../subsciptions/roomEvent/payload';
import { ROOM_EVENT } from '../subsciptions/roomEvent/topics';
import { Context, analyze } from './messageAnalyzer';

type RoomState = State<typeof roomTemplate>;
type RoomUpOperation = UpOperation<typeof roomTemplate>;
type ParticipantState = State<typeof participantTemplate>;

export const RoomNotFound = 'RoomNotFound';
export const IdOperation = 'IdOperation';
export const NotSignIn = 'NotSignIn';
export const AnonymousAccount = 'AnonymousAccount';

export const checkSignIn = (context: ResolverContext): DecodedIdToken | typeof NotSignIn => {
    if (context.decodedIdToken == null || context.decodedIdToken.isError) {
        return NotSignIn;
    }
    return context.decodedIdToken.value;
};

export const checkSignInAndNotAnonymous = (
    context: ResolverContext
): DecodedIdToken | typeof NotSignIn | typeof AnonymousAccount => {
    const decodedIdToken = checkSignIn(context);
    if (decodedIdToken == NotSignIn) {
        return NotSignIn;
    }
    if (decodedIdToken.firebase.sign_in_provider === anonymous) {
        return AnonymousAccount;
    }
    return decodedIdToken;
};

export const checkEntry = async ({
    em,
    userUid,
    baasType,
    serverConfig,
    noFlush,
}: {
    em: EM;
    userUid: string;
    baasType: BaasType;
    serverConfig: ServerConfig;
    noFlush?: boolean;
}): Promise<boolean> => {
    return (await getUserIfEntry({ em, userUid, baasType, serverConfig, noFlush })) != null;
};

class FindRoomAndMyParticipantResult {
    public constructor(
        public readonly room: Room$MikroORM.Room,
        public readonly roomState: RoomState,
        public readonly me?: ParticipantState
    ) {}

    public participantIds(): Set<string> {
        if (this.roomState.participants == null) {
            return new Set();
        }
        return new Set(recordToArray(this.roomState.participants).map(({ key }) => key));
    }
}

/** Room をデータベースから探し、Room に付随する様々なデータと併せて返します。 */
export const findRoomAndMyParticipant = async ({
    em,
    userUid,
    roomId,
}: {
    em: EM;
    userUid: string | undefined;
    roomId: string;
}): Promise<FindRoomAndMyParticipantResult | null> => {
    const room = await em.findOne(Room$MikroORM.Room, { id: roomId });
    if (room == null) {
        return null;
    }
    const state = await GlobalRoom.MikroORM.ToGlobal.state(room, em);
    const me = userUid == null ? undefined : state.participants?.[userUid];
    return new FindRoomAndMyParticipantResult(room, state, me);
};

export const ensureUserUid = (context: ResolverContext): string => {
    const decodedIdToken = checkSignIn(context);
    if (decodedIdToken === NotSignIn) {
        throw new Error('Not sign in. "@Attribute()" might be missing.');
    }
    return decodedIdToken.uid;
};

export const ensureAuthorizedUser = (context: ResolverContext): User => {
    if (context.authorizedUser == null) {
        throw new Error(
            'authorizedUser was not found. "@Attribute(ENTRY or ADMIN)" might be missing.'
        );
    }
    return context.authorizedUser;
};

export const comparePassword = async (
    plainPassword: string,
    config: EntryPasswordConfig
): Promise<boolean> => {
    if (config.type === plain) {
        return safeCompare(plainPassword, config.value);
    }
    return await bcrypt.compare(plainPassword, config.value);
};

export const bcryptCompareNullable = async (
    plainPassword: string | undefined,
    hash: string | undefined
) => {
    if (hash == null) {
        return true;
    }
    if (plainPassword == null) {
        return false;
    }
    return await bcrypt.compare(plainPassword, hash);
};

export const publishRoomEvent = async (pubSub: PubSubEngine, payload: RoomEventPayload) => {
    await pubSub.publish(ROOM_EVENT, payload);
};

export const deleteSecretValues = (
    message:
        | RoomPublicMessage
        | RoomPrivateMessage
        | RoomPublicMessageUpdate
        | RoomPrivateMessageUpdate
) => {
    message.initText = undefined;
    message.initTextSource = undefined;
    message.updatedText = undefined;
    message.commandResult = undefined;
};

export const createUpdatedText = (entity: RoomPubMsg | RoomPrvMsg): UpdatedText | undefined => {
    if (entity.textUpdatedAtValue == null) {
        return undefined;
    }
    return { currentText: entity.updatedText, updatedAt: entity.textUpdatedAtValue };
};

export const createRoomPublicMessage = ({
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
        updatedAt: msg.updatedAt?.getTime(),
    };
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
        portraitImage:
            message.charaPortraitImagePath == null || message.charaPortraitImageSourceType == null
                ? undefined
                : {
                      path: message.charaPortraitImagePath,
                      sourceType: message.charaPortraitImageSourceType,
                  },
    };
};

export const createRoomPrivateMessage = ({
    msg,
    visibleTo,
}: {
    msg: RoomPrvMsg;
    visibleTo: string[];
}): RoomPrivateMessage => {
    return {
        __tstype: RoomPrivateMessageType,
        messageId: msg.id,
        visibleTo: [...visibleTo].sort(),
        createdBy: msg.createdBy?.userUid,
        character: toCharacterValueForMessage(msg),
        customName: msg.customName,
        createdAt: msg.createdAt.getTime(),
        updatedAt: msg.updatedAt?.getTime(),
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

export const createRoomPublicMessageUpdate = (msg: RoomPubMsg): RoomPublicMessageUpdate => {
    return {
        __tstype: RoomPublicMessageUpdateType,
        messageId: msg.id,
        initText: msg.initText,
        initTextSource: msg.initTextSource ?? msg.initText,
        updatedAt: msg.updatedAt?.getTime(),
        updatedText: createUpdatedText(msg),
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

export const createRoomPrivateMessageUpdate = (msg: RoomPrvMsg): RoomPrivateMessageUpdate => {
    return {
        __tstype: RoomPrivateMessageUpdateType,
        messageId: msg.id,
        initText: msg.initText ?? undefined,
        initTextSource: msg.initTextSource ?? msg.initText,
        updatedAt: msg.updatedAt?.getTime(),
        updatedText: createUpdatedText(msg),
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

export async function getRoomMessagesFromDb(
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
            const graphqlMessage = createRoomPublicMessage({ msg, channelKey: ch.key });
            if (mode === 'default' && msg.isSecret && createdBy !== userUid) {
                deleteSecretValues(graphqlMessage);
            }
            publicMessages.push(graphqlMessage);
        }
    }

    const privateMessages: RoomPrivateMessage[] = [];
    for (const msg of await room.roomPrvMsgs.loadItems()) {
        const visibleTo = await msg.visibleTo.loadItems();
        if (mode === 'default') {
            if (visibleTo.every(v => v.userUid !== userUid)) {
                continue;
            }
        }
        const createdBy = msg.createdBy?.userUid;
        const graphqlMessage = createRoomPrivateMessage({
            msg,
            visibleTo: visibleTo.map(user => user.userUid),
        });
        if (mode === 'default' && msg.isSecret && createdBy !== userUid) {
            deleteSecretValues(graphqlMessage);
        }
        privateMessages.push(graphqlMessage);
    }

    const pieceLogs: PieceLog[] = [];
    for (const msg of await room.dicePieceLogs.loadItems()) {
        pieceLogs.push(DicePieceLogNameSpace.MikroORM.ToGraphQL.state(msg));
    }
    for (const msg of await room.stringPieceLogs.loadItems()) {
        pieceLogs.push(StringPieceLogNameSpace.MikroORM.ToGraphQL.state(msg));
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
        pieceLogs: pieceLogs,
        publicChannels,
        soundEffects,
    };
}

type PromiseOrValue<T> = T | Promise<T>;

const operateAsAdminAndFlushCore = async <TError>({
    operation: operationSource,
    em,
    room,
    roomState,
    roomHistCount,
}: {
    operation: (
        roomState: RoomState
    ) => PromiseOrValue<Result<RoomUpOperation | undefined, TError>>;
    em: EM;
    room: Room$MikroORM.Room;
    roomState: RoomState;
    roomHistCount: number | undefined;
}) => {
    const prevRevision = room.revision;
    const operation = await operationSource(roomState);
    if (operation.isError) {
        return Result.error({ type: 'custom', error: operation.error } as const);
    }
    if (operation.value == null) {
        return Result.ok<typeof IdOperation>(IdOperation);
    }
    const transformed = serverTransform({ type: admin })({
        stateBeforeServerOperation: roomState,
        stateAfterServerOperation: roomState,
        clientOperation: operation.value,
        serverOperation: undefined,
    });
    if (transformed.isError) {
        return Result.error({ type: 'OT', error: transformed.error } as const);
    }
    const transformedValue = transformed.value;
    if (transformedValue == null) {
        return Result.ok<typeof IdOperation>(IdOperation);
    }

    const nextRoomState = await GlobalRoom.Global.applyToEntity({
        em,
        target: room,
        prevState: roomState,
        operation: transformedValue,
    });
    await em.flush();

    await GlobalRoom.Global.cleanOldRoomOp({
        em: em.fork(),
        room,
        roomHistCount,
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

    return Result.ok(generateOperation);
};

type OperationRestArg = {
    room: Room$MikroORM.Room;
};

type OperationChoice<TError> =
    | {
          operationType: 'operation';
          operation: (
              roomState: RoomState,
              rest: OperationRestArg
          ) => PromiseOrValue<Result<RoomUpOperation | undefined, TError>>;
      }
    | {
          operationType: 'state';
          operation: (
              roomState: RoomState,
              rest: OperationRestArg
          ) => PromiseOrValue<Result<RoomState, TError>>;
      };

export const operateAsAdminAndFlush = async <TError>({
    operation,
    operationType,
    em,
    roomId,
    roomHistCount,
}: {
    em: EM;
    roomId: string;
    roomHistCount: number | undefined;
} & OperationChoice<TError>) => {
    const findResult = await findRoomAndMyParticipant({ em, roomId, userUid: undefined });
    if (findResult == null) {
        return Result.ok<typeof RoomNotFound>(RoomNotFound);
    }

    const generateOperationResult = await operateAsAdminAndFlushCore({
        operation: async state => {
            if (operationType === 'operation') {
                return await operation(state, { room: findResult.room });
            }
            const nextState = await operation(state, { room: findResult.room });
            if (nextState.isError) {
                return nextState;
            }
            if (nextState.value === state) {
                // 不要な diff の実行を避け少しでも処理を高速化させるため、確実に等しい場合は早期 return させている。
                return Result.ok(undefined);
            }
            const diffResult = diff(roomTemplate)({ prevState: state, nextState: nextState.value });
            if (diffResult == null) {
                return Result.ok(undefined);
            }
            return Result.ok(toUpOperation(roomTemplate)(diffResult));
        },
        em,
        room: findResult.room,
        roomState: findResult.roomState,
        roomHistCount,
    });
    if (generateOperationResult.isError) {
        return generateOperationResult;
    }
    if (generateOperationResult.value === IdOperation) {
        return generateOperationResult;
    }
    const payload: RoomEventPayload = {
        type: 'roomOperationPayload',
        generateOperation: x => generateOperationResult.value(x),
        sendTo: findResult.participantIds(),
        roomId,
    };
    return Result.ok(payload);
};

export const fixTextColor = (color: string) => {
    try {
        return Color(color).hex();
    } catch {
        return undefined;
    }
};

export const analyzeTextAndSetToEntity = async (params: {
    type: 'RoomPubMsg' | 'RoomPrvMsg';
    textSource: string;
    context: Context | null;
    gameType: string | undefined;
    createdBy: User;
    room: RoomState;
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
