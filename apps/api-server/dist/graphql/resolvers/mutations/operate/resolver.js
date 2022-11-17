'use strict';

var tslib = require('tslib');
var FilePathModule = require('@flocon-trpg/core');
var classValidator = require('class-validator');
var typeGraphql = require('type-graphql');
var room$1 = require('../../../../entities-graphql/room.js');
var roomAsListItem = require('../../../../entities-graphql/roomAsListItem.js');
var roomMessage = require('../../../../entities-graphql/roomMessage.js');
var entity = require('../../../../entities/roomMessage/entity.js');
var OperateRoomFailureType = require('../../../../enums/OperateRoomFailureType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var room = require('../../../objects/room.js');
var utils = require('../../utils/utils.js');

exports.RoomOperationInput = class RoomOperationInput {
};
tslib.__decorate([
    typeGraphql.Field({ description: 'room.upOperationをJSONにしたもの' }),
    tslib.__metadata("design:type", String)
], exports.RoomOperationInput.prototype, "valueJson", void 0);
tslib.__decorate([
    typeGraphql.Field({
        description: 'クライアントを識別するID。適当なIDをクライアント側で生成して渡す。Operationごとに変える必要はない',
    }),
    classValidator.MaxLength(10),
    tslib.__metadata("design:type", String)
], exports.RoomOperationInput.prototype, "clientId", void 0);
exports.RoomOperationInput = tslib.__decorate([
    typeGraphql.InputType()
], exports.RoomOperationInput);
let OperateArgs = class OperateArgs {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], OperateArgs.prototype, "id", void 0);
tslib.__decorate([
    typeGraphql.Field(() => typeGraphql.Int),
    tslib.__metadata("design:type", Number)
], OperateArgs.prototype, "prevRevision", void 0);
tslib.__decorate([
    typeGraphql.Field(() => exports.RoomOperationInput),
    tslib.__metadata("design:type", exports.RoomOperationInput)
], OperateArgs.prototype, "operation", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    classValidator.MaxLength(10),
    tslib.__metadata("design:type", String)
], OperateArgs.prototype, "requestId", void 0);
OperateArgs = tslib.__decorate([
    typeGraphql.ArgsType()
], OperateArgs);
let OperateRoomSuccessResult = class OperateRoomSuccessResult {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", room.RoomOperation)
], OperateRoomSuccessResult.prototype, "operation", void 0);
OperateRoomSuccessResult = tslib.__decorate([
    typeGraphql.ObjectType()
], OperateRoomSuccessResult);
let OperateRoomIdResult = class OperateRoomIdResult {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], OperateRoomIdResult.prototype, "requestId", void 0);
OperateRoomIdResult = tslib.__decorate([
    typeGraphql.ObjectType()
], OperateRoomIdResult);
let OperateRoomNonJoinedResult = class OperateRoomNonJoinedResult {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", room.RoomAsListItem)
], OperateRoomNonJoinedResult.prototype, "roomAsListItem", void 0);
OperateRoomNonJoinedResult = tslib.__decorate([
    typeGraphql.ObjectType()
], OperateRoomNonJoinedResult);
let OperateRoomFailureResult = class OperateRoomFailureResult {
};
tslib.__decorate([
    typeGraphql.Field(() => OperateRoomFailureType.OperateRoomFailureType),
    tslib.__metadata("design:type", String)
], OperateRoomFailureResult.prototype, "failureType", void 0);
OperateRoomFailureResult = tslib.__decorate([
    typeGraphql.ObjectType()
], OperateRoomFailureResult);
const OperateRoomResult = typeGraphql.createUnionType({
    name: 'OperateRoomResult',
    types: () => [
        OperateRoomSuccessResult,
        OperateRoomFailureResult,
        OperateRoomNonJoinedResult,
        OperateRoomIdResult,
    ],
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
async function operateCore({ args, context, }) {
    const em = context.em;
    const authorizedUserUid = utils.ensureAuthorizedUser(context).userUid;
    const findResult = await utils.findRoomAndMyParticipant({
        em,
        userUid: authorizedUserUid,
        roomId: args.id,
    });
    if (findResult == null) {
        return {
            type: 'failure',
            result: { failureType: OperateRoomFailureType.OperateRoomFailureType.NotFound },
        };
    }
    const { room, me, roomState } = findResult;
    if (me === undefined) {
        return {
            type: 'nonJoined',
            result: {
                roomAsListItem: await roomAsListItem.stateToGraphQL({
                    roomEntity: room,
                    myUserUid: authorizedUserUid,
                }),
            },
        };
    }
    const participantUserUids = findResult.participantIds();
    const clientOperation = FilePathModule.parseUpOperation(args.operation.valueJson);
    const downOperation = await room$1.GlobalRoom.MikroORM.ToGlobal.downOperationMany({
        em,
        roomId: room.id,
        revisionRange: { from: args.prevRevision, expectedTo: room.revision },
    });
    if (downOperation.isError) {
        throw FilePathModule.toOtError(downOperation.error);
    }
    let prevState = roomState;
    let twoWayOperation = undefined;
    if (downOperation.value !== undefined) {
        const restoredRoom = FilePathModule.restore(FilePathModule.roomTemplate)({
            nextState: roomState,
            downOperation: downOperation.value,
        });
        if (restoredRoom.isError) {
            throw FilePathModule.toOtError(restoredRoom.error);
        }
        prevState = restoredRoom.value.prevState;
        twoWayOperation = restoredRoom.value.twoWayOperation;
    }
    const transformed = FilePathModule.serverTransform({ type: FilePathModule.client, userUid: authorizedUserUid })({
        stateBeforeServerOperation: prevState,
        stateAfterServerOperation: roomState,
        clientOperation: clientOperation,
        serverOperation: twoWayOperation,
    });
    if (transformed.isError) {
        throw FilePathModule.toOtError(transformed.error);
    }
    if (transformed.value === undefined) {
        return { type: 'id', result: { requestId: args.requestId } };
    }
    const operation = transformed.value;
    const prevRevision = room.revision;
    const nextRoomState = await room$1.GlobalRoom.Global.applyToEntity({
        em,
        target: room,
        prevState: roomState,
        operation,
    });
    const logs = FilePathModule.createLogs({ prevState: roomState, nextState: nextRoomState });
    const dicePieceLogEntities = [];
    logs?.dicePieceLogs.forEach(log => {
        const entity$1 = new entity.DicePieceLog({
            stateId: log.stateId,
            room,
            value: log.value,
        });
        dicePieceLogEntities.push(entity$1);
        em.persist(entity$1);
    });
    const stringPieceLogEntities = [];
    logs?.stringPieceLogs.forEach(log => {
        const entity$1 = new entity.StringPieceLog({
            stateId: log.stateId,
            room,
            value: log.value,
        });
        stringPieceLogEntities.push(entity$1);
        em.persist(entity$1);
    });
    await em.flush();
    await room$1.GlobalRoom.Global.cleanOldRoomOp({
        em: em.fork(),
        room,
        roomHistCount: context.serverConfig.roomHistCount,
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
            valueJson: room$1.GlobalRoom.Global.ToGraphQL.operation({
                prevState: roomState,
                nextState: nextRoomState,
                requestedBy: { type: FilePathModule.client, userUid: deliverTo },
            }),
        };
    };
    const roomOperationPayload = {
        type: 'roomOperationPayload',
        roomId: args.id,
        generateOperation,
    };
    return {
        type: 'success',
        sendTo: participantUserUids,
        roomOperationPayload,
        messageUpdatePayload: [
            ...dicePieceLogEntities.map(log => ({
                type: 'messageUpdatePayload',
                roomId: room.id,
                createdBy: undefined,
                visibleTo: undefined,
                value: roomMessage.DicePieceLog.MikroORM.ToGraphQL.state(log),
            })),
            ...stringPieceLogEntities.map(log => ({
                type: 'messageUpdatePayload',
                roomId: room.id,
                createdBy: undefined,
                visibleTo: undefined,
                value: roomMessage.StringPieceLog.MikroORM.ToGraphQL.state(log),
            })),
        ],
        result: {
            operation: generateOperation(authorizedUserUid),
        },
    };
}
exports.OperateResolver = class OperateResolver {
    async operate(args, context, pubSub) {
        const operateResult = await operateCore({
            args,
            context,
        });
        if (operateResult.type === 'success') {
            await utils.publishRoomEvent(pubSub, {
                ...operateResult.roomOperationPayload,
                sendTo: operateResult.sendTo,
            });
            for (const messageUpdate of operateResult.messageUpdatePayload) {
                await utils.publishRoomEvent(pubSub, { ...messageUpdate, sendTo: operateResult.sendTo });
            }
        }
        return operateResult.result;
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => OperateRoomResult, {
        description: 'この Mutation を直接実行することは非推奨です。代わりに @flocon-trpg/sdk を用いてください。',
    }),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(3)),
    tslib.__param(0, typeGraphql.Args()),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [OperateArgs, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.OperateResolver.prototype, "operate", null);
exports.OperateResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.OperateResolver);
//# sourceMappingURL=resolver.js.map
