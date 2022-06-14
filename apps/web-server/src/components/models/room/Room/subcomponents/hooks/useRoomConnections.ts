import { useQuery } from 'urql';
import produce from 'immer';
import React from 'react';
import { GetRoomConnectionsDocument } from '@flocon-trpg/typed-document-node-v0.7.1';
import { Notification } from '@flocon-trpg/web-server-utils';
import { useParticipants } from './useParticipants';
import { useReadonlyRef } from '../../../../../../hooks/useReadonlyRef';
import { roomAtom, roomNotificationsAtom, text } from '../../../../../../atoms/roomAtom/roomAtom';
import { useAtomSelector } from '../../../../../../hooks/useAtomSelector';
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
    const [roomConnections, getRoomConnections] = useQuery({
        query: GetRoomConnectionsDocument,
        requestPolicy: 'network-only',
        pause: true,
        variables: roomId == null ? undefined : { roomId },
    });
    const addRoomNotification = useUpdateAtom(roomNotificationsAtom);
    const participants = useParticipants();
    const participantsRef = useReadonlyRef(participants);

    React.useEffect(() => {
        setResult({});
        if (roomId != null) {
            getRoomConnections();
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
