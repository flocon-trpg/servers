import { State, participantTemplate } from '@flocon-trpg/core';
declare type ParticipantState = State<typeof participantTemplate>;
export declare class PrivateChannelSet {
    #private;
    constructor(userUid: string | ReadonlySet<string> | ReadonlyArray<string>);
    toString(): string;
    toChannelNameBase(participants: ReadonlyMap<string, ParticipantState>, skipMe?: {
        userUid: string;
    }): string[];
    toStringArray(): string[];
    toStringSet(): ReadonlySet<string>;
}
export {};
//# sourceMappingURL=privateChannelSet.d.ts.map