import { graphql } from '../graphql-codegen';

export const PromoteToPlayerDoc = graphql(`
    mutation PromoteToPlayer($roomId: String!, $password: String) {
        result: promoteToPlayer(roomId: $roomId, password: $password) {
            failureType
        }
    }
`);
