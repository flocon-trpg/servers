import { graphql } from '../graphql-codegen';

export const DeleteRoomDoc = graphql(`
    mutation DeleteRoom($roomId: String!) {
        result: deleteRoom(roomId: $roomId) {
            failureType
        }
    }
`);
