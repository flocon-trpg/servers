import { Master, Player, Spectator } from '@flocon-trpg/core';

export enum ParticipantRole {
    Master = 'Master',
    Player = 'Player',
    Spectator = 'Spectator',
}

export namespace ParticipantRole {
    export const ofString = (
        source: typeof Master | typeof Player | typeof Spectator
    ): ParticipantRole => {
        switch (source) {
            case Master:
                return ParticipantRole.Master;
            case Player:
                return ParticipantRole.Player;
            case Spectator:
                return ParticipantRole.Spectator;
        }
    };

    export const ofNullishString = (
        source: typeof Master | typeof Player | typeof Spectator | null | undefined
    ) => {
        switch (source) {
            case null:
            case undefined:
                return undefined;
            default:
                return ofString(source);
        }
    };
}
