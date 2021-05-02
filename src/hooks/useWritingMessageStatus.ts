import produce from 'immer';
import React from 'react';
import { interval } from 'rxjs';
import { PublicChannelKey } from '../@shared/publicChannelKey';
import { RoomEventSubscription, WritingMessageStatusType } from '../generated/graphql';

export type WritingMessageStatusResult = ReadonlyMap<PublicChannelKey.Without$System.PublicChannelKey, ReadonlyMap<string, { prev?: WritingMessageStatusType; current: WritingMessageStatusType; __elapsed: number }>>

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
            console.info('publicChannelKey', writingMessageStatus.publicChannelKey);
            if (!PublicChannelKey.Without$System.isPublicChannelKey(writingMessageStatus.publicChannelKey)) {
                return;
            }
            let inner = draft.get(writingMessageStatus.publicChannelKey);
            if (inner == null) {
                inner = new Map();
            }
            const prev = inner.get(writingMessageStatus.userUid)?.current;
            inner.set(writingMessageStatus.userUid, { prev, current: writingMessageStatus.status, __elapsed: 0 });
            draft.set(writingMessageStatus.publicChannelKey, inner); 
        }));
    }, [roomEventSubscription?.roomEvent?.writingMessageStatus]);

    // 4～6秒間ほど変わらなかったら自動削除
    React.useEffect(() => {
        const subscription = interval(2000).subscribe(() => {
            setResult(oldValue => produce(oldValue, draft => {
                draft.forEach(inner => {
                    inner.forEach((value, key) => {
                        if (value.__elapsed >= 4000) {
                            inner.delete(key);
                            return;
                        }
                        value.__elapsed += 2000;
                    });
                });
            }));
        });
        return (() => {
            subscription.unsubscribe();
        });
    }, []);

    return result;
}