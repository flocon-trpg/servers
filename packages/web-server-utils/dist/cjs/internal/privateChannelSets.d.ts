import { PrivateChannelSet } from './privateChannelSet';
export declare class PrivateChannelSets {
    #private;
    constructor(source?: string);
    add(visibleTo: ReadonlyArray<string> | PrivateChannelSet): void;
    clone(): PrivateChannelSets;
    toArray(): PrivateChannelSet[];
    toString(): string;
}
//# sourceMappingURL=privateChannelSets.d.ts.map