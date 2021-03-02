import { Room } from '../room/mikro-orm';
import { RoomAsListItem } from './graphql';

export const stateToGraphQL = ({
    roomEntity,
}: {
    roomEntity: Room;
}): RoomAsListItem => {
    return { 
        ...roomEntity,
        requiresPhraseToJoinAsPlayer: roomEntity.joinAsPlayerPhrase != null,
        requiresPhraseToJoinAsSpectator: roomEntity.joinAsSpectatorPhrase != null,
    };
};