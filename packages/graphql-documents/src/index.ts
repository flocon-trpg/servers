import { graphql } from './graphql-codegen';

export const CharacterValueForMessageFragmentDoc = graphql(`
    fragment CharacterValueForMessage on CharacterValueForMessage {
        image {
            path
            sourceType
        }
        isPrivate
        name
        portraitImage {
            path
            sourceType
        }
        stateId
    }
`);

export const RoomPublicMessageFragmentDoc = graphql(`
    fragment RoomPublicMessage on RoomPublicMessage {
        messageId
        altTextToSecret
        textColor
        updatedAt
        updatedText {
            currentText
            updatedAt
        }
        channelKey
        character {
            ...CharacterValueForMessage
        }
        commandResult {
            isSuccess
            text
        }
        createdAt
        createdBy
        customName
        initText
        initTextSource
        isSecret
    }
`);

export const RoomPrivateMessageFragmentDoc = graphql(`
    fragment RoomPrivateMessage on RoomPrivateMessage {
        messageId
        visibleTo
        initText
        initTextSource
        updatedText {
            currentText
            updatedAt
        }
        textColor
        commandResult {
            text
            isSuccess
        }
        altTextToSecret
        isSecret
        createdBy
        character {
            ...CharacterValueForMessage
        }
        customName
        createdAt
        updatedAt
        initText
        initTextSource
    }
`);

export const PieceLogFragmentDoc = graphql(`
    fragment PieceLog on PieceLog {
        messageId
        stateId
        createdAt
        logType
        valueJson
    }
`);

export const RoomPrivateMessageUpdateFragmentDoc = graphql(`
    fragment RoomPrivateMessageUpdate on RoomPrivateMessageUpdate {
        messageId
        altTextToSecret
        commandResult {
            isSuccess
            text
        }
        initText
        initTextSource
        isSecret
        updatedAt
        updatedText {
            currentText
            updatedAt
        }
    }
`);

export const RoomPublicMessageUpdateFragmentDoc = graphql(`
    fragment RoomPublicMessageUpdate on RoomPublicMessageUpdate {
        altTextToSecret
        commandResult {
            isSuccess
            text
        }
        initText
        initTextSource
        isSecret
        messageId
        updatedAt
        updatedText {
            currentText
            updatedAt
        }
    }
`);

export const RoomSoundEffectFragmentDoc = graphql(`
    fragment RoomSoundEffect on RoomSoundEffect {
        createdAt
        createdBy
        file {
            path
            sourceType
        }
        messageId
        volume
    }
`);

export const RoomPublicChannelFragmentDoc = graphql(`
    fragment RoomPublicChannel on RoomPublicChannel {
        key
        name
    }
`);

export const RoomPublicChannelUpdateFragmentDoc = graphql(`
    fragment RoomPublicChannelUpdate on RoomPublicChannelUpdate {
        key
        name
    }
`);

export const RoomGetStateFragmentDoc = graphql(`
    fragment RoomGetState on RoomGetState {
        revision
        createdBy
        createdAt
        updatedAt
        role
        isBookmarked
        stateJson
    }
`);

export const RoomAsListItemFragmentDoc = graphql(`
    fragment RoomAsListItem on RoomAsListItem {
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
`);

export const RoomOperationFragmentDoc = graphql(`
    fragment RoomOperation on RoomOperation {
        revisionTo
        operatedBy {
            userUid
            clientId
        }
        valueJson
    }
`);

export const RoomEventDoc = graphql(`
    subscription RoomEvent($roomId: String!) {
        result: roomEvent(roomId: $roomId) {
            isRoomMessagesResetEvent
            roomOperation {
                ...RoomOperation
            }
            deleteRoomOperation {
                deletedBy
            }
            roomMessageEvent {
                __typename
                ... on PieceLog {
                    ...PieceLog
                }
                ... on RoomMessagesReset {
                    publicMessagesDeleted
                }
                ... on RoomPrivateMessage {
                    ...RoomPrivateMessage
                }
                ... on RoomPrivateMessageUpdate {
                    ...RoomPrivateMessageUpdate
                }
                ... on RoomPublicChannel {
                    ...RoomPublicChannel
                }
                ... on RoomPublicChannelUpdate {
                    ...RoomPublicChannelUpdate
                }
                ... on RoomPublicMessage {
                    ...RoomPublicMessage
                }
                ... on RoomPublicMessageUpdate {
                    ...RoomPublicMessageUpdate
                }
                ... on RoomSoundEffect {
                    ...RoomSoundEffect
                }
            }
            roomConnectionEvent {
                userUid
                isConnected
                updatedAt
            }
            writingMessageStatus {
                userUid
                status
            }
        }
    }
`);

