import { RoomEventDoc, WritingMessageStatusType } from '@flocon-trpg/graphql-documents';
import { ResultOf } from '@graphql-typed-document-node/core';
import { Observable } from 'rxjs';
import { ReadonlyBehaviorEvent } from '../rxjs/readonlyBehaviorEvent';
type RoomEventSubscription = ResultOf<typeof RoomEventDoc>['result'];
export declare const subscribeWritingMessageStatus: ({ subscription, }: {
    subscription: Observable<Pick<NonNullable<RoomEventSubscription>, "writingMessageStatus">>;
}) => {
    value: ReadonlyBehaviorEvent<ReadonlyMap<string, WritingMessageStatusType>>;
    unsubscribe: () => void;
};
export {};
//# sourceMappingURL=subscribeWritingMessageStatus.d.ts.map