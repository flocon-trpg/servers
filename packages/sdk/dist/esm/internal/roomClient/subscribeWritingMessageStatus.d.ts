import { RoomEventSubscription, WritingMessageStatusType } from '@flocon-trpg/typed-document-node';
import { Observable } from 'rxjs';
import { ReadonlyBehaviorEvent } from '../rxjs/readonlyBehaviorEvent';
export declare const subscribeWritingMessageStatus: ({ subscription, }: {
    subscription: Observable<Pick<NonNullable<RoomEventSubscription['roomEvent']>, 'writingMessageStatus'>>;
}) => {
    value: ReadonlyBehaviorEvent<ReadonlyMap<string, WritingMessageStatusType>>;
    unsubscribe: () => void;
};
//# sourceMappingURL=subscribeWritingMessageStatus.d.ts.map