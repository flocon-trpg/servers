import { graphql } from '../graphql-codegen';

export const LeaveRoomDoc = graphql(`
    mutation LeaveRoom($id: String!) {
        result: leaveRoom(id: $id) {
            failureType
        }
    }
`);
