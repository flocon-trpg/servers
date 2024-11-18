import { graphql } from '../graphql-codegen';

export const ResetMessagesDoc = graphql(`
    mutation ResetMessages($roomId: String!) {
        result: resetMessages(roomId: $roomId) {
            failureType
        }
    }
`);
