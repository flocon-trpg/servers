import * as ParticipantRoleModule from '../@shared/ot/room/participant/v1';

export enum ParticipantRole {
    Master = 'Master',
    Player = 'Player',
    Spectator = 'Spectator',
}

export namespace ParticipantRole {
    export const ofString = (source: typeof ParticipantRoleModule.Master | typeof ParticipantRoleModule.Player | typeof ParticipantRoleModule.Spectator): ParticipantRole => {
        switch (source) {
            case ParticipantRoleModule.Master:
                return ParticipantRole.Master;
            case ParticipantRoleModule.Player:
                return ParticipantRole.Player;
            case ParticipantRoleModule.Spectator:
                return ParticipantRole.Spectator;
        }
    };

    export const ofNullishString = (source: typeof ParticipantRoleModule.Master | typeof ParticipantRoleModule.Player | typeof ParticipantRoleModule.Spectator | null | undefined) => {
        switch (source) {
            case null:
            case undefined:
                return undefined;
            default:
                return ofString(source);
        }
    };
}