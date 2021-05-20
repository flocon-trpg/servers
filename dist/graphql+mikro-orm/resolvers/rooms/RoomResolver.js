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
const Result_1 = require("../../../@shared/Result");
const LeaveRoomFailureType_1 = require("../../../enums/LeaveRoomFailureType");
const config_1 = require("../../../config");
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
const mikro_orm_1 = require("../../entities/roomMessage/mikro-orm");
const object_args_input_1 = require("./object+args+input");
const graphql_2 = require("../../entities/roomMessage/graphql");
const WritePublicRoomMessageFailureType_1 = require("../../../enums/WritePublicRoomMessageFailureType");
const Constants_1 = require("../../../@shared/Constants");
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
const publicChannelKey_1 = require("../../../@shared/publicChannelKey");
const RoomModule = __importStar(require("../../../@shared/ot/room/v1"));
const ParticipantModule = __importStar(require("../../../@shared/ot/room/participant/v1"));
const recordOperationElement_1 = require("../../../@shared/ot/room/util/recordOperationElement");
const utils_1 = require("../../../@shared/utils");
const FileSourceType_1 = require("../../../enums/FileSourceType");
const MyNumberValueModule = __importStar(require("../../../@shared/ot/room/participant/myNumberValue/log-v1"));
const ParticipantRole_1 = require("../../../enums/ParticipantRole");
const find = (source, key) => source[key];
const operateParticipantAndFlush = async ({ myUserUid, em, room, participantUserUids, create, update, }) => {
    const prevRevision = room.revision;
    const roomState = global_2.GlobalRoom.MikroORM.ToGlobal.state(room);
    const me = find(roomState.participants, myUserUid);
    let participantOperation = undefined;
    if (me == null) {
        if (create != null) {
            participantOperation = {
                type: recordOperationElement_1.replace,
                replace: {
                    newValue: {
                        $version: 1,
                        name: create.name,
                        role: create.role,
                        boards: {},
                        characters: {},
                        myNumberValues: {},
                    }
                },
            };
        }
    }
    else {
        if (update != null) {
            participantOperation = {
                type: 'update',
                update: {
                    $version: 1,
                    role: update.role,
                    name: update.name,
                }
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
        $version: 1,
        participants: {
            [myUserUid]: participantOperation,
        }
    };
    const transformed = RoomModule.serverTransform({ type: Types_1.server })({ prevState: roomState, currentState: roomState, clientOperation: roomUpOperation, serverOperation: undefined });
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
    const nextRoomState = global_2.GlobalRoom.Global.applyToEntity({ em, target: room, prevState: roomState, operation: transformedValue });
    await em.flush();
    const generateOperation = (deliverTo) => {
        return {
            __tstype: 'RoomOperation',
            revisionTo: prevRevision + 1,
            operatedBy: undefined,
            valueJson: global_2.GlobalRoom.Global.ToGraphQL.operation({
                operation: transformedValue,
                prevState: roomState,
                nextState: nextRoomState,
                requestedBy: { type: Types_1.client, userUid: deliverTo },
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
        const findResult = await helpers_1.findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.id });
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
        var _a;
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
        const findResult = await helpers_1.findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId });
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
                        myUserUid: decodedIdToken.uid,
                        update: {
                            role: { newValue: strategyResult },
                        }
                    }))) === null || _a === void 0 ? void 0 : _a.payload,
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
    const analyzed = await main_1.analyze(Object.assign(Object.assign({}, params), { gameType: (_a = params.gameType) !== null && _a !== void 0 ? _a : defaultGameType, text: params.textSource }));
    if (analyzed.isError) {
        return analyzed;
    }
    const targetEntity = params.type === 'RoomPubMsg' ? new mikro_orm_1.RoomPubMsg({ initTextSource: params.textSource, initText: analyzed.value.message }) : new mikro_orm_1.RoomPrvMsg({ initTextSource: params.textSource, initText: analyzed.value.message });
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
    return Result_1.ResultModule.ok(targetEntity);
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
    var _a, _b, _c, _d, _e;
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
        initText: (_b = msg.initText) !== null && _b !== void 0 ? _b : undefined,
        initTextSource: (_c = msg.initTextSource) !== null && _c !== void 0 ? _c : msg.initText,
        updatedText: createUpdatedText(msg),
        textColor: (_d = msg.textColor) !== null && _d !== void 0 ? _d : undefined,
        commandResult: msg.commandResult == null ? undefined : {
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
                value: {
                    $version: 1,
                    participants: {
                        [entryUser.userUid]: {
                            $version: 1,
                            role: ParticipantModule.Master,
                            name: input.participantName,
                            boards: {},
                            characters: {},
                            myNumberValues: {},
                        }
                    },
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
                }
            });
            newRoom.joinAsPlayerPhrase = input.joinAsPlayerPhrase;
            newRoom.joinAsSpectatorPhrase = input.joinAsSpectatorPhrase;
            const revision = newRoom.revision;
            em.persist(newRoom);
            const roomState = global_2.GlobalRoom.MikroORM.ToGlobal.state(newRoom);
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
            for (const msg of await room.myValueLogs.loadItems()) {
                myValueLogs.push(global_3.MyValueLog.MikroORM.ToGraphQL.state(msg));
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
            if (me.role === ParticipantModule.Spectator) {
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
            for (const msg of await room.myValueLogs.loadItems()) {
                myValueLogs.push(global_3.MyValueLog.MikroORM.ToGraphQL.state(msg));
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
                    type: 'messageUpdatePayload',
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
            await publishRoomEvent(pubSub, coreResult.payload);
        }
        return coreResult.result;
    }
    async getRoomConnectionsCore({ roomId, context }) {
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return { __tstype: object_args_input_1.GetRoomConnectionFailureResultType, failureType: GetRoomConnectionFailureType_1.GetRoomConnectionFailureType.NotSignIn };
        }
        const queue = async () => {
            const em = context.createEm();
            const entry = await helpers_1.checkEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (!entry) {
                return Result_1.ResultModule.ok({
                    __tstype: object_args_input_1.GetRoomConnectionFailureResultType,
                    failureType: GetRoomConnectionFailureType_1.GetRoomConnectionFailureType.NotEntry,
                });
            }
            const findResult = await helpers_1.findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId });
            if (findResult == null) {
                return Result_1.ResultModule.ok({
                    __tstype: object_args_input_1.GetRoomConnectionFailureResultType,
                    failureType: GetRoomConnectionFailureType_1.GetRoomConnectionFailureType.RoomNotFound,
                });
            }
            const { me } = findResult;
            if ((me === null || me === void 0 ? void 0 : me.role) === undefined) {
                return Result_1.ResultModule.ok({
                    __tstype: object_args_input_1.GetRoomConnectionFailureResultType,
                    failureType: GetRoomConnectionFailureType_1.GetRoomConnectionFailureType.NotParticipant,
                });
            }
            return Result_1.ResultModule.ok({
                __tstype: object_args_input_1.GetRoomConnectionSuccessResultType,
                connectedUserUids: [...context.connectionManager.listRoomConnections({ roomId })].filter(([key, value]) => value > 0).map(([key]) => key),
                fetchedAt: new Date().getTime(),
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
    async getRoomConnections(roomId, context) {
        const coreResult = await this.getRoomConnectionsCore({ roomId, context });
        return coreResult;
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
            var _a, _b, _c, _d, _e, _f;
            const em = context.createEm();
            const entryUser = await helpers_1.getUserIfEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (entryUser == null) {
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
            const { room, me, roomState } = findResult;
            if (me === undefined) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.WritePublicRoomMessageFailureResultType,
                        failureType: WritePublicRoomMessageFailureType_1.WritePublicRoomMessageFailureType.NotParticipant,
                    }
                });
            }
            const channelKeyFailureType = checkChannelKey(channelKey, me.role === ParticipantModule.Spectator);
            if (channelKeyFailureType != null) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.WritePublicRoomMessageFailureResultType,
                        failureType: WritePublicRoomMessageFailureType_1.WritePublicRoomMessageFailureType.NotAuthorized,
                    }
                });
            }
            let chara = undefined;
            if (args.characterStateId != null) {
                const characters = (_b = (_a = find(roomState.participants, decodedIdToken.uid)) === null || _a === void 0 ? void 0 : _a.characters) !== null && _b !== void 0 ? _b : {};
                chara = find(characters, args.characterStateId);
            }
            const entityResult = await analyzeTextAndSetToEntity({
                type: 'RoomPubMsg',
                textSource: args.text,
                context: chara == null ? null : { type: 'chara', value: chara },
                createdBy: entryUser,
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
                entity.charaImageSourceType = FileSourceType_1.FileSourceType.ofNullishString((_d = chara.image) === null || _d === void 0 ? void 0 : _d.sourceType);
                entity.charaTachieImagePath = (_e = chara.tachieImage) === null || _e === void 0 ? void 0 : _e.path;
                entity.charaTachieImageSourceType = FileSourceType_1.FileSourceType.ofNullishString((_f = chara.tachieImage) === null || _f === void 0 ? void 0 : _f.sourceType);
            }
            entity.roomPubCh = core_1.Reference.create(ch);
            await em.persistAndFlush(entity);
            const result = createRoomPublicMessage({ msg: entity, channelKey });
            const payload = {
                type: 'messageUpdatePayload',
                roomId: args.roomId,
                createdBy: decodedIdToken.uid,
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
            await publishRoomEvent(pubSub, payload);
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
                return ParticipantModule.Player;
            }
        });
    }
    async joinRoomAsPlayer(args, context, pubSub) {
        const { result, payload } = await this.joinRoomAsPlayerCore({ args, context, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
        if (payload != null) {
            await publishRoomEvent(pubSub, payload);
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
                return ParticipantModule.Spectator;
            }
        });
    }
    async joinRoomAsSpectator(args, context, pubSub) {
        const { result, payload } = await this.joinRoomAsSpectatorCore({ args, context, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
        if (payload != null) {
            await publishRoomEvent(pubSub, payload);
        }
        return result;
    }
    async promoteToPlayerCore({ args, context, globalEntryPhrase }) {
        return promoteMeCore(Object.assign(Object.assign({}, args), { context,
            globalEntryPhrase, strategy: ({ me, room }) => {
                switch (me.role) {
                    case ParticipantModule.Master:
                    case ParticipantModule.Player:
                        return PromoteFailureType_1.PromoteFailureType.NoNeedToPromote;
                    case ParticipantModule.Spectator: {
                        if (room.joinAsPlayerPhrase != null && room.joinAsPlayerPhrase !== args.phrase) {
                            return PromoteFailureType_1.PromoteFailureType.WrongPhrase;
                        }
                        return ParticipantModule.Player;
                    }
                    case null:
                    case undefined:
                        return PromoteFailureType_1.PromoteFailureType.NotParticipant;
                }
            } }));
    }
    async promoteToPlayer(args, context, pubSub) {
        const { result, payload } = await this.promoteToPlayerCore({ args, context, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
        if (payload != null) {
            await publishRoomEvent(pubSub, payload);
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
            const findResult = await helpers_1.findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
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
                payload: payload,
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
            await publishRoomEvent(pubSub, payload);
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
            const roomState = global_2.GlobalRoom.MikroORM.ToGlobal.state(room);
            return Result_1.ResultModule.ok({
                role: ParticipantRole_1.ParticipantRole.ofString(me.role),
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
            const findResult = await helpers_1.findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: id });
            if (findResult == null) {
                return Result_1.ResultModule.ok({
                    result: { failureType: LeaveRoomFailureType_1.LeaveRoomFailureType.NotFound },
                    payload: undefined,
                });
            }
            const { me, room } = findResult;
            const participantUserUids = findResult.participantIds();
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
                payload: payload,
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
            await publishRoomEvent(pubSub, payload);
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
            var _a, _b;
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
            const findResult = await helpers_1.findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.id });
            if (findResult == null) {
                return Result_1.ResultModule.ok({
                    type: 'failure',
                    result: { failureType: OperateRoomFailureType_1.OperateRoomFailureType.NotFound }
                });
            }
            const { room, me, roomState } = findResult;
            const participantUserUids = findResult.participantIds();
            if (me === undefined) {
                return Result_1.ResultModule.ok({
                    type: 'nonJoined',
                    result: { roomAsListItem: global_1.stateToGraphQL({ roomEntity: room }) }
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
                const restoredRoom = RoomModule.restore({
                    nextState: roomState,
                    downOperation: downOperation.value
                });
                if (restoredRoom.isError) {
                    return restoredRoom;
                }
                prevState = restoredRoom.value.prevState;
                twoWayOperation = restoredRoom.value.twoWayOperation;
            }
            const transformed = RoomModule.serverTransform({ type: Types_1.client, userUid: decodedIdToken.uid })({
                prevState,
                currentState: roomState,
                clientOperation: clientOperation,
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
            for (const pair of utils_1.recordToArray((_a = operation.participants) !== null && _a !== void 0 ? _a : {})) {
                const userUid = pair.key;
                const participant = pair.value;
                if (participant.type === recordOperationElement_1.replace) {
                    if (participant.replace.oldValue != null) {
                        utils_1.recordForEach(participant.replace.oldValue.myNumberValues, async (value, key) => myValueLogs.push(new mikro_orm_1.MyValueLog({
                            createdBy: userUid,
                            room,
                            stateId: key,
                            value: {
                                $version: 1,
                                type: MyNumberValueModule.deleteType
                            },
                        })));
                    }
                    if (participant.replace.newValue != null) {
                        utils_1.recordForEach(participant.replace.newValue.myNumberValues, async (value, key) => myValueLogs.push(new mikro_orm_1.MyValueLog({
                            createdBy: userUid,
                            room,
                            stateId: key,
                            value: {
                                $version: 1,
                                type: MyNumberValueModule.createType
                            },
                        })));
                    }
                }
                if (participant.type === recordOperationElement_1.update) {
                    utils_1.recordForEach((_b = participant.update.myNumberValues) !== null && _b !== void 0 ? _b : {}, (value, key) => {
                        if (value.type === recordOperationElement_1.replace) {
                            myValueLogs.push(new mikro_orm_1.MyValueLog({
                                createdBy: userUid,
                                room,
                                stateId: key,
                                value: value.replace.newValue == null ? {
                                    $version: 1,
                                    type: MyNumberValueModule.deleteType
                                } : {
                                    $version: 1,
                                    type: MyNumberValueModule.createType
                                },
                            }));
                        }
                        else {
                            myValueLogs.push(new mikro_orm_1.MyValueLog({
                                createdBy: userUid,
                                room,
                                stateId: key,
                                value: MyNumberValueModule.ofOperation(value.update),
                            }));
                        }
                    });
                }
            }
            for (const log of myValueLogs) {
                em.persist(log);
            }
            const nextRoomState = global_2.GlobalRoom.Global.applyToEntity({ em, target: room, prevState: roomState, operation });
            await em.flush();
            const generateOperation = (deliverTo) => {
                return {
                    __tstype: 'RoomOperation',
                    revisionTo: prevRevision + 1,
                    operatedBy: {
                        userUid: decodedIdToken.uid,
                        clientId: args.operation.clientId,
                    },
                    valueJson: global_2.GlobalRoom.Global.ToGraphQL.operation({
                        operation,
                        prevState: roomState,
                        nextState: nextRoomState,
                        requestedBy: { type: Types_1.client, userUid: deliverTo },
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
                messageUpdatePayload: myValueLogs.map(log => ({
                    type: 'messageUpdatePayload',
                    roomId: room.id,
                    createdBy: undefined,
                    visibleTo: undefined,
                    value: global_3.MyValueLog.MikroORM.ToGraphQL.state(log),
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
            await publishRoomEvent(pubSub, operateResult.roomOperationPayload);
            for (const messageUpdate of operateResult.messageUpdatePayload) {
                await publishRoomEvent(pubSub, messageUpdate);
            }
        }
        return operateResult.result;
    }
    async writePublicMessage(args, context, pubSub) {
        const coreResult = await this.writePublicMessageCore({ args, context, channelKey: args.channelKey });
        if (coreResult.payload != null) {
            await publishRoomEvent(pubSub, coreResult.payload);
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
            var _a, _b, _c, _d, _e, _f;
            const em = context.createEm();
            const entryUser = await helpers_1.getUserIfEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (entryUser == null) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.WritePrivateRoomMessageFailureResultType,
                        failureType: WritePrivateRoomMessageFailureType_1.WritePrivateRoomMessageFailureType.NotEntry,
                    }
                });
            }
            const findResult = await helpers_1.findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.roomId });
            if (findResult == null) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.WritePrivateRoomMessageFailureResultType,
                        failureType: WritePrivateRoomMessageFailureType_1.WritePrivateRoomMessageFailureType.RoomNotFound,
                    }
                });
            }
            const { room, me, roomState } = findResult;
            if (me === undefined) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.WritePrivateRoomMessageFailureResultType,
                        failureType: WritePrivateRoomMessageFailureType_1.WritePrivateRoomMessageFailureType.NotParticipant,
                    }
                });
            }
            const visibleTo = new Set(args.visibleTo);
            visibleTo.add(decodedIdToken.uid);
            await entryUser.visibleRoomPrvMsgs.init({ where: { room: { id: room.id } } });
            let chara = undefined;
            if (args.characterStateId != null) {
                const characters = (_b = (_a = find(roomState.participants, decodedIdToken.uid)) === null || _a === void 0 ? void 0 : _a.characters) !== null && _b !== void 0 ? _b : {};
                chara = find(characters, args.characterStateId);
            }
            const entityResult = await analyzeTextAndSetToEntity({
                type: 'RoomPrvMsg',
                textSource: args.text,
                context: chara == null ? null : { type: 'chara', value: chara },
                createdBy: entryUser,
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
                    return Result_1.ResultModule.ok({
                        result: {
                            __tstype: graphql_2.WritePrivateRoomMessageFailureResultType,
                            failureType: WritePrivateRoomMessageFailureType_1.WritePrivateRoomMessageFailureType.VisibleToIsInvalid,
                        }
                    });
                }
                ;
                entity.visibleTo.add(user);
            }
            entity.customName = args.customName;
            if (chara != null) {
                entity.charaStateId = args.characterStateId;
                entity.charaName = chara.name;
                entity.charaIsPrivate = chara.isPrivate;
                entity.charaImagePath = (_c = chara.image) === null || _c === void 0 ? void 0 : _c.path;
                entity.charaImageSourceType = FileSourceType_1.FileSourceType.ofNullishString((_d = chara.tachieImage) === null || _d === void 0 ? void 0 : _d.sourceType);
                entity.charaTachieImagePath = (_e = chara.tachieImage) === null || _e === void 0 ? void 0 : _e.path;
                entity.charaTachieImageSourceType = FileSourceType_1.FileSourceType.ofNullishString((_f = chara.tachieImage) === null || _f === void 0 ? void 0 : _f.sourceType);
            }
            entity.room = core_1.Reference.create(room);
            await em.persistAndFlush(entity);
            const visibleToArray = [...visibleTo].sort();
            const result = await createRoomPrivateMessage({ msg: entity, myUserUid: entryUser.userUid, visibleTo: visibleToArray, visibleToMe: true });
            if (result == null) {
                throw 'This should not happen';
            }
            const payload = {
                type: 'messageUpdatePayload',
                roomId: args.roomId,
                createdBy: entryUser.userUid,
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
            await publishRoomEvent(pubSub, coreResult.payload);
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
            const entryUser = await helpers_1.getUserIfEntry({ userUid: decodedIdToken.uid, em, globalEntryPhrase: config_1.loadServerConfigAsMain().globalEntryPhrase });
            await em.flush();
            if (entryUser == null) {
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
            if (me.role === ParticipantModule.Spectator) {
                return Result_1.ResultModule.ok({
                    result: {
                        __tstype: graphql_2.WriteRoomSoundEffectFailureResultType,
                        failureType: WriteRoomSoundEffectFailureType_1.WriteRoomSoundEffectFailureType.NotAuthorized,
                    }
                });
            }
            const entity = new mikro_orm_1.RoomSe({
                filePath: args.file.path,
                fileSourceType: args.file.sourceType,
                volume: args.volume,
            });
            entity.createdBy = core_1.Reference.create(entryUser);
            entity.room = core_1.Reference.create(room);
            await em.persistAndFlush(entity);
            const result = Object.assign(Object.assign({}, entity), { __tstype: graphql_2.RoomSoundEffectType, messageId: entity.id, createdBy: decodedIdToken.uid, createdAt: entity.createdAt.getTime(), file: {
                    path: entity.filePath,
                    sourceType: entity.fileSourceType,
                } });
            const payload = {
                type: 'messageUpdatePayload',
                roomId: args.roomId,
                createdBy: decodedIdToken.uid,
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
            await publishRoomEvent(pubSub, coreResult.payload);
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
            const publicMsg = await em.findOne(mikro_orm_1.RoomPubMsg, { id: args.messageId });
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
                    updatedText: createUpdatedText(publicMsg),
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
                    updatedText: createUpdatedText(privateMsg),
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
                        type: 'messageUpdatePayload',
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
            await publishRoomEvent(pubSub, coreResult.payload);
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
            const publicMsg = await em.findOne(mikro_orm_1.RoomPubMsg, { id: args.messageId });
            if (publicMsg != null) {
                if (((_a = publicMsg.createdBy) === null || _a === void 0 ? void 0 : _a.userUid) !== decodedIdToken.uid) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.NotYourMessage,
                        }
                    });
                }
                if (publicMsg.initText == null && publicMsg.altTextToSecret == null && publicMsg.commandResult == null) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.MessageDeleted,
                        }
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
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        visibleTo: undefined,
                        createdBy: (_b = publicMsg.createdBy) === null || _b === void 0 ? void 0 : _b.userUid,
                        value: payloadValue,
                    }
                });
            }
            const privateMsg = await em.findOne(mikro_orm_1.RoomPrvMsg, { id: args.messageId });
            if (privateMsg != null) {
                if (((_c = privateMsg.createdBy) === null || _c === void 0 ? void 0 : _c.userUid) !== decodedIdToken.uid) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.NotYourMessage,
                        }
                    });
                }
                if (privateMsg.initText == null && privateMsg.altTextToSecret == null && privateMsg.commandResult == null) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: DeleteMessageFailureType_1.DeleteMessageFailureType.MessageDeleted,
                        }
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
                return Result_1.ResultModule.ok({
                    result: {},
                    payload: {
                        type: 'messageUpdatePayload',
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
            await publishRoomEvent(pubSub, coreResult.payload);
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
            const publicMsg = await em.findOne(mikro_orm_1.RoomPubMsg, { id: args.messageId });
            if (publicMsg != null) {
                if (((_a = publicMsg.createdBy) === null || _a === void 0 ? void 0 : _a.userUid) !== decodedIdToken.uid) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: EditMessageFailureType_1.EditMessageFailureType.NotYourMessage,
                        }
                    });
                }
                if (isDeleted(publicMsg)) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: EditMessageFailureType_1.EditMessageFailureType.MessageDeleted,
                        }
                    });
                }
                publicMsg.initText = args.text;
                publicMsg.textUpdatedAt = new Date().getTime();
                await em.flush();
                const payloadValue = {
                    __tstype: graphql_2.RoomPublicMessageUpdateType,
                    messageId: publicMsg.id,
                    isSecret: publicMsg.isSecret,
                    updatedText: createUpdatedText(publicMsg),
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
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        visibleTo: undefined,
                        createdBy: (_b = publicMsg.createdBy) === null || _b === void 0 ? void 0 : _b.userUid,
                        value: payloadValue,
                    }
                });
            }
            const privateMsg = await em.findOne(mikro_orm_1.RoomPrvMsg, { id: args.messageId });
            if (privateMsg != null) {
                if (((_c = privateMsg.createdBy) === null || _c === void 0 ? void 0 : _c.userUid) !== decodedIdToken.uid) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: EditMessageFailureType_1.EditMessageFailureType.NotYourMessage,
                        }
                    });
                }
                if (privateMsg.initText == null) {
                    return Result_1.ResultModule.ok({
                        result: {
                            failureType: EditMessageFailureType_1.EditMessageFailureType.MessageDeleted,
                        }
                    });
                }
                privateMsg.initText = args.text;
                privateMsg.textUpdatedAt = new Date().getTime();
                await em.flush();
                const payloadValue = {
                    __tstype: graphql_2.RoomPrivateMessageUpdateType,
                    messageId: privateMsg.id,
                    isSecret: privateMsg.isSecret,
                    updatedText: createUpdatedText(privateMsg),
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
                        type: 'messageUpdatePayload',
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
            await publishRoomEvent(pubSub, coreResult.payload);
        }
        return coreResult.result;
    }
    async updateWritingMessageStatus(args, context, pubSub) {
        if (!publicChannelKey_1.PublicChannelKey.Without$System.isPublicChannelKey(args.publicChannelKey)) {
            return false;
        }
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return false;
        }
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
        const returns = context.connectionManager.onWritingMessageStatusUpdate({
            roomId: args.roomId,
            userUid: decodedIdToken.uid,
            publicChannelKey: args.publicChannelKey,
            status,
        });
        if (returns != null) {
            await publishRoomEvent(pubSub, {
                type: 'writingMessageStatusUpdatePayload',
                roomId: args.roomId,
                userUid: decodedIdToken.uid,
                status: returns,
                updatedAt: new Date().getTime(),
                publicChannelKey: args.publicChannelKey,
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
                }
            };
        }
        if (payload.type === 'writingMessageStatusUpdatePayload') {
            return {
                writingMessageStatus: {
                    userUid: payload.userUid,
                    publicChannelKey: payload.publicChannelKey,
                    status: payload.status,
                    updatedAt: payload.updatedAt,
                }
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
                        return {
                            roomMessageEvent: Object.assign(Object.assign({}, payload.value), { initText: undefined, initTextSource: undefined, commandResult: undefined })
                        };
                    }
                    break;
                }
                case graphql_2.RoomPrivateMessageUpdateType:
                case graphql_2.RoomPublicMessageUpdateType:
                    if (payload.value.isSecret && (payload.createdBy !== userUid)) {
                        return {
                            roomMessageEvent: Object.assign(Object.assign({}, payload.value), { initText: undefined, initTextSource: undefined, commandResult: undefined })
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
                }
            };
        }
        if (!payload.participants.has(userUid)) {
            return undefined;
        }
        if (payload.type === 'roomOperationPayload') {
            return {
                roomOperation: payload.generateOperation(userUid)
            };
        }
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
    __metadata("design:paramtypes", [object_args_input_1.GetMessagesArgs, Object]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "getMessages", null);
