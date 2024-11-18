import { graphql } from '../graphql-codegen';

export const DeleteRoomAsAdminDoc = graphql(`
    mutation DeleteRoomAsAdmin($id: String!) {
        result: deleteRoomAsAdmin(id: $id) {
            failureType
        }
    }
`);
