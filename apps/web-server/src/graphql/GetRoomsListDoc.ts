import { graphql } from '../graphql-codegen';

export const GetRoomsListDoc = graphql(`
    query GetRoomsList {
        result: getRoomsList {
            __typename
            ... on GetRoomsListSuccessResult {
                rooms {
                    roomId
                    name
                    createdBy
                    createdAt
                    updatedAt
                    role
                    isBookmarked
                    requiresPlayerPassword
                    requiresSpectatorPassword
                }
            }
            ... on GetRoomsListFailureResult {
                failureType
            }
        }
    }
`);
