import { Room } from './entity';

export const isBookmarked = async ({
    roomEntity,
    myUserUid,
}: {
    roomEntity: Room;
    myUserUid: string;
}) => {
    return (await roomEntity.bookmarkedBy.init({ where: { userUid: myUserUid } })).count() !== 0;
};
