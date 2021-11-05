import { useLazyQuery } from '@apollo/client';
import produce from 'immer';
import React from 'react';
import { useDispatch } from 'react-redux';
import { GetRoomConnectionsDocument } from '@flocon-trpg/typed-document-node';
import { Notification, roomModule } from '../modules/roomModule';
import { useSelector } from '../store';
import { useParticipants } from './state/useParticipants';
import { useReadonlyRef } from './useReadonlyRef';

export type RoomConnectionsResult = {
    readonly [userUid: string]: { readonly isConnected: boolean; readonly fetchedAt: number };
};

export function useRoomConnections() {
    const roomId = useSelector(state => state.roomModule.roomId);
    const roomConnectionEvent = useSelector(
        state => state.roomModule.roomEventSubscription?.roomEvent?.roomConnectionEvent
    );
    const [result, setResult] = React.useState<RoomConnectionsResult>({});
    const [getRoomConnections, roomConnections] = useLazyQuery(GetRoomConnectionsDocument, {
        fetchPolicy: 'network-only',
    });
    const dispatch = useDispatch();
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
                const notification: Notification.StateElement | undefined =
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
                        dispatch(
                            roomModule.actions.addNotification({
                                type: Notification.text,
                                notification,
                            })
                        );
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
                    dispatch(
                        roomModule.actions.addNotification({
                            type: Notification.text,
                            notification,
                        })
                    );
                }
                draft[roomConnectionEvent.userUid] = {
                    isConnected: roomConnectionEvent.isConnected,
                    fetchedAt: roomConnectionEvent.updatedAt,
                };
            })
        );
    }, [roomConnectionEvent, dispatch, participantsRef]);

    return result;
}
