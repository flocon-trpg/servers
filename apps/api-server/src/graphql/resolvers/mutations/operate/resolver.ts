import {
    State,
    TwoWayOperation,
    client,
    createLogs,
    parseUpOperation,
    restore,
    roomTemplate,
    serverTransform,
    toOtError,
} from '@flocon-trpg/core';
import {
    Args,
    ArgsType,
    Field,
    InputType,
    Int,
    Mutation,
    ObjectType,
    Resolver,
    createUnionType,
} from '@nestjs/graphql';
import { MaxLength } from 'class-validator';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { GlobalRoom } from '../../../../entities-graphql/room';
import * as RoomAsListItemGlobal from '../../../../entities-graphql/roomAsListItem';
import {
    DicePieceLog as DicePieceLogNameSpace,
    StringPieceLog as StringPieceLogNameSpace,
} from '../../../../entities-graphql/roomMessage';
import { OperateRoomFailureType } from '../../../../enums/OperateRoomFailureType';
import {
    DicePieceLog as DicePieceLog$MikroORM,
    StringPieceLog as StringPieceLog$MikroORM,
} from '../../../../mikro-orm/entities/roomMessage/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
import { ServerConfig, ServerConfigService } from '../../../../server-config/server-config.service';
import { EM } from '../../../../types';
import { lockByRoomId } from '../../../../utils/asyncLock';
import { RoomAsListItem, RoomOperation } from '../../../objects/room';
import { MessageUpdatePayload, RoomOperationPayload } from '../../subsciptions/roomEvent/payload';
import { SendTo } from '../../types';
import { findRoomAndMyParticipant } from '../../utils/utils';

type RoomState = State<typeof roomTemplate>;
type RoomTwoWayOperation = TwoWayOperation<typeof roomTemplate>;

@InputType()
export class RoomOperationInput {
    @Field({ description: 'room.upOperationをJSONにしたもの' })
    public valueJson!: string;

