import { Resolver, Query, Args, Mutation, Ctx, PubSub, Subscription, Root, ArgsType, Field, Arg, InputType, PubSubEngine, Int } from 'type-graphql';
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
import { RoomOperation, RoomOperated, RoomOperationInput, deleteRoomOperation } from '../../entities/room/graphql';
import { OperateRoomFailureType } from '../../../enums/OperateRoomFailureType';
import { ROOM_OPERATED } from '../../utils/Topics';
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

@InputType()
class CreateRoomInput {
    @Field()
    public roomName!: string;

    @Field()
    public participantName!: string;

    @Field({ nullable: true })
    public joinAsPlayerPhrase?: string;

    @Field({ nullable: true })
    public joinAsSpectatorPhrase?: string;
}

@ArgsType()
class DeleteRoomArgs {
    @Field()
    public id!: string;
}

@ArgsType()
class JoinRoomArgs {
    @Field()
    public id!: string;

    @Field()
    public name!: string;

    @Field({ nullable: true })
    public phrase?: string;
}

@ArgsType()
class PromoteArgs {
    @Field()
    public roomId!: string;

    @Field({ nullable: true })
    public phrase?: string;
}

@ArgsType()
class ChangeParticipantNameArgs {
    @Field()
    public roomId!: string;

    @Field()
    public newName!: string;
}

@ArgsType()
class OperateArgs {
    @Field()
    public id!: string;

    @Field(() => Int)
    public prevRevision!: number;

    @Field(() => RoomOperationInput)
    public operation!: RoomOperationInput;

    @Field()
    @MaxLength(10)
    public requestId!: string;
}

@ArgsType()
class GetRoomArgs {
    @Field()
    public id!: string;
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

type RoomOperatedPayload = RoomOperationPayload | DeleteRoomPayload;

type OperateCoreResult = {
    type: 'success';
    result: OperateRoomSuccessResult;
    payload: RoomOperationPayload;
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
}): Promise<{ result: typeof JoinRoomResult; payload: RoomOperatedPayload | undefined }> => {
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
}): Promise<{ result: typeof JoinRoomResult; payload: RoomOperatedPayload | undefined }> => {
    const decodedIdToken = checkSignIn(context);
    if (decodedIdToken === NotSignIn) {
        return { result: { failureType: JoinRoomFailureType.NotSignIn }, payload: undefined };
    }

    const queue = async (): Promise<{ result: typeof JoinRoomResult; payload: RoomOperatedPayload | undefined }> => {
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
}): Promise<{ result: PromoteResult; payload: RoomOperatedPayload | undefined }> => {
    const decodedIdToken = checkSignIn(context);
    if (decodedIdToken === NotSignIn) {
        return { result: { failureType: PromoteFailureType.NotSignIn }, payload: undefined };
    }

    const queue = async (): Promise<{ result: PromoteResult; payload: RoomOperatedPayload | undefined }> => {
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

    @Mutation(() => CreateRoomResult)
    public createRoom(@Arg('input') input: CreateRoomInput, @Ctx() context: ResolverContext): Promise<typeof CreateRoomResult> {
        return this.createRoomCore({ input, context, globalEntryPhrase: loadServerConfigAsMain().globalEntryPhrase });
    }

    public async deleteRoomCore({ args, context, globalEntryPhrase }: { args: DeleteRoomArgs; context: ResolverContext; globalEntryPhrase: string | undefined }): Promise<{ result: DeleteRoomResult; payload: RoomOperatedPayload | undefined }> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return {
                result: { failureType: DeleteRoomFailureType.NotSignIn },
                payload: undefined,
            };
        }

        const queue = async (): Promise<{ result: DeleteRoomResult; payload: RoomOperatedPayload | undefined }> => {
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
            await pubSub.publish(ROOM_OPERATED, payload);
        }
        return result;
    }

    public async joinRoomAsPlayerCore({ args, context, globalEntryPhrase }: { args: JoinRoomArgs; context: ResolverContext; globalEntryPhrase: string | undefined }): Promise<{ result: typeof JoinRoomResult; payload: RoomOperatedPayload | undefined }> {
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
            await pubSub.publish(ROOM_OPERATED, payload);
        }
        return result;
    }

    public async joinRoomAsSpectatorCore({ args, context, globalEntryPhrase }: { args: JoinRoomArgs; context: ResolverContext; globalEntryPhrase: string | undefined }): Promise<{ result: typeof JoinRoomResult; payload: RoomOperatedPayload | undefined }> {
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
            await pubSub.publish(ROOM_OPERATED, payload);
        }
        return result;
    }

    public async promoteToPlayerCore({ args, context, globalEntryPhrase }: { args: PromoteArgs; context: ResolverContext; globalEntryPhrase: string | undefined }): Promise<{ result: PromoteResult; payload: RoomOperatedPayload | undefined }> {
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
            await pubSub.publish(ROOM_OPERATED, payload);
        }
        return result;
    }

    public async changeParticipantNameCore({ args, context, globalEntryPhrase }: { args: ChangeParticipantNameArgs; context: ResolverContext; globalEntryPhrase: string | undefined }): Promise<{ result: ChangeParticipantNameResult; payload: RoomOperatedPayload | undefined }> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return { result: { failureType: ChangeParticipantNameFailureType.NotSignIn }, payload: undefined };
        }

        const queue = async (): Promise<{ result: ChangeParticipantNameResult; payload: RoomOperatedPayload | undefined }> => {
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
            await pubSub.publish(ROOM_OPERATED, payload);
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

    public async leaveRoomCore({ id, context }: { id: string; context: ResolverContext }): Promise<{ result: LeaveRoomResult; payload: RoomOperatedPayload | undefined }> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return {
                result: { failureType: LeaveRoomFailureType.NotSignIn },
                payload: undefined,
            };
        }

        const queue = async (): Promise<Result<{ result: LeaveRoomResult; payload: RoomOperatedPayload | undefined }>> => {
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
            await pubSub.publish(ROOM_OPERATED, payload);
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
                payload: roomOperationPayload,
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
            await pubSub.publish(ROOM_OPERATED, operateResult.payload);
        }
        return operateResult.result;
    }

    @Subscription(() => RoomOperated, { topics: ROOM_OPERATED, nullable: true })
    public roomOperated(@Root() payload: RoomOperatedPayload, @Arg('id') id: string, @Ctx() context: ResolverContext): typeof RoomOperated | undefined {
        // userUidが同じでも例えば異なるタブで同じRoomを開いているケースがある。そのため、Mutationを行ったuserUidにだけSubscriptionを送信しないことで通信量を節約、ということはできない。 

        if (context.decodedIdToken == null || context.decodedIdToken.isError) {
            return undefined;
        }
        const userUid = context.decodedIdToken.value.uid;
        if (id !== payload.roomId) {
            return undefined;
        }
        if (payload.type === 'deleteRoomPayload') {
            // Roomが削除されたことは非公開にする必要はないので、このように全員に通知して構わない。
            return {
                __tstype: deleteRoomOperation,
                deletedBy: payload.deletedBy,
            };
        }
        if (!payload.participants.has(userUid)) {
            return undefined;
        }
        if (payload.type === 'roomOperationPayload') {
            // TODO: DeleteRoomGetOperationも返す
            return payload.generateOperation(userUid);
        }
    }
}