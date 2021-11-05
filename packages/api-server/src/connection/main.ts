/*eslint require-await: "error"*/

import { createNodeCache } from '@flocon-trpg/core';
import { PubSub } from 'graphql-subscriptions';
import { WritingMessageStatusType } from '../enums/WritingMessageStatusType';
import { RoomEventPayload } from '../graphql+mikro-orm/resolvers/rooms/RoomResolver';
import { ROOM_EVENT } from '../graphql+mikro-orm/utils/Topics';

export const pubSub = new PubSub();

class ConnectionIdDatabase {
    private userUidDatabase = createNodeCache({ stdTTL: 60 * 60 * 48 });
    private roomIdDatabase = createNodeCache({ stdTTL: 60 * 60 * 48 });

    public async set({
        roomId,
        connectionId,
        userUid,
    }: {
        roomId: string;
        connectionId: string;
        userUid: string;
    }): Promise<void> {
        await this.userUidDatabase.set(connectionId, userUid);
        await this.roomIdDatabase.set(connectionId, roomId);
    }

    public async del({
        connectionId,
    }: {
        connectionId: string;
    }): Promise<{ roomId: string; userUid: string } | null> {
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
    private database = createNodeCache({});

    public async incr({ roomId, userUid }: { roomId: string; userUid: string }): Promise<number> {
        const key = `${roomId}@${userUid}`;
        return await this.database.incrby(key, 1);
    }

    public async decr({
        roomId,
        userUid,
    }: {
        roomId: string;
        userUid: string;
    }): Promise<number | null> {
        const key = `${roomId}@${userUid}`;
        const newValue = await this.database.decrby(key, 1);
        if (newValue <= 0) {
            await this.database.del(key);
            return newValue === 0 ? 0 : null;
        }
        return newValue;
    }

    public async list({ roomId }: { roomId: string }): Promise<ReadonlyMap<string, number>> {
        const result = new Map<string, number>();
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

// 値が前と同じ時はSubscriptionで送信するのをある程度防ぐためのクラス
class WritingMessageStatusDatabase {
    private database = createNodeCache({ stdTTL: 600, maxKeys: 10000, checkperiod: 299 });

    // 戻り値がnullの場合、subscriptionで送信する必要はない
    public async set({
        roomId,
        status,
        userUid,
    }: {
        roomId: string;
        userUid: string;
        status: WritingMessageStatusType;
    }): Promise<WritingMessageStatusType | null> {
        const key = `${roomId}@${userUid}`;
        const oldValue = await this.database.getAsString(key);
        if (oldValue === status && status !== WritingMessageStatusType.Writing) {
            return null;
        }
        await this.database.set(key, status);
        return status;
    }

    public async onDisconnect({
        userUid,
        roomId,
    }: {
        userUid: string;
        roomId: string;
    }): Promise<void> {
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

export class InMemoryConnectionManager {
    private connectionIdDatabase = new ConnectionIdDatabase();
    private connectionCountDatabase = new ConnectionCountDatabase();
    private writingMessageStatusDatabase = new WritingMessageStatusDatabase();

    public async onConnectToRoom({
        connectionId,
        userUid,
        roomId,
    }: {
        connectionId: string;
        userUid: string;
        roomId: string;
    }) {
        await this.connectionIdDatabase.set({ roomId, connectionId, userUid });
        const newValue = await this.connectionCountDatabase.incr({ roomId, userUid });
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
        await pubSub.publish(ROOM_EVENT, payload);
    }

    public async onLeaveRoom({ connectionId }: { connectionId: string }) {
        const deleted = await this.connectionIdDatabase.del({ connectionId });
        if (deleted == null) {
            return;
        }
        const newConnectionCount = await this.connectionCountDatabase.decr(deleted);
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
        await pubSub.publish(ROOM_EVENT, payload1);

        await this.writingMessageStatusDatabase.onDisconnect(deleted);
        const payload2: RoomEventPayload = {
            type: 'writingMessageStatusUpdatePayload',
            roomId: deleted.roomId,
            userUid: deleted.userUid,
            status: WritingMessageStatusType.Disconnected,
            updatedAt: new Date().getTime(),
        };
        await pubSub.publish(ROOM_EVENT, payload2);
    }

    public onWritingMessageStatusUpdate(params: {
        roomId: string;
        userUid: string;
        status: WritingMessageStatusType;
    }) {
        return this.writingMessageStatusDatabase.set(params);
    }

    public listRoomConnections({
        roomId,
    }: {
        roomId: string;
    }): Promise<ReadonlyMap<string, number>> {
        return this.connectionCountDatabase.list({ roomId });
    }
}
