"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryConnectionManager = exports.pubSub = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const node_cache_1 = __importDefault(require("node-cache"));
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
        const key = `${userUid}@${roomId}`;
        const value = this.database.get(key);
        const newValue = typeof value === 'number' ? value + 1 : 1;
        this.database.set(key, newValue);
        return newValue;
    }
    decr({ roomId, userUid }) {
        const key = `${userUid}@${roomId}`;
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
            const userUid = split[0];
            const roomIdKey = split[1];
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
class InMemoryConnectionManager {
    constructor() {
        this.connectionIdDatabase = new ConnectionIdDatabase();
        this.connectionCountDatabase = new ConnectionCountDatabase();
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
        const payload = {
            type: 'roomConnectionUpdatePayload',
            roomId: deleted.roomId,
            userUid: deleted.userUid,
            isConnected: false,
            updatedAt: new Date().getTime(),
        };
        exports.pubSub.publish(Topics_1.ROOM_EVENT, payload);
    }
    list({ roomId }) {
        return this.connectionCountDatabase.list({ roomId });
    }
}
exports.InMemoryConnectionManager = InMemoryConnectionManager;
