import { RoomEventDoc, WritingMessageStatusType } from '@flocon-trpg/graphql-documents';
import { ResultOf } from '@graphql-typed-document-node/core';
import { Observable, interval } from 'rxjs';
import { BehaviorEvent } from '../rxjs/behaviorEvent';
import { ReadonlyBehaviorEvent } from '../rxjs/readonlyBehaviorEvent';

type RoomEventSubscription = ResultOf<typeof RoomEventDoc>['result'];

type WritingMessageStatusResultSource = {
    prev?: WritingMessageStatusType;
    current: WritingMessageStatusType;
    __elapsed: number;
};

export const subscribeWritingMessageStatus = ({
    subscription,
}: {
    subscription: Observable<Pick<NonNullable<RoomEventSubscription>, 'writingMessageStatus'>>;
}) => {
    const map = new Map<string, WritingMessageStatusResultSource>();
    const convertMap = (source: Map<string, WritingMessageStatusResultSource>) => {
        const result = new Map<string, WritingMessageStatusType>();
        source.forEach((value, key) => {
            result.set(key, value.current);
        });
        return result;
    };
    const result = new BehaviorEvent<ReadonlyMap<string, WritingMessageStatusType>>(
        convertMap(map),
    );
    const subscriptionSubscription = subscription.subscribe({
        next: status => {
            if (status.writingMessageStatus == null) {
                return;
            }
            const prev = map.get(status.writingMessageStatus.userUid)?.current;
            map.set(status.writingMessageStatus.userUid, {
                prev,
                current: status.writingMessageStatus.status,
                __elapsed: 0,
            });
            result.next(convertMap(map));
        },
    });

    // 4～6秒間ほど変わらなかったら自動削除
    const autoDeleterSubscription = interval(2000).subscribe(() => {
        [...map].forEach(([key, value]) => {
            if (value.__elapsed >= 4000) {
                map.delete(key);
                return;
            }
            value.__elapsed += 2000;
        });
        result.next(convertMap(map));
    });

    return {
        value: new ReadonlyBehaviorEvent(result),
        unsubscribe: () => {
            subscriptionSubscription.unsubscribe();
            autoDeleterSubscription.unsubscribe();
        },
    };
};