    @Field({
        description:
            'クライアントを識別するID。適当なIDをクライアント側で生成して渡す。Operationごとに変える必要はない' /* createdByのみで判定するのは、同一ユーザーが複数タブを開くなどして同時に操作したときに問題が生じるので、このようにoperationIdも定義する必要がある。*/,
    })
    @MaxLength(10)
    public clientId!: string;
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

@ObjectType()
class OperateRoomSuccessResult {
    @Field()
    public operation!: RoomOperation;
}

@ObjectType()
class OperateRoomIdResult {
    @Field()
    public requestId!: string;
}

@ObjectType()
class OperateRoomNonJoinedResult {
    @Field()
    public roomAsListItem!: RoomAsListItem;
}

@ObjectType()
class OperateRoomFailureResult {
    @Field(() => OperateRoomFailureType)
    public failureType!: OperateRoomFailureType;
}

const OperateRoomResult = createUnionType({
    name: 'OperateRoomResult',
    types: () =>
        [
            OperateRoomSuccessResult,
            OperateRoomFailureResult,
            OperateRoomNonJoinedResult,
            OperateRoomIdResult,
        ] as const,
    resolveType: value => {
        if ('operation' in value) {
            return OperateRoomSuccessResult;
        }
        if ('failureType' in value) {
            return OperateRoomFailureResult;
        }
        if ('roomAsListItem' in value) {
            return OperateRoomNonJoinedResult;
        }
        if ('requestId' in value) {
            return OperateRoomIdResult;
        }
        return undefined;
    },
});

type OperateCoreResult =
    | ({
          type: 'success';
          result: OperateRoomSuccessResult;
          roomOperationPayload: RoomOperationPayload;
          messageUpdatePayload: MessageUpdatePayload[];
      } & SendTo)
    | {
          type: 'id';
          result: OperateRoomIdResult;
      }
    | {
          type: 'nonJoined';
          result: OperateRoomNonJoinedResult;
      }
    | {
          type: 'failure';
          result: OperateRoomFailureResult;
      };

async function operateCore({
    args,
    userUid,
    em,
    serverConfig,
}: {
    args: OperateArgs;
    userUid: string;
    em: EM;
    serverConfig: ServerConfig;
}): Promise<OperateCoreResult> {
    // Spectatorであっても自分の名前などはoperateで変更する必要があるため、Spectatorならば無条件で弾くという手法は使えない

    const findResult = await findRoomAndMyParticipant({
        em,
        userUid,
        roomId: args.id,
    });
    if (findResult == null) {
        return {
            type: 'failure',
            result: { failureType: OperateRoomFailureType.NotFound },
        };
    }
    const { room, me, roomState } = findResult;
    if (me === undefined) {
        return {
            type: 'nonJoined',
            result: {
                roomAsListItem: await RoomAsListItemGlobal.stateToGraphQL({
                    roomEntity: room,
                    myUserUid: userUid,
                }),
            },
        };
    }
    const participantUserUids = findResult.participantIds();
    const clientOperation = parseUpOperation(args.operation.valueJson);

    const downOperation = await GlobalRoom.MikroORM.ToGlobal.downOperationMany({
        em,
        roomId: room.id,
        revisionRange: { from: args.prevRevision, expectedTo: room.revision },
    });
    if (downOperation.isError) {
        throw toOtError(downOperation.error);
    }

    let prevState: RoomState = roomState;
    let twoWayOperation: RoomTwoWayOperation | undefined = undefined;
    if (downOperation.value !== undefined) {
        const restoredRoom = restore(roomTemplate)({
            nextState: roomState,
            downOperation: downOperation.value,
        });
        if (restoredRoom.isError) {
            throw toOtError(restoredRoom.error);
        }
        prevState = restoredRoom.value.prevState;
        twoWayOperation = restoredRoom.value.twoWayOperation;
    }

    const transformed = serverTransform({ type: client, userUid })({
        stateBeforeServerOperation: prevState,
        stateAfterServerOperation: roomState,
        clientOperation: clientOperation,
        serverOperation: twoWayOperation,
    });
    if (transformed.isError) {
        throw toOtError(transformed.error);
    }
    if (transformed.value === undefined) {
        return { type: 'id', result: { requestId: args.requestId } };
    }

    const operation = transformed.value;
    const prevRevision = room.revision;

    const nextRoomState = await GlobalRoom.Global.applyToEntity({
        em,
        target: room,
        prevState: roomState,
        operation,
    });

    const logs = createLogs({ prevState: roomState, nextState: nextRoomState });
    const dicePieceLogEntities: DicePieceLog$MikroORM[] = [];
    logs?.dicePieceLogs.forEach(log => {
        const entity = new DicePieceLog$MikroORM({
            stateId: log.stateId,
            room,
            value: log.value,
        });
        dicePieceLogEntities.push(entity);
        em.persist(entity);
    });
    const stringPieceLogEntities: StringPieceLog$MikroORM[] = [];
    logs?.stringPieceLogs.forEach(log => {
        const entity = new StringPieceLog$MikroORM({
            stateId: log.stateId,
            room,
            value: log.value,
        });
        stringPieceLogEntities.push(entity);
        em.persist(entity);
    });

    // GlobalRoom.Global.applyToEntityでcompleteUpdatedAtの更新は行っているため、ここで更新する必要はない
    await em.flush();

    await GlobalRoom.Global.cleanOldRoomOp({
        em: em.fork(),
        room,
        roomHistCount: serverConfig.roomHistCount,
    });
    await em.flush();

    const generateOperation = (deliverTo: string): RoomOperation => {
        return {
            __tstype: 'RoomOperation',
            revisionTo: prevRevision + 1,
            operatedBy: {
                userUid,
                clientId: args.operation.clientId,
            },
            valueJson: GlobalRoom.Global.ToGraphQL.operation({
                prevState: roomState,
                nextState: nextRoomState,
                requestedBy: { type: client, userUid: deliverTo },
            }),
        };
    };
    const roomOperationPayload: RoomOperationPayload = {
        type: 'roomOperationPayload',
        roomId: args.id,
        generateOperation,
    };
    return {
        type: 'success',
        sendTo: participantUserUids,
        roomOperationPayload,
        messageUpdatePayload: [
            ...dicePieceLogEntities.map(
                log =>
                    ({
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        createdBy: undefined,
                        visibleTo: undefined,
                        value: DicePieceLogNameSpace.MikroORM.ToGraphQL.state(log),
                    }) as const,
            ),
            ...stringPieceLogEntities.map(
                log =>
                    ({
                        type: 'messageUpdatePayload',
                        roomId: room.id,
                        createdBy: undefined,
                        visibleTo: undefined,
                        value: StringPieceLogNameSpace.MikroORM.ToGraphQL.state(log),
                    }) as const,
            ),
        ],
        result: {
            operation: generateOperation(userUid),
        },
    };
}

@Resolver(() => OperateRoomResult)
export class OperateResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
        private readonly serverConfigService: ServerConfigService,
    ) {}

    @Mutation(() => OperateRoomResult, {
        description:
            'この Mutation を直接実行することは非推奨です。代わりに @flocon-trpg/sdk を用いてください。',
    })
    @Auth(ENTRY)
    public async operate(
        @Args() args: OperateArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<typeof OperateRoomResult> {
        return await lockByRoomId(args.id, async () => {
            const operateResult = await operateCore({
                args,
                userUid: auth.user.userUid,
                em: await this.mikroOrmService.forkEmForMain(),
                serverConfig: this.serverConfigService.getValueForce(),
            });
            if (operateResult.type === 'success') {
                this.pubSubService.roomEvent.next({
                    ...operateResult.roomOperationPayload,
                    sendTo: operateResult.sendTo,
                });
                for (const messageUpdate of operateResult.messageUpdatePayload) {
                    this.pubSubService.roomEvent.next({
                        ...messageUpdate,
                        sendTo: operateResult.sendTo,
                    });
                }
            }
            return operateResult.result;
        });
    }
}
