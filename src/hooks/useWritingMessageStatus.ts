import produce from 'immer';
import React from 'react';
import { PublicChannelKey } from '../@shared/publicChannelKey';
import { RoomEventSubscription, WritingMessageStatusType } from '../generated/graphql';

export type WritingMessageStatusResult = ReadonlyMap<PublicChannelKey.Without$System.PublicChannelKey, ReadonlyMap<string, { prev?: WritingMessageStatusType; current: WritingMessageStatusType }>>

export function useWritingMessageStatus({ roomId, roomEventSubscription }: { roomId: string; roomEventSubscription: RoomEventSubscription | undefined }) {
    const [result, setResult] = React.useState<WritingMessageStatusResult>(new Map());

    React.useEffect(() => {
        setResult(new Map());
    }, [roomId]);
    React.useEffect(() => {
        const writingMessageStatus = roomEventSubscription?.roomEvent?.writingMessageStatus;
        if (writingMessageStatus == null) {
            return;
        }
        setResult(oldValue => produce(oldValue, draft => {
            if (!PublicChannelKey.Without$System.isPublicChannelKey(writingMessageStatus.publicChannelKey)) {
                return;
            }
            let inner = draft.get(writingMessageStatus.publicChannelKey);
            if (inner == null) {
                inner = new Map();
            }
            const prev = inner.get(writingMessageStatus.userUid)?.current;
            inner.set(writingMessageStatus.userUid, { prev, current: writingMessageStatus.status });
            draft.set(writingMessageStatus.publicChannelKey, inner);
        }));
    }, [roomEventSubscription?.roomEvent?.writingMessageStatus]);

    return result;
}