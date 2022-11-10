import * as SDK from '@flocon-trpg/sdk-react';
import React from 'react';
import { useLatest } from 'react-use';
import { map, skip } from 'rxjs';
import { useAddNotification } from '../../../../../../hooks/useAddNotification';
import { useParticipants } from './useParticipants';
import { useRoomClient } from '@/hooks/roomClientHooks';

/** 差分が Notification として自動追加されるので、複数の個所で同時に呼ばないようにしてください。 */
export const useRoomConnections = () => {
    const roomClient = useRoomClient();
    const addCustomMessage = useAddNotification();
    const participants = useParticipants();
    const participantsRef = useLatest(participants);
    React.useEffect(() => {
        roomClient.value.roomConnections
            .asObservable()
            .pipe(
                skip(1),
                map(x => x.diff)
            )
            .subscribe({
                next: diff => {
                    if (diff == null) {
                        return;
                    }
                    const participant = participantsRef.current?.get(diff.userUid);
                    if (participant == null) {
                        return;
                    }
                    addCustomMessage({
                        type: 'info',
                        message: `${participant.name}が${
                            diff.type === 'connect' ? '接続' : '切断'
                        }しました。`,
                    });
                },
            });
    }, [addCustomMessage, participantsRef, roomClient.value.roomConnections]);
    return SDK.useRoomConnections(roomClient.value);
};
