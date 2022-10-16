import { Arg, Ctx, Field, ObjectType, Resolver, Root, Subscription } from 'type-graphql';
import { WritingMessageStatusType } from '../../../../enums/WritingMessageStatusType';
import { ResolverContext } from '../../../../types';
import { RoomOperation } from '../../../objects/room';
import {
    RoomMessageEvent,
    RoomPrivateMessageType,
    RoomPrivateMessageUpdateType,
    RoomPublicMessageType,
    RoomPublicMessageUpdateType,
} from '../../../objects/roomMessage';
import { all } from '../../types';
import { deleteSecretValues } from '../../utils/utils';
import { RoomEventPayload } from './payload';
import { ROOM_EVENT } from './topics';

export const deleteRoomOperation = 'DeleteRoomOperation';

@ObjectType()
class DeleteRoomOperation {
    public __tstype!: typeof deleteRoomOperation;

    @Field()
    public deletedBy!: string;

    @Field({ description: 'since v0.7.2' })
    public deletedByAdmin!: boolean;
}

@ObjectType()
class RoomConnectionEvent {
    @Field()
    public userUid!: string;

    @Field()
    public isConnected!: boolean;

    @Field()
    public updatedAt!: number;
}

@ObjectType()
class WritingMessageStatus {
    @Field()
    public userUid!: string;

    @Field(() => WritingMessageStatusType)
    public status!: WritingMessageStatusType;

    @Field()
    public updatedAt!: number;
}

@ObjectType()
class RoomEvent {
    // 現状は、2つ以上同時にnon-nullish|trueになることはない。

    @Field(() => RoomOperation, { nullable: true })
    public roomOperation?: RoomOperation;

    @Field(() => DeleteRoomOperation, { nullable: true })
    public deleteRoomOperation?: DeleteRoomOperation;

    @Field(() => RoomMessageEvent, { nullable: true })
    public roomMessageEvent?: typeof RoomMessageEvent;

    @Field()
    public isRoomMessagesResetEvent!: boolean;

    @Field(() => RoomConnectionEvent, { nullable: true })
    public roomConnectionEvent?: RoomConnectionEvent;

    @Field(() => WritingMessageStatus, { nullable: true })
    public writingMessageStatus?: WritingMessageStatus;
}

@Resolver()
export class RoomEventResolver {
    // graphql-wsでRoomOperatedのConnectionを検知しているので、もしこれのメソッドやArgsがリネームもしくは削除されるときはそちらも変える。
    // CONSIDER: return undefined; とすると、{ roomEvent: null } というオブジェクトが全員に通知される。そのため、それを見るとイベントの内容を予想できてしまう可能性がある。例えばサイト全体で1セッションしか進行していない場合、何らかの秘話が送られた可能性が高い、など。この問題はおそらくfilterプロパティで解決できるかもしれない。
    // CONSIDER: QueueMiddlewareを適用すべきか？
    @Subscription(() => RoomEvent, {
        topics: ROOM_EVENT,
        nullable: true,
    })
    public roomEvent(
        @Root() payload: RoomEventPayload | null | undefined,
        @Arg('id') id: string,
        @Ctx() context: ResolverContext
    ): RoomEvent | undefined {
        if (payload == null) {
            return undefined;
        }
        if (id !== payload.roomId) {
            return undefined;
        }
        if (context.decodedIdToken == null || context.decodedIdToken.isError) {
            return undefined;
        }
        const userUid: string = context.decodedIdToken.value.uid;
        if (payload.sendTo !== all) {
            if (!payload.sendTo.has(userUid)) {
                return undefined;
            }
        }

        switch (payload.type) {
            case 'roomConnectionUpdatePayload':
                return {
                    roomConnectionEvent: {
                        userUid: payload.userUid,
                        isConnected: payload.isConnected,
                        updatedAt: payload.updatedAt,
                    },
                    isRoomMessagesResetEvent: false,
                };
            case 'writingMessageStatusUpdatePayload':
                return {
                    writingMessageStatus: {
                        userUid: payload.userUid,
                        status: payload.status,
                        updatedAt: payload.updatedAt,
                    },
                    isRoomMessagesResetEvent: false,
                };
            case 'roomMessagesResetPayload':
                return {
                    isRoomMessagesResetEvent: true,
                };
            case 'messageUpdatePayload': {
                // userUidが同じでも例えば異なるタブで同じRoomを開いているケースがある。そのため、「Mutationを行ったuserUidにだけSubscriptionを送信せず、代わりにMutationの戻り値で処理してもらうことで通信量を節約する」ということはできない。

                if (payload.value.__tstype === RoomPrivateMessageType) {
                    if (payload.value.visibleTo.every(vt => vt !== userUid)) {
                        return undefined;
                    }
                }
                if (payload.value.__tstype === RoomPrivateMessageUpdateType) {
                    if (payload.visibleTo == null) {
                        throw new Error('payload.visibleTo is required.');
                    }
                    if (payload.visibleTo.every(vt => vt !== userUid)) {
                        return undefined;
                    }
                }

                switch (payload.value.__tstype) {
                    case RoomPrivateMessageType:
                    case RoomPublicMessageType: {
                        if (payload.value.isSecret && payload.value.createdBy !== userUid) {
                            const roomMessageEvent = { ...payload.value };
                            deleteSecretValues(roomMessageEvent);
                            return {
                                roomMessageEvent,
                                isRoomMessagesResetEvent: false,
                            };
                        }
                        break;
                    }
                    case RoomPrivateMessageUpdateType:
                    case RoomPublicMessageUpdateType:
                        if (payload.value.isSecret && payload.createdBy !== userUid) {
                            const roomMessageEvent = { ...payload.value };
                            deleteSecretValues(roomMessageEvent);
                            return {
                                roomMessageEvent: {
                                    ...payload.value,
                                    commandResult: undefined,
                                },
                                isRoomMessagesResetEvent: false,
                            };
                        }
                        break;
                }

                return {
                    roomMessageEvent: payload.value,
                    isRoomMessagesResetEvent: false,
                };
            }
            case 'deleteRoomPayload':
                // Roomが削除されたことは非公開にする必要はないので、このように全員に通知して構わない。
                return {
                    deleteRoomOperation: {
                        __tstype: deleteRoomOperation,
                        deletedBy: payload.deletedBy,
                        deletedByAdmin: payload.deletedByAdmin,
                    },
                    isRoomMessagesResetEvent: false,
                };
            case 'roomOperationPayload':
                // TODO: DeleteRoomOperationも返す
                return {
                    roomOperation: payload.generateOperation(userUid),
                    isRoomMessagesResetEvent: false,
                };
        }
    }
}
