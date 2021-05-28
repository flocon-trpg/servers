"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryConnectionManager = exports.pubSub = void 0;
const util_1 = require("@kizahasi/util");
const apollo_server_express_1 = require("apollo-server-express");
const lodash_1 = __importDefault(require("lodash"));
const node_cache_1 = __importDefault(require("node-cache"));
const WritingMessageStatusType_1 = require("../enums/WritingMessageStatusType");
const Topics_1 = require("../graphql+mikro-orm/utils/Topics");
exports.pubSub = new apollo_server_express_1.PubSub();
class ConnectionIdDatabase {
    constructor() {
        this.userUidDatabase = new node_cache_1.default({ stdTTL: 60 * 60 * 48 });
        this.roomIdDatabase = new node_cache_1.default({ stdTTL: 60 * 60 * 48 });
    }
    set({ roomId, connectionId, userUid }) {
        this.userUidDatabase.set(connectionId, userUid);
        this.roomIdDatabase.set(connectionId, roomId);
    }
    del({ connectionId }) {
        const userUid = this.userUidDatabase.get(connectionId);
        this.userUidDatabase.del(connectionId);
        const roomId = this.roomIdDatabase.get(connectionId);
        this.userUidDatabase.del(connectionId);
        if (typeof userUid === 'string' && typeof roomId === 'string') {
            return { userUid, roomId };
        }
        return null;
    }
}
class ConnectionCountDatabase {
    constructor() {
        this.database = new node_cache_1.default();
    }
    incr({ roomId, userUid }) {
        const key = `${roomId}@${userUid}`;
        const value = this.database.get(key);
        const newValue = typeof value === 'number' ? value + 1 : 1;
        this.database.set(key, newValue);
        return newValue;
    }
    decr({ roomId, userUid }) {
        const key = `${roomId}@${userUid}`;
        const value = this.database.get(key);
        if (typeof value !== 'number' || value <= 0) {
            this.database.del(key);
            return null;
        }
        const newValue = value - 1;
        if (newValue <= 0) {
            this.database.del(key);
            return 0;
        }
        this.database.set(key, newValue);
        return newValue;
    }
    list({ roomId }) {
        const result = new Map();
        this.database.keys().forEach(key => {
            const split = key.split('@');
            if (split.length !== 2) {
                return;
            }
            const roomIdKey = split[0];
            const userUid = split[1];
            if (roomIdKey !== roomId) {
                return;
            }
            const value = this.database.get(key);
            if (typeof value !== 'number') {
                return;
            }
            result.set(userUid, value);
        });
        return result;
    }
}
class WritingMessageStatusDatabase {
    constructor() {
        this.database = new node_cache_1.default({ stdTTL: 600, maxKeys: 10000, checkperiod: 299 });
    }
    set({ roomId, status, publicChannelKey, userUid }) {
        if (!util_1.PublicChannelKey.Without$System.isPublicChannelKey(publicChannelKey)) {
            return null;
        }
        const key = `${roomId}@${userUid}@${publicChannelKey}`;
        const oldValue = this.database.get(key);
        if (oldValue === status && status !== WritingMessageStatusType_1.WritingMessageStatusType.Writing) {
            return null;
        }
        this.database.set(key, status);
        return status;
    }
    onDisconnect({ userUid, roomId }) {
        return lodash_1.default(this.database.keys()).map(key => {
            const split = key.split('@');
            if (split.length !== 3) {
                return undefined;
            }
            const roomIdKey = split[0];
            const userUidKey = split[1];
            const publicChannelKey = split[2];
            if (roomIdKey !== roomId) {
                return undefined;
            }
            if (userUidKey !== userUid) {
                return undefined;
            }
            if (!util_1.PublicChannelKey.Without$System.isPublicChannelKey(publicChannelKey)) {
                return undefined;
            }
            this.database.del(key);
            return { publicChannelKey };
        }).compact().value();
    }
}
class InMemoryConnectionManager {
    constructor() {
        this.connectionIdDatabase = new ConnectionIdDatabase();
        this.connectionCountDatabase = new ConnectionCountDatabase();
        this.writingMessageStatusDatabase = new WritingMessageStatusDatabase();
    }
    onConnectToRoom({ connectionId, userUid, roomId }) {
        this.connectionIdDatabase.set({ roomId, connectionId, userUid });
        const newValue = this.connectionCountDatabase.incr({ roomId, userUid });
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
        exports.pubSub.publish(Topics_1.ROOM_EVENT, payload);
    }
    onLeaveRoom({ connectionId }) {
        const deleted = this.connectionIdDatabase.del({ connectionId });
        if (deleted == null) {
            return;
        }
        const newConnectionCount = this.connectionCountDatabase.decr(deleted);
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
        exports.pubSub.publish(Topics_1.ROOM_EVENT, payload1);
        this.writingMessageStatusDatabase.onDisconnect(deleted).forEach(({ publicChannelKey }) => {
            const payload2 = {
                type: 'writingMessageStatusUpdatePayload',
                roomId: deleted.roomId,
                userUid: deleted.userUid,
                publicChannelKey,
                status: WritingMessageStatusType_1.WritingMessageStatusType.Disconnected,
                updatedAt: new Date().getTime(),
            };
            exports.pubSub.publish(Topics_1.ROOM_EVENT, payload2);
        });
    }
    onWritingMessageStatusUpdate(params) {
        return this.writingMessageStatusDatabase.set(params);
    }
    listRoomConnections({ roomId }) {
        return this.connectionCountDatabase.list({ roomId });
    }
}
exports.InMemoryConnectionManager = InMemoryConnectionManager;
