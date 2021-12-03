import { Room } from '../room/mikro-orm';
import { RoomAsListItem } from './graphql';

export const stateToGraphQL = ({ roomEntity }: { roomEntity: Room }): RoomAsListItem => {
    return {
        ...roomEntity,
        requiresPlayerPassword: roomEntity.playerPasswordHash != null,
        requiresSpectatorPassword: roomEntity.spectatorPasswordHash != null,
    };
};
