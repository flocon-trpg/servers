import { graphql } from '../graphql-codegen';

export const EditMessageDoc = graphql(`
    mutation EditMessage($roomId: String!, $messageId: String!, $text: String!) {
        result: editMessage(roomId: $roomId, messageId: $messageId, text: $text) {
            failureType
        }
    }
`);
