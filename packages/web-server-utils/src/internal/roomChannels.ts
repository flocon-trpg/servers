import { GetMessagesDoc, RoomEventDoc } from '@flocon-trpg/graphql-documents';
import { ResultOf } from '@graphql-typed-document-node/core';
import { PrivateChannelSet } from './privateChannelSet';
import { PrivateChannelSets } from './privateChannelSets';

type RoomEventSubscriptionFragment = ResultOf<typeof RoomEventDoc>['result'];
type RoomMessageEvent = NonNullable<RoomEventSubscriptionFragment['roomMessageEvent']>;
type RoomMessages = ResultOf<typeof GetMessagesDoc>['result'];

type PublicChannel = {
    name: string | null;
};

export class RoomChannels {
    #publicChannels = new Map<string, PublicChannel>();
    #privateChannels = new PrivateChannelSets();

    public get publicChannels(): ReadonlyMap<string, PublicChannel> {
        return this.#publicChannels;
    }

    public get privateChannels(): { toArray(): PrivateChannelSet[] } {
        return this.#privateChannels;
    }

    public onEvent(action: RoomMessageEvent): boolean {
        switch (action.__typename) {
            case 'RoomPrivateMessage': {
                const privateChannels = this.#privateChannels.clone();
                privateChannels.add(action.visibleTo);
                this.#privateChannels = privateChannels;
                return true;
            }
            case 'RoomPublicChannel':
            case 'RoomPublicChannelUpdate': {
                const publicChannels = new Map(this.#publicChannels);
                publicChannels.set(action.key, { name: action.name ?? null });
                this.#publicChannels = publicChannels;
                return true;
            }
            case 'RoomPublicMessage':
            case 'RoomPrivateMessageUpdate':
            case 'RoomPublicMessageUpdate':
            case 'PieceLog':
            case 'RoomSoundEffect':
            case 'RoomMessagesReset':
            case undefined: {
                return false;
            }
        }
    }

    public onQuery(roomMessages: Extract<RoomMessages, { __typename?: 'RoomMessages' }>) {
        const events: RoomMessageEvent[] = [];

        // CONSIDER: __typenameをnon-undefinedにしてgraphql.tsを生成し、Spread構文を不要にするほうが綺麗なコードになりそう
        roomMessages.publicMessages.forEach(msg => {
            events.push({ ...msg, __typename: 'RoomPublicMessage' });
        });
        roomMessages.publicChannels.forEach(ch => {
            events.push({ ...ch, __typename: 'RoomPublicChannel' });
        });
        roomMessages.privateMessages.forEach(msg => {
            events.push({ ...msg, __typename: 'RoomPrivateMessage' });
        });
        roomMessages.pieceLogs.forEach(msg => {
            events.push({ ...msg, __typename: 'PieceLog' });
        });
        roomMessages.soundEffects.forEach(se => {
            events.push({ ...se, __typename: 'RoomSoundEffect' });
        });

        events.forEach(event => this.onEvent(event));
    }
}
