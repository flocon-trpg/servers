import { Master, Player, Spectator } from '@kizahasi/flocon-core';

export enum ParticipantRoleType {
    Master = 'Master',
    Player = 'Player',
    Spectator = 'Spectator',
}

export const stringToParticipantRoleType = (
    source: typeof Master | typeof Player | typeof Spectator
) => {
    switch (source) {
        case Master:
            return ParticipantRoleType.Master;
        case Player:
            return ParticipantRoleType.Player;
        case Spectator:
            return ParticipantRoleType.Spectator;
    }
};

export const nullableStringToParticipantRoleType = (
    source: typeof Master | typeof Player | typeof Spectator | null | undefined
) => {
    switch (source) {
        case Master:
            return ParticipantRoleType.Master;
        case Player:
            return ParticipantRoleType.Player;
        case Spectator:
            return ParticipantRoleType.Spectator;
        default:
            return source;
    }
};
