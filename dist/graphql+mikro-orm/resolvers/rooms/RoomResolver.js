"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.RoomResolver = void 0;
const type_graphql_1 = require("type-graphql");
const ParticipantRole_1 = require("../../../enums/ParticipantRole");
const GetRoomFailureType_1 = require("../../../enums/GetRoomFailureType");
const GetRoomsListFailureType_1 = require("../../../enums/GetRoomsListFailureType");
const CreateRoomFailureType_1 = require("../../../enums/CreateRoomFailureType");
const helpers_1 = require("../utils/helpers");
const JoinRoomFailureType_1 = require("../../../enums/JoinRoomFailureType");
const Room$MikroORM = __importStar(require("../../entities/room/mikro-orm"));
const global_1 = require("../../entities/roomAsListItem/global");
const PromiseQueue_1 = require("../../../utils/PromiseQueue");
const messages_1 = require("../utils/messages");
const graphql_1 = require("../../entities/room/graphql");
const OperateRoomFailureType_1 = require("../../../enums/OperateRoomFailureType");
const Topics_1 = require("../../utils/Topics");
const Result_1 = require("../../../@shared/Result");
const LeaveRoomFailureType_1 = require("../../../enums/LeaveRoomFailureType");
const config_1 = require("../../../config");
const mikro_orm_1 = require("../../entities/room/participant/mikro-orm");
const RequiresPhraseFailureType_1 = require("../../../enums/RequiresPhraseFailureType");
const OperateRoomResult_1 = require("../../results/OperateRoomResult");
const JoinRoomResult_1 = require("../../results/JoinRoomResult");
const GetRoomsListResult_1 = require("../../results/GetRoomsListResult");
const RequiresPhraseResult_1 = require("../../results/RequiresPhraseResult");
const CreateRoomResult_1 = require("../../results/CreateRoomResult");
const GetRoomResult_1 = require("../../results/GetRoomResult");
const LeaveRoomResult_1 = require("../../results/LeaveRoomResult");
const PromoteMeResult_1 = require("../../results/PromoteMeResult");
const PromoteFailureType_1 = require("../../../enums/PromoteFailureType");
const ChangeParticipantNameResult_1 = require("../../results/ChangeParticipantNameResult");
const ChangeParticipantNameFailureType_1 = require("../../../enums/ChangeParticipantNameFailureType");
const DeleteRoomResult_1 = require("../../results/DeleteRoomResult");
const DeleteRoomFailureType_1 = require("../../../enums/DeleteRoomFailureType");
const global_2 = require("../../entities/room/global");
const Types_1 = require("../../Types");
const global_3 = require("../../entities/room/participant/global");
const mapOperations_1 = require("../../mapOperations");
const global_4 = require("../../entities/room/participant/myValue/global");
const collection_1 = require("../../../@shared/collection");
const mikro_orm_2 = require("../../entities/roomMessage/mikro-orm");
const args_input_1 = require("./args+input");
const graphql_2 = require("../../entities/roomMessage/graphql");
const WritePublicRoomMessageFailureType_1 = require("../../../enums/WritePublicRoomMessageFailureType");
const Constants_1 = require("../../../@shared/Constants");
const mikro_orm_3 = require("../../entities/room/character/mikro-orm");
const main_1 = require("../../../messageAnalyzer/main");
const color_1 = __importDefault(require("color"));
const GetRoomMessagesFailureType_1 = require("../../../enums/GetRoomMessagesFailureType");
const global_5 = require("../../entities/roomMessage/global");
const GetRoomLogFailureType_1 = require("../../../enums/GetRoomLogFailureType");
const roomMessage_1 = require("../utils/roomMessage");
const core_1 = require("@mikro-orm/core");
const WritePrivateRoomMessageFailureType_1 = require("../../../enums/WritePrivateRoomMessageFailureType");
const Set_1 = require("../../../@shared/Set");
const Types_2 = require("../../../@shared/Types");
const WriteRoomSoundEffectFailureType_1 = require("../../../enums/WriteRoomSoundEffectFailureType");
const MakeMessageNotSecretFailureType_1 = require("../../../enums/MakeMessageNotSecretFailureType");
const DeleteMessageFailureType_1 = require("../../../enums/DeleteMessageFailureType");
const EditMessageFailureType_1 = require("../../../enums/EditMessageFailureType");
const operateParticipantAndFlush = async ({ myUserUid, em, room, participantUserUids, create, update, }) => {
    const prevRevision = room.revision;
    const roomState = await global_2.GlobalRoom.MikroORM.ToGlobal.state(room);
    const me = roomState.participants.get(myUserUid);
    const participantsOperation = new Map();
    if (me == null) {
        if (create != null) {
            participantsOperation.set(myUserUid, {
                type: mapOperations_1.replace,
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
    }
    else {
        if (update != null) {
            const operation = global_3.GlobalParticipant.transformerFactory({ type: Types_1.server }).diff({
                key: myUserUid,
                prevState: me,
                nextState: Object.assign(Object.assign({}, me), { role: update.role === undefined ? me.role : update.role.newValue, name: update.name === undefined ? me.name : update.name.newValue }),
            });
            if (operation !== undefined) {
                participantsOperation.set(myUserUid, {
                    type: 'update',
                    operation,
                });
            }
        }
    }
    const roomOperation = Object.assign(Object.assign({}, global_2.GlobalRoom.Global.emptyTwoWayOperation()), { participants: participantsOperation });
    await global_2.GlobalRoom.Global.applyToEntity({ em, target: room, operation: roomOperation });
    await em.flush();
    const nextRoomState = await global_2.GlobalRoom.MikroORM.ToGlobal.state(room);
    const generateOperation = (deliverTo) => {
        const value = global_2.GlobalRoom.Global.ToGraphQL.operation({
            operation: roomOperation,
            prevState: roomState,
            nextState: nextRoomState,
            requestedBy: { type: Types_1.client, userUid: deliverTo },
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
            participants: participantUserUids,
            generateOperation,
            roomId: room.id,
        },
    };
};
const joinRoomCore = async ({ args, context, globalEntryPhrase, strategy, }) => {
    const decodedIdToken = helpers_1.checkSignIn(context);
    if (decodedIdToken === helpers_1.NotSignIn) {
        return { result: { failureType: JoinRoomFailureType_1.JoinRoomFailureType.NotSignIn }, payload: undefined };
    }
    const queue = async () => {
        const em = context.createEm();
        const entryUser = await helpers_1.getUserIfEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase, });
        await em.flush();
        if (entryUser == null) {
            return {
                result: {
                    failureType: JoinRoomFailureType_1.JoinRoomFailureType.NotEntry,
                },
                payload: undefined,
            };
        }
        const findResult = await helpers_1.findRoomAndMyParticipantAndParitipantUserUids({ em, userUid: decodedIdToken.uid, roomId: args.id });
        if (findResult == null) {
            return {
                result: {
                    failureType: JoinRoomFailureType_1.JoinRoomFailureType.NotFound,
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
            case JoinRoomFailureType_1.JoinRoomFailureType.WrongPhrase: {
                return {
                    result: {
                        failureType: JoinRoomFailureType_1.JoinRoomFailureType.WrongPhrase,
                    },
                    payload: undefined,
                };
            }
            case JoinRoomFailureType_1.JoinRoomFailureType.AlreadyParticipant: {
                return {
                    result: {
                        failureType: JoinRoomFailureType_1.JoinRoomFailureType.AlreadyParticipant,
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
    if (result.type === PromiseQueue_1.queueLimitReached) {
        throw messages_1.serverTooBusyMessage;
    }
    return result.value;
};
const promoteMeCore = async ({ roomId, context, globalEntryPhrase, strategy, }) => {
    const decodedIdToken = helpers_1.checkSignIn(context);
    if (decodedIdToken === helpers_1.NotSignIn) {
        return { result: { failureType: PromoteFailureType_1.PromoteFailureType.NotSignIn }, payload: undefined };
    }
    const queue = async () => {
        const em = context.createEm();
        const entryUser = await helpers_1.getUserIfEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase, });
        await em.flush();
        if (entryUser == null) {
            return {
                result: {
                    failureType: PromoteFailureType_1.PromoteFailureType.NotEntry,
                },
                payload: undefined,
            };
        }
        const findResult = await helpers_1.findRoomAndMyParticipantAndParitipantUserUids({ em, userUid: decodedIdToken.uid, roomId });
        if (findResult == null) {
            return {
                result: {
                    failureType: PromoteFailureType_1.PromoteFailureType.NotFound,
                },
                payload: undefined,
            };
        }
        const { room, me, participantUserUids } = findResult;
        if (me == null) {
            return {
                result: {
                    failureType: PromoteFailureType_1.PromoteFailureType.NotParticipant,
                },
                payload: undefined,
            };
        }
        const strategyResult = strategy({ me, room });
        switch (strategyResult) {
            case PromoteFailureType_1.PromoteFailureType.NoNeedToPromote: {
                return {
                    result: {
                        failureType: PromoteFailureType_1.PromoteFailureType.NoNeedToPromote,
                    },
                    payload: undefined,
                };
            }
            case PromoteFailureType_1.PromoteFailureType.WrongPhrase: {
                return {
                    result: {
                        failureType: PromoteFailureType_1.PromoteFailureType.WrongPhrase,
                    },
                    payload: undefined,
                };
            }
            case PromoteFailureType_1.PromoteFailureType.NotParticipant: {
                return {
                    result: {
                        failureType: PromoteFailureType_1.PromoteFailureType.NotParticipant,
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
    if (result.type === PromiseQueue_1.queueLimitReached) {
        throw messages_1.serverTooBusyMessage;
    }
    return result.value;
};
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
let RoomResolver = class RoomResolver {
    async getRoomsListCore({ context, globalEntryPhrase }) {
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return { failureType: GetRoomsListFailureType_1.GetRoomsListFailureType.NotSignIn };
        }
        const queue = async () => {
            const em = context.createEm();
            const entry = await helpers_1.checkEntry({ em, userUid: decodedIdToken.uid, globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return {
                    failureType: GetRoomsListFailureType_1.GetRoomsListFailureType.NotEntry,
                };
            }
            const roomModels = await em.find(Room$MikroORM.Room, {});
            const rooms = roomModels.map(model => global_1.stateToGraphQL({ roomEntity: model }));
            return {
                rooms,
            };
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === PromiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        return result.value;
    }
    getRoomsList(context) {
        return this.getRoomsListCore({ context, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
    }
    async requiresPhraseToJoinAsPlayerCore({ roomId, context, globalEntryPhrase }) {
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return { failureType: RequiresPhraseFailureType_1.RequiresPhraseFailureType.NotSignIn };
        }
        const queue = async () => {
            const em = context.createEm();
            const entry = await helpers_1.checkEntry({ em, userUid: decodedIdToken.uid, globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return {
                    failureType: RequiresPhraseFailureType_1.RequiresPhraseFailureType.NotEntry,
                };
            }
            const room = await em.findOne(Room$MikroORM.Room, { id: roomId });
            if (room == null) {
                return {
                    failureType: RequiresPhraseFailureType_1.RequiresPhraseFailureType.NotFound,
                };
            }
            return {
                value: room.joinAsPlayerPhrase != null,
            };
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === PromiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        return result.value;
    }
    requiresPhraseToJoinAsPlayer(roomId, context) {
        return this.requiresPhraseToJoinAsPlayerCore({ roomId, context, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
    }
    async createRoomCore({ input, context, globalEntryPhrase }) {
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return { failureType: CreateRoomFailureType_1.CreateRoomFailureType.NotSignIn };
        }
        const queue = async () => {
            const em = context.createEm();
            const entryUser = await helpers_1.getUserIfEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase, });
            await em.flush();
            if (entryUser == null) {
                return {
                    failureType: CreateRoomFailureType_1.CreateRoomFailureType.NotEntry,
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
            const newParticipant = new mikro_orm_1.Partici({ role: ParticipantRole_1.ParticipantRole.Master, name: input.participantName, user: entryUser, room: newRoom });
            newRoom.joinAsPlayerPhrase = input.joinAsPlayerPhrase;
            newRoom.joinAsSpectatorPhrase = input.joinAsSpectatorPhrase;
            const revision = newRoom.revision;
            em.persist(newParticipant);
            em.persist(newRoom);
            const roomState = await global_2.GlobalRoom.MikroORM.ToGlobal.state(newRoom);
            const graphqlState = global_2.GlobalRoom.Global.ToGraphQL.state({
                source: roomState,
                requestedBy: { type: Types_1.client, userUid: decodedIdToken.uid },
            });
            await em.flush();
            return {
                room: Object.assign(Object.assign({}, graphqlState), { revision, createdBy: decodedIdToken.uid }),
                id: newRoom.id,
            };
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === PromiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        return result.value;
    }
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
            const myValueLogs = [];
            for (const partici of await room.particis.loadItems()) {
                for (const msg of await partici.myValueLogs.loadItems()) {
                    myValueLogs.push(global_5.MyValueLog.MikroORM.ToGraphQL.state({ entity: msg, stateUserUid: partici.user.userUid }));
                }
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
                myValueLogs,
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
            const myValueLogs = [];
            for (const partici of await room.particis.loadItems()) {
                for (const msg of await partici.myValueLogs.loadItems()) {
                    myValueLogs.push(global_5.MyValueLog.MikroORM.ToGraphQL.state({ entity: msg, stateUserUid: partici.user.userUid }));
                }
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
                    myValueLogs,
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
                chara = await em.findOne(mikro_orm_3.Chara, { createdBy: decodedIdToken.uid, stateId: args.characterStateId });
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
    createRoom(input, context) {
        return this.createRoomCore({ input, context, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
    }
    async deleteRoomCore({ args, context, globalEntryPhrase }) {
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return {
                result: { failureType: DeleteRoomFailureType_1.DeleteRoomFailureType.NotSignIn },
                payload: undefined,
            };
        }
        const queue = async () => {
            const em = context.createEm();
            const entry = await helpers_1.checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase, });
            await em.flush();
            if (!entry) {
                return {
                    result: { failureType: DeleteRoomFailureType_1.DeleteRoomFailureType.NotEntry },
                    payload: undefined,
                };
            }
            const room = await em.findOne(Room$MikroORM.Room, { id: args.id });
            if (room == null) {
                return {
                    result: { failureType: DeleteRoomFailureType_1.DeleteRoomFailureType.NotFound },
                    payload: undefined,
                };
            }
            const roomId = room.id;
            if (room.createdBy !== decodedIdToken.uid) {
                return {
                    result: { failureType: DeleteRoomFailureType_1.DeleteRoomFailureType.NotCreatedByYou },
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
        if (result.type === PromiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        return result.value;
    }
    async deleteRoom(args, context, pubSub) {
        const { result, payload } = await this.deleteRoomCore({ args, context, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
        if (payload != null) {
            await pubSub.publish(Topics_1.ROOM_OPERATED, payload);
        }
        return result;
    }
    async joinRoomAsPlayerCore({ args, context, globalEntryPhrase }) {
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
                            return JoinRoomFailureType_1.JoinRoomFailureType.AlreadyParticipant;
                    }
                }
                if (room.joinAsPlayerPhrase != null && room.joinAsPlayerPhrase !== args.phrase) {
                    return JoinRoomFailureType_1.JoinRoomFailureType.WrongPhrase;
                }
                return ParticipantRole_1.ParticipantRole.Player;
            }
        });
    }
    async joinRoomAsPlayer(args, context, pubSub) {
        const { result, payload } = await this.joinRoomAsPlayerCore({ args, context, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
        if (payload != null) {
            await pubSub.publish(Topics_1.ROOM_OPERATED, payload);
        }
        return result;
    }
    async joinRoomAsSpectatorCore({ args, context, globalEntryPhrase }) {
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
                            return JoinRoomFailureType_1.JoinRoomFailureType.AlreadyParticipant;
                    }
                }
                if (room.joinAsSpectatorPhrase != null && room.joinAsSpectatorPhrase !== args.phrase) {
                    return JoinRoomFailureType_1.JoinRoomFailureType.WrongPhrase;
                }
                return ParticipantRole_1.ParticipantRole.Spectator;
            }
        });
    }
    async joinRoomAsSpectator(args, context, pubSub) {
        const { result, payload } = await this.joinRoomAsSpectatorCore({ args, context, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
        if (payload != null) {
            await pubSub.publish(Topics_1.ROOM_OPERATED, payload);
        }
        return result;
    }
    async promoteToPlayerCore({ args, context, globalEntryPhrase }) {
        return promoteMeCore(Object.assign(Object.assign({}, args), { context,
            globalEntryPhrase, strategy: ({ me, room }) => {
                switch (me.role) {
                    case ParticipantRole_1.ParticipantRole.Master:
                    case ParticipantRole_1.ParticipantRole.Player:
                        return PromoteFailureType_1.PromoteFailureType.NoNeedToPromote;
                    case ParticipantRole_1.ParticipantRole.Spectator: {
                        if (room.joinAsPlayerPhrase != null && room.joinAsPlayerPhrase !== args.phrase) {
                            return PromoteFailureType_1.PromoteFailureType.WrongPhrase;
                        }
                        return ParticipantRole_1.ParticipantRole.Player;
                    }
                    case undefined:
                        return PromoteFailureType_1.PromoteFailureType.NotParticipant;
                }
            } }));
    }
    async promoteToPlayer(args, context, pubSub) {
        const { result, payload } = await this.promoteToPlayerCore({ args, context, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
        if (payload != null) {
            await pubSub.publish(Topics_1.ROOM_OPERATED, payload);
        }
        return result;
    }
    async changeParticipantNameCore({ args, context, globalEntryPhrase }) {
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return { result: { failureType: ChangeParticipantNameFailureType_1.ChangeParticipantNameFailureType.NotSignIn }, payload: undefined };
        }
        const queue = async () => {
            const em = context.createEm();
            const entryUser = await helpers_1.getUserIfEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase, });
            await em.flush();
            if (entryUser == null) {
                return {
                    result: {
                        failureType: ChangeParticipantNameFailureType_1.ChangeParticipantNameFailureType.NotEntry,
                    },
                    payload: undefined,
                };
            }
            const findResult = await helpers_1.findRoomAndMyParticipantAndParitipantUserUids({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return {
                    result: {
                        failureType: ChangeParticipantNameFailureType_1.ChangeParticipantNameFailureType.NotFound,
                    },
                    payload: undefined,
                };
            }
            const { room, me, participantUserUids } = findResult;
            if (me == null || me.role == null) {
                return {
                    result: {
                        failureType: ChangeParticipantNameFailureType_1.ChangeParticipantNameFailureType.NotParticipant,
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
        if (result.type === PromiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        return result.value;
    }
    async changeParticipantName(args, context, pubSub) {
        const { result, payload } = await this.changeParticipantNameCore({ args, context, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
        if (payload != null) {
            await pubSub.publish(Topics_1.ROOM_OPERATED, payload);
        }
        return result;
    }
    async getRoomCore({ args, context, globalEntryPhrase }) {
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return { failureType: GetRoomFailureType_1.GetRoomFailureType.NotSignIn };
        }
        const queue = async () => {
            const em = context.createEm();
            const entry = await helpers_1.checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase, });
            await em.flush();
            if (!entry) {
                return Result_1.ResultModule.ok({
                    failureType: GetRoomFailureType_1.GetRoomFailureType.NotEntry,
                });
            }
            const findResult = await helpers_1.findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.id });
            if (findResult == null) {
                return Result_1.ResultModule.ok({
                    failureType: GetRoomFailureType_1.GetRoomFailureType.NotFound,
                });
            }
            const { room, me } = findResult;
            if ((me === null || me === void 0 ? void 0 : me.role) == null) {
                return Result_1.ResultModule.ok({
                    roomAsListItem: global_1.stateToGraphQL({ roomEntity: room }),
                });
            }
            const roomState = await global_2.GlobalRoom.MikroORM.ToGlobal.state(room);
            return Result_1.ResultModule.ok({
                role: me.role,
                room: Object.assign(Object.assign({}, global_2.GlobalRoom.Global.ToGraphQL.state({ source: roomState, requestedBy: { type: Types_1.client, userUid: decodedIdToken.uid } })), { revision: room.revision, createdBy: room.createdBy }),
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
    getRoom(args, context) {
        return this.getRoomCore({ args, context, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
    }
    async leaveRoomCore({ id, context }) {
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return {
                result: { failureType: LeaveRoomFailureType_1.LeaveRoomFailureType.NotSignIn },
                payload: undefined,
            };
        }
        const queue = async () => {
            const em = context.createEm();
            const findResult = await helpers_1.findRoomAndMyParticipantAndParitipantUserUids({ em, userUid: decodedIdToken.uid, roomId: id });
            if (findResult == null) {
                return Result_1.ResultModule.ok({
                    result: { failureType: LeaveRoomFailureType_1.LeaveRoomFailureType.NotFound },
                    payload: undefined,
                });
            }
            const { me, room, participantUserUids } = findResult;
            if (me === undefined || me.role == null) {
                return Result_1.ResultModule.ok({
                    result: { failureType: LeaveRoomFailureType_1.LeaveRoomFailureType.NotEntry },
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
            return Result_1.ResultModule.ok({
                result: {},
                payload,
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
    async leaveRoom(id, context, pubSub) {
        const { result, payload } = await this.leaveRoomCore({ id, context });
        if (payload != null) {
            await pubSub.publish(Topics_1.ROOM_OPERATED, payload);
        }
        return result;
    }
    async operateCore({ args, context, globalEntryPhrase }) {
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return {
                type: 'failure',
                result: { failureType: OperateRoomFailureType_1.OperateRoomFailureType.NotSignIn }
            };
        }
        const queue = async () => {
            const em = context.createEm();
            const entry = await helpers_1.checkEntry({
                userUid: decodedIdToken.uid,
                em,
                globalEntryPhrase,
            });
            await em.flush();
            if (!entry) {
                return Result_1.ResultModule.ok({
                    type: 'failure',
                    result: { failureType: OperateRoomFailureType_1.OperateRoomFailureType.NotEntry }
                });
            }
            const findResult = await helpers_1.findRoomAndMyParticipantAndParitipantUserUids({ em, userUid: decodedIdToken.uid, roomId: args.id });
            if (findResult == null) {
                return Result_1.ResultModule.ok({
                    type: 'failure',
                    result: { failureType: OperateRoomFailureType_1.OperateRoomFailureType.NotFound }
                });
            }
            const { room, me, participantUserUids } = findResult;
            if (me === undefined) {
                return Result_1.ResultModule.ok({
                    type: 'nonJoined',
                    result: { roomAsListItem: global_1.stateToGraphQL({ roomEntity: room }) }
                });
            }
            const clientOperation = global_2.GlobalRoom.GraphQL.ToGlobal.upOperation(args.operation);
            if (clientOperation.isError) {
                return clientOperation;
            }
            const roomState = await global_2.GlobalRoom.MikroORM.ToGlobal.state(room);
            const downOperation = await global_2.GlobalRoom.MikroORM.ToGlobal.downOperationMany({
                em,
                roomId: room.id,
                revisionRange: { from: args.prevRevision, expectedTo: room.revision },
            });
            if (downOperation.isError) {
                return downOperation;
            }
            const transformerFactory = global_2.GlobalRoom.transformerFactory({ type: Types_1.client, userUid: decodedIdToken.uid });
            let prevState = roomState;
            let twoWayOperation = undefined;
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
                return Result_1.ResultModule.ok({ type: 'id', result: { requestId: args.requestId } });
            }
            const operation = transformed.value;
            const prevRevision = room.revision;
            const myValueLogs = [];
            for (const [userUid, participant] of operation.participants) {
                if (participant.type === mapOperations_1.replace) {
                    if (participant.operation.oldValue != null) {
                        const operation = collection_1.__(participant.operation.oldValue.myNumberValues).toMap(([key, value]) => {
                            return { key, value: { type: mapOperations_1.replace, operation: { oldValue: value, newValue: undefined } } };
                        });
                        const partici = await em.findOne(mikro_orm_1.Partici, { user: { userUid } });
                        if (partici == null) {
                            console.warn('Partici not found');
                            continue;
                        }
                        myValueLogs.push(...global_4.GlobalMyValue.Global.toLogs({ operation, createdBy: partici }).map(log => ({ log, stateUserUid: partici.user.userUid })));
                    }
                    if (participant.operation.newValue != null) {
                        const operation = collection_1.__(participant.operation.newValue.myNumberValues).toMap(([key, value]) => {
                            return { key, value: { type: mapOperations_1.replace, operation: { oldValue: undefined, newValue: value } } };
                        });
                        const partici = await em.findOne(mikro_orm_1.Partici, { user: { userUid } });
                        if (partici == null) {
                            console.warn('Partici not found');
                            continue;
                        }
                        myValueLogs.push(...global_4.GlobalMyValue.Global.toLogs({ operation, createdBy: partici }).map(log => ({ log, stateUserUid: partici.user.userUid })));
                    }
                }
                if (participant.type === mapOperations_1.update) {
                    const partici = await em.findOne(mikro_orm_1.Partici, { user: { userUid } });
                    if (partici == null) {
                        console.warn('Partici not found');
                        continue;
                    }
                    myValueLogs.push(...global_4.GlobalMyValue.Global.toLogs({ operation: participant.operation.myNumberValues, createdBy: partici }).map(log => ({ log, stateUserUid: partici.user.userUid })));
                }
            }
            for (const { log } of myValueLogs) {
                em.persist(log);
            }
            await global_2.GlobalRoom.Global.applyToEntity({ em, target: room, operation });
            await em.flush();
            const nextRoomState = await global_2.GlobalRoom.MikroORM.ToGlobal.state(room);
            const generateOperation = (deliverTo) => {
                const value = global_2.GlobalRoom.Global.ToGraphQL.operation({
                    operation,
                    prevState: roomState,
                    nextState: nextRoomState,
                    requestedBy: { type: Types_1.client, userUid: deliverTo },
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
            const roomOperationPayload = {
                type: 'roomOperationPayload',
                roomId: args.id,
                participants: participantUserUids,
                generateOperation,
            };
            const result = {
                type: 'success',
                roomOperationPayload,
                messageUpdatePayload: myValueLogs.map(({ log, stateUserUid }) => ({
                    roomId: room.id,
                    createdBy: undefined,
                    visibleTo: undefined,
                    value: global_5.MyValueLog.MikroORM.ToGraphQL.state({ entity: log, stateUserUid }),
                })),
                result: {
                    operation: generateOperation(decodedIdToken.uid)
                },
            };
            return Result_1.ResultModule.ok(result);
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
    async operate(args, context, pubSub) {
        const operateResult = await this.operateCore({ args, context, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
        if (operateResult.type === 'success') {
            await pubSub.publish(Topics_1.ROOM_OPERATED, operateResult.roomOperationPayload);
            for (const messageUpdate of operateResult.messageUpdatePayload) {
                await pubSub.publish(Topics_1.ROOM_MESSAGE_UPDATE, messageUpdate);
            }
        }
        return operateResult.result;
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
            const visibleToIsOk = collection_1.__(Set_1.groupJoin(visibleTo, new Set(participantUserUids))).forAll(({ value }) => value !== Types_2.left);
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
                chara = await em.findOne(mikro_orm_3.Chara, { createdBy: decodedIdToken.uid, stateId: args.characterStateId });
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
    roomOperated(payload, id, context) {
        if (context.decodedIdToken == null || context.decodedIdToken.isError) {
            return undefined;
        }
        const userUid = context.decodedIdToken.value.uid;
        if (id !== payload.roomId) {
            return undefined;
        }
        if (payload.type === 'deleteRoomPayload') {
            return {
                __tstype: graphql_1.deleteRoomOperation,
                deletedBy: payload.deletedBy,
            };
        }
        if (!payload.participants.has(userUid)) {
            return undefined;
        }
        if (payload.type === 'roomOperationPayload') {
            return payload.generateOperation(userUid);
        }
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
    type_graphql_1.Query(() => GetRoomsListResult_1.GetRoomsListResult),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "getRoomsList", null);
__decorate([
    type_graphql_1.Query(() => RequiresPhraseResult_1.RequiresPhraseResult),
    __param(0, type_graphql_1.Arg('roomId')), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "requiresPhraseToJoinAsPlayer", null);
__decorate([
    type_graphql_1.Query(() => graphql_2.GetRoomMessagesResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [args_input_1.GetMessagesArgs, Object]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "getMessages", null);
__decorate([
    type_graphql_1.Query(() => graphql_2.GetRoomLogResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [args_input_1.GetLogArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "getLog", null);
__decorate([
    type_graphql_1.Mutation(() => CreateRoomResult_1.CreateRoomResult),
    __param(0, type_graphql_1.Arg('input')), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [args_input_1.CreateRoomInput, Object]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "createRoom", null);
__decorate([
    type_graphql_1.Mutation(() => DeleteRoomResult_1.DeleteRoomResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [args_input_1.DeleteRoomArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "deleteRoom", null);
__decorate([
    type_graphql_1.Mutation(() => JoinRoomResult_1.JoinRoomResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [args_input_1.JoinRoomArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "joinRoomAsPlayer", null);
__decorate([
    type_graphql_1.Mutation(() => JoinRoomResult_1.JoinRoomResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [args_input_1.JoinRoomArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "joinRoomAsSpectator", null);
__decorate([
    type_graphql_1.Mutation(() => PromoteMeResult_1.PromoteResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [args_input_1.PromoteArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "promoteToPlayer", null);
__decorate([
    type_graphql_1.Mutation(() => ChangeParticipantNameResult_1.ChangeParticipantNameResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [args_input_1.ChangeParticipantNameArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "changeParticipantName", null);
__decorate([
    type_graphql_1.Query(() => GetRoomResult_1.GetRoomResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [args_input_1.GetRoomArgs, Object]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "getRoom", null);
__decorate([
    type_graphql_1.Mutation(() => LeaveRoomResult_1.LeaveRoomResult),
    __param(0, type_graphql_1.Arg('id')), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "leaveRoom", null);
__decorate([
    type_graphql_1.Mutation(() => OperateRoomResult_1.OperateRoomResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [args_input_1.OperateArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "operate", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.WritePublicRoomMessageResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [args_input_1.WritePublicMessageArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "writePublicMessage", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.WritePrivateRoomMessageResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [args_input_1.WritePrivateMessageArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "writePrivateMessage", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.WriteRoomSoundEffectResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [args_input_1.WriteRoomSoundEffectArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "writeRoomSoundEffect", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.MakeMessageNotSecretResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [args_input_1.MessageIdArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "makeMessageNotSecret", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.DeleteMessageResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [args_input_1.MessageIdArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "deleteMessage", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.EditMessageResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [args_input_1.EditMessageArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "editMessage", null);
__decorate([
    type_graphql_1.Subscription(() => graphql_1.RoomOperated, { topics: Topics_1.ROOM_OPERATED, nullable: true }),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Arg('id')), __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Object)
], RoomResolver.prototype, "roomOperated", null);
__decorate([
    type_graphql_1.Subscription(() => graphql_2.RoomMessageEvent, { topics: Topics_1.ROOM_MESSAGE_UPDATE, nullable: true }),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Arg('roomId')), __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Object)
], RoomResolver.prototype, "messageEvent", null);
RoomResolver = __decorate([
    type_graphql_1.Resolver()
], RoomResolver);
exports.RoomResolver = RoomResolver;
