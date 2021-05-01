import produce from 'immer';
import React from 'react';
import { RoomEventSubscription, useGetRoomConnectionsQuery } from '../generated/graphql';

export type RoomConnectionsResult = {
    readonly [userUid: string]: { readonly isConnected: boolean; readonly fetchedAt: number };
}

export function useRoomConnections({ roomId, roomEventSubscription }: { roomId: string; roomEventSubscription: RoomEventSubscription | undefined }) {
    const [result, setResult] = React.useState<RoomConnectionsResult>({});
    const roomConnections = useGetRoomConnectionsQuery({ variables: { roomId }, fetchPolicy: 'network-only' });

    React.useEffect(() => {
        setResult({});
    }, [roomId]);
    React.useEffect(() => {
        if (roomConnections.data?.result.__typename !== 'GetRoomConnectionsSuccessResult') {
            return;
        }
        const data = roomConnections.data.result;
        setResult(oldValue => produce(oldValue, draft => {
            data.connectedUserUids.forEach(userUid => {
                draft[userUid] = { isConnected: true, fetchedAt: data.fetchedAt };
            });
        }));
    }, [roomConnections.data]);
    React.useEffect(() => {
        const roomConnectionEvent = roomEventSubscription?.roomEvent?.roomConnectionEvent;
        if (roomConnectionEvent == null) {
            return;
        }
        setResult(oldValue => produce(oldValue, draft => {
            const value = draft[roomConnectionEvent.userUid];
            if (value == null) {
                draft[roomConnectionEvent.userUid] = { isConnected: roomConnectionEvent.isConnected, fetchedAt: roomConnectionEvent.updatedAt };
                return;
            }
            if (value.fetchedAt >= roomConnectionEvent.updatedAt) {
                return;
            }
            draft[roomConnectionEvent.userUid] = { isConnected: roomConnectionEvent.isConnected, fetchedAt: roomConnectionEvent.updatedAt };
        }));
    }, [roomEventSubscription?.roomEvent?.roomConnectionEvent]);

    return result;
}