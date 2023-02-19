import { RoomMessageEventFragment, RoomMessages } from '@flocon-trpg/typed-document-node';
import { PrivateChannelSet } from './privateChannelSet';
type PublicChannel = {
    name: string | null;
};
export declare class RoomChannels {
    #private;
    get publicChannels(): ReadonlyMap<string, PublicChannel>;
    get privateChannels(): {
        toArray(): PrivateChannelSet[];
    };
    onEvent(action: RoomMessageEventFragment): boolean;
    onQuery(roomMessages: RoomMessages): void;
}
export {};
//# sourceMappingURL=roomChannels.d.ts.map