export const GetMessagesDoc = graphql(`
    query GetMessages($roomId: String!) {
        result: getMessages(roomId: $roomId) {
            __typename
            ... on RoomMessages {
                pieceLogs {
                    createdAt
                    logType
                    messageId
                    stateId
                    valueJson
                }
                privateMessages {
                    ...RoomPrivateMessage
                }
                publicChannels {
                    key
                    name
                }
                publicMessages {
                    ...RoomPublicMessage
                }
                soundEffects {
                    createdAt
                    createdBy
                    file {
                        path
                        sourceType
                    }
                    messageId
                    volume
                }
            }
            ... on GetRoomMessagesFailureResult {
                failureType
            }
        }
    }
`);

export const WritePublicMessageDoc = graphql(`
    mutation WritePublicMessage(
        $roomId: String!
        $text: String!
        $textColor: String
        $channelKey: String!
        $characterId: String
        $customName: String
        $gameType: String
    ) {
        result: writePublicMessage(
            roomId: $roomId
            text: $text
            textColor: $textColor
            channelKey: $channelKey
            characterId: $characterId
            customName: $customName
            gameType: $gameType
        ) {
            __typename
            ... on RoomPublicMessage {
                ...RoomPublicMessage
            }
            ... on WriteRoomPublicMessageFailureResult {
                failureType
            }
            ... on RoomMessageSyntaxError {
                errorMessage
            }
        }
    }
`);

export const WritePrivateMessageDoc = graphql(`
    mutation WritePrivateMessage(
        $roomId: String!
        $visibleTo: [String!]!
        $text: String!
        $textColor: String
        $characterId: String
        $customName: String
        $gameType: String
    ) {
        result: writePrivateMessage(
            roomId: $roomId
            visibleTo: $visibleTo
            text: $text
            textColor: $textColor
            characterId: $characterId
            customName: $customName
            gameType: $gameType
        ) {
            __typename
            ... on RoomPrivateMessage {
                ...RoomPrivateMessage
            }
            ... on WriteRoomPrivateMessageFailureResult {
                failureType
            }
            ... on RoomMessageSyntaxError {
                errorMessage
            }
        }
    }
`);

export const OperateRoomDoc = graphql(`
    mutation operateRoom(
        $roomId: String!
        $revisionFrom: Int!
        $operation: RoomOperationInput!
        $requestId: String!
    ) {
        result: operateRoom(
            roomId: $roomId
            prevRevision: $revisionFrom
            operation: $operation
            requestId: $requestId
        ) {
            __typename
            ... on OperateRoomSuccessResult {
                operation {
                    ...RoomOperation
                }
            }
            ... on OperateRoomIdResult {
                requestId
            }
            ... on OperateRoomFailureResult {
                failureType
            }
            ... on OperateRoomNonJoinedResult {
                roomAsListItem {
                    ...RoomAsListItem
                }
            }
        }
    }
`);

export const GetRoomDoc = graphql(`
    query GetRoom($roomId: String!) {
        result: getRoom(roomId: $roomId) {
            __typename
            ... on GetJoinedRoomResult {
                role
                room {
                    ...RoomGetState
                }
            }
            ... on GetNonJoinedRoomResult {
                roomAsListItem {
                    ...RoomAsListItem
                }
            }
            ... on GetRoomFailureResult {
                failureType
            }
        }
    }
`);

export const UpdateWritingMessageStatusDoc = graphql(`
    mutation UpdateWritingMessageStatus(
        $roomId: String!
        $newStatus: WritingMessageStatusInputType!
    ) {
        result: updateWritingMessageStatus(roomId: $roomId, newStatus: $newStatus)
    }
`);

export const GetRoomConnectionsDoc = graphql(`
    query GetRoomConnections($roomId: String!) {
        result: getRoomConnections(roomId: $roomId) {
            __typename
            ... on GetRoomConnectionsSuccessResult {
                fetchedAt
                connectedUserUids
            }
            ... on GetRoomConnectionsFailureResult {
                failureType
            }
        }
    }
`);

export {
    GetRoomMessagesFailureType,
    PieceLogType,
    FileSourceType,
    WritingMessageStatusType,
    OperateRoomFailureType,
    GetRoomFailureType,
    WritingMessageStatusInputType,
    FilePathInput,
    ParticipantRole,
    JoinRoomFailureType,
    PrereleaseType,
    WriteRoomPublicMessageFailureType,
    WriteRoomPrivateMessageFailureType,
} from './graphql-codegen/graphql';
