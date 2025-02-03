import { graphql } from '../graphql-codegen';

export const MakeMessageNotSecretDoc = graphql(`
    mutation MakeMessageNotSecret($roomId: String!, $messageId: String!) {
        result: makeMessageNotSecret(roomId: $roomId, messageId: $messageId) {
            failureType
        }
    }
`);
