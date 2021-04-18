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
const class_validator_1 = require("class-validator");
let CreateRoomInput = class CreateRoomInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CreateRoomInput.prototype, "roomName", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CreateRoomInput.prototype, "participantName", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], CreateRoomInput.prototype, "joinAsPlayerPhrase", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], CreateRoomInput.prototype, "joinAsSpectatorPhrase", void 0);
CreateRoomInput = __decorate([
    type_graphql_1.InputType()
], CreateRoomInput);
let DeleteRoomArgs = class DeleteRoomArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], DeleteRoomArgs.prototype, "id", void 0);
DeleteRoomArgs = __decorate([
    type_graphql_1.ArgsType()
], DeleteRoomArgs);
let JoinRoomArgs = class JoinRoomArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], JoinRoomArgs.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], JoinRoomArgs.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], JoinRoomArgs.prototype, "phrase", void 0);
JoinRoomArgs = __decorate([
    type_graphql_1.ArgsType()
], JoinRoomArgs);
let PromoteArgs = class PromoteArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PromoteArgs.prototype, "roomId", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], PromoteArgs.prototype, "phrase", void 0);
PromoteArgs = __decorate([
    type_graphql_1.ArgsType()
], PromoteArgs);
let ChangeParticipantNameArgs = class ChangeParticipantNameArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ChangeParticipantNameArgs.prototype, "roomId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ChangeParticipantNameArgs.prototype, "newName", void 0);
ChangeParticipantNameArgs = __decorate([
    type_graphql_1.ArgsType()
], ChangeParticipantNameArgs);
let OperateArgs = class OperateArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], OperateArgs.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], OperateArgs.prototype, "prevRevision", void 0);
__decorate([
    type_graphql_1.Field(() => graphql_1.RoomOperationInput),
    __metadata("design:type", graphql_1.RoomOperationInput)
], OperateArgs.prototype, "operation", void 0);
__decorate([
    type_graphql_1.Field(),
    class_validator_1.MaxLength(10),
    __metadata("design:type", String)
], OperateArgs.prototype, "requestId", void 0);
OperateArgs = __decorate([
    type_graphql_1.ArgsType()
], OperateArgs);
let GetRoomArgs = class GetRoomArgs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetRoomArgs.prototype, "id", void 0);
GetRoomArgs = __decorate([
    type_graphql_1.ArgsType()
], GetRoomArgs);
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
                payload: roomOperationPayload,
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
            await pubSub.publish(Topics_1.ROOM_OPERATED, operateResult.payload);
        }
        return operateResult.result;
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
    type_graphql_1.Mutation(() => CreateRoomResult_1.CreateRoomResult),
    __param(0, type_graphql_1.Arg('input')), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateRoomInput, Object]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "createRoom", null);
__decorate([
    type_graphql_1.Mutation(() => DeleteRoomResult_1.DeleteRoomResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DeleteRoomArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "deleteRoom", null);
__decorate([
    type_graphql_1.Mutation(() => JoinRoomResult_1.JoinRoomResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [JoinRoomArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "joinRoomAsPlayer", null);
__decorate([
    type_graphql_1.Mutation(() => JoinRoomResult_1.JoinRoomResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [JoinRoomArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "joinRoomAsSpectator", null);
__decorate([
    type_graphql_1.Mutation(() => PromoteMeResult_1.PromoteResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PromoteArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "promoteToPlayer", null);
__decorate([
    type_graphql_1.Mutation(() => ChangeParticipantNameResult_1.ChangeParticipantNameResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()), __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ChangeParticipantNameArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "changeParticipantName", null);
__decorate([
    type_graphql_1.Query(() => GetRoomResult_1.GetRoomResult),
    __param(0, type_graphql_1.Args()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GetRoomArgs, Object]),
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
    __metadata("design:paramtypes", [OperateArgs, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "operate", null);
__decorate([
    type_graphql_1.Subscription(() => graphql_1.RoomOperated, { topics: Topics_1.ROOM_OPERATED, nullable: true }),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Arg('id')), __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Object)
], RoomResolver.prototype, "roomOperated", null);
RoomResolver = __decorate([
    type_graphql_1.Resolver()
], RoomResolver);
exports.RoomResolver = RoomResolver;
