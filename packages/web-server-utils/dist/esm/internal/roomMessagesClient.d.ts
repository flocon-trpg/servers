import { GetMessagesDoc, RoomEventDoc } from '@flocon-trpg/graphql-documents';
import { ResultOf } from '@graphql-typed-document-node/core';
import { Observable } from 'rxjs';
import { CustomMessage, Diff, Message } from './roomMessageTypes';
type GetRoomMessagesQueryResult = ResultOf<typeof GetMessagesDoc>['result'];
type RoomMessages = Omit<Extract<GetRoomMessagesQueryResult, {
    __typename?: 'RoomMessages';
}>, '__typename'>;
type RoomEventSubscriptionResult = ResultOf<typeof RoomEventDoc>['result'];
type RoomMessageEvent = NonNullable<RoomEventSubscriptionResult['roomMessageEvent']>;
export declare const event = "event";
export declare const query = "query";
export declare const clear = "clear";
export type MessagesChange<TCustomMessage> = {
    type: typeof event;
    current: readonly Message<TCustomMessage>[];
    diff: Diff<TCustomMessage> | null;
} | {
    type: typeof query | typeof clear;
    current: readonly Message<TCustomMessage>[];
};
export type FilteredRoomMessages<TCustomMessage> = Readonly<{
    getCurrent(): readonly Message<TCustomMessage>[];
    changed: Observable<MessagesChange<TCustomMessage>>;
}>;
export type AllRoomMessages<TCustomMessage> = FilteredRoomMessages<TCustomMessage> & Readonly<{
    filter(filter: (message: Message<TCustomMessage>) => boolean): FilteredRoomMessages<TCustomMessage>;
}>;
export declare class RoomMessagesClient<TCustomMessage> {
    #private;
    readonly messages: AllRoomMessages<TCustomMessage>;
    constructor();
    onQuery(messages: RoomMessages): void;
    onEvent(event: RoomMessageEvent): void;
    addCustomMessage(message: Omit<CustomMessage<TCustomMessage>, 'type'>): void;
    clear(): void;
}
export {};
//# sourceMappingURL=roomMessagesClient.d.ts.map