import produce from 'immer';
import React from 'react';
import { interval } from 'rxjs';
import { WritingMessageStatusType } from '../generated/graphql';
import { useSelector } from '../store';

export type WritingMessageStatusResult = ReadonlyMap<
    string,
    { prev?: WritingMessageStatusType; current: WritingMessageStatusType; __elapsed: number }
>;

export function useWritingMessageStatus() {
    const [result, setResult] = React.useState<WritingMessageStatusResult>(new Map());

    const roomId = useSelector(state => state.roomModule.roomId);
    const roomEventSubscription = useSelector(state => state.roomModule.roomEventSubscription);

    React.useEffect(() => {
        setResult(new Map());
    }, [roomId]);

    React.useEffect(() => {
        const writingMessageStatus = roomEventSubscription?.roomEvent?.writingMessageStatus;
        if (writingMessageStatus == null) {
            return;
        }
        setResult(oldValue =>
            produce(oldValue, draft => {
                const prev = draft.get(writingMessageStatus.userUid)?.current;
                draft.set(writingMessageStatus.userUid, {
                    prev,
                    current: writingMessageStatus.status,
                    __elapsed: 0,
                });
            })
        );
    }, [roomEventSubscription?.roomEvent?.writingMessageStatus]);

    // 4～6秒間ほど変わらなかったら自動削除
    React.useEffect(() => {
        const subscription = interval(2000).subscribe(() => {
            setResult(oldValue =>
                produce(oldValue, draft => {
                    draft.forEach((value, key) => {
                        if (value.__elapsed >= 4000) {
                            draft.delete(key);
                            return;
                        }
                        value.__elapsed += 2000;
                    });
                })
            );
        });
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return result;
}
