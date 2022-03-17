export namespace Resources {
    export const testAuthorizationHeader = 'test-authorization-header';

    export const entryPassword = 'ENTRY_PASSWORD';

    export namespace Room {
        export const name = 'ROOM_NAME';
        export const playerPassword = 'PLAYER_PASSWORD';
        export const spectatorPassword = 'SPECTATOR_PASSWORD';
    }

    export namespace UserUid {
        export const master = 'MasterUser';
        export const player1 = 'Player1User';
        export const player2 = 'Player2User';
        export const spectator = 'SpectatorUser';
        export const notJoin = 'NotJoinUser';
        export const admin = 'AdminUser';
        export const notAdmin = 'NotAdminUser';
    }

    export namespace Participant {
        export namespace Name {
            export const master = 'ROOM_MASTER_NAME';
            export const player1 = 'ROOM_PLAYER1_NAME';
            export const player2 = 'ROOM_PLAYER2_NAME';
            export const spectator = 'ROOM_SPECTATOR_NAME';
        }
    }

    export namespace ClientId {
        export const player1 = 'ROOM_PLAYER1_CLIENT_ID';
    }
}
