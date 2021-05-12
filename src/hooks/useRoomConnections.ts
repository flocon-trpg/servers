import produce from 'immer';
import React from 'react';
import { useGetRoomConnectionsLazyQuery, useGetRoomConnectionsQuery } from '../generated/graphql';
import { useSelector } from '../store';

export type RoomConnectionsResult = {
    readonly [userUid: string]: { readonly isConnected: boolean; readonly fetchedAt: number };
}

export function useRoomConnections() {
    const roomId = useSelector(state => state.roomModule.roomId);
    const roomConnectionEvent = useSelector(state => state.roomModule.roomEventSubscription?.roomEvent?.roomConnectionEvent);
    const [result, setResult] = React.useState<RoomConnectionsResult>({});
    const [getRoomConnections, roomConnections] = useGetRoomConnectionsLazyQuery({ fetchPolicy: 'network-only' });

    React.useEffect(() => {
        setResult({});
        if (roomId != null) {
            getRoomConnections({ variables: { roomId } });
        }
    }, [roomId, getRoomConnections]);
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
    }, [roomConnectionEvent]);

    return result;
}