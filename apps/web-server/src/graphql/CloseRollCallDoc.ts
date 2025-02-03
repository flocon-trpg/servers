import { graphql } from '../graphql-codegen';

export const CloseRollCallDoc = graphql(`
    mutation CloseRollCall($roomId: String!, $rollCallId: String!) {
        result: closeRollCall(roomId: $roomId, rollCallId: $rollCallId) {
            failureType
        }
    }
`);
