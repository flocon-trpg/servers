export namespace Resources {
    export const testAuthorizationHeader = 'test-authorization-header';

    export const entryPassword = 'ENTRY_PASSWORD';

    export namespace Room {
        export const name = 'ROOM_NAME';
        export const playerPassword = 'PLAYER_PASSWORD';
        export const spectatorPassword = 'SPECTATOR_PASSWORD';
    }

    export namespace User {
        export const master = 'ROOM_MASTER_USER';
        export const player1 = 'ROOM_PLAYER1_USER';
        export const player2 = 'ROOM_PLAYER2_USER';
        export const spectator = 'ROOM_SPECTATOR_USER';
        export const notJoin = 'NOT_JOIN_USER';
    }

    export namespace ParticipantName {
        export const master = 'ROOM_MASTER_NAME';
        export const player1 = 'ROOM_PLAYER1_NAME';
        export const player2 = 'ROOM_PLAYER2_NAME';
        export const spectator = 'ROOM_SPECTATOR_NAME';
    }

    export namespace ClientId {
        export const player1 = 'ROOM_PLAYER1_CLIENT_ID';
    }
}
