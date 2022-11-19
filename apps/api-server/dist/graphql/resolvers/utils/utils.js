'use strict';

var FilePathModule = require('@flocon-trpg/core');
var utils = require('@flocon-trpg/utils');
var result = require('@kizahasi/result');
var core = require('@mikro-orm/core');
var bcrypt = require('bcrypt');
var Color = require('color');
var safeCompare = require('safe-compare');
var types = require('../../../config/types.js');
var room = require('../../../entities-graphql/room.js');
var roomMessage$1 = require('../../../entities-graphql/roomMessage.js');
var entity = require('../../../entities/room/entity.js');
var entity$1 = require('../../../entities/roomMessage/entity.js');
var getUserIfEntry = require('../../../entities/user/getUserIfEntry.js');
var JoinRoomFailureType = require('../../../enums/JoinRoomFailureType.js');
var roomMessage = require('../../objects/roomMessage.js');
var topics = require('../subsciptions/roomEvent/topics.js');
var messageAnalyzer = require('./messageAnalyzer.js');

const NotSignIn = 'NotSignIn';
const checkSignIn = (context) => {
    if (context.decodedIdToken == null || context.decodedIdToken.isError) {
        return NotSignIn;
    }
    return context.decodedIdToken.value;
};
const checkEntry = async ({ em, userUid, baasType, serverConfig, noFlush, }) => {
    return (await getUserIfEntry.getUserIfEntry({ em, userUid, baasType, serverConfig, noFlush })) != null;
};
class FindRoomAndMyParticipantResult {
    constructor(room, roomState, me) {
        this.room = room;
        this.roomState = roomState;
        this.me = me;
    }
    participantIds() {
        if (this.roomState.participants == null) {
            return new Set();
        }
        return new Set(utils.recordToArray(this.roomState.participants).map(({ key }) => key));
    }
}
const findRoomAndMyParticipant = async ({ em, userUid, roomId, }) => {
    const room$1 = await em.findOne(entity.Room, { id: roomId });
    if (room$1 == null) {
        return null;
    }
    const state = await room.GlobalRoom.MikroORM.ToGlobal.state(room$1, em);
    const me = state.participants?.[userUid];
    return new FindRoomAndMyParticipantResult(room$1, state, me);
};
const ensureUserUid = (context) => {
    const decodedIdToken = checkSignIn(context);
    if (decodedIdToken === NotSignIn) {
        throw new Error('Not sign in. "@Attribute()" might be missing.');
    }
    return decodedIdToken.uid;
};
const ensureAuthorizedUser = (context) => {
    if (context.authorizedUser == null) {
        throw new Error('authorizedUser was not found. "@Attribute(ENTRY or ADMIN)" might be missing.');
    }
    return context.authorizedUser;
};
const comparePassword = async (plainPassword, config) => {
    if (config.type === types.plain) {
        return safeCompare(plainPassword, config.value);
    }
    return await bcrypt.compare(plainPassword, config.value);
};
const bcryptCompareNullable = async (plainPassword, hash) => {
    if (hash == null) {
        return true;
    }
    if (plainPassword == null) {
        return false;
    }
    return await bcrypt.compare(plainPassword, hash);
};
const publishRoomEvent = async (pubSub, payload) => {
    await pubSub.publish(topics.ROOM_EVENT, payload);
};
const deleteSecretValues = (message) => {
    message.initText = undefined;
    message.initTextSource = undefined;
    message.updatedText = undefined;
    message.commandResult = undefined;
};
const createUpdatedText = (entity) => {
    if (entity.textUpdatedAtValue == null) {
        return undefined;
    }
    return { currentText: entity.updatedText, updatedAt: entity.textUpdatedAtValue };
};
const createRoomPublicMessage = ({ msg, channelKey, }) => {
    return {
        __tstype: roomMessage.RoomPublicMessageType,
        channelKey,
        messageId: msg.id,
        initText: msg.initText,
        initTextSource: msg.initTextSource ?? msg.initText,
        updatedText: createUpdatedText(msg),
        textColor: msg.textColor ?? undefined,
        commandResult: msg.commandResult == null
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
const toCharacterValueForMessage = (message) => {
    if (message.charaStateId == null ||
        message.charaName == null ||
        message.charaIsPrivate == null) {
        return undefined;
    }
    return {
        stateId: message.charaStateId,
        isPrivate: message.charaIsPrivate,
        name: message.charaName,
        image: message.charaImagePath == null || message.charaImageSourceType == null
            ? undefined
            : {
                path: message.charaImagePath,
                sourceType: message.charaImageSourceType,
            },
        portraitImage: message.charaPortraitImagePath == null || message.charaPortraitImageSourceType == null
            ? undefined
            : {
                path: message.charaPortraitImagePath,
                sourceType: message.charaPortraitImageSourceType,
            },
    };
};
const createRoomPrivateMessage = ({ msg, visibleTo, }) => {
    return {
        __tstype: roomMessage.RoomPrivateMessageType,
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
        commandResult: msg.commandResult == null
            ? undefined
            : {
                text: msg.commandResult,
                isSuccess: msg.commandIsSuccess,
            },
        altTextToSecret: msg.altTextToSecret ?? undefined,
        isSecret: msg.isSecret,
    };
};
const createRoomPublicMessageUpdate = (msg) => {
    return {
        __tstype: roomMessage.RoomPublicMessageUpdateType,
        messageId: msg.id,
        initText: msg.initText,
        initTextSource: msg.initTextSource ?? msg.initText,
        updatedAt: msg.updatedAt?.getTime(),
        updatedText: createUpdatedText(msg),
        commandResult: msg.commandResult == null
            ? undefined
            : {
                text: msg.commandResult,
                isSuccess: msg.commandIsSuccess,
            },
        altTextToSecret: msg.altTextToSecret ?? undefined,
        isSecret: msg.isSecret,
    };
};
const createRoomPrivateMessageUpdate = (msg) => {
    return {
        __tstype: roomMessage.RoomPrivateMessageUpdateType,
        messageId: msg.id,
        initText: msg.initText ?? undefined,
        initTextSource: msg.initTextSource ?? msg.initText,
        updatedAt: msg.updatedAt?.getTime(),
        updatedText: createUpdatedText(msg),
        commandResult: msg.commandResult == null
            ? undefined
            : {
                text: msg.commandResult,
                isSuccess: msg.commandIsSuccess,
            },
        altTextToSecret: msg.altTextToSecret ?? undefined,
        isSecret: msg.isSecret,
    };
};
async function getRoomMessagesFromDb(room, userUid, mode) {
    const publicMessages = [];
    const publicChannels = [];
    for (const ch of await room.roomChatChs.loadItems()) {
        publicChannels.push({
            __tstype: roomMessage.RoomPublicChannelType,
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
    const privateMessages = [];
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
    const pieceLogs = [];
    for (const msg of await room.dicePieceLogs.loadItems()) {
        pieceLogs.push(roomMessage$1.DicePieceLog.MikroORM.ToGraphQL.state(msg));
    }
    for (const msg of await room.stringPieceLogs.loadItems()) {
        pieceLogs.push(roomMessage$1.StringPieceLog.MikroORM.ToGraphQL.state(msg));
    }
    const soundEffects = [];
    for (const se of await room.roomSes.loadItems()) {
        const createdBy = se.createdBy?.userUid;
        const graphQLValue = {
            __tstype: roomMessage.RoomSoundEffectType,
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
        __tstype: roomMessage.RoomMessagesType,
        publicMessages,
        privateMessages,
        pieceLogs: pieceLogs,
        publicChannels,
        soundEffects,
    };
}
const operateAsAdminAndFlush = async ({ operation: operationSource, em, room: room$1, roomHistCount, }) => {
    const prevRevision = room$1.revision;
    const roomState = await room.GlobalRoom.MikroORM.ToGlobal.state(room$1, em);
    const operation = typeof operationSource === 'function' ? operationSource(roomState) : operationSource;
    if (operation == null) {
        return result.Result.ok(undefined);
    }
    const transformed = FilePathModule.serverTransform({ type: FilePathModule.admin })({
        stateBeforeServerOperation: roomState,
        stateAfterServerOperation: roomState,
        clientOperation: operation,
        serverOperation: undefined,
    });
    if (transformed.isError) {
        return transformed;
    }
    const transformedValue = transformed.value;
    if (transformedValue == null) {
        return result.Result.ok(undefined);
    }
    const nextRoomState = await room.GlobalRoom.Global.applyToEntity({
        em,
        target: room$1,
        prevState: roomState,
        operation: transformedValue,
    });
    await em.flush();
    await room.GlobalRoom.Global.cleanOldRoomOp({
        em: em.fork(),
        room: room$1,
        roomHistCount,
    });
    await em.flush();
    const generateOperation = (deliverTo) => {
        return {
            __tstype: 'RoomOperation',
            revisionTo: prevRevision + 1,
            operatedBy: undefined,
            valueJson: room.GlobalRoom.Global.ToGraphQL.operation({
                prevState: roomState,
                nextState: nextRoomState,
                requestedBy: { type: FilePathModule.client, userUid: deliverTo },
            }),
        };
    };
    return result.Result.ok(generateOperation);
};
const operateParticipantAndFlush = async ({ myUserUid, em, room, roomHistCount, participantUserUids, create, update, }) => {
    const operation = (roomState) => {
        const me = roomState.participants?.[myUserUid];
        let participantOperation = undefined;
        if (me == null) {
            if (create != null) {
                participantOperation = {
                    type: FilePathModule.replace,
                    replace: {
                        newValue: {
                            $v: 2,
                            $r: 1,
                            name: create.name,
                            role: create.role,
                        },
                    },
                };
            }
        }
        else {
            if (update != null) {
                participantOperation = {
                    type: 'update',
                    update: {
                        $v: 2,
                        $r: 1,
                        role: update.role,
                        name: update.name,
                    },
                };
            }
        }
        if (participantOperation == null) {
            return undefined;
        }
        const roomUpOperation = {
            $v: 2,
            $r: 1,
            participants: {
                [myUserUid]: participantOperation,
            },
        };
        return roomUpOperation;
    };
    const generateOperationResult = await operateAsAdminAndFlush({
        operation,
        em,
        room,
        roomHistCount,
    });
    if (generateOperationResult.isError) {
        return {
            result: { failureType: JoinRoomFailureType.JoinRoomFailureType.TransformError },
            payload: undefined,
        };
    }
    if (generateOperationResult.value == null) {
        return {
            result: {},
            payload: undefined,
        };
    }
    const generateOperation = generateOperationResult.value;
    return {
        result: {
            operation: generateOperation(myUserUid),
        },
        payload: {
            type: 'roomOperationPayload',
            sendTo: participantUserUids,
            generateOperation,
            roomId: room.id,
        },
    };
};
const fixTextColor = (color) => {
    try {
        return Color(color).hex();
    }
    catch {
        return undefined;
    }
};
const analyzeTextAndSetToEntity = async (params) => {
    const defaultGameType = 'DiceBot';
    const analyzed = await messageAnalyzer.analyze({
        ...params,
        gameType: params.gameType ?? defaultGameType,
        text: params.textSource,
    });
    if (analyzed.isError) {
        return analyzed;
    }
    const targetEntity = params.type === 'RoomPubMsg'
        ? new entity$1.RoomPubMsg({
            initTextSource: params.textSource,
            initText: analyzed.value.message,
        })
        : new entity$1.RoomPrvMsg({
            initTextSource: params.textSource,
            initText: analyzed.value.message,
        });
    targetEntity.createdBy = core.Reference.create(params.createdBy);
    if (analyzed.value.diceResult != null) {
        if (analyzed.value.diceResult.isSecret) {
            targetEntity.isSecret = true;
            targetEntity.altTextToSecret = 'シークレットダイス';
            targetEntity.commandResult = analyzed.value.diceResult.result;
            targetEntity.commandIsSuccess = analyzed.value.diceResult.isSuccess ?? undefined;
        }
        else {
            targetEntity.commandResult = analyzed.value.diceResult.result;
            targetEntity.commandIsSuccess = analyzed.value.diceResult.isSuccess ?? undefined;
        }
    }
    return result.Result.ok(targetEntity);
};

exports.NotSignIn = NotSignIn;
exports.analyzeTextAndSetToEntity = analyzeTextAndSetToEntity;
exports.bcryptCompareNullable = bcryptCompareNullable;
exports.checkEntry = checkEntry;
exports.checkSignIn = checkSignIn;
exports.comparePassword = comparePassword;
exports.createRoomPrivateMessage = createRoomPrivateMessage;
exports.createRoomPrivateMessageUpdate = createRoomPrivateMessageUpdate;
exports.createRoomPublicMessage = createRoomPublicMessage;
exports.createRoomPublicMessageUpdate = createRoomPublicMessageUpdate;
exports.createUpdatedText = createUpdatedText;
exports.deleteSecretValues = deleteSecretValues;
exports.ensureAuthorizedUser = ensureAuthorizedUser;
exports.ensureUserUid = ensureUserUid;
exports.findRoomAndMyParticipant = findRoomAndMyParticipant;
exports.fixTextColor = fixTextColor;
exports.getRoomMessagesFromDb = getRoomMessagesFromDb;
exports.operateParticipantAndFlush = operateParticipantAndFlush;
exports.publishRoomEvent = publishRoomEvent;
//# sourceMappingURL=utils.js.map
