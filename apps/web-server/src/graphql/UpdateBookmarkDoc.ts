import { graphql } from '../graphql-codegen';

export const UpdateBookmarkDoc = graphql(`
    mutation UpdateBookmark($roomId: String!, $newValue: Boolean!) {
        result: updateBookmark(roomId: $roomId, newValue: $newValue) {
            __typename
            ... on UpdateBookmarkSuccessResult {
                prevValue
                currentValue
            }
            ... on UpdateBookmarkFailureResult {
                failureType
            }
        }
    }
`);
