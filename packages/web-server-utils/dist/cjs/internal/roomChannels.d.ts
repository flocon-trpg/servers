import { GetMessagesDoc, RoomEventDoc } from '@flocon-trpg/graphql-documents';
import { ResultOf } from '@graphql-typed-document-node/core';
import { PrivateChannelSet } from './privateChannelSet';
type RoomEventSubscriptionFragment = ResultOf<typeof RoomEventDoc>['result'];
type RoomMessageEvent = NonNullable<RoomEventSubscriptionFragment['roomMessageEvent']>;
type RoomMessages = ResultOf<typeof GetMessagesDoc>['result'];
type PublicChannel = {
    name: string | null;
};
export declare class RoomChannels {
    #private;
    get publicChannels(): ReadonlyMap<string, PublicChannel>;
    get privateChannels(): {
        toArray(): PrivateChannelSet[];
    };
    onEvent(action: RoomMessageEvent): boolean;
    onQuery(roomMessages: Extract<RoomMessages, {
        __typename?: 'RoomMessages';
    }>): void;
}
export {};
//# sourceMappingURL=roomChannels.d.ts.map