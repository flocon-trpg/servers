import { RoomEventDoc } from '@flocon-trpg/graphql-documents';
import { ResultOf } from '@graphql-typed-document-node/core';
import { Observable } from 'rxjs';
import { ReadonlyBehaviorEvent } from '../rxjs/readonlyBehaviorEvent';
import { GraphQLClientWithStatus } from './graphqlClient';
type RoomEventSubscriptionResult = ResultOf<typeof RoomEventDoc>['result'];
export type RoomConnectionStatus = {
    isConnected: boolean;
    /** 接続状況が最後に更新された日時です。`value` が true の場合は最後に接続を開始した日時を、false の場合は切断した日時を表します。 */
    updatedAt: Date;
};
export type RoomConnectionStatusDiff = {
    type: 'connect' | 'disconnect';
    userUid: string;
};
export declare class RoomConnectionsManager {
    #private;
    connect({ userUid, updatedAt }: {
        userUid: string;
        updatedAt: Date;
    }): void;
    disconnect({ userUid, updatedAt }: {
        userUid: string;
        updatedAt: Date;
    }): void;
    onQuery({ connectedUserUids, fetchedAt, }: {
        connectedUserUids: readonly string[];
        fetchedAt: Date;
    }): void;
    toReadonlyBehaviorEvent(): ReadonlyBehaviorEvent<{
        current: ReadonlyMap<string, RoomConnectionStatus>;
        diff: RoomConnectionStatusDiff | null;
    }>;
}
export declare const subscribeRoomConnections: ({ client, subscription, }: {
    client: Pick<GraphQLClientWithStatus<any>, "getRoomConnectionsQuery">;
    subscription: Observable<Pick<NonNullable<RoomEventSubscriptionResult>, "roomConnectionEvent">>;
}) => {
    value: ReadonlyBehaviorEvent<{
        current: ReadonlyMap<string, RoomConnectionStatus>;
        diff: RoomConnectionStatusDiff | null;
    }>;
    executeQuery: () => void;
    unsubscribe: () => void;
};
export {};
//# sourceMappingURL=roomConnections.d.ts.map