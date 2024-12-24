'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var WritingMessageStatusType = require('../../../../enums/WritingMessageStatusType.js');
var room = require('../../../objects/room.js');
var roomMessage = require('../../../objects/roomMessage.js');
var types = require('../../types.js');
var utils = require('../../utils/utils.js');
var topics = require('./topics.js');

const deleteRoomOperation = 'DeleteRoomOperation';
let DeleteRoomOperation = class DeleteRoomOperation {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], DeleteRoomOperation.prototype, "deletedBy", void 0);
tslib.__decorate([
    typeGraphql.Field({ description: 'since v0.7.2' }),
    tslib.__metadata("design:type", Boolean)
], DeleteRoomOperation.prototype, "deletedByAdmin", void 0);
DeleteRoomOperation = tslib.__decorate([
    typeGraphql.ObjectType()
], DeleteRoomOperation);
let RoomConnectionEvent = class RoomConnectionEvent {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], RoomConnectionEvent.prototype, "userUid", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Boolean)
], RoomConnectionEvent.prototype, "isConnected", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Number)
], RoomConnectionEvent.prototype, "updatedAt", void 0);
RoomConnectionEvent = tslib.__decorate([
    typeGraphql.ObjectType()
], RoomConnectionEvent);
let WritingMessageStatus = class WritingMessageStatus {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], WritingMessageStatus.prototype, "userUid", void 0);
tslib.__decorate([
    typeGraphql.Field(() => WritingMessageStatusType.WritingMessageStatusType),
    tslib.__metadata("design:type", String)
], WritingMessageStatus.prototype, "status", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Number)
], WritingMessageStatus.prototype, "updatedAt", void 0);
WritingMessageStatus = tslib.__decorate([
    typeGraphql.ObjectType()
], WritingMessageStatus);
let RoomEvent = class RoomEvent {
};
tslib.__decorate([
    typeGraphql.Field(() => room.RoomOperation, { nullable: true }),
    tslib.__metadata("design:type", room.RoomOperation)
], RoomEvent.prototype, "roomOperation", void 0);
tslib.__decorate([
    typeGraphql.Field(() => DeleteRoomOperation, { nullable: true }),
    tslib.__metadata("design:type", DeleteRoomOperation)
], RoomEvent.prototype, "deleteRoomOperation", void 0);
tslib.__decorate([
    typeGraphql.Field(() => roomMessage.RoomMessageEvent, { nullable: true }),
    tslib.__metadata("design:type", Object)
], RoomEvent.prototype, "roomMessageEvent", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Boolean)
], RoomEvent.prototype, "isRoomMessagesResetEvent", void 0);
tslib.__decorate([
    typeGraphql.Field(() => RoomConnectionEvent, { nullable: true }),
    tslib.__metadata("design:type", RoomConnectionEvent)
], RoomEvent.prototype, "roomConnectionEvent", void 0);
tslib.__decorate([
    typeGraphql.Field(() => WritingMessageStatus, { nullable: true }),
    tslib.__metadata("design:type", WritingMessageStatus)
], RoomEvent.prototype, "writingMessageStatus", void 0);
RoomEvent = tslib.__decorate([
    typeGraphql.ObjectType()
], RoomEvent);
exports.RoomEventResolver = class RoomEventResolver {
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
        if (payload.sendTo !== types.all) {
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
                if (payload.value.__tstype === roomMessage.RoomPrivateMessageType) {
                    if (payload.value.visibleTo.every(vt => vt !== userUid)) {
                        return undefined;
                    }
                }
                if (payload.value.__tstype === roomMessage.RoomPrivateMessageUpdateType) {
                    if (payload.visibleTo == null) {
                        throw new Error('payload.visibleTo is required.');
                    }
                    if (payload.visibleTo.every(vt => vt !== userUid)) {
                        return undefined;
                    }
                }
                switch (payload.value.__tstype) {
                    case roomMessage.RoomPrivateMessageType:
                    case roomMessage.RoomPublicMessageType: {
                        if (payload.value.isSecret && payload.value.createdBy !== userUid) {
                            const roomMessageEvent = { ...payload.value };
                            utils.deleteSecretValues(roomMessageEvent);
                            return {
                                roomMessageEvent,
                                isRoomMessagesResetEvent: false,
                            };
                        }
                        break;
                    }
                    case roomMessage.RoomPrivateMessageUpdateType:
                    case roomMessage.RoomPublicMessageUpdateType:
                        if (payload.value.isSecret && payload.createdBy !== userUid) {
                            const roomMessageEvent = { ...payload.value };
                            utils.deleteSecretValues(roomMessageEvent);
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
                return {
                    deleteRoomOperation: {
                        __tstype: deleteRoomOperation,
                        deletedBy: payload.deletedBy,
                        deletedByAdmin: payload.deletedByAdmin,
                    },
                    isRoomMessagesResetEvent: false,
                };
            case 'roomOperationPayload':
                return {
                    roomOperation: payload.generateOperation(userUid),
                    isRoomMessagesResetEvent: false,
                };
        }
    }
};
tslib.__decorate([
    typeGraphql.Subscription(() => RoomEvent, {
        topics: topics.ROOM_EVENT,
        nullable: true,
        description: 'この Subscription を直接実行することは非推奨です。代わりに @flocon-trpg/sdk を用いてください。',
    }),
    tslib.__param(0, typeGraphql.Root()),
    tslib.__param(1, typeGraphql.Arg('id')),
    tslib.__param(2, typeGraphql.Ctx()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [Object, String, Object]),
    tslib.__metadata("design:returntype", Object)
], exports.RoomEventResolver.prototype, "roomEvent", null);
exports.RoomEventResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.RoomEventResolver);

exports.deleteRoomOperation = deleteRoomOperation;
//# sourceMappingURL=resolver.js.map
