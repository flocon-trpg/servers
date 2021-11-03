"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryConnectionManager = exports.pubSub = void 0;
const flocon_core_1 = require("@kizahasi/flocon-core");
const graphql_subscriptions_1 = require("graphql-subscriptions");
const WritingMessageStatusType_1 = require("../enums/WritingMessageStatusType");
const Topics_1 = require("../graphql+mikro-orm/utils/Topics");
exports.pubSub = new graphql_subscriptions_1.PubSub();
class ConnectionIdDatabase {
    constructor() {
        this.userUidDatabase = (0, flocon_core_1.createNodeCache)({ stdTTL: 60 * 60 * 48 });
        this.roomIdDatabase = (0, flocon_core_1.createNodeCache)({ stdTTL: 60 * 60 * 48 });
    }
    async set({ roomId, connectionId, userUid, }) {
        await this.userUidDatabase.set(connectionId, userUid);
        await this.roomIdDatabase.set(connectionId, roomId);
    }
    async del({ connectionId, }) {
        const userUid = await this.userUidDatabase.getAsString(connectionId);
        await this.userUidDatabase.del(connectionId);
        const roomId = await this.roomIdDatabase.getAsString(connectionId);
        await this.userUidDatabase.del(connectionId);
        if (typeof userUid === 'string' && typeof roomId === 'string') {
            return { userUid, roomId };
        }
        return null;
    }
}
class ConnectionCountDatabase {
    constructor() {
        this.database = (0, flocon_core_1.createNodeCache)({});
    }
    async incr({ roomId, userUid }) {
        const key = `${roomId}@${userUid}`;
        return await this.database.incrby(key, 1);
    }
    async decr({ roomId, userUid, }) {
        const key = `${roomId}@${userUid}`;
        const newValue = await this.database.decrby(key, 1);
        if (newValue <= 0) {
            await this.database.del(key);
            return newValue === 0 ? 0 : null;
        }
        return newValue;
    }
    async list({ roomId }) {
        const result = new Map();
        const keys = await this.database.keys();
        for (const key of keys) {
            const split = key.split('@');
            const [roomIdKey, userUid, ...rest] = split;
            if (roomIdKey == null || userUid == null || rest.length > 0) {
                continue;
            }
            if (roomIdKey !== roomId) {
                continue;
            }
            const value = await this.database.getAsNumber(key);
            if (value == null) {
                continue;
            }
            result.set(userUid, value);
        }
        return result;
    }
}
class WritingMessageStatusDatabase {
    constructor() {
        this.database = (0, flocon_core_1.createNodeCache)({ stdTTL: 600, maxKeys: 10000, checkperiod: 299 });
    }
    async set({ roomId, status, userUid, }) {
        const key = `${roomId}@${userUid}`;
        const oldValue = await this.database.getAsString(key);
        if (oldValue === status && status !== WritingMessageStatusType_1.WritingMessageStatusType.Writing) {
            return null;
        }
        await this.database.set(key, status);
        return status;
    }
    async onDisconnect({ userUid, roomId, }) {
        const keys = await this.database.keys();
        for (const key of keys) {
            const split = key.split('@');
            if (split.length !== 2) {
                return undefined;
            }
            const roomIdKey = split[0];
            const userUidKey = split[1];
            if (roomIdKey !== roomId) {
                return undefined;
            }
            if (userUidKey !== userUid) {
                return undefined;
            }
            await this.database.del(key);
        }
    }
}
class InMemoryConnectionManager {
    constructor() {
        this.connectionIdDatabase = new ConnectionIdDatabase();
        this.connectionCountDatabase = new ConnectionCountDatabase();
        this.writingMessageStatusDatabase = new WritingMessageStatusDatabase();
    }
    async onConnectToRoom({ connectionId, userUid, roomId, }) {
        await this.connectionIdDatabase.set({ roomId, connectionId, userUid });
        const newValue = await this.connectionCountDatabase.incr({ roomId, userUid });
        if (newValue !== 1) {
            return;
        }
        const payload = {
            type: 'roomConnectionUpdatePayload',
            roomId,
            userUid,
            isConnected: true,
            updatedAt: new Date().getTime(),
        };
        await exports.pubSub.publish(Topics_1.ROOM_EVENT, payload);
    }
    async onLeaveRoom({ connectionId }) {
        const deleted = await this.connectionIdDatabase.del({ connectionId });
        if (deleted == null) {
            return;
        }
        const newConnectionCount = await this.connectionCountDatabase.decr(deleted);
        if (newConnectionCount !== 0) {
            return;
        }
        const payload1 = {
            type: 'roomConnectionUpdatePayload',
            roomId: deleted.roomId,
            userUid: deleted.userUid,
            isConnected: false,
            updatedAt: new Date().getTime(),
        };
        await exports.pubSub.publish(Topics_1.ROOM_EVENT, payload1);
        await this.writingMessageStatusDatabase.onDisconnect(deleted);
        const payload2 = {
            type: 'writingMessageStatusUpdatePayload',
            roomId: deleted.roomId,
            userUid: deleted.userUid,
            status: WritingMessageStatusType_1.WritingMessageStatusType.Disconnected,
            updatedAt: new Date().getTime(),
        };
        await exports.pubSub.publish(Topics_1.ROOM_EVENT, payload2);
    }
    onWritingMessageStatusUpdate(params) {
        return this.writingMessageStatusDatabase.set(params);
    }
    listRoomConnections({ roomId, }) {
        return this.connectionCountDatabase.list({ roomId });
    }
}
exports.InMemoryConnectionManager = InMemoryConnectionManager;
