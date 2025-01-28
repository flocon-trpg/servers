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
    '\n    mutation AnswerRollCall($roomId: String!, $rollCallId: String!, $answer: Boolean!) {\n        result: answerRollCall(roomId: $roomId, rollCallId: $rollCallId, answer: $answer) {\n            failureType\n        }\n    }\n':
        types.AnswerRollCallDocument,
    '\n    mutation ChangeParticipantName($roomId: String!, $newName: String!) {\n        result: changeParticipantName(roomId: $roomId, newName: $newName) {\n            failureType\n        }\n    }\n':
        types.ChangeParticipantNameDocument,
    '\n    mutation CloseRollCall($roomId: String!, $rollCallId: String!) {\n        result: closeRollCall(roomId: $roomId, rollCallId: $rollCallId) {\n            failureType\n        }\n    }\n':
        types.CloseRollCallDocument,
    '\n    mutation CreateRoom($input: CreateRoomInput!) {\n        result: createRoom(input: $input) {\n            __typename\n            ... on CreateRoomSuccessResult {\n                roomId\n                room {\n                    createdAt\n                    createdBy\n                    isBookmarked\n                    revision\n                    role\n                    stateJson\n                    updatedAt\n                }\n            }\n            ... on CreateRoomFailureResult {\n                failureType\n            }\n        }\n    }\n':
        types.CreateRoomDocument,
    '\n    mutation DeleteFiles($filenames: [String!]!) {\n        result: deleteFiles(filenames: $filenames)\n    }\n':
        types.DeleteFilesDocument,
    '\n    mutation DeleteMessage($roomId: String!, $messageId: String!) {\n        result: deleteMessage(roomId: $roomId, messageId: $messageId) {\n            failureType\n        }\n    }\n':
        types.DeleteMessageDocument,
    '\n    mutation DeleteRoomAsAdmin($roomId: String!) {\n        result: deleteRoomAsAdmin(roomId: $roomId) {\n            failureType\n        }\n    }\n':
        types.DeleteRoomAsAdminDocument,
    '\n    mutation DeleteRoom($roomId: String!) {\n        result: deleteRoom(roomId: $roomId) {\n            failureType\n        }\n    }\n':
        types.DeleteRoomDocument,
    '\n    mutation EditMessage($roomId: String!, $messageId: String!, $text: String!) {\n        result: editMessage(roomId: $roomId, messageId: $messageId, text: $text) {\n            failureType\n        }\n    }\n':
        types.EditMessageDocument,
    '\n    mutation EntryToServer($password: String) {\n        result: entryToServer(password: $password) {\n            type\n        }\n    }\n':
        types.EntryToServerDocument,
    '\n    fragment FilePath on FilePath {\n        sourceType\n        path\n    }\n':
        types.FilePathFragmentDoc,
    '\n    query GetAvailableGameSystems {\n        result: getAvailableGameSystems {\n            value {\n                id\n                name\n                sortKey\n            }\n        }\n    }\n':
        types.GetAvailableGameSystemsDocument,
    '\n    query GetDiceHelpMessages($gameSystemId: String!) {\n        result: getDiceHelpMessage(gameSystemId: $gameSystemId)\n    }\n':
        types.GetDiceHelpMessagesDocument,
    '\n    query GetFiles($input: GetFilesInput!) {\n        result: getFiles(input: $input) {\n            files {\n                createdAt\n                createdBy\n                filename\n                listType\n                screenname\n                thumbFilename\n            }\n        }\n    }\n':
        types.GetFilesDocument,
    '\n    query GetLog($roomId: String!) {\n        result: getLog(roomId: $roomId) {\n            __typename\n            ... on RoomMessages {\n                publicMessages {\n                    altTextToSecret\n                    messageId\n                    textColor\n                    updatedAt\n                    isSecret\n                    updatedText {\n                        currentText\n                        updatedAt\n                    }\n                    channelKey\n                    character {\n                        image {\n                            path\n                            sourceType\n                        }\n                        image {\n                            path\n                            sourceType\n                        }\n                        isPrivate\n                        name\n                        portraitImage {\n                            path\n                            sourceType\n                        }\n                        stateId\n                    }\n                    commandResult {\n                        text\n                        isSuccess\n                    }\n                    createdAt\n                    createdBy\n                    customName\n                }\n                privateMessages {\n                    messageId\n                    visibleTo\n                    initText\n                    initTextSource\n                    updatedText {\n                        currentText\n                        updatedAt\n                    }\n                    textColor\n                    commandResult {\n                        text\n                        isSuccess\n                    }\n                    altTextToSecret\n                    isSecret\n                    createdBy\n                    character {\n                        image {\n                            path\n                            sourceType\n                        }\n                        image {\n                            path\n                            sourceType\n                        }\n                        isPrivate\n                        name\n                        portraitImage {\n                            path\n                            sourceType\n                        }\n                        stateId\n                    }\n                    customName\n                    createdAt\n                    updatedAt\n                }\n                pieceLogs {\n                    messageId\n                    stateId\n                    createdAt\n                    logType\n                    valueJson\n                }\n                publicChannels {\n                    key\n                    name\n                }\n                soundEffects {\n                    createdAt\n                    createdBy\n                    file {\n                        path\n                        sourceType\n                    }\n                    messageId\n                    volume\n                }\n            }\n            ... on GetRoomLogFailureResult {\n                failureType\n            }\n        }\n    }\n':
        types.GetLogDocument,
    '\n    query GetMyRoles {\n        result: getMyRoles {\n            admin\n        }\n    }\n':
        types.GetMyRolesDocument,
    '\n    query GetRoomAsListItem($roomId: String!) {\n        result: getRoomAsListItem(roomId: $roomId) {\n            __typename\n            ... on GetRoomAsListItemSuccessResult {\n                room {\n                    roomId\n                    name\n                    createdBy\n                    createdAt\n                    updatedAt\n                    role\n                    isBookmarked\n                    requiresPlayerPassword\n                    requiresSpectatorPassword\n                }\n            }\n            ... on GetRoomAsListItemFailureResult {\n                failureType\n            }\n        }\n    }\n':
        types.GetRoomAsListItemDocument,
    '\n    query GetRoomsList {\n        result: getRoomsList {\n            __typename\n            ... on GetRoomsListSuccessResult {\n                rooms {\n                    roomId\n                    name\n                    createdBy\n                    createdAt\n                    updatedAt\n                    role\n                    isBookmarked\n                    requiresPlayerPassword\n                    requiresSpectatorPassword\n                }\n            }\n            ... on GetRoomsListFailureResult {\n                failureType\n            }\n        }\n    }\n':
        types.GetRoomsListDocument,
    '\n    query GetServerInfo {\n        result: getServerInfo {\n            version {\n                major\n                minor\n                patch\n                prerelease {\n                    type\n                    version\n                }\n            }\n            uploaderEnabled\n        }\n    }\n':
        types.GetServerInfoDocument,
    '\n    fragment JoinRoomResult on JoinRoomResult {\n        __typename\n        ... on JoinRoomSuccessResult {\n            operation {\n                revisionTo\n                operatedBy {\n                    userUid\n                    clientId\n                }\n                valueJson\n            }\n        }\n        ... on JoinRoomFailureResult {\n            failureType\n        }\n    }\n':
        types.JoinRoomResultFragmentDoc,
    '\n    mutation JoinRoomAsPlayer($roomId: String!, $name: String!, $password: String) {\n        result: joinRoomAsPlayer(roomId: $roomId, name: $name, password: $password) {\n            ...JoinRoomResult\n        }\n    }\n':
        types.JoinRoomAsPlayerDocument,
    '\n    mutation JoinRoomAsSpectator($roomId: String!, $name: String!, $password: String) {\n        result: joinRoomAsSpectator(roomId: $roomId, name: $name, password: $password) {\n            ...JoinRoomResult\n        }\n    }\n':
        types.JoinRoomAsSpectatorDocument,
    '\n    mutation LeaveRoom($roomId: String!) {\n        result: leaveRoom(roomId: $roomId) {\n            failureType\n        }\n    }\n':
        types.LeaveRoomDocument,
    '\n    mutation MakeMessageNotSecret($roomId: String!, $messageId: String!) {\n        result: makeMessageNotSecret(roomId: $roomId, messageId: $messageId) {\n            failureType\n        }\n    }\n':
        types.MakeMessageNotSecretDocument,
    '\n    mutation PerformRollCall($input: PerformRollCallInput!) {\n        result: performRollCall(input: $input) {\n            failureType\n        }\n    }\n':
        types.PerformRollCallDocument,
    '\n    mutation PromoteToPlayer($roomId: String!, $password: String) {\n        result: promoteToPlayer(roomId: $roomId, password: $password) {\n            failureType\n        }\n    }\n':
        types.PromoteToPlayerDocument,
    '\n    mutation RenameFiles($input: [RenameFileInput!]!) {\n        result: renameFiles(input: $input)\n    }\n':
        types.RenameFilesDocument,
    '\n    mutation ResetMessages($roomId: String!) {\n        result: resetMessages(roomId: $roomId) {\n            failureType\n        }\n    }\n':
        types.ResetMessagesDocument,
    '\n    mutation UpdateBookmark($roomId: String!, $newValue: Boolean!) {\n        result: updateBookmark(roomId: $roomId, newValue: $newValue) {\n            __typename\n            ... on UpdateBookmarkSuccessResult {\n                prevValue\n                currentValue\n            }\n            ... on UpdateBookmarkFailureResult {\n                failureType\n            }\n        }\n    }\n':
        types.UpdateBookmarkDocument,
    '\n    mutation WriteRoomSoundEffect($roomId: String!, $file: FilePathInput!, $volume: Float!) {\n        result: writeRoomSoundEffect(roomId: $roomId, file: $file, volume: $volume) {\n            __typename\n            ... on RoomSoundEffect {\n                createdAt\n                createdBy\n                file {\n                    path\n                    sourceType\n                }\n                messageId\n                volume\n            }\n            ... on WriteRoomSoundEffectFailureResult {\n                failureType\n            }\n        }\n    }\n':
        types.WriteRoomSoundEffectDocument,
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
    source: '\n    mutation AnswerRollCall($roomId: String!, $rollCallId: String!, $answer: Boolean!) {\n        result: answerRollCall(roomId: $roomId, rollCallId: $rollCallId, answer: $answer) {\n            failureType\n        }\n    }\n',
): (typeof documents)['\n    mutation AnswerRollCall($roomId: String!, $rollCallId: String!, $answer: Boolean!) {\n        result: answerRollCall(roomId: $roomId, rollCallId: $rollCallId, answer: $answer) {\n            failureType\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation ChangeParticipantName($roomId: String!, $newName: String!) {\n        result: changeParticipantName(roomId: $roomId, newName: $newName) {\n            failureType\n        }\n    }\n',
): (typeof documents)['\n    mutation ChangeParticipantName($roomId: String!, $newName: String!) {\n        result: changeParticipantName(roomId: $roomId, newName: $newName) {\n            failureType\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation CloseRollCall($roomId: String!, $rollCallId: String!) {\n        result: closeRollCall(roomId: $roomId, rollCallId: $rollCallId) {\n            failureType\n        }\n    }\n',
): (typeof documents)['\n    mutation CloseRollCall($roomId: String!, $rollCallId: String!) {\n        result: closeRollCall(roomId: $roomId, rollCallId: $rollCallId) {\n            failureType\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation CreateRoom($input: CreateRoomInput!) {\n        result: createRoom(input: $input) {\n            __typename\n            ... on CreateRoomSuccessResult {\n                roomId\n                room {\n                    createdAt\n                    createdBy\n                    isBookmarked\n                    revision\n                    role\n                    stateJson\n                    updatedAt\n                }\n            }\n            ... on CreateRoomFailureResult {\n                failureType\n            }\n        }\n    }\n',
): (typeof documents)['\n    mutation CreateRoom($input: CreateRoomInput!) {\n        result: createRoom(input: $input) {\n            __typename\n            ... on CreateRoomSuccessResult {\n                roomId\n                room {\n                    createdAt\n                    createdBy\n                    isBookmarked\n                    revision\n                    role\n                    stateJson\n                    updatedAt\n                }\n            }\n            ... on CreateRoomFailureResult {\n                failureType\n            }\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation DeleteFiles($filenames: [String!]!) {\n        result: deleteFiles(filenames: $filenames)\n    }\n',
): (typeof documents)['\n    mutation DeleteFiles($filenames: [String!]!) {\n        result: deleteFiles(filenames: $filenames)\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation DeleteMessage($roomId: String!, $messageId: String!) {\n        result: deleteMessage(roomId: $roomId, messageId: $messageId) {\n            failureType\n        }\n    }\n',
): (typeof documents)['\n    mutation DeleteMessage($roomId: String!, $messageId: String!) {\n        result: deleteMessage(roomId: $roomId, messageId: $messageId) {\n            failureType\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation DeleteRoomAsAdmin($roomId: String!) {\n        result: deleteRoomAsAdmin(roomId: $roomId) {\n            failureType\n        }\n    }\n',
): (typeof documents)['\n    mutation DeleteRoomAsAdmin($roomId: String!) {\n        result: deleteRoomAsAdmin(roomId: $roomId) {\n            failureType\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation DeleteRoom($roomId: String!) {\n        result: deleteRoom(roomId: $roomId) {\n            failureType\n        }\n    }\n',
): (typeof documents)['\n    mutation DeleteRoom($roomId: String!) {\n        result: deleteRoom(roomId: $roomId) {\n            failureType\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation EditMessage($roomId: String!, $messageId: String!, $text: String!) {\n        result: editMessage(roomId: $roomId, messageId: $messageId, text: $text) {\n            failureType\n        }\n    }\n',
): (typeof documents)['\n    mutation EditMessage($roomId: String!, $messageId: String!, $text: String!) {\n        result: editMessage(roomId: $roomId, messageId: $messageId, text: $text) {\n            failureType\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation EntryToServer($password: String) {\n        result: entryToServer(password: $password) {\n            type\n        }\n    }\n',
): (typeof documents)['\n    mutation EntryToServer($password: String) {\n        result: entryToServer(password: $password) {\n            type\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment FilePath on FilePath {\n        sourceType\n        path\n    }\n',
): (typeof documents)['\n    fragment FilePath on FilePath {\n        sourceType\n        path\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query GetAvailableGameSystems {\n        result: getAvailableGameSystems {\n            value {\n                id\n                name\n                sortKey\n            }\n        }\n    }\n',
): (typeof documents)['\n    query GetAvailableGameSystems {\n        result: getAvailableGameSystems {\n            value {\n                id\n                name\n                sortKey\n            }\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query GetDiceHelpMessages($gameSystemId: String!) {\n        result: getDiceHelpMessage(gameSystemId: $gameSystemId)\n    }\n',
): (typeof documents)['\n    query GetDiceHelpMessages($gameSystemId: String!) {\n        result: getDiceHelpMessage(gameSystemId: $gameSystemId)\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query GetFiles($input: GetFilesInput!) {\n        result: getFiles(input: $input) {\n            files {\n                createdAt\n                createdBy\n                filename\n                listType\n                screenname\n                thumbFilename\n            }\n        }\n    }\n',
): (typeof documents)['\n    query GetFiles($input: GetFilesInput!) {\n        result: getFiles(input: $input) {\n            files {\n                createdAt\n                createdBy\n                filename\n                listType\n                screenname\n                thumbFilename\n            }\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query GetLog($roomId: String!) {\n        result: getLog(roomId: $roomId) {\n            __typename\n            ... on RoomMessages {\n                publicMessages {\n                    altTextToSecret\n                    messageId\n                    textColor\n                    updatedAt\n                    isSecret\n                    updatedText {\n                        currentText\n                        updatedAt\n                    }\n                    channelKey\n                    character {\n                        image {\n                            path\n                            sourceType\n                        }\n                        image {\n                            path\n                            sourceType\n                        }\n                        isPrivate\n                        name\n                        portraitImage {\n                            path\n                            sourceType\n                        }\n                        stateId\n                    }\n                    commandResult {\n                        text\n                        isSuccess\n                    }\n                    createdAt\n                    createdBy\n                    customName\n                }\n                privateMessages {\n                    messageId\n                    visibleTo\n                    initText\n                    initTextSource\n                    updatedText {\n                        currentText\n                        updatedAt\n                    }\n                    textColor\n                    commandResult {\n                        text\n                        isSuccess\n                    }\n                    altTextToSecret\n                    isSecret\n                    createdBy\n                    character {\n                        image {\n                            path\n                            sourceType\n                        }\n                        image {\n                            path\n                            sourceType\n                        }\n                        isPrivate\n                        name\n                        portraitImage {\n                            path\n                            sourceType\n                        }\n                        stateId\n                    }\n                    customName\n                    createdAt\n                    updatedAt\n                }\n                pieceLogs {\n                    messageId\n                    stateId\n                    createdAt\n                    logType\n                    valueJson\n                }\n                publicChannels {\n                    key\n                    name\n                }\n                soundEffects {\n                    createdAt\n                    createdBy\n                    file {\n                        path\n                        sourceType\n                    }\n                    messageId\n                    volume\n                }\n            }\n            ... on GetRoomLogFailureResult {\n                failureType\n            }\n        }\n    }\n',
): (typeof documents)['\n    query GetLog($roomId: String!) {\n        result: getLog(roomId: $roomId) {\n            __typename\n            ... on RoomMessages {\n                publicMessages {\n                    altTextToSecret\n                    messageId\n                    textColor\n                    updatedAt\n                    isSecret\n                    updatedText {\n                        currentText\n                        updatedAt\n                    }\n                    channelKey\n                    character {\n                        image {\n                            path\n                            sourceType\n                        }\n                        image {\n                            path\n                            sourceType\n                        }\n                        isPrivate\n                        name\n                        portraitImage {\n                            path\n                            sourceType\n                        }\n                        stateId\n                    }\n                    commandResult {\n                        text\n                        isSuccess\n                    }\n                    createdAt\n                    createdBy\n                    customName\n                }\n                privateMessages {\n                    messageId\n                    visibleTo\n                    initText\n                    initTextSource\n                    updatedText {\n                        currentText\n                        updatedAt\n                    }\n                    textColor\n                    commandResult {\n                        text\n                        isSuccess\n                    }\n                    altTextToSecret\n                    isSecret\n                    createdBy\n                    character {\n                        image {\n                            path\n                            sourceType\n                        }\n                        image {\n                            path\n                            sourceType\n                        }\n                        isPrivate\n                        name\n                        portraitImage {\n                            path\n                            sourceType\n                        }\n                        stateId\n                    }\n                    customName\n                    createdAt\n                    updatedAt\n                }\n                pieceLogs {\n                    messageId\n                    stateId\n                    createdAt\n                    logType\n                    valueJson\n                }\n                publicChannels {\n                    key\n                    name\n                }\n                soundEffects {\n                    createdAt\n                    createdBy\n                    file {\n                        path\n                        sourceType\n                    }\n                    messageId\n                    volume\n                }\n            }\n            ... on GetRoomLogFailureResult {\n                failureType\n            }\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query GetMyRoles {\n        result: getMyRoles {\n            admin\n        }\n    }\n',
): (typeof documents)['\n    query GetMyRoles {\n        result: getMyRoles {\n            admin\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query GetRoomAsListItem($roomId: String!) {\n        result: getRoomAsListItem(roomId: $roomId) {\n            __typename\n            ... on GetRoomAsListItemSuccessResult {\n                room {\n                    roomId\n                    name\n                    createdBy\n                    createdAt\n                    updatedAt\n                    role\n                    isBookmarked\n                    requiresPlayerPassword\n                    requiresSpectatorPassword\n                }\n            }\n            ... on GetRoomAsListItemFailureResult {\n                failureType\n            }\n        }\n    }\n',
): (typeof documents)['\n    query GetRoomAsListItem($roomId: String!) {\n        result: getRoomAsListItem(roomId: $roomId) {\n            __typename\n            ... on GetRoomAsListItemSuccessResult {\n                room {\n                    roomId\n                    name\n                    createdBy\n                    createdAt\n                    updatedAt\n                    role\n                    isBookmarked\n                    requiresPlayerPassword\n                    requiresSpectatorPassword\n                }\n            }\n            ... on GetRoomAsListItemFailureResult {\n                failureType\n            }\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query GetRoomsList {\n        result: getRoomsList {\n            __typename\n            ... on GetRoomsListSuccessResult {\n                rooms {\n                    roomId\n                    name\n                    createdBy\n                    createdAt\n                    updatedAt\n                    role\n                    isBookmarked\n                    requiresPlayerPassword\n                    requiresSpectatorPassword\n                }\n            }\n            ... on GetRoomsListFailureResult {\n                failureType\n            }\n        }\n    }\n',
): (typeof documents)['\n    query GetRoomsList {\n        result: getRoomsList {\n            __typename\n            ... on GetRoomsListSuccessResult {\n                rooms {\n                    roomId\n                    name\n                    createdBy\n                    createdAt\n                    updatedAt\n                    role\n                    isBookmarked\n                    requiresPlayerPassword\n                    requiresSpectatorPassword\n                }\n            }\n            ... on GetRoomsListFailureResult {\n                failureType\n            }\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query GetServerInfo {\n        result: getServerInfo {\n            version {\n                major\n                minor\n                patch\n                prerelease {\n                    type\n                    version\n                }\n            }\n            uploaderEnabled\n        }\n    }\n',
): (typeof documents)['\n    query GetServerInfo {\n        result: getServerInfo {\n            version {\n                major\n                minor\n                patch\n                prerelease {\n                    type\n                    version\n                }\n            }\n            uploaderEnabled\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment JoinRoomResult on JoinRoomResult {\n        __typename\n        ... on JoinRoomSuccessResult {\n            operation {\n                revisionTo\n                operatedBy {\n                    userUid\n                    clientId\n                }\n                valueJson\n            }\n        }\n        ... on JoinRoomFailureResult {\n            failureType\n        }\n    }\n',
): (typeof documents)['\n    fragment JoinRoomResult on JoinRoomResult {\n        __typename\n        ... on JoinRoomSuccessResult {\n            operation {\n                revisionTo\n                operatedBy {\n                    userUid\n                    clientId\n                }\n                valueJson\n            }\n        }\n        ... on JoinRoomFailureResult {\n            failureType\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation JoinRoomAsPlayer($roomId: String!, $name: String!, $password: String) {\n        result: joinRoomAsPlayer(roomId: $roomId, name: $name, password: $password) {\n            ...JoinRoomResult\n        }\n    }\n',
): (typeof documents)['\n    mutation JoinRoomAsPlayer($roomId: String!, $name: String!, $password: String) {\n        result: joinRoomAsPlayer(roomId: $roomId, name: $name, password: $password) {\n            ...JoinRoomResult\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation JoinRoomAsSpectator($roomId: String!, $name: String!, $password: String) {\n        result: joinRoomAsSpectator(roomId: $roomId, name: $name, password: $password) {\n            ...JoinRoomResult\n        }\n    }\n',
): (typeof documents)['\n    mutation JoinRoomAsSpectator($roomId: String!, $name: String!, $password: String) {\n        result: joinRoomAsSpectator(roomId: $roomId, name: $name, password: $password) {\n            ...JoinRoomResult\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation LeaveRoom($roomId: String!) {\n        result: leaveRoom(roomId: $roomId) {\n            failureType\n        }\n    }\n',
): (typeof documents)['\n    mutation LeaveRoom($roomId: String!) {\n        result: leaveRoom(roomId: $roomId) {\n            failureType\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation MakeMessageNotSecret($roomId: String!, $messageId: String!) {\n        result: makeMessageNotSecret(roomId: $roomId, messageId: $messageId) {\n            failureType\n        }\n    }\n',
): (typeof documents)['\n    mutation MakeMessageNotSecret($roomId: String!, $messageId: String!) {\n        result: makeMessageNotSecret(roomId: $roomId, messageId: $messageId) {\n            failureType\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation PerformRollCall($input: PerformRollCallInput!) {\n        result: performRollCall(input: $input) {\n            failureType\n        }\n    }\n',
): (typeof documents)['\n    mutation PerformRollCall($input: PerformRollCallInput!) {\n        result: performRollCall(input: $input) {\n            failureType\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation PromoteToPlayer($roomId: String!, $password: String) {\n        result: promoteToPlayer(roomId: $roomId, password: $password) {\n            failureType\n        }\n    }\n',
): (typeof documents)['\n    mutation PromoteToPlayer($roomId: String!, $password: String) {\n        result: promoteToPlayer(roomId: $roomId, password: $password) {\n            failureType\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation RenameFiles($input: [RenameFileInput!]!) {\n        result: renameFiles(input: $input)\n    }\n',
): (typeof documents)['\n    mutation RenameFiles($input: [RenameFileInput!]!) {\n        result: renameFiles(input: $input)\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation ResetMessages($roomId: String!) {\n        result: resetMessages(roomId: $roomId) {\n            failureType\n        }\n    }\n',
): (typeof documents)['\n    mutation ResetMessages($roomId: String!) {\n        result: resetMessages(roomId: $roomId) {\n            failureType\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation UpdateBookmark($roomId: String!, $newValue: Boolean!) {\n        result: updateBookmark(roomId: $roomId, newValue: $newValue) {\n            __typename\n            ... on UpdateBookmarkSuccessResult {\n                prevValue\n                currentValue\n            }\n            ... on UpdateBookmarkFailureResult {\n                failureType\n            }\n        }\n    }\n',
): (typeof documents)['\n    mutation UpdateBookmark($roomId: String!, $newValue: Boolean!) {\n        result: updateBookmark(roomId: $roomId, newValue: $newValue) {\n            __typename\n            ... on UpdateBookmarkSuccessResult {\n                prevValue\n                currentValue\n            }\n            ... on UpdateBookmarkFailureResult {\n                failureType\n            }\n        }\n    }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation WriteRoomSoundEffect($roomId: String!, $file: FilePathInput!, $volume: Float!) {\n        result: writeRoomSoundEffect(roomId: $roomId, file: $file, volume: $volume) {\n            __typename\n            ... on RoomSoundEffect {\n                createdAt\n                createdBy\n                file {\n                    path\n                    sourceType\n                }\n                messageId\n                volume\n            }\n            ... on WriteRoomSoundEffectFailureResult {\n                failureType\n            }\n        }\n    }\n',
): (typeof documents)['\n    mutation WriteRoomSoundEffect($roomId: String!, $file: FilePathInput!, $volume: Float!) {\n        result: writeRoomSoundEffect(roomId: $roomId, file: $file, volume: $volume) {\n            __typename\n            ... on RoomSoundEffect {\n                createdAt\n                createdBy\n                file {\n                    path\n                    sourceType\n                }\n                messageId\n                volume\n            }\n            ... on WriteRoomSoundEffectFailureResult {\n                failureType\n            }\n        }\n    }\n'];

export function graphql(source: string) {
    return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
    TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
