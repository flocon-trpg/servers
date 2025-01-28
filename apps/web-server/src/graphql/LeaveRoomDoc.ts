import { graphql } from '../graphql-codegen';

export const LeaveRoomDoc = graphql(`
    mutation LeaveRoom($roomId: String!) {
        result: leaveRoom(roomId: $roomId) {
            failureType
        }
    }
`);
