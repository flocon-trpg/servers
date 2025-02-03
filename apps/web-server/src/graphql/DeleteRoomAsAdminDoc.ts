import { graphql } from '../graphql-codegen';

export const DeleteRoomAsAdminDoc = graphql(`
    mutation DeleteRoomAsAdmin($roomId: String!) {
        result: deleteRoomAsAdmin(roomId: $roomId) {
            failureType
        }
    }
`);
