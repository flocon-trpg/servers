import { Room } from '../entities/room/entity';
import { isBookmarked } from '../entities/room/isBookmarked';
import { role } from '../entities/room/role';
import { RoomAsListItem } from '../graphql/objects/room';

export const stateToGraphQL = async ({
    roomEntity,
    myUserUid,
}: {
    roomEntity: Room;
    myUserUid: string;
}): Promise<RoomAsListItem> => {
    return {
        ...roomEntity,
        createdAt: roomEntity.createdAt?.getTime(),
        updatedAt: roomEntity.completeUpdatedAt?.getTime(),
        requiresPlayerPassword: roomEntity.playerPasswordHash != null,
        requiresSpectatorPassword: roomEntity.spectatorPasswordHash != null,
        role: await role({ roomEntity, myUserUid }),
        isBookmarked: await isBookmarked({ roomEntity, myUserUid }),
    };
};
