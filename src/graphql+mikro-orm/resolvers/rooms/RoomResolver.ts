import { Resolver, Query, Args, Mutation, Ctx, PubSub, Subscription, Root, ArgsType, Field, Arg, Publisher, InputType, PubSubEngine, Int, ObjectType, createUnionType } from 'type-graphql';

import { ResolverContext } from '../../utils/Contexts';
import { ParticipantRole } from '../../../enums/ParticipantRole';
import { GetRoomFailureType } from '../../../enums/GetRoomFailureType';
import { GetRoomsListFailureType } from '../../../enums/GetRoomsListFailureType';
import { CreateRoomFailureType } from '../../../enums/CreateRoomFailureType';
import { checkEntry, checkSignIn, findRoomAndMyParticipant, findRoomAndMyParticipantAndParitipantUserUids, getUserIfEntry, NotSignIn } from '../utils/helpers';
import { JoinRoomFailureType } from '../../../enums/JoinRoomFailureType';
import * as Room$MikroORM from '../../entities/room/mikro-orm';
import * as Room$Global from '../../entities/room/global';
import * as Participant$GraphQL from '../../entities/participant/graphql';
import { stateToGraphql as stateToGraphql$RoomAsListItem } from '../../entities/roomAsListItem/global';
import { queueLimitReached } from '../../../utils/PromiseQueue';
import { serverTooBusyMessage } from '../utils/messages';
import { RoomOperation, RoomOperated, RoomOperationInput } from '../../entities/room/graphql';
import { OperateRoomFailureType } from '../../../enums/OperateRoomFailureType';
import { ROOM_OPERATED } from '../../utils/Topics';
import { Result, ResultModule } from '../../../@shared/Result';
import * as User$MikroORM from '../../entities/user/mikro-orm';
import { createPrivateMessages, createPublicMessages } from '../utils/sample';
import { LeaveRoomFailureType } from '../../../enums/LeaveRoomFailureType';
import { loadServerConfigAsMain } from '../../../config';
import { Partici } from '../../entities/participant/mikro-orm';
import { addAndCreateGraphQLOperation, toGraphQL as toParticipantsGraphQL, updateAndCreateGraphQLOperation } from '../../entities/participant/global';
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

    @Field({ nullable: true })
    public deletePhrase?: string;
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
    graphQLOperationGenerator: Room$Global.GraphQLOperationGenerator;
    operatedBy: string;
}

type ParticipantOperationPayload = {
    type: 'participantOperation';
    roomId: string;
    participants: ReadonlySet<string>; // UserUid
    participantsOperation: Participant$GraphQL.ParticipantsOperation;
}

