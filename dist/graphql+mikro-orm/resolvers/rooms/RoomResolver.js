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
var RoomResolver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomResolver = void 0;
const type_graphql_1 = require("type-graphql");
const GetRoomFailureType_1 = require("../../../enums/GetRoomFailureType");
const helpers_1 = require("../utils/helpers");
const JoinRoomFailureType_1 = require("../../../enums/JoinRoomFailureType");
const Room$MikroORM = __importStar(require("../../entities/room/mikro-orm"));
const Participant$MikroORM = __importStar(require("../../entities/participant/mikro-orm"));
const global_1 = require("../../entities/roomAsListItem/global");
const promiseQueue_1 = require("../../../utils/promiseQueue");
const messages_1 = require("../utils/messages");
const graphql_1 = require("../../entities/room/graphql");
const OperateRoomFailureType_1 = require("../../../enums/OperateRoomFailureType");
const LeaveRoomFailureType_1 = require("../../../enums/LeaveRoomFailureType");
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
const mikro_orm_1 = require("../../entities/roomMessage/mikro-orm");
const object_args_input_1 = require("./object+args+input");
const graphql_2 = require("../../entities/roomMessage/graphql");
const WritePublicRoomMessageFailureType_1 = require("../../../enums/WritePublicRoomMessageFailureType");
const main_1 = require("../../../messageAnalyzer/main");
const color_1 = __importDefault(require("color"));
const GetRoomMessagesFailureType_1 = require("../../../enums/GetRoomMessagesFailureType");
const global_3 = require("../../entities/roomMessage/global");
const GetRoomLogFailureType_1 = require("../../../enums/GetRoomLogFailureType");
const roomMessage_1 = require("../utils/roomMessage");
const core_1 = require("@mikro-orm/core");
const mikro_orm_2 = require("../../entities/user/mikro-orm");
const WritePrivateRoomMessageFailureType_1 = require("../../../enums/WritePrivateRoomMessageFailureType");
const WriteRoomSoundEffectFailureType_1 = require("../../../enums/WriteRoomSoundEffectFailureType");
const MakeMessageNotSecretFailureType_1 = require("../../../enums/MakeMessageNotSecretFailureType");
const DeleteMessageFailureType_1 = require("../../../enums/DeleteMessageFailureType");
const EditMessageFailureType_1 = require("../../../enums/EditMessageFailureType");
const Topics_1 = require("../../utils/Topics");
const GetRoomConnectionFailureType_1 = require("../../../enums/GetRoomConnectionFailureType");
const WritingMessageStatusType_1 = require("../../../enums/WritingMessageStatusType");
const WritingMessageStatusInputType_1 = require("../../../enums/WritingMessageStatusInputType");
const FileSourceType_1 = require("../../../enums/FileSourceType");
const result_1 = require("@kizahasi/result");
const util_1 = require("@kizahasi/util");
const flocon_core_1 = require("@kizahasi/flocon-core");
const ParticipantRole_1 = require("../../../enums/ParticipantRole");
const roles_1 = require("../../../roles");
const ParticipantRoleType_1 = require("../../../enums/ParticipantRoleType");
const find = (source, key) => source[key];
const operateParticipantAndFlush = async ({ myUserUid, em, room, participantUserUids, create, update, }) => {
    const prevRevision = room.revision;
    const roomState = await global_2.GlobalRoom.MikroORM.ToGlobal.state(room, em);
    const me = find(roomState.participants, myUserUid);
    let participantOperation = undefined;
    if (me == null) {
        if (create != null) {
            participantOperation = {
                type: flocon_core_1.replace,
                replace: {
                    newValue: {
                        $v: 1,
                        name: create.name,
                        role: create.role,
                        boards: {},
                        characters: {},
                        imagePieceValues: {},
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
                    $v: 1,
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
    const roomUpOperation = {
        $v: 1,
        participants: {
            [myUserUid]: participantOperation,
        },
    };
    const transformed = flocon_core_1.serverTransform({ type: flocon_core_1.admin })({
        prevState: roomState,
        currentState: roomState,
        clientOperation: roomUpOperation,
        serverOperation: undefined,
    });
    if (transformed.isError) {
        return {
            result: { failureType: JoinRoomFailureType_1.JoinRoomFailureType.TransformError },
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
    const nextRoomState = await global_2.GlobalRoom.Global.applyToEntity({
        em,
        target: room,
        prevState: roomState,
        operation: transformedValue,
    });
    await em.flush();
    const generateOperation = (deliverTo) => {
        return {
            __tstype: 'RoomOperation',
            revisionTo: prevRevision + 1,
            operatedBy: undefined,
            valueJson: global_2.GlobalRoom.Global.ToGraphQL.operation({
                prevState: roomState,
                nextState: nextRoomState,
                requestedBy: { type: flocon_core_1.client, userUid: deliverTo },
            }),
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
const joinRoomCore = async ({ args, context, strategy, }) => {
    const queue = async () => {
        const em = context.em;
        const authorizedUser = helpers_1.ensureAuthorizedUser(context);
        const findResult = await helpers_1.findRoomAndMyParticipant({
            em,
            userUid: authorizedUser.userUid,
            roomId: args.id,
        });
        if (findResult == null) {
            return {
                result: {
                    failureType: JoinRoomFailureType_1.JoinRoomFailureType.NotFound,
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
                    myUserUid: authorizedUser.userUid,
                    create: {
                        name: args.name,
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
    if (result.type === promiseQueue_1.queueLimitReached) {
        throw messages_1.serverTooBusyMessage;
    }
    return result.value;
};
const promoteMeCore = async ({ roomId, context, strategy, }) => {
    const queue = async () => {
        var _a;
        const em = context.em;
        const authorizedUser = helpers_1.ensureAuthorizedUser(context);
        const findResult = await helpers_1.findRoomAndMyParticipant({
            em,
            userUid: authorizedUser.userUid,
            roomId,
        });
        if (findResult == null) {
            return {
                result: {
                    failureType: PromoteFailureType_1.PromoteFailureType.NotFound,
                },
                payload: undefined,
            };
        }
        const { room, me } = findResult;
        const participantUserUids = findResult.participantIds();
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
                    payload: (_a = (await operateParticipantAndFlush({
                        em,
                        room,
                        participantUserUids,
                        myUserUid: authorizedUser.userUid,
                        update: {
                            role: { newValue: strategyResult },
                        },
                    }))) === null || _a === void 0 ? void 0 : _a.payload,
                };
            }
        }
    };
    const result = await context.promiseQueue.next(queue);
    if (result.type === promiseQueue_1.queueLimitReached) {
        throw messages_1.serverTooBusyMessage;
    }
    return result.value;
};
const checkChannelKey = (channelKey, isSpectator) => {
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
                return WritePublicRoomMessageFailureType_1.WritePublicRoomMessageFailureType.NotAuthorized;
            }
            return null;
        case util_1.$free:
            return null;
        case util_1.$system:
            return WritePublicRoomMessageFailureType_1.WritePublicRoomMessageFailureType.NotAuthorized;
        default:
            return WritePublicRoomMessageFailureType_1.WritePublicRoomMessageFailureType.NotAllowedChannelKey;
    }
};
const analyzeTextAndSetToEntity = async (params) => {
    var _a, _b, _c;
    const defaultGameType = 'DiceBot';
    const analyzed = await main_1.analyze(Object.assign(Object.assign({}, params), { gameType: (_a = params.gameType) !== null && _a !== void 0 ? _a : defaultGameType, text: params.textSource }));
    if (analyzed.isError) {
        return analyzed;
    }
    const targetEntity = params.type === 'RoomPubMsg'
        ? new mikro_orm_1.RoomPubMsg({
            initTextSource: params.textSource,
            initText: analyzed.value.message,
        })
        : new mikro_orm_1.RoomPrvMsg({
            initTextSource: params.textSource,
            initText: analyzed.value.message,
        });
    targetEntity.createdBy = core_1.Reference.create(params.createdBy);
    if (analyzed.value.diceResult != null) {
        if (analyzed.value.diceResult.isSecret) {
            targetEntity.isSecret = true;
            targetEntity.altTextToSecret = 'シークレットダイス';
            targetEntity.commandResult = analyzed.value.diceResult.result;
            targetEntity.commandIsSuccess = (_b = analyzed.value.diceResult.isSuccess) !== null && _b !== void 0 ? _b : undefined;
        }
        else {
            targetEntity.commandResult = analyzed.value.diceResult.result;
            targetEntity.commandIsSuccess = (_c = analyzed.value.diceResult.isSuccess) !== null && _c !== void 0 ? _c : undefined;
        }
    }
    return result_1.Result.ok(targetEntity);
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
        tachieImage: message.charaTachieImagePath == null || message.charaTachieImageSourceType == null
            ? undefined
            : {
                path: message.charaTachieImagePath,
                sourceType: message.charaTachieImageSourceType,
            },
    };
};
const createUpdatedText = (entity) => {
    if (entity.textUpdatedAt == null) {
        return undefined;
    }
    return { currentText: entity.updatedText, updatedAt: entity.textUpdatedAt };
};
const isDeleted = (entity) => {
    if (entity.textUpdatedAt == null) {
        return false;
    }
    return entity.updatedText == null;
};
const createRoomPublicMessage = ({ msg, channelKey, }) => {
    var _a, _b, _c, _d;
    return {
        __tstype: graphql_2.RoomPublicMessageType,
        channelKey,
        messageId: msg.id,
        initText: msg.initText,
        initTextSource: (_a = msg.initTextSource) !== null && _a !== void 0 ? _a : msg.initText,
        updatedText: createUpdatedText(msg),
        textColor: (_b = msg.textColor) !== null && _b !== void 0 ? _b : undefined,
        commandResult: msg.commandResult == null
            ? undefined
            : {
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
const createRoomPrivateMessage = async ({ msg, visibleTo, }) => {
    var _a, _b, _c, _d, _e;
    return {
        __tstype: graphql_2.RoomPrivateMessageType,
        messageId: msg.id,
        visibleTo: [...visibleTo].sort(),
        createdBy: (_a = msg.createdBy) === null || _a === void 0 ? void 0 : _a.userUid,
        character: toCharacterValueForMessage(msg),
        customName: msg.customName,
        createdAt: msg.createdAt.getTime(),
        updatedAt: msg.textUpdatedAt,
        initText: (_b = msg.initText) !== null && _b !== void 0 ? _b : undefined,
        initTextSource: (_c = msg.initTextSource) !== null && _c !== void 0 ? _c : msg.initText,
        updatedText: createUpdatedText(msg),
        textColor: (_d = msg.textColor) !== null && _d !== void 0 ? _d : undefined,
        commandResult: msg.commandResult == null
            ? undefined
            : {
                text: msg.commandResult,
                isSuccess: msg.commandIsSuccess,
            },
        altTextToSecret: (_e = msg.altTextToSecret) !== null && _e !== void 0 ? _e : undefined,
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
const publishRoomEvent = async (pubSub, payload) => {
    await pubSub.publish(Topics_1.ROOM_EVENT, payload);
};
let RoomResolver = RoomResolver_1 = class RoomResolver {
    async getRoomsList(context) {
        const queue = async () => {
            const em = context.em;
            const roomModels = await em.find(Room$MikroORM.Room, {});
            const rooms = roomModels.map(model => global_1.stateToGraphQL({ roomEntity: model }));
            return {
                rooms,
            };
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === promiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        return result.value;
    }
    async requiresPhraseToJoinAsPlayer(roomId, context) {
        const queue = async () => {
            const em = context.em;
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
        if (result.type === promiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        return result.value;
    }
    async getRoomMessagesFromDb(room, userUid, mode) {
        var _a, _b, _c;
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
                if (mode === 'default' && msg.isSecret && createdBy !== userUid) {
                    continue;
                }
                publicMessages.push(createRoomPublicMessage({ msg, channelKey: ch.key }));
            }
        }
        const privateMessages = [];
        for (const msg of await room.roomPrvMsgs.loadItems()) {
            const createdBy = (_b = msg.createdBy) === null || _b === void 0 ? void 0 : _b.userUid;
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
        const pieceValueLogs = [];
        for (const msg of await room.dicePieceValueLogs.loadItems()) {
            pieceValueLogs.push(global_3.DicePieceValueLog.MikroORM.ToGraphQL.state(msg));
        }
        for (const msg of await room.numberPieceValueLogs.loadItems()) {
            pieceValueLogs.push(global_3.NumberPieceValueLog.MikroORM.ToGraphQL.state(msg));
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
        return {
            __tstype: graphql_2.RoomMessagesType,
            publicMessages,
            privateMessages,
            pieceValueLogs,
            publicChannels,
            soundEffects,
        };
    }
    async getMessages(args, context) {
        const queue = async () => {
            const em = context.em;
            const authorizedUserUid = helpers_1.ensureAuthorizedUser(context).userUid;
            const findResult = await helpers_1.findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: args.roomId,
            });
            if (findResult == null) {
                return result_1.Result.ok({
                    __tstype: graphql_2.GetRoomMessagesFailureResultType,
                    failureType: GetRoomMessagesFailureType_1.GetRoomMessagesFailureType.RoomNotFound,
                });
            }
            const { room, me } = findResult;
            if ((me === null || me === void 0 ? void 0 : me.role) === undefined) {
                return result_1.Result.ok({
                    __tstype: graphql_2.GetRoomMessagesFailureResultType,
                    failureType: GetRoomMessagesFailureType_1.GetRoomMessagesFailureType.NotParticipant,
                });
            }
            const messages = await this.getRoomMessagesFromDb(room, authorizedUserUid, 'default');
            return result_1.Result.ok(messages);
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === promiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }
    async getLog(args, context, pubSub) {
        const queue = async () => {
            const em = context.em;
            const authorizedUserUid = helpers_1.ensureAuthorizedUser(context).userUid;
            const findResult = await helpers_1.findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: args.roomId,
            });
            if (findResult == null) {
                return result_1.Result.ok({
                    result: {
                        __tstype: graphql_2.GetRoomLogFailureResultType,
                        failureType: GetRoomLogFailureType_1.GetRoomLogFailureType.RoomNotFound,
                    },
                });
            }
            const { room, me } = findResult;
            if ((me === null || me === void 0 ? void 0 : me.role) === undefined) {
                return result_1.Result.ok({
                    result: {
                        __tstype: graphql_2.GetRoomLogFailureResultType,
                        failureType: GetRoomLogFailureType_1.GetRoomLogFailureType.NotParticipant,
                    },
                });
            }
            if (me.role === flocon_core_1.Spectator) {
                return result_1.Result.ok({
                    result: {
                        __tstype: graphql_2.GetRoomLogFailureResultType,
                        failureType: GetRoomLogFailureType_1.GetRoomLogFailureType.NotAuthorized,
                    },
                });
            }
            const messages = await this.getRoomMessagesFromDb(room, authorizedUserUid, 'log');
            em.clear();
            const systemMessageEntity = await roomMessage_1.writeSystemMessage({
                em,
                text: `${me.name}(${authorizedUserUid}) が全てのログを出力しました。`,
                room: room,
            });
            await em.flush();
            return result_1.Result.ok({
                result: messages,
                payload: {
                    type: 'messageUpdatePayload',
                    roomId: room.id,
                    value: createRoomPublicMessage({
                        msg: systemMessageEntity,
                        channelKey: util_1.$system,
                    }),
                    createdBy: undefined,
                    visibleTo: undefined,
                },
            });
        };
        const coreResult = await context.promiseQueue.next(queue);
        if (coreResult.type === promiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (coreResult.value.isError) {
            throw coreResult.value.error;
        }
        if (coreResult.value.value.payload != null) {
            await publishRoomEvent(pubSub, coreResult.value.value.payload);
        }
        return coreResult.value.value.result;
    }
    async getRoomConnections(roomId, context) {
        const queue = async () => {
            const em = context.em;
            const authorizedUserUid = helpers_1.ensureAuthorizedUser(context).userUid;
            const findResult = await helpers_1.findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId,
            });
            if (findResult == null) {
                return result_1.Result.ok({
                    __tstype: object_args_input_1.GetRoomConnectionFailureResultType,
                    failureType: GetRoomConnectionFailureType_1.GetRoomConnectionFailureType.RoomNotFound,
                });
            }
            const { me } = findResult;
            if ((me === null || me === void 0 ? void 0 : me.role) === undefined) {
                return result_1.Result.ok({
                    __tstype: object_args_input_1.GetRoomConnectionFailureResultType,
                    failureType: GetRoomConnectionFailureType_1.GetRoomConnectionFailureType.NotParticipant,
                });
            }
            return result_1.Result.ok({
                __tstype: object_args_input_1.GetRoomConnectionSuccessResultType,
                connectedUserUids: [
                    ...(await context.connectionManager.listRoomConnections({ roomId })),
                ]
                    .filter(([key, value]) => value > 0)
                    .map(([key]) => key),
                fetchedAt: new Date().getTime(),
            });
        };
        const coreResult = await context.promiseQueue.next(queue);
        if (coreResult.type === promiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (coreResult.value.isError) {
            throw coreResult.value.error;
        }
        return coreResult.value.value;
    }
    async createRoom(input, context) {
        const queue = async () => {
            const em = context.em;
            const authorizedUser = helpers_1.ensureAuthorizedUser(context);
            const newRoom = new Room$MikroORM.Room({
                name: input.roomName,
                createdBy: authorizedUser.userUid,
                value: {
                    $v: 1,
                    participants: {
                        [authorizedUser.userUid]: {
                            $v: 1,
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
                (newParticipant.role = ParticipantRoleType_1.ParticipantRoleType.Master);
            em.persist(newParticipant);
            newRoom.participants.add(newParticipant);
            authorizedUser.participants.add(newParticipant);
            newRoom.joinAsPlayerPhrase = input.joinAsPlayerPhrase;
            newRoom.joinAsSpectatorPhrase = input.joinAsSpectatorPhrase;
            const revision = newRoom.revision;
            em.persist(newRoom);
            const roomState = await global_2.GlobalRoom.MikroORM.ToGlobal.state(newRoom, em);
            const graphqlState = global_2.GlobalRoom.Global.ToGraphQL.state({
                source: roomState,
                requestedBy: { type: flocon_core_1.client, userUid: authorizedUser.userUid },
            });
            await em.flush();
            return {
                room: Object.assign(Object.assign({}, graphqlState), { revision, createdBy: authorizedUser.userUid }),
                id: newRoom.id,
            };
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === promiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        return result.value;
    }
    async deleteRoom(args, context, pubSub) {
        const queue = async () => {
            const em = context.em;
            const authorizedUserUid = helpers_1.ensureAuthorizedUser(context).userUid;
            const room = await em.findOne(Room$MikroORM.Room, { id: args.id });
            if (room == null) {
                return {
                    result: { failureType: DeleteRoomFailureType_1.DeleteRoomFailureType.NotFound },
                    payload: undefined,
                };
            }
            const roomId = room.id;
            if (room.createdBy !== authorizedUserUid) {
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
                    deletedBy: authorizedUserUid,
                },
            };
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === promiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.payload != null) {
            await publishRoomEvent(pubSub, result.value.payload);
        }
        return result.value.result;
    }
    async joinRoomAsPlayer(args, context, pubSub) {
        const { result, payload } = await joinRoomCore({
            args,
            context,
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
                return flocon_core_1.Player;
            },
        });
        if (payload != null) {
            await publishRoomEvent(pubSub, payload);
        }
        return result;
    }
    async joinRoomAsSpectator(args, context, pubSub) {
        const { result, payload } = await joinRoomCore({
            args,
            context,
            strategy: ({ me, room }) => {
                if (me != null) {
                    switch (me.role) {
                        case undefined:
                            break;
                        default:
                            return JoinRoomFailureType_1.JoinRoomFailureType.AlreadyParticipant;
                    }
                }
                if (room.joinAsSpectatorPhrase != null &&
                    room.joinAsSpectatorPhrase !== args.phrase) {
                    return JoinRoomFailureType_1.JoinRoomFailureType.WrongPhrase;
                }
                return flocon_core_1.Spectator;
            },
        });
        if (payload != null) {
            await publishRoomEvent(pubSub, payload);
        }
        return result;
    }
    async promoteToPlayer(args, context, pubSub) {
        const { result, payload } = await promoteMeCore(Object.assign(Object.assign({}, args), { context, strategy: ({ me, room }) => {
                switch (me.role) {
                    case flocon_core_1.Master:
                    case flocon_core_1.Player:
                        return PromoteFailureType_1.PromoteFailureType.NoNeedToPromote;
                    case flocon_core_1.Spectator: {
                        if (room.joinAsPlayerPhrase != null &&
                            room.joinAsPlayerPhrase !== args.phrase) {
                            return PromoteFailureType_1.PromoteFailureType.WrongPhrase;
                        }
                        return flocon_core_1.Player;
                    }
                    case null:
                    case undefined:
                        return PromoteFailureType_1.PromoteFailureType.NotParticipant;
                }
            } }));
        if (payload != null) {
            await publishRoomEvent(pubSub, payload);
        }
        return result;
    }
    async changeParticipantName(args, context, pubSub) {
        const queue = async () => {
            const em = context.em;
            const authorizedUserUid = helpers_1.ensureAuthorizedUser(context).userUid;
            const findResult = await helpers_1.findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: args.roomId,
            });
            if (findResult == null) {
                return {
                    result: {
                        failureType: ChangeParticipantNameFailureType_1.ChangeParticipantNameFailureType.NotFound,
                    },
                    payload: undefined,
                };
            }
            const { room, me, roomState } = findResult;
            const participantUserUids = findResult.participantIds();
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
                myUserUid: authorizedUserUid,
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
                payload: payload,
            };
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === promiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.payload != null) {
            await publishRoomEvent(pubSub, result.value.payload);
        }
        return result.value.result;
    }
    async getRoom(args, context) {
        const queue = async () => {
            const em = context.em;
            const authorizedUserUid = helpers_1.ensureAuthorizedUser(context).userUid;
            const findResult = await helpers_1.findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: args.id,
            });
            if (findResult == null) {
                return result_1.Result.ok({
                    failureType: GetRoomFailureType_1.GetRoomFailureType.NotFound,
                });
            }
            const { room, me } = findResult;
            if ((me === null || me === void 0 ? void 0 : me.role) == null) {
                return result_1.Result.ok({
                    roomAsListItem: global_1.stateToGraphQL({ roomEntity: room }),
                });
            }
            const roomState = await global_2.GlobalRoom.MikroORM.ToGlobal.state(room, em);
            return result_1.Result.ok({
                role: ParticipantRole_1.ParticipantRole.ofString(me.role),
                room: Object.assign(Object.assign({}, global_2.GlobalRoom.Global.ToGraphQL.state({
                    source: roomState,
                    requestedBy: { type: flocon_core_1.client, userUid: authorizedUserUid },
                })), { revision: room.revision, createdBy: room.createdBy }),
            });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === promiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }
    async leaveRoom(id, context, pubSub) {
        const queue = async () => {
            const em = context.em;
            const authorizedUserUid = helpers_1.ensureAuthorizedUser(context).userUid;
            const findResult = await helpers_1.findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: id,
            });
            if (findResult == null) {
                return result_1.Result.ok({
                    result: { failureType: LeaveRoomFailureType_1.LeaveRoomFailureType.NotFound },
                    payload: undefined,
                });
            }
            const { me, room } = findResult;
            const participantUserUids = findResult.participantIds();
            if (me === undefined || me.role == null) {
                return result_1.Result.ok({
                    result: { failureType: LeaveRoomFailureType_1.LeaveRoomFailureType.NotParticipant },
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
            return result_1.Result.ok({
                result: {},
                payload: payload,
            });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === promiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        if (result.value.value.payload != null) {
            await publishRoomEvent(pubSub, result.value.value.payload);
        }
        return result.value.value.result;
    }
    static async operateCore({ args, context, }) {
        const queue = async () => {
            const em = context.em;
            const authorizedUserUid = helpers_1.ensureAuthorizedUser(context).userUid;
            const findResult = await helpers_1.findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: args.id,
            });
            if (findResult == null) {
                return result_1.Result.ok({
                    type: 'failure',
                    result: { failureType: OperateRoomFailureType_1.OperateRoomFailureType.NotFound },
                });
            }
            const { room, me, roomState } = findResult;
            const participantUserUids = findResult.participantIds();
            if (me === undefined) {
                return result_1.Result.ok({
                    type: 'nonJoined',
                    result: { roomAsListItem: global_1.stateToGraphQL({ roomEntity: room }) },
                });
            }
            const clientOperation = global_2.GlobalRoom.GraphQL.ToGlobal.upOperation(args.operation);
            const downOperation = await global_2.GlobalRoom.MikroORM.ToGlobal.downOperationMany({
                em,
                roomId: room.id,
                revisionRange: { from: args.prevRevision, expectedTo: room.revision },
            });
            if (downOperation.isError) {
                return downOperation;
            }
            let prevState = roomState;
            let twoWayOperation = undefined;
            if (downOperation.value !== undefined) {
                const restoredRoom = flocon_core_1.restore({
                    nextState: roomState,
                    downOperation: downOperation.value,
                });
                if (restoredRoom.isError) {
                    return restoredRoom;
                }
                prevState = restoredRoom.value.prevState;
                twoWayOperation = restoredRoom.value.twoWayOperation;
            }
            const transformed = flocon_core_1.serverTransform({ type: flocon_core_1.client, userUid: authorizedUserUid })({
                prevState,
                currentState: roomState,
                clientOperation: clientOperation,
                serverOperation: twoWayOperation,
            });
            if (transformed.isError) {
                return transformed;
            }
            if (transformed.value === undefined) {
                return result_1.Result.ok({ type: 'id', result: { requestId: args.requestId } });
            }
            const operation = transformed.value;
            const prevRevision = room.revision;
            const nextRoomState = await global_2.GlobalRoom.Global.applyToEntity({
                em,
                target: room,
                prevState: roomState,
                operation,
            });
            const logs = flocon_core_1.createLogs({ prevState: roomState, nextState: nextRoomState });
            const dicePieceLogEntities = [];
            logs === null || logs === void 0 ? void 0 : logs.dicePieceValueLogs.forEach(log => {
                const entity = new mikro_orm_1.DicePieceValueLog({
                    characterCreatedBy: log.characterKey.createdBy,
                    characterId: log.characterKey.id,
                    stateId: log.stateId,
                    room,
                    value: log.value,
                });
                dicePieceLogEntities.push(entity);
                em.persist(entity);
            });
            const numberPieceLogEntities = [];
            logs === null || logs === void 0 ? void 0 : logs.numberPieceValueLogs.forEach(log => {
                const entity = new mikro_orm_1.NumberPieceValueLog({
                    characterCreatedBy: log.characterKey.createdBy,
                    characterId: log.characterKey.id,
                    stateId: log.stateId,
                    room,
                    value: log.value,
                });
                numberPieceLogEntities.push(entity);
                em.persist(entity);
            });
            await em.flush();
            const generateOperation = (deliverTo) => {
                return {
                    __tstype: 'RoomOperation',
                    revisionTo: prevRevision + 1,
                    operatedBy: {
                        userUid: authorizedUserUid,
                        clientId: args.operation.clientId,
                    },
                    valueJson: global_2.GlobalRoom.Global.ToGraphQL.operation({
                        prevState: roomState,
                        nextState: nextRoomState,
                        requestedBy: { type: flocon_core_1.client, userUid: deliverTo },
                    }),
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
                messageUpdatePayload: [
                    ...dicePieceLogEntities.map(log => ({
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        createdBy: undefined,
                        visibleTo: undefined,
                        value: global_3.DicePieceValueLog.MikroORM.ToGraphQL.state(log),
                    })),
                    ...numberPieceLogEntities.map(log => ({
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        createdBy: undefined,
                        visibleTo: undefined,
                        value: global_3.NumberPieceValueLog.MikroORM.ToGraphQL.state(log),
                    })),
                ],
                result: {
                    operation: generateOperation(authorizedUserUid),
                },
            };
            return result_1.Result.ok(result);
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === promiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }
    async operate(args, context, pubSub) {
        const operateResult = await RoomResolver_1.operateCore({
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
    async writePublicMessage(args, context, pubSub) {
        const channelKey = args.channelKey;
        const queue = async () => {
            var _a, _b, _c, _d, _e, _f;
            const em = context.em;
            const authorizedUser = helpers_1.ensureAuthorizedUser(context);
            const findResult = await helpers_1.findRoomAndMyParticipant({
                em,
                userUid: authorizedUser.userUid,
                roomId: args.roomId,
            });
            if (findResult == null) {
                return result_1.Result.ok({
                    result: {
                        __tstype: graphql_2.WritePublicRoomMessageFailureResultType,
                        failureType: WritePublicRoomMessageFailureType_1.WritePublicRoomMessageFailureType.RoomNotFound,
                    },
                });
            }
            const { room, me, roomState } = findResult;
            if (me === undefined) {
                return result_1.Result.ok({
                    result: {
                        __tstype: graphql_2.WritePublicRoomMessageFailureResultType,
                        failureType: WritePublicRoomMessageFailureType_1.WritePublicRoomMessageFailureType.NotParticipant,
                    },
                });
            }
            const channelKeyFailureType = checkChannelKey(channelKey, me.role === flocon_core_1.Spectator);
            if (channelKeyFailureType != null) {
                return result_1.Result.ok({
                    result: {
                        __tstype: graphql_2.WritePublicRoomMessageFailureResultType,
                        failureType: WritePublicRoomMessageFailureType_1.WritePublicRoomMessageFailureType.NotAuthorized,
                    },
                });
            }
            let chara = undefined;
            if (args.characterStateId != null) {
                chara =
                    (_b = (_a = roomState.participants[authorizedUser.userUid]) === null || _a === void 0 ? void 0 : _a.characters) === null || _b === void 0 ? void 0 : _b[args.characterStateId];
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
            const entity = entityResult.value;
            entity.textColor = args.textColor == null ? undefined : fixTextColor(args.textColor);
            let ch = await em.findOne(mikro_orm_1.RoomPubCh, { key: channelKey, room: room.id });
            if (ch == null) {
                ch = new mikro_orm_1.RoomPubCh({ key: channelKey });
                ch.room = core_1.Reference.create(room);
                em.persist(ch);
            }
            entity.customName = args.customName;
            if (chara != null) {
                entity.charaStateId = args.characterStateId;
                entity.charaName = chara.name;
                entity.charaIsPrivate = chara.isPrivate;
                entity.charaImagePath = (_c = chara.image) === null || _c === void 0 ? void 0 : _c.path;
                entity.charaImageSourceType = FileSourceType_1.FileSourceTypeModule.ofNullishString((_d = chara.image) === null || _d === void 0 ? void 0 : _d.sourceType);
                entity.charaTachieImagePath = (_e = chara.tachieImage) === null || _e === void 0 ? void 0 : _e.path;
                entity.charaTachieImageSourceType = FileSourceType_1.FileSourceTypeModule.ofNullishString((_f = chara.tachieImage) === null || _f === void 0 ? void 0 : _f.sourceType);
            }
            entity.roomPubCh = core_1.Reference.create(ch);
            await em.persistAndFlush(entity);
            const result = createRoomPublicMessage({ msg: entity, channelKey });
            const payload = {
                type: 'messageUpdatePayload',
                roomId: args.roomId,
                createdBy: authorizedUser.userUid,
                visibleTo: undefined,
                value: result,
            };
            return result_1.Result.ok({ result, payload });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === promiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        if (result.value.value.payload != null) {
            await publishRoomEvent(pubSub, result.value.value.payload);
        }
        return result.value.value.result;
    }
    async writePrivateMessage(args, context, pubSub) {
        if (args.visibleTo.length >= 1000) {
            throw new Error('visibleTo.length is too large');
        }
        const queue = async () => {
            var _a, _b, _c, _d, _e, _f;
            const em = context.em;
            const authorizedUser = helpers_1.ensureAuthorizedUser(context);
            const findResult = await helpers_1.findRoomAndMyParticipant({
                em,
                userUid: authorizedUser.userUid,
                roomId: args.roomId,
            });
            if (findResult == null) {
                return result_1.Result.ok({
                    result: {
                        __tstype: graphql_2.WritePrivateRoomMessageFailureResultType,
                        failureType: WritePrivateRoomMessageFailureType_1.WritePrivateRoomMessageFailureType.RoomNotFound,
                    },
                });
            }
            const { room, me, roomState } = findResult;
            if (me === undefined) {
                return result_1.Result.ok({
                    result: {
                        __tstype: graphql_2.WritePrivateRoomMessageFailureResultType,
                        failureType: WritePrivateRoomMessageFailureType_1.WritePrivateRoomMessageFailureType.NotParticipant,
                    },
                });
            }
            const visibleTo = new Set(args.visibleTo);
            visibleTo.add(authorizedUser.userUid);
            await authorizedUser.visibleRoomPrvMsgs.init({ where: { room: { id: room.id } } });
            let chara = undefined;
            if (args.characterStateId != null) {
                chara =
                    (_b = (_a = roomState.participants[authorizedUser.userUid]) === null || _a === void 0 ? void 0 : _a.characters) === null || _b === void 0 ? void 0 : _b[args.characterStateId];
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
            const entity = entityResult.value;
            args.textColor == null ? undefined : fixTextColor(args.textColor);
            for (const visibleToElement of visibleTo) {
                const user = await em.findOne(mikro_orm_2.User, { userUid: visibleToElement });
                if (user == null) {
                    return result_1.Result.ok({
                        result: {
                            __tstype: graphql_2.WritePrivateRoomMessageFailureResultType,
                            failureType: WritePrivateRoomMessageFailureType_1.WritePrivateRoomMessageFailureType.VisibleToIsInvalid,
                        },
                    });
                }
                entity.visibleTo.add(user);
            }
            entity.customName = args.customName;
            if (chara != null) {
                entity.charaStateId = args.characterStateId;
                entity.charaName = chara.name;
                entity.charaIsPrivate = chara.isPrivate;
                entity.charaImagePath = (_c = chara.image) === null || _c === void 0 ? void 0 : _c.path;
                entity.charaImageSourceType = FileSourceType_1.FileSourceTypeModule.ofNullishString((_d = chara.tachieImage) === null || _d === void 0 ? void 0 : _d.sourceType);
                entity.charaTachieImagePath = (_e = chara.tachieImage) === null || _e === void 0 ? void 0 : _e.path;
                entity.charaTachieImageSourceType = FileSourceType_1.FileSourceTypeModule.ofNullishString((_f = chara.tachieImage) === null || _f === void 0 ? void 0 : _f.sourceType);
            }
            entity.room = core_1.Reference.create(room);
            await em.persistAndFlush(entity);
            const visibleToArray = [...visibleTo].sort();
            const result = await createRoomPrivateMessage({
                msg: entity,
                visibleTo: visibleToArray,
            });
            const payload = {
                type: 'messageUpdatePayload',
                roomId: args.roomId,
                createdBy: authorizedUser.userUid,
                visibleTo: visibleToArray,
                value: result,
            };
            return result_1.Result.ok({ result, payload });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === promiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        if (result.value.value.payload != null) {
            await publishRoomEvent(pubSub, result.value.value.payload);
        }
        return result.value.value.result;
    }
    async writeRoomSoundEffect(args, context, pubSub) {
        const queue = async () => {
            const em = context.em;
            const authorizedUser = helpers_1.ensureAuthorizedUser(context);
            const findResult = await helpers_1.findRoomAndMyParticipant({
                em,
                userUid: authorizedUser.userUid,
                roomId: args.roomId,
            });
            if (findResult == null) {
                return result_1.Result.ok({
                    result: {
                        __tstype: graphql_2.WriteRoomSoundEffectFailureResultType,
                        failureType: WriteRoomSoundEffectFailureType_1.WriteRoomSoundEffectFailureType.RoomNotFound,
                    },
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return result_1.Result.ok({
                    result: {
                        __tstype: graphql_2.WriteRoomSoundEffectFailureResultType,
                        failureType: WriteRoomSoundEffectFailureType_1.WriteRoomSoundEffectFailureType.NotParticipant,
                    },
                });
            }
            if (me.role === flocon_core_1.Spectator) {
                return result_1.Result.ok({
                    result: {
                        __tstype: graphql_2.WriteRoomSoundEffectFailureResultType,
                        failureType: WriteRoomSoundEffectFailureType_1.WriteRoomSoundEffectFailureType.NotAuthorized,
                    },
                });
            }
            const entity = new mikro_orm_1.RoomSe({
                filePath: args.file.path,
                fileSourceType: args.file.sourceType,
                volume: args.volume,
            });
            entity.createdBy = core_1.Reference.create(authorizedUser);
            entity.room = core_1.Reference.create(room);
            await em.persistAndFlush(entity);
            const result = Object.assign(Object.assign({}, entity), { __tstype: graphql_2.RoomSoundEffectType, messageId: entity.id, createdBy: authorizedUser.userUid, createdAt: entity.createdAt.getTime(), file: {
                    path: entity.filePath,
                    sourceType: entity.fileSourceType,
                } });
            const payload = {
                type: 'messageUpdatePayload',
                roomId: args.roomId,
                createdBy: authorizedUser.userUid,
                visibleTo: undefined,
                value: result,
            };
            return result_1.Result.ok({ result, payload });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === promiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        if (result.value.value.payload != null) {
            await publishRoomEvent(pubSub, result.value.value.payload);
        }
        return result.value.value.result;
    }
    async makeMessageNotSecret(args, context, pubSub) {
        const queue = async () => {
            var _a, _b, _c, _d;
            const em = context.em;
            const authorizedUserUid = helpers_1.ensureAuthorizedUser(context).userUid;
            const findResult = await helpers_1.findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: args.roomId,
            });
            if (findResult == null) {
                return result_1.Result.ok({
                    result: {
                        failureType: MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType.RoomNotFound,
                    },
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return result_1.Result.ok({
                    result: {
                        failureType: MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType.NotParticipant,
                    },
                });
            }
            const publicMsg = await em.findOne(mikro_orm_1.RoomPubMsg, { id: args.messageId });
            if (publicMsg != null) {
                if (((_a = publicMsg.createdBy) === null || _a === void 0 ? void 0 : _a.userUid) !== authorizedUserUid) {
                    return result_1.Result.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType.NotYourMessage,
                        },
                    });
                }
                if (!publicMsg.isSecret) {
                    return result_1.Result.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType.NotSecret,
                        },
                    });
                }
                publicMsg.isSecret = false;
                await em.flush();
                const payloadValue = {
                    __tstype: graphql_2.RoomPublicMessageUpdateType,
                    messageId: publicMsg.id,
                    isSecret: publicMsg.isSecret,
                    updatedText: createUpdatedText(publicMsg),
                    commandResult: publicMsg.commandResult == null
                        ? undefined
                        : {
                            text: publicMsg.commandResult,
                            isSuccess: publicMsg.commandIsSuccess,
                        },
                    altTextToSecret: publicMsg.altTextToSecret,
                    updatedAt: publicMsg.textUpdatedAt,
                };
                return result_1.Result.ok({
                    result: {},
                    payload: {
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        visibleTo: undefined,
                        createdBy: (_b = publicMsg.createdBy) === null || _b === void 0 ? void 0 : _b.userUid,
                        value: payloadValue,
                    },
                });
            }
            const privateMsg = await em.findOne(mikro_orm_1.RoomPrvMsg, { id: args.messageId });
            if (privateMsg != null) {
                if (((_c = privateMsg.createdBy) === null || _c === void 0 ? void 0 : _c.userUid) !== authorizedUserUid) {
                    return result_1.Result.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType.NotYourMessage,
                        },
                    });
                }
                if (!privateMsg.isSecret) {
                    return result_1.Result.ok({
                        result: {
                            failureType: MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType.NotSecret,
                        },
                    });
                }
                privateMsg.isSecret = false;
                await em.flush();
                const payloadValue = {
                    __tstype: graphql_2.RoomPrivateMessageUpdateType,
                    messageId: privateMsg.id,
                    isSecret: privateMsg.isSecret,
                    updatedText: createUpdatedText(privateMsg),
                    commandResult: privateMsg.commandResult == null
                        ? undefined
                        : {
                            text: privateMsg.commandResult,
                            isSuccess: privateMsg.commandIsSuccess,
                        },
                    altTextToSecret: privateMsg.altTextToSecret,
                    updatedAt: privateMsg.textUpdatedAt,
                };
                return result_1.Result.ok({
                    result: {},
                    payload: {
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        visibleTo: (await privateMsg.visibleTo.loadItems()).map(user => user.userUid),
                        createdBy: (_d = privateMsg.createdBy) === null || _d === void 0 ? void 0 : _d.userUid,
                        value: payloadValue,
                    },
                });
            }
            return result_1.Result.ok({
                result: {
                    failureType: MakeMessageNotSecretFailureType_1.MakeMessageNotSecretFailureType.MessageNotFound,
                },
            });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === promiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        if (result.value.value.payload != null) {
            await publishRoomEvent(pubSub, result.value.value.payload);
        }
        return result.value.value.result;
    }
    async deleteMessage(args, context, pubSub) {
        const queue = async () => {
            var _a, _b, _c, _d;
            const em = context.em;
            const authorizedUserUid = helpers_1.ensureAuthorizedUser(context).userUid;
            const findResult = await helpers_1.findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: args.roomId,
            });
            if (findResult == null) {
                return result_1.Result.ok({
                    result: {
                        failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.RoomNotFound,
                    },
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return result_1.Result.ok({
                    result: {
                        failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.NotParticipant,
                    },
                });
            }
            const publicMsg = await em.findOne(mikro_orm_1.RoomPubMsg, { id: args.messageId });
            if (publicMsg != null) {
                if (((_a = publicMsg.createdBy) === null || _a === void 0 ? void 0 : _a.userUid) !== authorizedUserUid) {
                    return result_1.Result.ok({
                        result: {
                            failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.NotYourMessage,
                        },
                    });
                }
                if (publicMsg.initText == null &&
                    publicMsg.altTextToSecret == null &&
                    publicMsg.commandResult == null) {
                    return result_1.Result.ok({
                        result: {
                            failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.MessageDeleted,
                        },
                    });
                }
                publicMsg.updatedText = undefined;
                publicMsg.textUpdatedAt = new Date().getTime();
                await em.flush();
                const payloadValue = {
                    __tstype: graphql_2.RoomPublicMessageUpdateType,
                    messageId: publicMsg.id,
                    isSecret: publicMsg.isSecret,
                    updatedText: createUpdatedText(publicMsg),
                    commandResult: publicMsg.commandResult == null
                        ? undefined
                        : {
                            text: publicMsg.commandResult,
                            isSuccess: publicMsg.commandIsSuccess,
                        },
                    altTextToSecret: publicMsg.altTextToSecret,
                    updatedAt: publicMsg.textUpdatedAt,
                };
                return result_1.Result.ok({
                    result: {},
                    payload: {
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        visibleTo: undefined,
                        createdBy: (_b = publicMsg.createdBy) === null || _b === void 0 ? void 0 : _b.userUid,
                        value: payloadValue,
                    },
                });
            }
            const privateMsg = await em.findOne(mikro_orm_1.RoomPrvMsg, { id: args.messageId });
            if (privateMsg != null) {
                if (((_c = privateMsg.createdBy) === null || _c === void 0 ? void 0 : _c.userUid) !== authorizedUserUid) {
                    return result_1.Result.ok({
                        result: {
                            failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.NotYourMessage,
                        },
                    });
                }
                if (privateMsg.initText == null &&
                    privateMsg.altTextToSecret == null &&
                    privateMsg.commandResult == null) {
                    return result_1.Result.ok({
                        result: {
                            failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.MessageDeleted,
                        },
                    });
                }
                privateMsg.updatedText = undefined;
                privateMsg.textUpdatedAt = new Date().getTime();
                await em.flush();
                const payloadValue = {
                    __tstype: graphql_2.RoomPrivateMessageUpdateType,
                    updatedText: privateMsg.updatedText,
                    messageId: privateMsg.id,
                    isSecret: privateMsg.isSecret,
                    updatedAt: privateMsg.textUpdatedAt,
                };
                return result_1.Result.ok({
                    result: {},
                    payload: {
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        visibleTo: (await privateMsg.visibleTo.loadItems()).map(user => user.userUid),
                        createdBy: (_d = privateMsg.createdBy) === null || _d === void 0 ? void 0 : _d.userUid,
                        value: payloadValue,
                    },
                });
            }
            return result_1.Result.ok({
                result: {
                    failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.MessageNotFound,
                },
            });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === promiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        if (result.value.value.payload != null) {
            await publishRoomEvent(pubSub, result.value.value.payload);
        }
        return result.value.value.result;
    }
    async editMessage(args, context, pubSub) {
        const queue = async () => {
            var _a, _b, _c, _d;
            const em = context.em;
            const authorizedUserUid = helpers_1.ensureAuthorizedUser(context).userUid;
            const findResult = await helpers_1.findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: args.roomId,
            });
            if (findResult == null) {
                return result_1.Result.ok({
                    result: {
                        failureType: EditMessageFailureType_1.EditMessageFailureType.RoomNotFound,
                    },
                });
            }
            const { room, me } = findResult;
            if (me === undefined) {
                return result_1.Result.ok({
                    result: {
                        failureType: EditMessageFailureType_1.EditMessageFailureType.NotParticipant,
                    },
                });
            }
            const publicMsg = await em.findOne(mikro_orm_1.RoomPubMsg, { id: args.messageId });
            if (publicMsg != null) {
                if (((_a = publicMsg.createdBy) === null || _a === void 0 ? void 0 : _a.userUid) !== authorizedUserUid) {
                    return result_1.Result.ok({
                        result: {
                            failureType: EditMessageFailureType_1.EditMessageFailureType.NotYourMessage,
                        },
                    });
                }
                if (isDeleted(publicMsg)) {
                    return result_1.Result.ok({
                        result: {
                            failureType: EditMessageFailureType_1.EditMessageFailureType.MessageDeleted,
                        },
                    });
                }
                publicMsg.updatedText = args.text;
                publicMsg.textUpdatedAt = new Date().getTime();
                await em.flush();
                const payloadValue = {
                    __tstype: graphql_2.RoomPublicMessageUpdateType,
                    messageId: publicMsg.id,
                    isSecret: publicMsg.isSecret,
                    updatedText: createUpdatedText(publicMsg),
                    commandResult: publicMsg.commandResult == null
                        ? undefined
                        : {
                            text: publicMsg.commandResult,
                            isSuccess: publicMsg.commandIsSuccess,
                        },
                    altTextToSecret: publicMsg.altTextToSecret,
                    updatedAt: publicMsg.textUpdatedAt,
                };
                return result_1.Result.ok({
                    result: {},
                    payload: {
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        visibleTo: undefined,
                        createdBy: (_b = publicMsg.createdBy) === null || _b === void 0 ? void 0 : _b.userUid,
                        value: payloadValue,
                    },
                });
            }
            const privateMsg = await em.findOne(mikro_orm_1.RoomPrvMsg, { id: args.messageId });
            if (privateMsg != null) {
                if (((_c = privateMsg.createdBy) === null || _c === void 0 ? void 0 : _c.userUid) !== authorizedUserUid) {
                    return result_1.Result.ok({
                        result: {
                            failureType: EditMessageFailureType_1.EditMessageFailureType.NotYourMessage,
                        },
                    });
                }
                if (privateMsg.initText == null) {
                    return result_1.Result.ok({
                        result: {
                            failureType: EditMessageFailureType_1.EditMessageFailureType.MessageDeleted,
                        },
                    });
                }
                privateMsg.updatedText = args.text;
                privateMsg.textUpdatedAt = new Date().getTime();
                await em.flush();
                const payloadValue = {
                    __tstype: graphql_2.RoomPrivateMessageUpdateType,
                    messageId: privateMsg.id,
                    isSecret: privateMsg.isSecret,
                    updatedText: createUpdatedText(privateMsg),
                    commandResult: privateMsg.commandResult == null
                        ? undefined
                        : {
                            text: privateMsg.commandResult,
                            isSuccess: privateMsg.commandIsSuccess,
                        },
                    altTextToSecret: privateMsg.altTextToSecret,
                    updatedAt: privateMsg.textUpdatedAt,
                };
                return result_1.Result.ok({
                    result: {},
                    payload: {
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        visibleTo: (await privateMsg.visibleTo.loadItems()).map(user => user.userUid),
                        createdBy: (_d = privateMsg.createdBy) === null || _d === void 0 ? void 0 : _d.userUid,
                        value: payloadValue,
                    },
                });
            }
            return result_1.Result.ok({
                result: {
                    failureType: EditMessageFailureType_1.EditMessageFailureType.MessageNotFound,
                },
            });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === promiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        if (result.value.value.payload != null) {
            await publishRoomEvent(pubSub, result.value.value.payload);
        }
        return result.value.value.result;
    }
    async updateWritingMessageStatus(args, context, pubSub) {
        const authorizedUserUid = helpers_1.ensureAuthorizedUser(context).userUid;
        let status;
        switch (args.newStatus) {
            case WritingMessageStatusInputType_1.WritingMessageStatusInputType.Cleared:
                status = WritingMessageStatusType_1.WritingMessageStatusType.Cleared;
                break;
            case WritingMessageStatusInputType_1.WritingMessageStatusInputType.StartWriting:
                status = WritingMessageStatusType_1.WritingMessageStatusType.Writing;
                break;
            case WritingMessageStatusInputType_1.WritingMessageStatusInputType.KeepWriting:
                status = WritingMessageStatusType_1.WritingMessageStatusType.Writing;
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
    roomEvent(payload, id, context) {
        if (payload == null) {
            return undefined;
        }
        if (id !== payload.roomId) {
            return undefined;
        }
        if (context.decodedIdToken == null || context.decodedIdToken.isError) {
            return undefined;
        }
        const userUid = context.decodedIdToken.value.uid;
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
            if (payload.value.__tstype === graphql_2.RoomPrivateMessageType) {
                if (payload.value.visibleTo.every(vt => vt !== userUid)) {
                    return undefined;
                }
            }
            if (payload.value.__tstype === graphql_2.RoomPrivateMessageUpdateType) {
                if (payload.visibleTo == null) {
                    throw new Error('payload.visibleTo is required.');
                }
                if (payload.visibleTo.every(vt => vt !== userUid)) {
                    return undefined;
                }
            }
            switch (payload.value.__tstype) {
                case graphql_2.RoomPrivateMessageType:
                case graphql_2.RoomPublicMessageType: {
                    if (payload.value.isSecret && payload.value.createdBy !== userUid) {
                        return {
                            roomMessageEvent: Object.assign(Object.assign({}, payload.value), { initText: undefined, initTextSource: undefined, commandResult: undefined }),
                        };
                    }
                    break;
                }
                case graphql_2.RoomPrivateMessageUpdateType:
                case graphql_2.RoomPublicMessageUpdateType:
                    if (payload.value.isSecret && payload.createdBy !== userUid) {
                        return {
                            roomMessageEvent: Object.assign(Object.assign({}, payload.value), { initText: undefined, initTextSource: undefined, commandResult: undefined }),
                        };
                    }
                    break;
            }
            return { roomMessageEvent: payload.value };
        }
        if (id !== payload.roomId) {
            return undefined;
        }
        if (payload.type === 'deleteRoomPayload') {
            return {
                deleteRoomOperation: {
                    __tstype: graphql_1.deleteRoomOperation,
                    deletedBy: payload.deletedBy,
                },
            };
        }
        if (!payload.participants.has(userUid)) {
            return undefined;
        }
        if (payload.type === 'roomOperationPayload') {
            return {
                roomOperation: payload.generateOperation(userUid),
            };
        }
    }
};
__decorate([
    type_graphql_1.Query(() => GetRoomsListResult_1.GetRoomsListResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "getRoomsList", null);
__decorate([
    type_graphql_1.Query(() => RequiresPhraseResult_1.RequiresPhraseResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Arg('roomId')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "requiresPhraseToJoinAsPlayer", null);
__decorate([
    type_graphql_1.Query(() => graphql_2.GetRoomMessagesResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.GetMessagesArgs, Object]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "getMessages", null);
__decorate([
    type_graphql_1.Query(() => graphql_2.GetRoomLogResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.GetLogArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "getLog", null);
__decorate([
    type_graphql_1.Query(() => object_args_input_1.GetRoomConnectionsResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Arg('roomId')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "getRoomConnections", null);
__decorate([
    type_graphql_1.Mutation(() => CreateRoomResult_1.CreateRoomResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Arg('input')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.CreateRoomInput, Object]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "createRoom", null);
__decorate([
    type_graphql_1.Mutation(() => DeleteRoomResult_1.DeleteRoomResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.DeleteRoomArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "deleteRoom", null);
__decorate([
    type_graphql_1.Mutation(() => JoinRoomResult_1.JoinRoomResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.JoinRoomArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "joinRoomAsPlayer", null);
__decorate([
    type_graphql_1.Mutation(() => JoinRoomResult_1.JoinRoomResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.JoinRoomArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "joinRoomAsSpectator", null);
__decorate([
    type_graphql_1.Mutation(() => PromoteMeResult_1.PromoteResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.PromoteArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "promoteToPlayer", null);
__decorate([
    type_graphql_1.Mutation(() => ChangeParticipantNameResult_1.ChangeParticipantNameResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.ChangeParticipantNameArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "changeParticipantName", null);
__decorate([
    type_graphql_1.Query(() => GetRoomResult_1.GetRoomResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.GetRoomArgs, Object]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "getRoom", null);
__decorate([
    type_graphql_1.Mutation(() => LeaveRoomResult_1.LeaveRoomResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Arg('id')),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "leaveRoom", null);
__decorate([
    type_graphql_1.Mutation(() => OperateRoomResult_1.OperateRoomResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.OperateArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "operate", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.WritePublicRoomMessageResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.WritePublicMessageArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "writePublicMessage", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.WritePrivateRoomMessageResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.WritePrivateMessageArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "writePrivateMessage", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.WriteRoomSoundEffectResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.WriteRoomSoundEffectArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "writeRoomSoundEffect", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.MakeMessageNotSecretResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.MessageIdArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "makeMessageNotSecret", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.DeleteMessageResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.MessageIdArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "deleteMessage", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.EditMessageResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.EditMessageArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "editMessage", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.UpdateWritingMessageStateArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "updateWritingMessageStatus", null);
__decorate([
    type_graphql_1.Subscription(() => object_args_input_1.RoomEvent, { topics: Topics_1.ROOM_EVENT }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Arg('id')),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Object)
], RoomResolver.prototype, "roomEvent", null);
RoomResolver = RoomResolver_1 = __decorate([
    type_graphql_1.Resolver()
], RoomResolver);
exports.RoomResolver = RoomResolver;
