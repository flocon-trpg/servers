"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomMessageResolver = void 0;
const core_1 = require("@mikro-orm/core");
const color_1 = __importDefault(require("color"));
const type_graphql_1 = require("type-graphql");
const collection_1 = require("../../../@shared/collection");
const Constants_1 = require("../../../@shared/Constants");
const Result_1 = require("../../../@shared/Result");
const Set_1 = require("../../../@shared/Set");
const Types_1 = require("../../../@shared/Types");
const config_1 = require("../../../config");
const DeleteMessageFailureType_1 = require("../../../enums/DeleteMessageFailureType");
const EditMessageFailureType_1 = require("../../../enums/EditMessageFailureType");
const GetRoomLogFailureType_1 = require("../../../enums/GetRoomLogFailureType");
const GetRoomMessagesFailureType_1 = require("../../../enums/GetRoomMessagesFailureType");
const MakeMessageNotSecretFailureType_1 = require("../../../enums/MakeMessageNotSecretFailureType");
const ParticipantRole_1 = require("../../../enums/ParticipantRole");
const WritePrivateRoomMessageFailureType_1 = require("../../../enums/WritePrivateRoomMessageFailureType");
const WritePublicRoomMessageFailureType_1 = require("../../../enums/WritePublicRoomMessageFailureType");
const WriteRoomSoundEffectFailureType_1 = require("../../../enums/WriteRoomSoundEffectFailureType");
const main_1 = require("../../../messageAnalyzer/main");
const PromiseQueue_1 = require("../../../utils/PromiseQueue");
const mikro_orm_1 = require("../../entities/room/character/mikro-orm");
const graphql_1 = require("../../entities/filePath/graphql");
const graphql_2 = require("../../entities/roomMessage/graphql");
const mikro_orm_2 = require("../../entities/roomMessage/mikro-orm");
const Topics_1 = require("../../utils/Topics");
const helpers_1 = require("../utils/helpers");
const messages_1 = require("../utils/messages");
const roomMessage_1 = require("../utils/roomMessage");
const class_validator_1 = require("class-validator");
let WritePublicMessageArgs = class WritePublicMessageArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], WritePublicMessageArgs.prototype, "roomId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], WritePublicMessageArgs.prototype, "text", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    class_validator_1.MaxLength(10),
    __metadata("design:type", String)
], WritePublicMessageArgs.prototype, "textColor", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], WritePublicMessageArgs.prototype, "channelKey", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], WritePublicMessageArgs.prototype, "characterStateId", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], WritePublicMessageArgs.prototype, "customName", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true, description: 'BCDiceのgameType。' }),
    __metadata("design:type", String)
], WritePublicMessageArgs.prototype, "gameType", void 0);
WritePublicMessageArgs = __decorate([
    type_graphql_1.ArgsType()
], WritePublicMessageArgs);
let WritePrivateMessageArgs = class WritePrivateMessageArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], WritePrivateMessageArgs.prototype, "roomId", void 0);
__decorate([
    type_graphql_1.Field(() => [String]),
    __metadata("design:type", Array)
], WritePrivateMessageArgs.prototype, "visibleTo", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], WritePrivateMessageArgs.prototype, "text", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    class_validator_1.MaxLength(10),
    __metadata("design:type", String)
], WritePrivateMessageArgs.prototype, "textColor", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], WritePrivateMessageArgs.prototype, "characterStateId", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], WritePrivateMessageArgs.prototype, "customName", void 0);
WritePrivateMessageArgs = __decorate([
    type_graphql_1.ArgsType()
], WritePrivateMessageArgs);
let WriteRoomSoundEffectArgs = class WriteRoomSoundEffectArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], WriteRoomSoundEffectArgs.prototype, "roomId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", graphql_1.FilePath)
], WriteRoomSoundEffectArgs.prototype, "file", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], WriteRoomSoundEffectArgs.prototype, "volume", void 0);
WriteRoomSoundEffectArgs = __decorate([
    type_graphql_1.ArgsType()
], WriteRoomSoundEffectArgs);
let MessageIdArgs = class MessageIdArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], MessageIdArgs.prototype, "roomId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], MessageIdArgs.prototype, "messageId", void 0);
MessageIdArgs = __decorate([
    type_graphql_1.ArgsType()
], MessageIdArgs);
let EditMessageArgs = class EditMessageArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], EditMessageArgs.prototype, "roomId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], EditMessageArgs.prototype, "messageId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], EditMessageArgs.prototype, "text", void 0);
EditMessageArgs = __decorate([
    type_graphql_1.ArgsType()
], EditMessageArgs);
let GetMessagesArgs = class GetMessagesArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetMessagesArgs.prototype, "roomId", void 0);
GetMessagesArgs = __decorate([
    type_graphql_1.ArgsType()
], GetMessagesArgs);
let GetLogArgs = class GetLogArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetLogArgs.prototype, "roomId", void 0);
GetLogArgs = __decorate([
    type_graphql_1.ArgsType()
], GetLogArgs);
const checkChannelKey = (channelKey, isSpectator) => {
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
                return WritePublicRoomMessageFailureType_1.WritePublicRoomMessageFailureType.NotAuthorized;
            }
            return null;
        case Constants_1.$free:
            return null;
        case Constants_1.$system:
            return WritePublicRoomMessageFailureType_1.WritePublicRoomMessageFailureType.NotAuthorized;
        default:
            return WritePublicRoomMessageFailureType_1.WritePublicRoomMessageFailureType.NotAllowedChannelKey;
    }
};
const analyzeTextAndSetToEntity = async (params) => {
    var _a, _b, _c;
    const defaultGameType = 'DiceBot';
    const gameType = (_a = params.gameType) !== null && _a !== void 0 ? _a : defaultGameType;
    const rolled = await main_1.analyze(Object.assign(Object.assign({}, params), { gameType }));
    if (rolled.type === main_1.plain) {
        params.targetEntity.text = params.text;
    }
    else {
        if (rolled.isSecret) {
            params.targetEntity.isSecret = true;
            params.targetEntity.text = params.text;
            params.targetEntity.altTextToSecret = 'シークレットダイス';
            params.targetEntity.commandResult = rolled.result;
            params.targetEntity.commandIsSuccess = (_b = rolled.isSuccess) !== null && _b !== void 0 ? _b : undefined;
        }
        else {
            params.targetEntity.text = params.text;
            params.targetEntity.commandResult = rolled.result;
            params.targetEntity.commandIsSuccess = (_c = rolled.isSuccess) !== null && _c !== void 0 ? _c : undefined;
        }
    }
};
const toCharacterValueForMessage = (message) => {
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
const createRoomPublicMessage = ({ msg, channelKey, }) => {
    var _a, _b, _c, _d;
    return {
        __tstype: graphql_2.RoomPublicMessageType,
        channelKey,
        messageId: msg.id,
        text: (_a = msg.text) !== null && _a !== void 0 ? _a : undefined,
        textColor: (_b = msg.textColor) !== null && _b !== void 0 ? _b : undefined,
        commandResult: msg.commandResult == null ? undefined : {
            text: msg.commandResult,
            isSuccess: msg.commandIsSuccess,
        },
        altTextToSecret: (_c = msg.altTextToSecret) !== null && _c !== void 0 ? _c : undefined,
        isSecret: msg.isSecret,
        createdBy: (_d = msg.createdBy) === null || _d === void 0 ? void 0 : _d.userUid,
        character: toCharacterValueForMessage(msg),
        customName: msg.customName,
        createdAt: msg.createdAt.getTime(),
        updatedAt: msg.textUpdatedAt,
    };
};
const createRoomPrivateMessage = async ({ msg, myUserUid, visibleTo: visibleToCore, visibleToMe: visibleToMeCore, }) => {
    var _a, _b, _c, _d;
    const visibleTo = visibleToCore !== null && visibleToCore !== void 0 ? visibleToCore : (await msg.visibleTo.loadItems()).map(user => user.userUid);
    const visibleToMe = visibleToMeCore !== null && visibleToMeCore !== void 0 ? visibleToMeCore : visibleTo.find(userUid => userUid === myUserUid);
    if (!visibleToMe) {
        return null;
    }
    return {
        __tstype: graphql_2.RoomPrivateMessageType,
        messageId: msg.id,
        visibleTo: [...visibleTo].sort(),
        createdBy: (_a = msg.createdBy) === null || _a === void 0 ? void 0 : _a.userUid,
        character: toCharacterValueForMessage(msg),
        customName: msg.customName,
        createdAt: msg.createdAt.getTime(),
        updatedAt: msg.textUpdatedAt,
        text: (_b = msg.text) !== null && _b !== void 0 ? _b : undefined,
        textColor: (_c = msg.textColor) !== null && _c !== void 0 ? _c : undefined,
        commandResult: msg.commandResult == null ? undefined : {
            text: msg.commandResult,
            isSuccess: msg.commandIsSuccess,
        },
        altTextToSecret: (_d = msg.altTextToSecret) !== null && _d !== void 0 ? _d : undefined,
        isSecret: msg.isSecret,
    };
};
const fixTextColor = (color) => {
    try {
        return color_1.default(color).hex();
    }
    catch (_a) {
        return undefined;
    }
};
let RoomMessageResolver = class RoomMessageResolver {
    async getMessagesCore({ args, context }) {
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return { __tstype: graphql_2.GetRoomMessagesFailureResultType, failureType: GetRoomMessagesFailureType_1.GetRoomMessagesFailureType.NotSignIn };
        }
        const queue = async () => {
            var _a, _b, _c;
            const em = context.createEm();
            const entry = await helpers_1.checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return Result_1.ResultModule.ok({
                    __tstype: graphql_2.GetRoomMessagesFailureResultType,
                    failureType: GetRoomMessagesFailureType_1.GetRoomMessagesFailureType.NotEntry,
                });
            }
            const findResult = await helpers_1.findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return Result_1.ResultModule.ok({
                    __tstype: graphql_2.GetRoomMessagesFailureResultType,
                    failureType: GetRoomMessagesFailureType_1.GetRoomMessagesFailureType.RoomNotFound,
                });
            }
            const { room, me } = findResult;
            if ((me === null || me === void 0 ? void 0 : me.role) === undefined) {
                return Result_1.ResultModule.ok({
                    __tstype: graphql_2.GetRoomMessagesFailureResultType,
                    failureType: GetRoomMessagesFailureType_1.GetRoomMessagesFailureType.NotParticipant,
                });
            }
            const publicMessages = [];
            const publicChannels = [];
            for (const ch of await room.roomChatChs.loadItems()) {
                publicChannels.push({
                    __tstype: graphql_2.RoomPublicChannelType,
                    key: ch.key,
                    name: ch.name,
                });
                for (const msg of await ch.roomPubMsgs.loadItems()) {
                    const createdBy = (_a = msg.createdBy) === null || _a === void 0 ? void 0 : _a.userUid;
                    if (msg.isSecret && (createdBy !== decodedIdToken.uid)) {
                        continue;
                    }
                    publicMessages.push(createRoomPublicMessage({ msg, channelKey: ch.key }));
                }
            }
            const privateMessages = [];
            for (const msg of await room.roomPrvMsgs.loadItems()) {
                const createdBy = (_b = msg.createdBy) === null || _b === void 0 ? void 0 : _b.userUid;
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
            const soundEffects = [];
            for (const se of await room.roomSes.loadItems()) {
                const createdBy = (_c = se.createdBy) === null || _c === void 0 ? void 0 : _c.userUid;
                const graphQLValue = {
                    __tstype: graphql_2.RoomSoundEffectType,
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
            return Result_1.ResultModule.ok({
                __tstype: graphql_2.RoomMessagesType,
                publicMessages,
                privateMessages,
                publicChannels,
                soundEffects,
            });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === PromiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }
    getMessages(args, context) {
        return this.getMessagesCore({ args, context });
    }
    async getLogCore({ args, context }) {
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return {
                result: {
                    __tstype: graphql_2.GetRoomLogFailureResultType,
                    failureType: GetRoomLogFailureType_1.GetRoomLogFailureType.NotSignIn
                }
            };
        }
        const queue = async () => {
            var _a, _b;
            const em = context.createEm();
            const entry = await helpers_1.checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.GetRoomLogFailureResultType,
                        failureType: GetRoomLogFailureType_1.GetRoomLogFailureType.NotEntry,
                    }
                });
            }
            const findResult = await helpers_1.findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.GetRoomLogFailureResultType,
                        failureType: GetRoomLogFailureType_1.GetRoomLogFailureType.RoomNotFound,
                    }
                });
            }
            const { room, me } = findResult;
            if ((me === null || me === void 0 ? void 0 : me.role) === undefined) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.GetRoomLogFailureResultType,
                        failureType: GetRoomLogFailureType_1.GetRoomLogFailureType.NotParticipant,
                    }
                });
            }
            if (me.role === ParticipantRole_1.ParticipantRole.Spectator) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.GetRoomLogFailureResultType,
                        failureType: GetRoomLogFailureType_1.GetRoomLogFailureType.NotAuthorized,
                    }
                });
            }
            const publicMessages = [];
            const publicChannels = [];
            for (const ch of await room.roomChatChs.loadItems()) {
                publicChannels.push({
                    __tstype: graphql_2.RoomPublicChannelType,
                    key: ch.key,
                    name: ch.name,
                });
                for (const msg of await ch.roomPubMsgs.loadItems()) {
                    publicMessages.push(createRoomPublicMessage({ msg, channelKey: ch.key }));
                }
            }
            const privateMessages = [];
            for (const msg of await room.roomPrvMsgs.loadItems()) {
                const createdBy = (_a = msg.createdBy) === null || _a === void 0 ? void 0 : _a.userUid;
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
            const soundEffects = [];
            for (const se of await room.roomSes.loadItems()) {
                const createdBy = (_b = se.createdBy) === null || _b === void 0 ? void 0 : _b.userUid;
                const graphQLValue = {
                    __tstype: graphql_2.RoomSoundEffectType,
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
            const systemMessageEntity = await roomMessage_1.writeSystemMessage({ em, text: `${me.name}(${decodedIdToken.uid}) が全てのログを出力しました。`, room: room });
            await em.flush();
            return Result_1.ResultModule.ok({
                result: {
                    __tstype: graphql_2.RoomMessagesType,
                    publicMessages,
                    privateMessages,
                    publicChannels,
                    soundEffects,
                },
                payload: {
                    roomId: room.id,
                    value: createRoomPublicMessage({ msg: systemMessageEntity, channelKey: Constants_1.$system }),
                    createdBy: undefined,
                    visibleTo: undefined,
                }
            });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === PromiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }
    async getLog(args, context, pubSub) {
        const coreResult = await this.getLogCore({ args, context });
        if (coreResult.payload != null) {
            await pubSub.publish(Topics_1.ROOM_MESSAGE_UPDATE, coreResult.payload);
        }
        return coreResult.result;
    }
    async writePublicMessageCore({ args, context, channelKey }) {
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return {
                result: {
                    __tstype: graphql_2.WritePublicRoomMessageFailureResultType,
                    failureType: WritePublicRoomMessageFailureType_1.WritePublicRoomMessageFailureType.NotSignIn,
                }
            };
        }
        const queue = async () => {
            const em = context.createEm();
            const entry = await helpers_1.checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.WritePublicRoomMessageFailureResultType,
                        failureType: WritePublicRoomMessageFailureType_1.WritePublicRoomMessageFailureType.NotEntry,
                    }
                });
            }
            const findResult = await helpers_1.findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.WritePublicRoomMessageFailureResultType,
                        failureType: WritePublicRoomMessageFailureType_1.WritePublicRoomMessageFailureType.RoomNotFound,
                    }
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.WritePublicRoomMessageFailureResultType,
                        failureType: WritePublicRoomMessageFailureType_1.WritePublicRoomMessageFailureType.NotParticipant,
                    }
                });
            }
            const channelKeyFailureType = checkChannelKey(channelKey, me.role === ParticipantRole_1.ParticipantRole.Spectator);
            if (channelKeyFailureType != null) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.WritePublicRoomMessageFailureResultType,
                        failureType: WritePublicRoomMessageFailureType_1.WritePublicRoomMessageFailureType.NotAuthorized,
                    }
                });
            }
            const meAsUser = await me.user.load();
            const entity = new mikro_orm_2.RoomPubMsg();
            entity.text = args.text;
            entity.textColor = args.textColor == null ? undefined : fixTextColor(args.textColor);
            entity.createdBy = core_1.Reference.create(meAsUser);
            let ch = await em.findOne(mikro_orm_2.RoomPubCh, { key: channelKey, room: room.id });
            if (ch == null) {
                ch = new mikro_orm_2.RoomPubCh({ key: channelKey });
                ch.room = core_1.Reference.create(room);
                em.persist(ch);
            }
            entity.customName = args.customName;
            let chara = null;
            if (args.characterStateId != null) {
                chara = await em.findOne(mikro_orm_1.Chara, { createdBy: decodedIdToken.uid, stateId: args.characterStateId });
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
            entity.roomPubCh = core_1.Reference.create(ch);
            await em.persistAndFlush(entity);
            const result = createRoomPublicMessage({ msg: entity, channelKey });
            const payload = {
                roomId: args.roomId,
                createdBy: meAsUser.userUid,
                visibleTo: undefined,
                value: result,
            };
            return Result_1.ResultModule.ok({ result, payload });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === PromiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }
    async writePublicMessage(args, context, pubSub) {
        const coreResult = await this.writePublicMessageCore({ args, context, channelKey: args.channelKey });
        if (coreResult.payload != null) {
            await pubSub.publish(Topics_1.ROOM_MESSAGE_UPDATE, coreResult.payload);
        }
        return coreResult.result;
    }
    async writePrivateMessageCore({ args, context }) {
        if (args.visibleTo.length >= 1000) {
            throw 'visibleTo.length is too large';
        }
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return {
                result: {
                    __tstype: graphql_2.WritePrivateRoomMessageFailureResultType,
                    failureType: WritePrivateRoomMessageFailureType_1.WritePrivateRoomMessageFailureType.NotSignIn,
                }
            };
        }
        const queue = async () => {
            const em = context.createEm();
            const entry = await helpers_1.checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.WritePrivateRoomMessageFailureResultType,
                        failureType: WritePrivateRoomMessageFailureType_1.WritePrivateRoomMessageFailureType.NotEntry,
                    }
                });
            }
            const findResult = await helpers_1.findRoomAndMyParticipantAndParitipantUserUids({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.WritePrivateRoomMessageFailureResultType,
                        failureType: WritePrivateRoomMessageFailureType_1.WritePrivateRoomMessageFailureType.RoomNotFound,
                    }
                });
            }
            const { room, me, participantUserUids, participantUsers } = findResult;
            if (me === undefined) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.WritePrivateRoomMessageFailureResultType,
                        failureType: WritePrivateRoomMessageFailureType_1.WritePrivateRoomMessageFailureType.NotParticipant,
                    }
                });
            }
            const meAsUser = await me.user.load();
            const visibleTo = new Set(args.visibleTo);
            visibleTo.add(decodedIdToken.uid);
            const visibleToIsOk = collection_1.__(Set_1.groupJoin(visibleTo, new Set(participantUserUids))).forAll(({ value }) => value !== Types_1.left);
            if (!visibleToIsOk) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.WritePrivateRoomMessageFailureResultType,
                        failureType: WritePrivateRoomMessageFailureType_1.WritePrivateRoomMessageFailureType.VisibleToIsInvalid,
                    }
                });
            }
            await meAsUser.visibleRoomPrvMsgs.init({ where: { room: { id: room.id } } });
            const entity = new mikro_orm_2.RoomPrvMsg();
            entity.text = args.text;
            args.textColor == null ? undefined : fixTextColor(args.textColor);
            entity.createdBy = core_1.Reference.create(meAsUser);
            for (const participantUserRef of participantUsers) {
                const participantUser = await participantUserRef.load();
                if (visibleTo.has(participantUser.userUid)) {
                    participantUser.visibleRoomPrvMsgs.add(entity);
                    entity.visibleTo.add(participantUser);
                }
            }
            entity.customName = args.customName;
            let chara = null;
            if (args.characterStateId != null) {
                chara = await em.findOne(mikro_orm_1.Chara, { createdBy: decodedIdToken.uid, stateId: args.characterStateId });
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
            entity.room = core_1.Reference.create(room);
            await em.persistAndFlush(entity);
            const visibleToArray = [...visibleTo].sort();
            const result = await createRoomPrivateMessage({ msg: entity, myUserUid: meAsUser.userUid, visibleTo: visibleToArray, visibleToMe: true });
            if (result == null) {
                throw 'This should not happen';
            }
            const payload = {
                roomId: args.roomId,
                createdBy: meAsUser.userUid,
                visibleTo: visibleToArray,
                value: result,
            };
            return Result_1.ResultModule.ok({ result, payload });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === PromiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }
    async writePrivateMessage(args, context, pubSub) {
        const coreResult = await this.writePrivateMessageCore({ args, context });
        if (coreResult.payload != null) {
            await pubSub.publish(Topics_1.ROOM_MESSAGE_UPDATE, coreResult.payload);
        }
        return coreResult.result;
    }
    async writeRoomSoundEffectCore({ args, context }) {
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return {
                result: {
                    __tstype: graphql_2.WriteRoomSoundEffectFailureResultType,
                    failureType: WriteRoomSoundEffectFailureType_1.WriteRoomSoundEffectFailureType.NotSignIn
                }
            };
        }
        const queue = async () => {
            const em = context.createEm();
            const entry = await helpers_1.checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.WriteRoomSoundEffectFailureResultType,
                        failureType: WriteRoomSoundEffectFailureType_1.WriteRoomSoundEffectFailureType.NotEntry,
                    }
                });
            }
            const findResult = await helpers_1.findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.WriteRoomSoundEffectFailureResultType,
                        failureType: WriteRoomSoundEffectFailureType_1.WriteRoomSoundEffectFailureType.RoomNotFound,
                    }
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.WriteRoomSoundEffectFailureResultType,
                        failureType: WriteRoomSoundEffectFailureType_1.WriteRoomSoundEffectFailureType.NotParticipant,
                    }
                });
            }
            if (me.role === ParticipantRole_1.ParticipantRole.Spectator) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.WriteRoomSoundEffectFailureResultType,
                        failureType: WriteRoomSoundEffectFailureType_1.WriteRoomSoundEffectFailureType.NotAuthorized,
                    }
                });
            }
            const meAsUser = await me.user.load();
            const entity = new mikro_orm_2.RoomSe({
                filePath: args.file.path,
                fileSourceType: args.file.sourceType,
                volume: args.volume,
            });
            entity.createdBy = core_1.Reference.create(meAsUser);
            entity.room = core_1.Reference.create(room);
            await em.persistAndFlush(entity);
            const result = Object.assign(Object.assign({}, entity), { __tstype: graphql_2.RoomSoundEffectType, messageId: entity.id, createdBy: meAsUser.userUid, createdAt: entity.createdAt.getTime(), file: {
                    path: entity.filePath,
                    sourceType: entity.fileSourceType,
                } });
            const payload = {
                roomId: args.roomId,
                createdBy: meAsUser.userUid,
                visibleTo: undefined,
                value: result,
            };
            return Result_1.ResultModule.ok({ result, payload });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === PromiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }
    async writeRoomSoundEffect(args, context, pubSub) {
        const coreResult = await this.writeRoomSoundEffectCore({ args, context });
        if (coreResult.payload != null) {
            await pubSub.publish(Topics_1.ROOM_MESSAGE_UPDATE, coreResult.payload);
        }
        return coreResult.result;
    }
    async makeMessageNotSecretCore({ args, context }) {
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return {
                result: {
                    failureType: MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType.NotSignIn
                }
            };
        }
        const queue = async () => {
            var _a, _b, _c, _d;
            const em = context.createEm();
            const entry = await helpers_1.checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return Result_1.ResultModule.ok({
                    result: {
                        failureType: MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType.NotEntry,
                    }
                });
            }
            const findResult = await helpers_1.findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return Result_1.ResultModule.ok({
                    result: {
                        failureType: MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType.RoomNotFound,
                    }
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return Result_1.ResultModule.ok({
                    result: {
                        failureType: MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType.NotParticipant,
                    }
                });
            }
            const publicMsg = await em.findOne(mikro_orm_2.RoomPubMsg, { id: args.messageId });
            if (publicMsg != null) {
                if (((_a = publicMsg.createdBy) === null || _a === void 0 ? void 0 : _a.userUid) !== decodedIdToken.uid) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType.NotYourMessage,
                        }
                    });
                }
                if (!publicMsg.isSecret) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType.NotSecret,
                        }
                    });
                }
                publicMsg.isSecret = false;
                await em.flush();
                const payloadValue = {
                    __tstype: graphql_2.RoomPublicMessageUpdateType,
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
                return Result_1.ResultModule.ok({
                    result: {},
                    payload: {
                        roomId: room.id,
                        visibleTo: undefined,
                        createdBy: (_b = publicMsg.createdBy) === null || _b === void 0 ? void 0 : _b.userUid,
                        value: payloadValue,
                    },
                });
            }
            const privateMsg = await em.findOne(mikro_orm_2.RoomPrvMsg, { id: args.messageId });
            if (privateMsg != null) {
                if (((_c = privateMsg.createdBy) === null || _c === void 0 ? void 0 : _c.userUid) !== decodedIdToken.uid) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType.NotYourMessage,
                        }
                    });
                }
                if (!privateMsg.isSecret) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType.NotSecret,
                        }
                    });
                }
                privateMsg.isSecret = false;
                await em.flush();
                const payloadValue = {
                    __tstype: graphql_2.RoomPrivateMessageUpdateType,
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
                return Result_1.ResultModule.ok({
                    result: {},
                    payload: {
                        roomId: room.id,
                        visibleTo: (await privateMsg.visibleTo.loadItems()).map(user => user.userUid),
                        createdBy: (_d = privateMsg.createdBy) === null || _d === void 0 ? void 0 : _d.userUid,
                        value: payloadValue,
                    }
                });
            }
            return Result_1.ResultModule.ok({
                result: {
                    failureType: MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType.MessageNotFound,
                }
            });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === PromiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }
    async makeMessageNotSecret(args, context, pubSub) {
        const coreResult = await this.makeMessageNotSecretCore({ args, context });
        if (coreResult.payload != null) {
            await pubSub.publish(Topics_1.ROOM_MESSAGE_UPDATE, coreResult.payload);
        }
        return coreResult.result;
    }
    async deleteMessageCore({ args, context }) {
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return {
                result: {
                    failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.NotSignIn
                }
            };
        }
        const queue = async () => {
            var _a, _b, _c, _d;
            const em = context.createEm();
            const entry = await helpers_1.checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return Result_1.ResultModule.ok({
                    result: {
                        failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.NotEntry,
                    }
                });
            }
            const findResult = await helpers_1.findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return Result_1.ResultModule.ok({
                    result: {
                        failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.RoomNotFound,
                    }
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return Result_1.ResultModule.ok({
                    result: {
                        failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.NotParticipant,
                    }
                });
            }
            const publicMsg = await em.findOne(mikro_orm_2.RoomPubMsg, { id: args.messageId });
            if (publicMsg != null) {
                if (((_a = publicMsg.createdBy) === null || _a === void 0 ? void 0 : _a.userUid) !== decodedIdToken.uid) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.NotYourMessage,
                        }
                    });
                }
                if (publicMsg.text == null && publicMsg.altTextToSecret == null && publicMsg.commandResult == null) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.MessageDeleted,
                        }
                    });
                }
                publicMsg.text = undefined;
                publicMsg.altTextToSecret = undefined;
                publicMsg.commandResult = undefined;
                publicMsg.isSecret = false;
                publicMsg.textUpdatedAt = new Date().getTime();
                await em.flush();
                const payloadValue = {
                    __tstype: graphql_2.RoomPublicMessageUpdateType,
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
                return Result_1.ResultModule.ok({
                    result: {},
                    payload: {
                        roomId: room.id,
                        visibleTo: undefined,
                        createdBy: (_b = publicMsg.createdBy) === null || _b === void 0 ? void 0 : _b.userUid,
                        value: payloadValue,
                    }
                });
            }
            const privateMsg = await em.findOne(mikro_orm_2.RoomPrvMsg, { id: args.messageId });
            if (privateMsg != null) {
                if (((_c = privateMsg.createdBy) === null || _c === void 0 ? void 0 : _c.userUid) !== decodedIdToken.uid) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.NotYourMessage,
                        }
                    });
                }
                if (privateMsg.text == null && privateMsg.altTextToSecret == null && privateMsg.commandResult == null) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.MessageDeleted,
                        }
                    });
                }
                privateMsg.text = undefined;
                privateMsg.altTextToSecret = undefined;
                privateMsg.commandResult = undefined;
                privateMsg.isSecret = false;
                privateMsg.textUpdatedAt = new Date().getTime();
                await em.flush();
                const payloadValue = {
                    __tstype: graphql_2.RoomPrivateMessageUpdateType,
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
                return Result_1.ResultModule.ok({
                    result: {},
                    payload: {
                        roomId: room.id,
                        visibleTo: (await privateMsg.visibleTo.loadItems()).map(user => user.userUid),
                        createdBy: (_d = privateMsg.createdBy) === null || _d === void 0 ? void 0 : _d.userUid,
                        value: payloadValue,
                    }
                });
            }
            return Result_1.ResultModule.ok({
                result: {
                    failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.MessageNotFound,
                }
            });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === PromiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }
    async deleteMessage(args, context, pubSub) {
        const coreResult = await this.deleteMessageCore({ args, context });
        if (coreResult.payload != null) {
            await pubSub.publish(Topics_1.ROOM_MESSAGE_UPDATE, coreResult.payload);
        }
        return coreResult.result;
    }
    async editMessageCore({ args, context }) {
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return {
                result: {
                    failureType: EditMessageFailureType_1.EditMessageFailureType.NotSignIn
                }
            };
        }
        const queue = async () => {
            var _a, _b, _c, _d;
            const em = context.createEm();
            const entry = await helpers_1.checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return Result_1.ResultModule.ok({
                    result: {
                        failureType: EditMessageFailureType_1.EditMessageFailureType.NotEntry,
                    }
                });
            }
            const findResult = await helpers_1.findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return Result_1.ResultModule.ok({
                    result: {
                        failureType: EditMessageFailureType_1.EditMessageFailureType.RoomNotFound,
                    }
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return Result_1.ResultModule.ok({
                    result: {
                        failureType: EditMessageFailureType_1.EditMessageFailureType.NotParticipant,
                    }
                });
            }
            const publicMsg = await em.findOne(mikro_orm_2.RoomPubMsg, { id: args.messageId });
            if (publicMsg != null) {
                if (((_a = publicMsg.createdBy) === null || _a === void 0 ? void 0 : _a.userUid) !== decodedIdToken.uid) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: EditMessageFailureType_1.EditMessageFailureType.NotYourMessage,
                        }
                    });
                }
                if (publicMsg.text == null) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: EditMessageFailureType_1.EditMessageFailureType.MessageDeleted,
                        }
                    });
                }
                publicMsg.text = args.text;
                publicMsg.textUpdatedAt = new Date().getTime();
                await em.flush();
                const payloadValue = {
                    __tstype: graphql_2.RoomPublicMessageUpdateType,
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
                return Result_1.ResultModule.ok({
                    result: {},
                    payload: {
                        roomId: room.id,
                        visibleTo: undefined,
                        createdBy: (_b = publicMsg.createdBy) === null || _b === void 0 ? void 0 : _b.userUid,
                        value: payloadValue,
                    }
                });
            }
            const privateMsg = await em.findOne(mikro_orm_2.RoomPrvMsg, { id: args.messageId });
            if (privateMsg != null) {
                if (((_c = privateMsg.createdBy) === null || _c === void 0 ? void 0 : _c.userUid) !== decodedIdToken.uid) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: EditMessageFailureType_1.EditMessageFailureType.NotYourMessage,
                        }
                    });
                }
                if (privateMsg.text == null) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: EditMessageFailureType_1.EditMessageFailureType.MessageDeleted,
                        }
                    });
                }
                privateMsg.text = args.text;
                privateMsg.textUpdatedAt = new Date().getTime();
                await em.flush();
                const payloadValue = {
                    __tstype: graphql_2.RoomPrivateMessageUpdateType,
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
                return Result_1.ResultModule.ok({
                    result: {},
                    payload: {
                        roomId: room.id,
                        visibleTo: (await privateMsg.visibleTo.loadItems()).map(user => user.userUid),
                        createdBy: (_d = privateMsg.createdBy) === null || _d === void 0 ? void 0 : _d.userUid,
                        value: payloadValue,
                    }
                });
            }
            return Result_1.ResultModule.ok({
                result: {
                    failureType: EditMessageFailureType_1.EditMessageFailureType.MessageNotFound,
                }
            });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === PromiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }
    async editMessage(args, context, pubSub) {
        const coreResult = await this.editMessageCore({ args, context });
        if (coreResult.payload != null) {
            await pubSub.publish(Topics_1.ROOM_MESSAGE_UPDATE, coreResult.payload);
        }
        return coreResult.result;
    }
    messageEvent(payload, roomId, context) {
        if (payload == null) {
            return undefined;
        }
        if (roomId !== payload.roomId) {
            return undefined;
        }
        if (context.decodedIdToken == null || context.decodedIdToken.isError) {
            return undefined;
        }
        const userUid = context.decodedIdToken.value.uid;
        if (payload.value.__tstype === graphql_2.RoomPrivateMessageType) {
            if (payload.value.visibleTo.every(vt => vt !== userUid)) {
                return undefined;
            }
        }
        if (payload.value.__tstype === graphql_2.RoomPrivateMessageUpdateType) {
            if (payload.visibleTo == null) {
                throw 'payload.visibleTo is required.';
            }
            if (payload.visibleTo.every(vt => vt !== userUid)) {
                return undefined;
            }
        }
        switch (payload.value.__tstype) {
            case graphql_2.RoomPrivateMessageType:
            case graphql_2.RoomPublicMessageType: {
                if (payload.value.isSecret && (payload.value.createdBy !== userUid)) {
                    return Object.assign(Object.assign({}, payload.value), { text: undefined, commandResult: undefined });
                }
                break;
            }
            case graphql_2.RoomPrivateMessageUpdateType:
            case graphql_2.RoomPublicMessageUpdateType:
                if (payload.value.isSecret && (payload.createdBy !== userUid)) {
                    return Object.assign(Object.assign({}, payload.value), { text: undefined, commandResult: undefined });
                }
                break;
        }
        return payload.value;
    }
};
__decorate([
    type_graphql_1.Query(() => graphql_2.GetRoomMessagesResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GetMessagesArgs, Object]),
    __metadata("design:returntype", Promise)
], RoomMessageResolver.prototype, "getMessages", null);
__decorate([
    type_graphql_1.Query(() => graphql_2.GetRoomLogResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GetLogArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomMessageResolver.prototype, "getLog", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.WritePublicRoomMessageResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WritePublicMessageArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomMessageResolver.prototype, "writePublicMessage", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.WritePrivateRoomMessageResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WritePrivateMessageArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomMessageResolver.prototype, "writePrivateMessage", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.WriteRoomSoundEffectResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WriteRoomSoundEffectArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomMessageResolver.prototype, "writeRoomSoundEffect", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.MakeMessageNotSecretResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MessageIdArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomMessageResolver.prototype, "makeMessageNotSecret", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.DeleteMessageResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MessageIdArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomMessageResolver.prototype, "deleteMessage", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.EditMessageResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [EditMessageArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomMessageResolver.prototype, "editMessage", null);
__decorate([
    type_graphql_1.Subscription(() => graphql_2.RoomMessageEvent, { topics: Topics_1.ROOM_MESSAGE_UPDATE, nullable: true }),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Arg('roomId')), __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Object)
], RoomMessageResolver.prototype, "messageEvent", null);
RoomMessageResolver = __decorate([
    type_graphql_1.Resolver()
], RoomMessageResolver);
exports.RoomMessageResolver = RoomMessageResolver;
