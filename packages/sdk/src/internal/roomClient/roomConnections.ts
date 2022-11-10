import { RoomEventSubscription } from '@flocon-trpg/typed-document-node-v0.7.1';
import { Observable } from 'rxjs';
import { BehaviorEvent } from '../rxjs/behaviorEvent';
import { ReadonlyBehaviorEvent } from '../rxjs/readonlyBehaviorEvent';
import { GraphQLClientWithStatus } from './graphqlClient';

export type RoomConnectionStatus = {
    isConnected: boolean;
    /** 接続状況が最後に更新された日時です。`value` が true の場合は最後に接続を開始した日時を、false の場合は切断した日時を表します。 */
    updatedAt: Date;
};

export type RoomConnectionStatusDiff = { type: 'connect' | 'disconnect'; userUid: string };

export class RoomConnectionsManager {
    #map = new Map<string, RoomConnectionStatus>();
    #event = new BehaviorEvent<{
        current: ReadonlyMap<string, RoomConnectionStatus>;
        diff: RoomConnectionStatusDiff | null;
    }>({ current: this.#map, diff: null });

    #invokeNext(diff: RoomConnectionStatusDiff | null) {
        this.#event.next({ current: new Map(this.#map), diff });
    }

    connect({ userUid, updatedAt }: { userUid: string; updatedAt: Date }) {
        const value = this.#map.get(userUid);
        if (value == null || value.updatedAt < updatedAt) {
            this.#map.set(userUid, { isConnected: true, updatedAt: new Date(updatedAt) });
            this.#invokeNext({ type: 'connect', userUid });
            return;
        }
    }

    disconnect({ userUid, updatedAt }: { userUid: string; updatedAt: Date }) {
        const value = this.#map.get(userUid);
        if (value == null || value.updatedAt < updatedAt) {
            this.#map.set(userUid, { isConnected: false, updatedAt: new Date(updatedAt) });
            this.#invokeNext({ type: 'disconnect', userUid });
            return;
        }
    }

    onQuery({
        connectedUserUids,
        fetchedAt,
    }: {
        connectedUserUids: readonly string[];
        fetchedAt: Date;
    }) {
        connectedUserUids.forEach(userUid => {
            const value = this.#map.get(userUid);
            if (value == null || value.updatedAt < fetchedAt) {
                this.#map.set(userUid, { updatedAt: fetchedAt, isConnected: true });
            }
        });
    }

    toReadonlyBehaviorEvent() {
        return new ReadonlyBehaviorEvent(this.#event);
    }
}

export const subscribeRoomConnections = ({
    client,
    subscription,
}: {
    client: Pick<GraphQLClientWithStatus<any>, 'getRoomConnectionsQuery'>;
    subscription: Observable<
        Pick<NonNullable<RoomEventSubscription['roomEvent']>, 'roomConnectionEvent'>
    >;
}) => {
    const manager = new RoomConnectionsManager();
    const subscriptionSubscription = subscription.subscribe({
        next: status => {
            const e = status.roomConnectionEvent;
            if (e == null) {
                return;
            }

            if (e.isConnected) {
                manager.connect({ userUid: e.userUid, updatedAt: new Date(e.updatedAt) });
                return;
            }
            manager.disconnect({ userUid: e.userUid, updatedAt: new Date(e.updatedAt) });
            return;
        },
    });

    const executeQuery = () => {
        client.getRoomConnectionsQuery().then(r => {
            const result = r.value?.result;
            if (result?.__typename !== 'GetRoomConnectionsSuccessResult') {
                return;
            }
            manager.onQuery({
                connectedUserUids: result.connectedUserUids,
                fetchedAt: new Date(result.fetchedAt),
            });
        });
    };

    return {
        value: manager.toReadonlyBehaviorEvent(),
        // RoomState が joined になってから Query を実行させたいので、executeQuery が実行されるまで Query は実行されないようにしている。
        executeQuery,
        unsubscribe: () => {
            subscriptionSubscription.unsubscribe();
        },
    };
};
