import { PubSub } from 'apollo-server-express';
import { PubSubEngine } from 'graphql-subscriptions';
import { DecodedIdToken } from '../graphql+mikro-orm/utils/Contexts';
import NodeCache from 'node-cache';
import { RoomEventPayload } from '../graphql+mikro-orm/resolvers/rooms/RoomResolver';
import { ROOM_EVENT } from '../graphql+mikro-orm/utils/Topics';

export const pubSub = new PubSub();

class ConnectionIdDatabase {
    private userUidDatabase = new NodeCache({ stdTTL: 60 * 60 * 48 });
    private roomIdDatabase = new NodeCache({ stdTTL: 60 * 60 * 48 });

    public set({ roomId, connectionId, userUid }: { roomId: string; connectionId: string; userUid: string }): void {
        this.userUidDatabase.set(connectionId, userUid);
        this.roomIdDatabase.set(connectionId, roomId);
    }

    public del({ connectionId }: { connectionId: string }): { roomId: string; userUid: string } | null {
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
    private database = new NodeCache();

    public incr({ roomId, userUid }: { roomId: string; userUid: string }): number {
        const key = `${userUid}@${roomId}`;
        const value = this.database.get(key);
        const newValue = typeof value === 'number' ? value + 1 : 1;
        this.database.set(key, newValue);
        return newValue;
    }

    public decr({ roomId, userUid }: { roomId: string; userUid: string }): number | null {
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

    public list({ roomId }: { roomId: string }): ReadonlyMap<string, number> {
        const result = new Map<string, number>();
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

export class InMemoryConnectionManager {
    private connectionIdDatabase = new ConnectionIdDatabase();
    private connectionCountDatabase = new ConnectionCountDatabase();

    public constructor() {

    }

    public onConnectToRoom({ connectionId, userUid, roomId }: { connectionId: string; userUid: string; roomId: string }) {
        this.connectionIdDatabase.set({ roomId, connectionId, userUid });
        const newValue = this.connectionCountDatabase.incr({ roomId, userUid });
        if (newValue !== 1) {
            return;
        }
        const payload: RoomEventPayload = {
            type: 'roomConnectionUpdatePayload',
            roomId,
            userUid,
            isConnected: true,
            updatedAt: new Date().getTime(),
        }
        pubSub.publish(ROOM_EVENT, payload);
    }

    public onLeaveRoom({ connectionId }: { connectionId: string }) {
        const deleted = this.connectionIdDatabase.del({ connectionId });
        if (deleted == null) {
            return;
        }
        const newConnectionCount = this.connectionCountDatabase.decr(deleted);
        if (newConnectionCount !== 0) {
            return;
        }
        const payload: RoomEventPayload = {
            type: 'roomConnectionUpdatePayload',
            roomId: deleted.roomId,
            userUid: deleted.userUid,
            isConnected: false,
            updatedAt: new Date().getTime(),
        };
        pubSub.publish(ROOM_EVENT, payload);
    }

    public list({ roomId }: { roomId: string }): ReadonlyMap<string, number> {
        return this.connectionCountDatabase.list({ roomId });
    }
}