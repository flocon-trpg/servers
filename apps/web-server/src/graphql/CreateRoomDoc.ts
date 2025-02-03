import { graphql } from '../graphql-codegen';

export const CreateRoomDoc = graphql(`
    mutation CreateRoom($input: CreateRoomInput!) {
        result: createRoom(input: $input) {
            __typename
            ... on CreateRoomSuccessResult {
                roomId
                room {
                    createdAt
                    createdBy
                    isBookmarked
                    revision
                    role
                    stateJson
                    updatedAt
                }
            }
            ... on CreateRoomFailureResult {
                failureType
            }
        }
    }
`);
