/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
const documents = {
    '\n    fragment CharacterValueForMessage on CharacterValueForMessage {\n        image {\n            path\n            sourceType\n        }\n        isPrivate\n        name\n        portraitImage {\n            path\n            sourceType\n        }\n        stateId\n    }\n':
        types.CharacterValueForMessageFragmentDoc,
    '\n    fragment RoomPublicMessage on RoomPublicMessage {\n        messageId\n        altTextToSecret\n        textColor\n        updatedAt\n        updatedText {\n            currentText\n            updatedAt\n        }\n        channelKey\n        character {\n            ...CharacterValueForMessage\n        }\n        commandResult {\n            isSuccess\n            text\n        }\n        createdAt\n        createdBy\n        customName\n        initText\n        initTextSource\n        isSecret\n    }\n':
        types.RoomPublicMessageFragmentDoc,
    '\n    fragment RoomPrivateMessage on RoomPrivateMessage {\n        messageId\n        visibleTo\n        initText\n        initTextSource\n        updatedText {\n            currentText\n            updatedAt\n        }\n        textColor\n        commandResult {\n            text\n            isSuccess\n        }\n        altTextToSecret\n        isSecret\n        createdBy\n        character {\n            ...CharacterValueForMessage\n        }\n        customName\n        createdAt\n        updatedAt\n        initText\n        initTextSource\n    }\n':
        types.RoomPrivateMessageFragmentDoc,
    '\n    fragment PieceLog on PieceLog {\n        messageId\n        stateId\n        createdAt\n        logType\n        valueJson\n    }\n':
        types.PieceLogFragmentDoc,
    '\n    fragment RoomPrivateMessageUpdate on RoomPrivateMessageUpdate {\n        messageId\n        altTextToSecret\n        commandResult {\n            isSuccess\n            text\n        }\n        initText\n        initTextSource\n        isSecret\n        updatedAt\n        updatedText {\n            currentText\n            updatedAt\n        }\n    }\n':
        types.RoomPrivateMessageUpdateFragmentDoc,
    '\n    fragment RoomPublicMessageUpdate on RoomPublicMessageUpdate {\n        altTextToSecret\n        commandResult {\n            isSuccess\n            text\n        }\n        initText\n        initTextSource\n        isSecret\n        messageId\n        updatedAt\n        updatedText {\n            currentText\n            updatedAt\n        }\n    }\n':
        types.RoomPublicMessageUpdateFragmentDoc,
    '\n    fragment RoomSoundEffect on RoomSoundEffect {\n        createdAt\n        createdBy\n        file {\n            path\n            sourceType\n        }\n        messageId\n        volume\n    }\n':
        types.RoomSoundEffectFragmentDoc,
    '\n    fragment RoomPublicChannel on RoomPublicChannel {\n        key\n        name\n    }\n':
        types.RoomPublicChannelFragmentDoc,
    '\n    fragment RoomPublicChannelUpdate on RoomPublicChannelUpdate {\n        key\n        name\n    }\n':
        types.RoomPublicChannelUpdateFragmentDoc,
    '\n    fragment RoomGetState on RoomGetState {\n        revision\n        createdBy\n        createdAt\n        updatedAt\n        role\n        isBookmarked\n        stateJson\n    }\n':
        types.RoomGetStateFragmentDoc,
    '\n    fragment RoomAsListItem on RoomAsListItem {\n        roomId\n        name\n        createdBy\n        createdAt\n        updatedAt\n        role\n        isBookmarked\n        requiresPlayerPassword\n        requiresSpectatorPassword\n    }\n':
        types.RoomAsListItemFragmentDoc,
    '\n    fragment RoomOperation on RoomOperation {\n        revisionTo\n        operatedBy {\n            userUid\n            clientId\n        }\n        valueJson\n    }\n':
        types.RoomOperationFragmentDoc,
    '\n    subscription RoomEvent($roomId: String!) {\n        result: roomEvent(roomId: $roomId) {\n            isRoomMessagesResetEvent\n            roomOperation {\n                ...RoomOperation\n            }\n            deleteRoomOperation {\n                deletedBy\n            }\n            roomMessageEvent {\n                __typename\n                ... on PieceLog {\n                    ...PieceLog\n                }\n                ... on RoomMessagesReset {\n                    publicMessagesDeleted\n                }\n                ... on RoomPrivateMessage {\n                    ...RoomPrivateMessage\n                }\n                ... on RoomPrivateMessageUpdate {\n                    ...RoomPrivateMessageUpdate\n                }\n                ... on RoomPublicChannel {\n                    ...RoomPublicChannel\n                }\n                ... on RoomPublicChannelUpdate {\n                    ...RoomPublicChannelUpdate\n                }\n                ... on RoomPublicMessage {\n                    ...RoomPublicMessage\n                }\n                ... on RoomPublicMessageUpdate {\n                    ...RoomPublicMessageUpdate\n                }\n                ... on RoomSoundEffect {\n                    ...RoomSoundEffect\n                }\n            }\n            roomConnectionEvent {\n                userUid\n                isConnected\n                updatedAt\n            }\n            writingMessageStatus {\n                userUid\n                status\n            }\n        }\n    }\n':
        types.RoomEventDocument,
    '\n    query GetMessages($roomId: String!) {\n        result: getMessages(roomId: $roomId) {\n            __typename\n            ... on RoomMessages {\n                pieceLogs {\n                    createdAt\n                    logType\n                    messageId\n                    stateId\n                    valueJson\n                }\n                privateMessages {\n                    ...RoomPrivateMessage\n                }\n                publicChannels {\n                    key\n                    name\n                }\n                publicMessages {\n                    ...RoomPublicMessage\n                }\n                soundEffects {\n                    createdAt\n                    createdBy\n                    file {\n                        path\n                        sourceType\n                    }\n                    messageId\n                    volume\n                }\n            }\n            ... on GetRoomMessagesFailureResult {\n                failureType\n            }\n        }\n    }\n':
        types.GetMessagesDocument,
    '\n    mutation WritePublicMessage(\n        $roomId: String!\n        $text: String!\n        $textColor: String\n        $channelKey: String!\n        $characterId: String\n        $customName: String\n        $gameType: String\n    ) {\n        result: writePublicMessage(\n            roomId: $roomId\n            text: $text\n            textColor: $textColor\n            channelKey: $channelKey\n            characterId: $characterId\n            customName: $customName\n            gameType: $gameType\n        ) {\n            __typename\n            ... on RoomPublicMessage {\n                ...RoomPublicMessage\n            }\n            ... on WriteRoomPublicMessageFailureResult {\n                failureType\n            }\n            ... on RoomMessageSyntaxError {\n                errorMessage\n            }\n        }\n    }\n':
        types.WritePublicMessageDocument,
    '\n    mutation WritePrivateMessage(\n        $roomId: String!\n        $visibleTo: [String!]!\n        $text: String!\n        $textColor: String\n        $characterId: String\n        $customName: String\n        $gameType: String\n    ) {\n        result: writePrivateMessage(\n            roomId: $roomId\n            visibleTo: $visibleTo\n            text: $text\n            textColor: $textColor\n            characterId: $characterId\n            customName: $customName\n            gameType: $gameType\n        ) {\n            __typename\n            ... on RoomPrivateMessage {\n                ...RoomPrivateMessage\n            }\n            ... on WriteRoomPrivateMessageFailureResult {\n                failureType\n            }\n            ... on RoomMessageSyntaxError {\n                errorMessage\n            }\n        }\n    }\n':
        types.WritePrivateMessageDocument,
    '\n    mutation operate(\n        $roomId: String!\n        $revisionFrom: Int!\n        $operation: RoomOperationInput!\n        $requestId: String!\n    ) {\n        result: operate(\n            roomId: $roomId\n            prevRevision: $revisionFrom\n            operation: $operation\n            requestId: $requestId\n        ) {\n            __typename\n            ... on OperateRoomSuccessResult {\n                operation {\n                    ...RoomOperation\n                }\n            }\n            ... on OperateRoomIdResult {\n                requestId\n            }\n            ... on OperateRoomFailureResult {\n                failureType\n            }\n            ... on OperateRoomNonJoinedResult {\n                roomAsListItem {\n                    ...RoomAsListItem\n                }\n            }\n        }\n    }\n':
        types.OperateDocument,
    '\n    query GetRoom($roomId: String!) {\n        result: getRoom(roomId: $roomId) {\n            __typename\n            ... on GetJoinedRoomResult {\n                role\n                room {\n                    ...RoomGetState\n                }\n            }\n            ... on GetNonJoinedRoomResult {\n                roomAsListItem {\n                    ...RoomAsListItem\n                }\n            }\n            ... on GetRoomFailureResult {\n                failureType\n            }\n        }\n    }\n':
        types.GetRoomDocument,
    '\n    mutation UpdateWritingMessageStatus(\n        $roomId: String!\n        $newStatus: WritingMessageStatusInputType!\n    ) {\n        result: updateWritingMessageStatus(roomId: $roomId, newStatus: $newStatus)\n    }\n':
        types.UpdateWritingMessageStatusDocument,
    '\n    query GetRoomConnections($roomId: String!) {\n        result: getRoomConnections(roomId: $roomId) {\n            __typename\n            ... on GetRoomConnectionsSuccessResult {\n                fetchedAt\n                connectedUserUids\n            }\n            ... on GetRoomConnectionsFailureResult {\n                failureType\n            }\n        }\n    }\n':
        types.GetRoomConnectionsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment CharacterValueForMessage on CharacterValueForMessage {\n        image {\n            path\n            sourceType\n        }\n        isPrivate\n        name\n        portraitImage {\n            path\n            sourceType\n        }\n        stateId\n    }\n',
): (typeof documents)['\n    fragment CharacterValueForMessage on CharacterValueForMessage {\n        image {\n            path\n            sourceType\n        }\n        isPrivate\n        name\n        portraitImage {\n            path\n            sourceType\n        }\n        stateId\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment RoomPublicMessage on RoomPublicMessage {\n        messageId\n        altTextToSecret\n        textColor\n        updatedAt\n        updatedText {\n            currentText\n            updatedAt\n        }\n        channelKey\n        character {\n            ...CharacterValueForMessage\n        }\n        commandResult {\n            isSuccess\n            text\n        }\n        createdAt\n        createdBy\n        customName\n        initText\n        initTextSource\n        isSecret\n    }\n',
): (typeof documents)['\n    fragment RoomPublicMessage on RoomPublicMessage {\n        messageId\n        altTextToSecret\n        textColor\n        updatedAt\n        updatedText {\n            currentText\n            updatedAt\n        }\n        channelKey\n        character {\n            ...CharacterValueForMessage\n        }\n        commandResult {\n            isSuccess\n            text\n        }\n        createdAt\n        createdBy\n        customName\n        initText\n        initTextSource\n        isSecret\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment RoomPrivateMessage on RoomPrivateMessage {\n        messageId\n        visibleTo\n        initText\n        initTextSource\n        updatedText {\n            currentText\n            updatedAt\n        }\n        textColor\n        commandResult {\n            text\n            isSuccess\n        }\n        altTextToSecret\n        isSecret\n        createdBy\n        character {\n            ...CharacterValueForMessage\n        }\n        customName\n        createdAt\n        updatedAt\n        initText\n        initTextSource\n    }\n',
): (typeof documents)['\n    fragment RoomPrivateMessage on RoomPrivateMessage {\n        messageId\n        visibleTo\n        initText\n        initTextSource\n        updatedText {\n            currentText\n            updatedAt\n        }\n        textColor\n        commandResult {\n            text\n            isSuccess\n        }\n        altTextToSecret\n        isSecret\n        createdBy\n        character {\n            ...CharacterValueForMessage\n        }\n        customName\n        createdAt\n        updatedAt\n        initText\n        initTextSource\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment PieceLog on PieceLog {\n        messageId\n        stateId\n        createdAt\n        logType\n        valueJson\n    }\n',
): (typeof documents)['\n    fragment PieceLog on PieceLog {\n        messageId\n        stateId\n        createdAt\n        logType\n        valueJson\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment RoomPrivateMessageUpdate on RoomPrivateMessageUpdate {\n        messageId\n        altTextToSecret\n        commandResult {\n            isSuccess\n            text\n        }\n        initText\n        initTextSource\n        isSecret\n        updatedAt\n        updatedText {\n            currentText\n            updatedAt\n        }\n    }\n',
): (typeof documents)['\n    fragment RoomPrivateMessageUpdate on RoomPrivateMessageUpdate {\n        messageId\n        altTextToSecret\n        commandResult {\n            isSuccess\n            text\n        }\n        initText\n        initTextSource\n        isSecret\n        updatedAt\n        updatedText {\n            currentText\n            updatedAt\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment RoomPublicMessageUpdate on RoomPublicMessageUpdate {\n        altTextToSecret\n        commandResult {\n            isSuccess\n            text\n        }\n        initText\n        initTextSource\n        isSecret\n        messageId\n        updatedAt\n        updatedText {\n            currentText\n            updatedAt\n        }\n    }\n',
): (typeof documents)['\n    fragment RoomPublicMessageUpdate on RoomPublicMessageUpdate {\n        altTextToSecret\n        commandResult {\n            isSuccess\n            text\n        }\n        initText\n        initTextSource\n        isSecret\n        messageId\n        updatedAt\n        updatedText {\n            currentText\n            updatedAt\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment RoomSoundEffect on RoomSoundEffect {\n        createdAt\n        createdBy\n        file {\n            path\n            sourceType\n        }\n        messageId\n        volume\n    }\n',
): (typeof documents)['\n    fragment RoomSoundEffect on RoomSoundEffect {\n        createdAt\n        createdBy\n        file {\n            path\n            sourceType\n        }\n        messageId\n        volume\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment RoomPublicChannel on RoomPublicChannel {\n        key\n        name\n    }\n',
): (typeof documents)['\n    fragment RoomPublicChannel on RoomPublicChannel {\n        key\n        name\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment RoomPublicChannelUpdate on RoomPublicChannelUpdate {\n        key\n        name\n    }\n',
): (typeof documents)['\n    fragment RoomPublicChannelUpdate on RoomPublicChannelUpdate {\n        key\n        name\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment RoomGetState on RoomGetState {\n        revision\n        createdBy\n        createdAt\n        updatedAt\n        role\n        isBookmarked\n        stateJson\n    }\n',
): (typeof documents)['\n    fragment RoomGetState on RoomGetState {\n        revision\n        createdBy\n        createdAt\n        updatedAt\n        role\n        isBookmarked\n        stateJson\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment RoomAsListItem on RoomAsListItem {\n        roomId\n        name\n        createdBy\n        createdAt\n        updatedAt\n        role\n        isBookmarked\n        requiresPlayerPassword\n        requiresSpectatorPassword\n    }\n',
): (typeof documents)['\n    fragment RoomAsListItem on RoomAsListItem {\n        roomId\n        name\n        createdBy\n        createdAt\n        updatedAt\n        role\n        isBookmarked\n        requiresPlayerPassword\n        requiresSpectatorPassword\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment RoomOperation on RoomOperation {\n        revisionTo\n        operatedBy {\n            userUid\n            clientId\n        }\n        valueJson\n    }\n',
): (typeof documents)['\n    fragment RoomOperation on RoomOperation {\n        revisionTo\n        operatedBy {\n            userUid\n            clientId\n        }\n        valueJson\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    subscription RoomEvent($roomId: String!) {\n        result: roomEvent(roomId: $roomId) {\n            isRoomMessagesResetEvent\n            roomOperation {\n                ...RoomOperation\n            }\n            deleteRoomOperation {\n                deletedBy\n            }\n            roomMessageEvent {\n                __typename\n                ... on PieceLog {\n                    ...PieceLog\n                }\n                ... on RoomMessagesReset {\n                    publicMessagesDeleted\n                }\n                ... on RoomPrivateMessage {\n                    ...RoomPrivateMessage\n                }\n                ... on RoomPrivateMessageUpdate {\n                    ...RoomPrivateMessageUpdate\n                }\n                ... on RoomPublicChannel {\n                    ...RoomPublicChannel\n                }\n                ... on RoomPublicChannelUpdate {\n                    ...RoomPublicChannelUpdate\n                }\n                ... on RoomPublicMessage {\n                    ...RoomPublicMessage\n                }\n                ... on RoomPublicMessageUpdate {\n                    ...RoomPublicMessageUpdate\n                }\n                ... on RoomSoundEffect {\n                    ...RoomSoundEffect\n                }\n            }\n            roomConnectionEvent {\n                userUid\n                isConnected\n                updatedAt\n            }\n            writingMessageStatus {\n                userUid\n                status\n            }\n        }\n    }\n',
): (typeof documents)['\n    subscription RoomEvent($roomId: String!) {\n        result: roomEvent(roomId: $roomId) {\n            isRoomMessagesResetEvent\n            roomOperation {\n                ...RoomOperation\n            }\n            deleteRoomOperation {\n                deletedBy\n            }\n            roomMessageEvent {\n                __typename\n                ... on PieceLog {\n                    ...PieceLog\n                }\n                ... on RoomMessagesReset {\n                    publicMessagesDeleted\n                }\n                ... on RoomPrivateMessage {\n                    ...RoomPrivateMessage\n                }\n                ... on RoomPrivateMessageUpdate {\n                    ...RoomPrivateMessageUpdate\n                }\n                ... on RoomPublicChannel {\n                    ...RoomPublicChannel\n                }\n                ... on RoomPublicChannelUpdate {\n                    ...RoomPublicChannelUpdate\n                }\n                ... on RoomPublicMessage {\n                    ...RoomPublicMessage\n                }\n                ... on RoomPublicMessageUpdate {\n                    ...RoomPublicMessageUpdate\n                }\n                ... on RoomSoundEffect {\n                    ...RoomSoundEffect\n                }\n            }\n            roomConnectionEvent {\n                userUid\n                isConnected\n                updatedAt\n            }\n            writingMessageStatus {\n                userUid\n                status\n            }\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query GetMessages($roomId: String!) {\n        result: getMessages(roomId: $roomId) {\n            __typename\n            ... on RoomMessages {\n                pieceLogs {\n                    createdAt\n                    logType\n                    messageId\n                    stateId\n                    valueJson\n                }\n                privateMessages {\n                    ...RoomPrivateMessage\n                }\n                publicChannels {\n                    key\n                    name\n                }\n                publicMessages {\n                    ...RoomPublicMessage\n                }\n                soundEffects {\n                    createdAt\n                    createdBy\n                    file {\n                        path\n                        sourceType\n                    }\n                    messageId\n                    volume\n                }\n            }\n            ... on GetRoomMessagesFailureResult {\n                failureType\n            }\n        }\n    }\n',
): (typeof documents)['\n    query GetMessages($roomId: String!) {\n        result: getMessages(roomId: $roomId) {\n            __typename\n            ... on RoomMessages {\n                pieceLogs {\n                    createdAt\n                    logType\n                    messageId\n                    stateId\n                    valueJson\n                }\n                privateMessages {\n                    ...RoomPrivateMessage\n                }\n                publicChannels {\n                    key\n                    name\n                }\n                publicMessages {\n                    ...RoomPublicMessage\n                }\n                soundEffects {\n                    createdAt\n                    createdBy\n                    file {\n                        path\n                        sourceType\n                    }\n                    messageId\n                    volume\n                }\n            }\n            ... on GetRoomMessagesFailureResult {\n                failureType\n            }\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation WritePublicMessage(\n        $roomId: String!\n        $text: String!\n        $textColor: String\n        $channelKey: String!\n        $characterId: String\n        $customName: String\n        $gameType: String\n    ) {\n        result: writePublicMessage(\n            roomId: $roomId\n            text: $text\n            textColor: $textColor\n            channelKey: $channelKey\n            characterId: $characterId\n            customName: $customName\n            gameType: $gameType\n        ) {\n            __typename\n            ... on RoomPublicMessage {\n                ...RoomPublicMessage\n            }\n            ... on WriteRoomPublicMessageFailureResult {\n                failureType\n            }\n            ... on RoomMessageSyntaxError {\n                errorMessage\n            }\n        }\n    }\n',
): (typeof documents)['\n    mutation WritePublicMessage(\n        $roomId: String!\n        $text: String!\n        $textColor: String\n        $channelKey: String!\n        $characterId: String\n        $customName: String\n        $gameType: String\n    ) {\n        result: writePublicMessage(\n            roomId: $roomId\n            text: $text\n            textColor: $textColor\n            channelKey: $channelKey\n            characterId: $characterId\n            customName: $customName\n            gameType: $gameType\n        ) {\n            __typename\n            ... on RoomPublicMessage {\n                ...RoomPublicMessage\n            }\n            ... on WriteRoomPublicMessageFailureResult {\n                failureType\n            }\n            ... on RoomMessageSyntaxError {\n                errorMessage\n            }\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation WritePrivateMessage(\n        $roomId: String!\n        $visibleTo: [String!]!\n        $text: String!\n        $textColor: String\n        $characterId: String\n        $customName: String\n        $gameType: String\n    ) {\n        result: writePrivateMessage(\n            roomId: $roomId\n            visibleTo: $visibleTo\n            text: $text\n            textColor: $textColor\n            characterId: $characterId\n            customName: $customName\n            gameType: $gameType\n        ) {\n            __typename\n            ... on RoomPrivateMessage {\n                ...RoomPrivateMessage\n            }\n            ... on WriteRoomPrivateMessageFailureResult {\n                failureType\n            }\n            ... on RoomMessageSyntaxError {\n                errorMessage\n            }\n        }\n    }\n',
): (typeof documents)['\n    mutation WritePrivateMessage(\n        $roomId: String!\n        $visibleTo: [String!]!\n        $text: String!\n        $textColor: String\n        $characterId: String\n        $customName: String\n        $gameType: String\n    ) {\n        result: writePrivateMessage(\n            roomId: $roomId\n            visibleTo: $visibleTo\n            text: $text\n            textColor: $textColor\n            characterId: $characterId\n            customName: $customName\n            gameType: $gameType\n        ) {\n            __typename\n            ... on RoomPrivateMessage {\n                ...RoomPrivateMessage\n            }\n            ... on WriteRoomPrivateMessageFailureResult {\n                failureType\n            }\n            ... on RoomMessageSyntaxError {\n                errorMessage\n            }\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation operate(\n        $roomId: String!\n        $revisionFrom: Int!\n        $operation: RoomOperationInput!\n        $requestId: String!\n    ) {\n        result: operate(\n            roomId: $roomId\n            prevRevision: $revisionFrom\n            operation: $operation\n            requestId: $requestId\n        ) {\n            __typename\n            ... on OperateRoomSuccessResult {\n                operation {\n                    ...RoomOperation\n                }\n            }\n            ... on OperateRoomIdResult {\n                requestId\n            }\n            ... on OperateRoomFailureResult {\n                failureType\n            }\n            ... on OperateRoomNonJoinedResult {\n                roomAsListItem {\n                    ...RoomAsListItem\n                }\n            }\n        }\n    }\n',
): (typeof documents)['\n    mutation operate(\n        $roomId: String!\n        $revisionFrom: Int!\n        $operation: RoomOperationInput!\n        $requestId: String!\n    ) {\n        result: operate(\n            roomId: $roomId\n            prevRevision: $revisionFrom\n            operation: $operation\n            requestId: $requestId\n        ) {\n            __typename\n            ... on OperateRoomSuccessResult {\n                operation {\n                    ...RoomOperation\n                }\n            }\n            ... on OperateRoomIdResult {\n                requestId\n            }\n            ... on OperateRoomFailureResult {\n                failureType\n            }\n            ... on OperateRoomNonJoinedResult {\n                roomAsListItem {\n                    ...RoomAsListItem\n                }\n            }\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query GetRoom($roomId: String!) {\n        result: getRoom(roomId: $roomId) {\n            __typename\n            ... on GetJoinedRoomResult {\n                role\n                room {\n                    ...RoomGetState\n                }\n            }\n            ... on GetNonJoinedRoomResult {\n                roomAsListItem {\n                    ...RoomAsListItem\n                }\n            }\n            ... on GetRoomFailureResult {\n                failureType\n            }\n        }\n    }\n',
): (typeof documents)['\n    query GetRoom($roomId: String!) {\n        result: getRoom(roomId: $roomId) {\n            __typename\n            ... on GetJoinedRoomResult {\n                role\n                room {\n                    ...RoomGetState\n                }\n            }\n            ... on GetNonJoinedRoomResult {\n                roomAsListItem {\n                    ...RoomAsListItem\n                }\n            }\n            ... on GetRoomFailureResult {\n                failureType\n            }\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation UpdateWritingMessageStatus(\n        $roomId: String!\n        $newStatus: WritingMessageStatusInputType!\n    ) {\n        result: updateWritingMessageStatus(roomId: $roomId, newStatus: $newStatus)\n    }\n',
): (typeof documents)['\n    mutation UpdateWritingMessageStatus(\n        $roomId: String!\n        $newStatus: WritingMessageStatusInputType!\n    ) {\n        result: updateWritingMessageStatus(roomId: $roomId, newStatus: $newStatus)\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query GetRoomConnections($roomId: String!) {\n        result: getRoomConnections(roomId: $roomId) {\n            __typename\n            ... on GetRoomConnectionsSuccessResult {\n                fetchedAt\n                connectedUserUids\n            }\n            ... on GetRoomConnectionsFailureResult {\n                failureType\n            }\n        }\n    }\n',
): (typeof documents)['\n    query GetRoomConnections($roomId: String!) {\n        result: getRoomConnections(roomId: $roomId) {\n            __typename\n            ... on GetRoomConnectionsSuccessResult {\n                fetchedAt\n                connectedUserUids\n            }\n            ... on GetRoomConnectionsFailureResult {\n                failureType\n            }\n        }\n    }\n'];

export function graphql(source: string) {
    return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
    TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
