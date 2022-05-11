import { Room } from '../room/mikro-orm';
import { RoomAsListItem } from './graphql';

export const role = async ({ roomEntity, myUserUid }: { roomEntity: Room; myUserUid: string }) => {
    const me = (await roomEntity.participants.init({ where: { user: { userUid: myUserUid } } }))[0];
    return me?.role;
};

export const isBookmarked = async ({
    roomEntity,
    myUserUid,
}: {
    roomEntity: Room;
    myUserUid: string;
}) => {
    return (await roomEntity.bookmarkedBy.init({ where: { userUid: myUserUid } })).count() !== 0;
};

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
