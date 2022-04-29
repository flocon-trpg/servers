import { useLazyQuery } from '@apollo/client';
import produce from 'immer';
import React from 'react';
import { GetRoomConnectionsDocument } from '@flocon-trpg/typed-document-node';
import { Notification } from '@flocon-trpg/web-server-utils';
import { useParticipants } from './state/useParticipants';
import { useReadonlyRef } from './useReadonlyRef';
import { roomAtom, roomNotificationsAtom, text } from '../atoms/room/roomAtom';
import { useAtomSelector } from '../atoms/useAtomSelector';
import { useUpdateAtom } from 'jotai/utils';

export type RoomConnectionsResult = {
    readonly [userUid: string]: { readonly isConnected: boolean; readonly fetchedAt: number };
};

export function useRoomConnections() {
    const roomId = useAtomSelector(roomAtom, state => state.roomId);
    const roomConnectionEvent = useAtomSelector(
        roomAtom,
        state => state.roomEventSubscription?.roomEvent?.roomConnectionEvent
    );
    const [result, setResult] = React.useState<RoomConnectionsResult>({});
    const [getRoomConnections, roomConnections] = useLazyQuery(GetRoomConnectionsDocument, {
        fetchPolicy: 'network-only',
    });
    const addRoomNotification = useUpdateAtom(roomNotificationsAtom);
    const participants = useParticipants();
    const participantsRef = useReadonlyRef(participants);

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
        setResult(oldValue =>
            produce(oldValue, draft => {
                data.connectedUserUids.forEach(userUid => {
                    draft[userUid] = { isConnected: true, fetchedAt: data.fetchedAt };
                });
            })
        );
    }, [roomConnections.data]);
    React.useEffect(() => {
        if (roomConnectionEvent == null) {
            return;
        }
        setResult(oldValue =>
            produce(oldValue, draft => {
                const value = draft[roomConnectionEvent.userUid];
                const participant = participantsRef.current?.get(roomConnectionEvent.userUid);
                const notification: Notification | undefined =
                    participant == null
                        ? undefined
                        : {
                              type: 'info',
                              message: `${participant.name}が${
                                  roomConnectionEvent.isConnected ? '接続' : '切断'
                              }しました。`,
                              createdAt: new Date().getTime(),
                          };
                if (value == null) {
                    if (notification != null) {
                        addRoomNotification({
                            type: text,
                            notification,
                        });
                    }
                    draft[roomConnectionEvent.userUid] = {
                        isConnected: roomConnectionEvent.isConnected,
                        fetchedAt: roomConnectionEvent.updatedAt,
                    };
                    return;
                }
                if (value.fetchedAt >= roomConnectionEvent.updatedAt) {
                    return;
                }

                if (notification != null) {
                    addRoomNotification({
                        type: text,
                        notification,
                    });
                }
                draft[roomConnectionEvent.userUid] = {
                    isConnected: roomConnectionEvent.isConnected,
                    fetchedAt: roomConnectionEvent.updatedAt,
                };
            })
        );
    }, [roomConnectionEvent, participantsRef, addRoomNotification]);

    return result;
}
