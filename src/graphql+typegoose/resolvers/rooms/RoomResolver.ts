import { Resolver, Query, Args, Mutation, Ctx, PubSub, Subscription, Root, ArgsType, Field, Arg, Publisher, InputType, PubSubEngine, Int } from 'type-graphql';

import { ResolverContext } from '../../../graphql+typegoose/utils/Contexts';
import { ParticipantRole } from '../../../enums/ParticipantRole';
import { GetRoomResult } from '../../entities/getRoomResult/graphql';
import { GetRoomFailureType } from '../../../enums/GetRoomFailureType';
import { GetRoomsListFailureType } from '../../../enums/GetRoomsListFailureType';
import { CreateRoomFailureType } from '../../../enums/CreateRoomFailureType';
import { checkEntry, checkSignIn, findRoomAndMyParticipant, findRoomAndMyParticipantAndParitipantUserUids, getUserIfEntry, NotSignIn } from '../utils/helpers';
import { JoinRoomFailureType } from '../../../enums/JoinRoomFailureType';
import { GetRoomsListResult } from '../../entities/getRoomsListResult/graphql';
import * as Room$MikroORM from '../../entities/room/mikro-orm';
import * as Room$Global from '../../entities/room/global';
import { stateToGraphql as stateToGraphql$RoomAsListItem } from '../../entities/roomAsListItem/global';
import { queueLimitReached } from '../../../utils/PromiseQueue';
import { LeaveRoomResult } from '../../entities/leaveRoomResult/graphql';
import { CreateRoomResult } from '../../entities/createRoomResult/graphql';
import { Participant } from '../../entities/participant/mikro-orm';
import { JoinRoomResult } from '../../entities/joinRoomResult/graphql';
import { serverTooBusyMessage } from '../utils/messages';
import { RoomOperation, RoomOperated, RoomOperationInput } from '../../entities/room/graphql';
import { OperateRoomFailureResult, OperateRoomIdResult, OperateRoomNonJoinedResult, OperateRoomResult, OperateRoomSuccessResult } from '../../entities/operateRoomResult/graphql';
import { OperateRoomFailureType } from '../../../enums/OperateRoomFailureType';
import { ROOM_OPERATED } from '../../utils/Topics';
import { toGraphQL } from '../../entities/participant/global';
import { Result, ResultModule } from '../../../@shared/Result';
import * as User$MikroORM from '../../entities/user/mikro-orm';
import { createPrivateMessages, createPublicMessages } from '../utils/sample';
import { LeaveRoomFailureType } from '../../../enums/LeaveRoomFailureType';

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

export type RoomOperationPayload = {
    roomId: string;
    participants: ReadonlySet<string>; // UserUid
    graphQLOperationGenerator: Room$Global.GraphQLOperationGenerator;
    operatedBy: string;
}

