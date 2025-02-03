import { graphql } from '../graphql-codegen';

export const ChangeParticipantNameDoc = graphql(`
    mutation ChangeParticipantName($roomId: String!, $newName: String!) {
        result: changeParticipantName(roomId: $roomId, newName: $newName) {
            failureType
        }
    }
`);
