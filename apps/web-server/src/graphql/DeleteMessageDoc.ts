import { graphql } from '../graphql-codegen';

export const DeleteMessageDoc = graphql(`
    mutation DeleteMessage($roomId: String!, $messageId: String!) {
        result: deleteMessage(roomId: $roomId, messageId: $messageId) {
            failureType
        }
    }
`);