@Resolver()
export class RoomResolver {
    public async getRoomsListCore({ context }: { context: ResolverContext }): Promise<typeof GetRoomsListResult> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return { failureType: GetRoomsListFailureType.NotSignIn };
        }

        const queue = async () => {
            const em = context.createEm();
            const entry = await checkEntry({ em, userUid: decodedIdToken.uid });
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
        return this.getRoomsListCore({ context });
    }

    public async createRoomCore({ input, context }: { input: CreateRoomInput; context: ResolverContext }): Promise<typeof CreateRoomResult> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return { failureType: CreateRoomFailureType.NotSignIn };
        }

        const queue = async (): Promise<typeof CreateRoomResult> => {
            const em = context.createEm();
            const entryUser = await getUserIfEntry({ userUid: decodedIdToken.uid, em });
            await em.flush();
            if (entryUser == null) {
                return {
                    failureType: CreateRoomFailureType.NotEntry,
                };
            }
            const newRoom = new Room$MikroORM.Room({ name: input.roomName });
            const newParticipant = new Participant({ role: ParticipantRole.Master, name: input.participantName });
            newRoom.participants.add(newParticipant);
            entryUser.participants.add(newParticipant);
            newRoom.deletePhrase = input.deletePhrase;
            newRoom.joinAsPlayerPhrase = input.joinAsPlayerPhrase;
            newRoom.joinAsSpectatorPhrase = input.joinAsSpectatorPhrase;
            em.persist(newRoom);
            const roomState = await Room$Global.RoomState.create(newRoom);
            const graphqlState = await roomState.toGraphQL({
                deliverTo: decodedIdToken.uid,
                revision: newRoom.revision
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
        return this.createRoomCore({ input, context });
    }

    public async joinRoomAsPlayerCore({ args, context }: { args: JoinRoomArgs; context: ResolverContext }): Promise<typeof JoinRoomResult> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return { failureType: JoinRoomFailureType.NotSignIn };
        }

        const queue = async () => {
            const em = context.createEm();
            const entryUser = await getUserIfEntry({ userUid: decodedIdToken.uid, em });
            await em.flush();
            if (entryUser == null) {
                return {
                    failureType: JoinRoomFailureType.NotEntry,
                };
            }
            const findResult = await findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.id });
            if (findResult == null) {
                return {
                    failureType: JoinRoomFailureType.NotFound,
                };
            }
            const { room, me } = findResult;
            if (me !== undefined) {
                switch (me.role) {
                    case ParticipantRole.Master:
                    case ParticipantRole.Player: {
                        return toGraphQL({ source: { ...me, role: me.role }, userUid: decodedIdToken.uid });
                    }
                    case ParticipantRole.Spectator:
                    case null:
                    case undefined: {
                        if (room.joinAsPlayerPhrase != null && room.joinAsPlayerPhrase !== args.phrase) {
                            return {
                                failureType: JoinRoomFailureType.WrongPhrase,
                            };
                        }
                        me.role = ParticipantRole.Player;
                        await em.flush();
                        return toGraphQL({ source: { ...me, role: me.role }, userUid: decodedIdToken.uid });
                    }
                }
            }
            if (room.joinAsPlayerPhrase != null && room.joinAsPlayerPhrase !== args.phrase) {
                return {
                    failureType: JoinRoomFailureType.WrongPhrase,
                };
            }
            const newParticipant = new Participant({ role: ParticipantRole.Player, name: args.name });
            room.participants.add(newParticipant);
            entryUser.participants.add(newParticipant);
            await em.flush();
            return {
                ...newParticipant,
                role: ParticipantRole.Player,
            };
        };

        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        return result.value;
    }

    @Mutation(() => JoinRoomResult)
    public joinRoomAsPlayer(@Args() args: JoinRoomArgs, @Ctx() context: ResolverContext): Promise<typeof JoinRoomResult> {
        return this.joinRoomAsPlayerCore({ args, context });
    }

    public async joinRoomAsSpectatorCore({ args, context }: { args: JoinRoomArgs; context: ResolverContext }): Promise<typeof JoinRoomResult> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return { failureType: JoinRoomFailureType.NotSignIn };
        }

        const queue = async () => {
            const em = context.createEm();
            const entryUser = await getUserIfEntry({ userUid: decodedIdToken.uid, em });
            await em.flush();
            if (entryUser == null) {
                return {
                    failureType: JoinRoomFailureType.NotEntry,
                };
            }
            const findResult = await findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: args.id });
            if (findResult == null) {
                return {
                    failureType: JoinRoomFailureType.NotFound,
                };
            }
            const { room, me } = findResult;
            if (me !== undefined) {
                switch (me.role) {
                    case ParticipantRole.Master:
                    case ParticipantRole.Player:
                    case ParticipantRole.Spectator: {
                        return toGraphQL({ source: { ...me, role: me.role }, userUid: decodedIdToken.uid });
                    }
                    case null:
                    case undefined: {
                        if (room.joinAsSpectatorPhrase != null && room.joinAsSpectatorPhrase !== args.phrase) {
                            return {
                                failureType: JoinRoomFailureType.WrongPhrase,
                            };
                        }
                        me.role = ParticipantRole.Spectator;
                        await em.flush();
                        return toGraphQL({ source: { ...me, role: me.role }, userUid: decodedIdToken.uid });
                    }
                }
            }
            if (room.joinAsSpectatorPhrase != null && room.joinAsSpectatorPhrase !== args.phrase) {
                return {
                    failureType: JoinRoomFailureType.WrongPhrase,
                };
            }

            const newParticipant = new Participant({ role: ParticipantRole.Spectator, name: args.name });
            room.participants.add(newParticipant);
            entryUser.participants.add(newParticipant);
            await em.flush();
            return {
                ...newParticipant,
                role: ParticipantRole.Spectator,
            };
        };

        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        return result.value;
    }

    @Mutation(() => JoinRoomResult)
    public joinRoomAsSpectator(@Args() args: JoinRoomArgs, @Ctx() context: ResolverContext): Promise<typeof JoinRoomResult> {
        return this.joinRoomAsSpectatorCore({ args, context });
    }

    public async getRoomCore({ args, context }: { args: GetRoomArgs; context: ResolverContext }): Promise<typeof GetRoomResult> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return { failureType: GetRoomFailureType.NotSignIn };
        }

        const queue = async (): Promise<Result<typeof GetRoomResult>> => {
            const em = context.createEm();
            const entry = await checkEntry({ userUid: decodedIdToken.uid, em });
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
                room: await roomState.toGraphQL({ revision: room.revision, deliverTo: decodedIdToken.uid }),
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
        return this.getRoomCore({ args, context });
    }

    public async leaveRoomCore({ id, context }: { id: string; context: ResolverContext }): Promise<LeaveRoomResult> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return { failureType: LeaveRoomFailureType.NotSignIn };
        }

        const queue = async (): Promise<Result<LeaveRoomResult>> => {
            const em = context.createEm();
            // entryしていなくても呼べる
            const findResult = await findRoomAndMyParticipant({ em, userUid: decodedIdToken.uid, roomId: id });
            if (findResult == null) {
                return ResultModule.ok({
                    failureType: LeaveRoomFailureType.NotFound,
                });
            }
            const { me } = findResult;
            if (me === undefined) {
                return ResultModule.ok({
                    failureType: LeaveRoomFailureType.NotEntry,
                });
            }
            me.role = undefined;
            await em.flush();
            return ResultModule.ok({});
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
    public async leaveRoom(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<LeaveRoomResult> {
        return await this.leaveRoomCore({ id, context });
    }

    public async operateCore({ args, context }: { args: OperateArgs; context: ResolverContext }): Promise<OperateCoreResult> {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            return {
                type: 'failure',
                result: { failureType: OperateRoomFailureType.NotSignIn }
            };
        }

        const queue = async (): Promise<Result<OperateCoreResult>> => {
            const em = context.createEm();
            const entry = await checkEntry({ userUid: decodedIdToken.uid, em });
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
            const { room, me, participantUserUids: paritipantUserUids } = findResult;
            if (me === undefined) {
                return ResultModule.ok({
                    type: 'nonJoined',
                    result: { roomAsListItem: stateToGraphql$RoomAsListItem({ roomEntity: room }) }
                });
            }
            const roomState = await Room$Global.RoomState.create(room);
            const downOperation = await Room$Global.RoomDownOperation.findRange(em, room.id, { from: args.prevRevision, expectedTo: room.revision });
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
                roomId: args.id,
                participants: paritipantUserUids,
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
        const operateResult = await this.operateCore({ args, context });
        if (operateResult.type === 'success') {
            await pubSub.publish(ROOM_OPERATED, operateResult.payload);
        }
        return operateResult.result;
    }

    @Subscription(() => RoomOperated, { topics: ROOM_OPERATED, nullable: true })
    public roomOperated(@Root() payload: RoomOperationPayload, @Arg('id') id: string, @Ctx() context: ResolverContext): typeof RoomOperated | undefined {
        if (context.decodedIdToken == null || context.decodedIdToken.isError) {
            return undefined;
        }
        const userUid = context.decodedIdToken.value.uid;
        if (id !== payload.roomId) {
            return undefined;
        }
        if (payload.operatedBy === userUid) {
            // payload.operatedBy === userUidの場合、結果はsubscriptionではなくmutationのほうで返す。
            return undefined;
        }
        if (!payload.participants.has(userUid)) {
            return undefined;
        }
        // TODO: DeleteRoomGetOperationも返す
        return payload.graphQLOperationGenerator.toGraphQLOperation({ operatedBy: payload.operatedBy, deliverTo: userUid, nextRevision: payload.graphQLOperationGenerator.currentRevision });
    }
}