import { graphql } from '../graphql-codegen';

export const WriteRoomSoundEffectDoc = graphql(`
    mutation WriteRoomSoundEffect($roomId: String!, $file: FilePathInput!, $volume: Float!) {
        result: writeRoomSoundEffect(roomId: $roomId, file: $file, volume: $volume) {
            __typename
            ... on RoomSoundEffect {
                createdAt
                createdBy
                file {
                    path
                    sourceType
                }
                messageId
                volume
            }
            ... on WriteRoomSoundEffectFailureResult {
                failureType
            }
        }
    }
`);
