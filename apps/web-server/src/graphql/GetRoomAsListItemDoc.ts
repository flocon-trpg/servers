import { graphql } from '../graphql-codegen';

export const GetRoomAsListItemDoc = graphql(`
    query GetRoomAsListItem($roomId: String!) {
        result: getRoomAsListItem(roomId: $roomId) {
            __typename
            ... on GetRoomAsListItemSuccessResult {
                room {
                    id
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
            ... on GetRoomAsListItemFailureResult {
                failureType
            }
        }
    }
`);
