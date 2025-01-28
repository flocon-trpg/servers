import { Args, Field, ObjectType, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { Observable, filter, map, mergeMap } from 'rxjs';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { WritingMessageStatusType } from '../../../../enums/WritingMessageStatusType';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
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
    public constructor(private readonly pubSubService: PubSubService) {}

    // graphql-wsでRoomOperatedのConnectionを検知しているので、もしこれのメソッドやArgsがリネームもしくは削除されるときはそちらも変える。
    @Subscription(() => RoomEvent, {
        description:
            'この Subscription を直接実行することは非推奨です。代わりに @flocon-trpg/sdk を用いてください。',
    })
    @Auth(ENTRY)
    public roomEvent(
        @Args('roomId') roomId: string,
        @AuthData() auth: AuthDataType,
    ): AsyncIterableIterator<RoomEvent> {
        const userUid = auth.user.userUid;
        const roomEventsStream: Observable<RoomEvent> = this.pubSubService.roomEvent.pipe(
            filter(payload => {
                if (roomId !== payload.roomId) {
                    return false;
                }
                if (payload.sendTo !== all) {
                    if (!payload.sendTo.has(userUid)) {
                        return false;
                    }
                }

                return true;
            }),
            map((payload): RoomEvent | undefined => {
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
                            default:
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
            }),
            mergeMap(x => (x == null ? [] : [x])),
        );

        // TODO: PubSub は production 向けではない(https://github.com/apollographql/graphql-subscriptions#getting-started-with-your-first-subscription)ということもあり、最初は PubSub を使わずに AsyncIterableIterator を返すコードを書こうとしたがそれでは何故かクライアント側が Subscription による値を受け取れなかった。そのため暫定的に PubSub を利用した方法をとっている。
        const topic = 'roomEvent';
        const pubSub = new PubSub();
        roomEventsStream.subscribe(roomEvent => {
            // publish メソッドは async だが、中身はただ空の Promise を返しているだけ(https://github.com/apollographql/graphql-subscriptions/blob/d74107ce9dbc11d46eba0e20efa61bda140068de/src/pubsub.ts#L22)であるため await しなくて構わない。
            void pubSub.publish(topic, { roomEvent });
        });
        return pubSub.asyncIterableIterator(topic);
    }
}