__decorate([
    type_graphql_1.Query(() => graphql_2.GetRoomLogResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.GetLogArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "getLog", null);
__decorate([
    type_graphql_1.Query(() => object_args_input_1.GetRoomConnectionsResult),
    __param(0, type_graphql_1.Arg('roomId')), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "getRoomConnections", null);
__decorate([
    type_graphql_1.Mutation(() => CreateRoomResult_1.CreateRoomResult),
    __param(0, type_graphql_1.Arg('input')), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.CreateRoomInput, Object]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "createRoom", null);
__decorate([
    type_graphql_1.Mutation(() => DeleteRoomResult_1.DeleteRoomResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.DeleteRoomArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "deleteRoom", null);
__decorate([
    type_graphql_1.Mutation(() => JoinRoomResult_1.JoinRoomResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.JoinRoomArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "joinRoomAsPlayer", null);
__decorate([
    type_graphql_1.Mutation(() => JoinRoomResult_1.JoinRoomResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.JoinRoomArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "joinRoomAsSpectator", null);
__decorate([
    type_graphql_1.Mutation(() => PromoteMeResult_1.PromoteResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.PromoteArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "promoteToPlayer", null);
__decorate([
    type_graphql_1.Mutation(() => ChangeParticipantNameResult_1.ChangeParticipantNameResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.ChangeParticipantNameArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "changeParticipantName", null);
__decorate([
    type_graphql_1.Query(() => GetRoomResult_1.GetRoomResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.GetRoomArgs, Object]),
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
    __metadata("design:paramtypes", [object_args_input_1.OperateArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "operate", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.WritePublicRoomMessageResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.WritePublicMessageArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "writePublicMessage", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.WritePrivateRoomMessageResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.WritePrivateMessageArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "writePrivateMessage", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.WriteRoomSoundEffectResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.WriteRoomSoundEffectArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "writeRoomSoundEffect", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.MakeMessageNotSecretResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.MessageIdArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "makeMessageNotSecret", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.DeleteMessageResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.MessageIdArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "deleteMessage", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_2.EditMessageResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.EditMessageArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "editMessage", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.UpdateWritingMessageStateArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "updateWritingMessageStatus", null);
__decorate([
    type_graphql_1.Subscription(() => object_args_input_1.RoomEvent, { topics: Topics_1.ROOM_EVENT, nullable: true }),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Arg('id')), __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Object)
], RoomResolver.prototype, "roomEvent", null);
RoomResolver = __decorate([
    type_graphql_1.Resolver()
], RoomResolver);
exports.RoomResolver = RoomResolver;
