import { graphql } from '../graphql-codegen';

export const JoinRoomResultFragmentDoc = graphql(`
    fragment JoinRoomResult on JoinRoomResult {
        __typename
        ... on JoinRoomSuccessResult {
            operation {
                revisionTo
                operatedBy {
                    userUid
                    clientId
                }
                valueJson
            }
        }
        ... on JoinRoomFailureResult {
            failureType
        }
    }
`);

export const JoinRoomAsPlayerDoc = graphql(`
    mutation JoinRoomAsPlayer($id: String!, $name: String!, $password: String) {
        result: joinRoomAsPlayer(id: $id, name: $name, password: $password) {
            ...JoinRoomResult
        }
    }
`);

export const JoinRoomAsSpectatorDoc = graphql(`
    mutation JoinRoomAsSpectator($id: String!, $name: String!, $password: String) {
        result: joinRoomAsSpectator(id: $id, name: $name, password: $password) {
            ...JoinRoomResult
        }
    }
`);
