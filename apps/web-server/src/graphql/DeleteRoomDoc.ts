import { graphql } from '../graphql-codegen';

export const DeleteRoomDoc = graphql(`
    mutation DeleteRoom($id: String!) {
        result: deleteRoom(id: $id) {
            failureType
        }
    }
`);