type RoomOperatedPayload = RoomOperationPayload | ParticipantOperationPayload;

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
                let graphQLOperation: Participant$GraphQL.ParticipantsOperation;
                if (me == null) {
                    graphQLOperation = await addAndCreateGraphQLOperation({
                        em,
                        userUid: decodedIdToken.uid,
                        newValue: { role: strategyResult, name: args.name },
                        user: entryUser,
                        room,
                    });
                } else {
                    graphQLOperation = await updateAndCreateGraphQLOperation({
                        em,
                        userUid: decodedIdToken.uid,
                        operation: {
                            role: { newValue: strategyResult },
                            name: { newValue: args.name },
                        },
                        room,
                    });
                }
                await em.flush();
                return {
                    result: {
                        operation: graphQLOperation,
                    },
                    payload: {
                        type: 'participantOperation',
                        // Roomに参加したばかりの場合、decodedToken.uidはparticipantUserUidsに含まれないためSubscriptionは実行されない。だが、そのようなユーザーにroomOperatedで通知する必要はないため問題ない。
                        participants: participantUserUids,
                        participantsOperation: graphQLOperation,
                        roomId: room.id,
                    },
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
                const graphQLOperation = await updateAndCreateGraphQLOperation({
                    em,
                    userUid: decodedIdToken.uid,
                    operation: {
                        role: { newValue: strategyResult },
                    },
                    room,
                });

                await em.flush();
                return {
                    result: {
                        failureType: undefined,
                    },
                    payload: {
                        type: 'participantOperation',
                        participants: participantUserUids,
                        participantsOperation: graphQLOperation,
                        roomId: room.id,
                    },
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
            const newRoom = new Room$MikroORM.Room({ name: input.roomName });
            // このRoomのroomOperatedを購読しているユーザーはいないので、roomOperatedは実行する必要がない。
            const newParticipant = new Partici({ role: ParticipantRole.Master, name: input.participantName });
            newRoom.particis.add(newParticipant);
            entryUser.particis.add(newParticipant);
            newRoom.deletePhrase = input.deletePhrase;
            newRoom.joinAsPlayerPhrase = input.joinAsPlayerPhrase;
            newRoom.joinAsSpectatorPhrase = input.joinAsSpectatorPhrase;
            em.persist(newRoom);
            const roomState = await Room$Global.RoomState.create(newRoom);
            const graphqlState = await roomState.toGraphQL({
                deliverTo: decodedIdToken.uid,
                revision: newRoom.roomRevision
            });
            await em.flush();
            return {
                room: graphqlState,
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

            const graphQLOperation = await updateAndCreateGraphQLOperation({
                em,
                userUid: decodedIdToken.uid,
                operation: {
                    name: {newValue: args.newName },
                },
                room,
            });

            await em.flush();
            return {
                result: {
                    failureType: undefined,
                },
                payload: {
                    type: 'participantOperation',
                    participants: participantUserUids,
                    participantsOperation: graphQLOperation,
                    roomId: room.id,
                },
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

            const roomState = await Room$Global.RoomState.create(room);
            return ResultModule.ok({
                role: me.role,
                room: await roomState.toGraphQL({ revision: room.roomRevision, deliverTo: decodedIdToken.uid }),
                participants: await toParticipantsGraphQL({ room }),
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
            const graphQLOperation = await updateAndCreateGraphQLOperation({
                em,
                userUid: decodedIdToken.uid,
                operation: {
                    role: { newValue: undefined }
                },
                room,
            });
            await em.flush();
            return ResultModule.ok({
                result: {},
                payload: {
                    type: 'participantOperation',
                    participants: participantUserUids,
                    participantsOperation: graphQLOperation,
                    roomId: room.id,
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
            const roomState = await Room$Global.RoomState.create(room);
            const downOperation = await Room$Global.RoomDownOperation.findRange(em, room.id, { from: args.prevRevision, expectedTo: room.roomRevision });
            if (downOperation.isError) {
                return downOperation;
            }

            const restoredRoom = Room$Global.RoomState.restore({
                nextState: roomState,
                downOperation: downOperation.value
            });
            if (restoredRoom.isError) {
                return restoredRoom;
            }

            const transformed = restoredRoom.value.transform({ clientOperation: args.operation.value, operatedBy: decodedIdToken.uid });
            if (transformed.isError) {
                return transformed;
            }
            if (transformed.value === undefined) {
                return ResultModule.ok({ type: 'id', result: { requestId: args.requestId } });
            }
            const graphQLOperationGenerator = await transformed.value.applyAndCreateOperation({ em, entity: room });
            await em.flush();

            const roomOperationPayload: RoomOperationPayload = {
                type: 'roomOperationPayload',
                roomId: args.id,
                participants: participantUserUids,
                graphQLOperationGenerator,
                operatedBy: decodedIdToken.uid,
            };
            const result: OperateCoreResult = {
                type: 'success',
                payload: roomOperationPayload,
                result: {
                    operation: graphQLOperationGenerator.toGraphQLOperation({
                        operatedBy: decodedIdToken.uid,
                        deliverTo: decodedIdToken.uid,
                        nextRevision: graphQLOperationGenerator.currentRevision
                    })
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
        if (context.decodedIdToken == null || context.decodedIdToken.isError) {
            return undefined;
        }
        const userUid = context.decodedIdToken.value.uid;
        if (id !== payload.roomId) {
            return undefined;
        }
        if (!payload.participants.has(userUid)) {
            return undefined;
        }
        if (payload.type === 'roomOperationPayload') {
            // web_api側ではpayload.operatedBy === userUidを満たすSubscriptionは無視している（代わりにMutationの結果を用いる）ため、この条件を満たすSubscriptionを送信しないことで通信量の削減が期待できる。だが、ParticipantsOperationと挙動が異なるのは直感的でないため、条件を満たすときでも送信するようにしている。
            // もし条件を満たすときは送信しないようにしたい場合は、↓のコードのコメントアウトを解除する。
            // if (payload.operatedBy === userUid) {
            //     return undefined;
            // }

            // TODO: DeleteRoomGetOperationも返す
            return payload.graphQLOperationGenerator.toGraphQLOperation({ operatedBy: payload.operatedBy, deliverTo: userUid, nextRevision: payload.graphQLOperationGenerator.currentRevision });
        }
        if (payload.type === 'participantOperation') {
            return payload.participantsOperation;
        }
    }
}