import { Room } from '../room/mikro-orm';
import { RoomAsListItem } from './graphql';

export const stateToGraphQL = ({ roomEntity }: { roomEntity: Room }): RoomAsListItem => {
    return {
        ...roomEntity,
        createdAt: roomEntity.createdAt?.getTime(),
        updatedAt: roomEntity.completeUpdatedAt?.getTime(),
        requiresPlayerPassword: roomEntity.playerPasswordHash != null,
        requiresSpectatorPassword: roomEntity.spectatorPasswordHash != null,
    };
};
