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
    mutation JoinRoomAsPlayer($roomId: String!, $name: String!, $password: String) {
        result: joinRoomAsPlayer(roomId: $roomId, name: $name, password: $password) {
            ...JoinRoomResult
        }
    }
`);

export const JoinRoomAsSpectatorDoc = graphql(`
    mutation JoinRoomAsSpectator($roomId: String!, $name: String!, $password: String) {
        result: joinRoomAsSpectator(roomId: $roomId, name: $name, password: $password) {
            ...JoinRoomResult
        }
    }
`);
