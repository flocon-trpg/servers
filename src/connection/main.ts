import { PublicChannelKey } from '@kizahasi/util';
import { PubSub } from 'graphql-subscriptions';
import _ from 'lodash';
import NodeCache from 'node-cache';
import { WritingMessageStatusType } from '../enums/WritingMessageStatusType';
import { RoomEventPayload } from '../graphql+mikro-orm/resolvers/rooms/RoomResolver';
import { ROOM_EVENT } from '../graphql+mikro-orm/utils/Topics';

export const pubSub = new PubSub();

class ConnectionIdDatabase {
    private userUidDatabase = new NodeCache({ stdTTL: 60 * 60 * 48 });
    private roomIdDatabase = new NodeCache({ stdTTL: 60 * 60 * 48 });

    public set({
        roomId,
        connectionId,
        userUid,
    }: {
        roomId: string;
        connectionId: string;
        userUid: string;
    }): void {
        this.userUidDatabase.set(connectionId, userUid);
        this.roomIdDatabase.set(connectionId, roomId);
    }

    public del({
        connectionId,
    }: {
        connectionId: string;
    }): { roomId: string; userUid: string } | null {
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
        const key = `${roomId}@${userUid}`;
        const value = this.database.get(key);
        const newValue = typeof value === 'number' ? value + 1 : 1;
        this.database.set(key, newValue);
        return newValue;
    }

    public decr({ roomId, userUid }: { roomId: string; userUid: string }): number | null {
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

    public list({ roomId }: { roomId: string }): ReadonlyMap<string, number> {
        const result = new Map<string, number>();
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

// 値が前と同じ時はSubscriptionで送信するのをある程度防ぐためのクラス
class WritingMessageStatusDatabase {
    private database = new NodeCache({ stdTTL: 600, maxKeys: 10000, checkperiod: 299 });

    // 戻り値がnullの場合、subscriptionで送信する必要はない
    public set({
        roomId,
        status,
        publicChannelKey,
        userUid,
    }: {
        roomId: string;
        userUid: string;
        publicChannelKey: string;
        status: WritingMessageStatusType;
    }): WritingMessageStatusType | null {
        if (!PublicChannelKey.Without$System.isPublicChannelKey(publicChannelKey)) {
            return null;
        }
        const key = `${roomId}@${userUid}@${publicChannelKey}`;
        const oldValue = this.database.get(key);
        if (oldValue === status && status !== WritingMessageStatusType.Writing) {
            return null;
        }
        this.database.set(key, status);
        return status;
    }

    public onDisconnect({
        userUid,
        roomId,
    }: {
        userUid: string;
        roomId: string;
    }): { publicChannelKey: PublicChannelKey.Without$System.PublicChannelKey }[] {
        return _(this.database.keys())
            .map(key => {
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
                if (!PublicChannelKey.Without$System.isPublicChannelKey(publicChannelKey)) {
                    return undefined;
                }
                this.database.del(key);
                return { publicChannelKey };
            })
            .compact()
            .value();
    }
}

export class InMemoryConnectionManager {
    private connectionIdDatabase = new ConnectionIdDatabase();
    private connectionCountDatabase = new ConnectionCountDatabase();
    private writingMessageStatusDatabase = new WritingMessageStatusDatabase();

    public onConnectToRoom({
        connectionId,
        userUid,
        roomId,
    }: {
        connectionId: string;
        userUid: string;
        roomId: string;
    }) {
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
        };
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

        const payload1: RoomEventPayload = {
            type: 'roomConnectionUpdatePayload',
            roomId: deleted.roomId,
            userUid: deleted.userUid,
            isConnected: false,
            updatedAt: new Date().getTime(),
        };
        pubSub.publish(ROOM_EVENT, payload1);

        this.writingMessageStatusDatabase.onDisconnect(deleted).forEach(({ publicChannelKey }) => {
            const payload2: RoomEventPayload = {
                type: 'writingMessageStatusUpdatePayload',
                roomId: deleted.roomId,
                userUid: deleted.userUid,
                publicChannelKey,
                status: WritingMessageStatusType.Disconnected,
                updatedAt: new Date().getTime(),
            };
            pubSub.publish(ROOM_EVENT, payload2);
        });
    }

    public onWritingMessageStatusUpdate(params: {
        roomId: string;
        userUid: string;
        publicChannelKey: string;
        status: WritingMessageStatusType;
    }) {
        return this.writingMessageStatusDatabase.set(params);
    }

    public listRoomConnections({ roomId }: { roomId: string }): ReadonlyMap<string, number> {
        return this.connectionCountDatabase.list({ roomId });
    }
}
