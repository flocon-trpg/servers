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
    '\n        mutation CreateFileTag($tagName: String!) {\n            result: createFileTag(tagName: $tagName) {\n                id\n                name\n            }\n        }\n    ':
        types.CreateFileTagDocument,
    '\n        mutation DeleteFiles($filenames: [String!]!) {\n            result: deleteFiles(filenames: $filenames)\n        }\n    ':
        types.DeleteFilesDocument,
    '\n        mutation DeleteFileTag($tagId: String!) {\n            result: deleteFileTag(tagId: $tagId)\n        }\n    ':
        types.DeleteFileTagDocument,
    '\n        mutation DeleteRoom($id: String!) {\n            result: deleteRoom(id: $id) {\n                failureType\n            }\n        }\n    ':
        types.DeleteRoomDocument,
    '\n        mutation DeleteRoomAsAdmin($id: String!) {\n            result: deleteRoomAsAdmin(id: $id) {\n                failureType\n            }\n        }\n    ':
        types.DeleteRoomAsAdminDocument,
    '\n        mutation EditFileTags($input: EditFileTagsInput!) {\n            result: editFileTags(input: $input)\n        }\n    ':
        types.EditFileTagsDocument,
    '\n        mutation EntryToServer($password: String) {\n            result: entryToServer(password: $password) {\n                type\n            }\n        }\n    ':
        types.EntryToServerDocument,
    '\n        query GetFiles($input: GetFilesInput!) {\n            result: getFiles(input: $input) {\n                files {\n                    createdAt\n                    createdBy\n                    filename\n                    listType\n                    screenname\n                    thumbFilename\n                }\n            }\n        }\n    ':
        types.GetFilesDocument,
    '\n        query GetMyRoles {\n            result: getMyRoles {\n                admin\n            }\n        }\n    ':
        types.GetMyRolesDocument,
    '\n        query GetRoom($id: String!) {\n            result: getRoom(id: $id) {\n                __typename\n                ... on GetJoinedRoomResult {\n                    role\n                    room {\n                        createdAt\n                        createdBy\n                        isBookmarked\n                        revision\n                        role\n                        stateJson\n                        updatedAt\n                    }\n                }\n                ... on GetNonJoinedRoomResult {\n                    roomAsListItem {\n                        createdAt\n                        createdBy\n                        id\n                        isBookmarked\n                        name\n                        requiresPlayerPassword\n                        requiresSpectatorPassword\n                        role\n                        updatedAt\n                    }\n                }\n                ... on GetRoomFailureResult {\n                    failureType\n                }\n            }\n        }\n    ':
        types.GetRoomDocument,
    '\n        query GetRoomsList {\n            result: getRoomsList {\n                __typename\n                ... on GetRoomsListSuccessResult {\n                    rooms {\n                        createdAt\n                        createdBy\n                        id\n                        isBookmarked\n                        name\n                        requiresPlayerPassword\n                        requiresSpectatorPassword\n                        role\n                        updatedAt\n                    }\n                }\n                ... on GetRoomsListFailureResult {\n                    failureType\n                }\n            }\n        }\n    ':
        types.GetRoomsListDocument,
    '\n        mutation CreateRoom($input: CreateRoomInput!) {\n            result: createRoom(input: $input) {\n                ... on CreateRoomFailureResult {\n                    failureType\n                }\n                ... on CreateRoomSuccessResult {\n                    id\n                    room {\n                        createdAt\n                        createdBy\n                        isBookmarked\n                        revision\n                        role\n                        stateJson\n                        updatedAt\n                    }\n                }\n            }\n        }\n    ':
        types.CreateRoomDocument,
    '\n        mutation DeleteMessage($roomId: String!, $messageId: String!) {\n            result: deleteMessage(roomId: $roomId, messageId: $messageId) {\n                failureType\n            }\n        }\n    ':
        types.DeleteMessageDocument,
    '\n        mutation EditMessage($roomId: String!, $messageId: String!, $text: String!) {\n            result: editMessage(roomId: $roomId, messageId: $messageId, text: $text) {\n                failureType\n            }\n        }\n    ':
        types.EditMessageDocument,
    '\n        mutation JoinRoomAsPlayer($id: String!, $name: String!, $password: String) {\n            result: joinRoomAsPlayer(id: $id, name: $name, password: $password) {\n                ... on JoinRoomFailureResult {\n                    failureType\n                }\n                ... on JoinRoomSuccessResult {\n                    operation {\n                        operatedBy {\n                            clientId\n                            userUid\n                        }\n                        revisionTo\n                        valueJson\n                    }\n                }\n            }\n        }\n    ':
        types.JoinRoomAsPlayerDocument,
    '\n        mutation JoinRoomAsSpectator($id: String!, $name: String!, $password: String) {\n            result: joinRoomAsSpectator(id: $id, name: $name, password: $password) {\n                ... on JoinRoomFailureResult {\n                    failureType\n                }\n                ... on JoinRoomSuccessResult {\n                    operation {\n                        operatedBy {\n                            clientId\n                            userUid\n                        }\n                        revisionTo\n                        valueJson\n                    }\n                }\n            }\n        }\n    ':
        types.JoinRoomAsSpectatorDocument,
    '\n        mutation LeaveRoom($id: String!) {\n            result: leaveRoom(id: $id) {\n                failureType\n            }\n        }\n    ':
        types.LeaveRoomDocument,
    '\n        mutation MakeMessageNotSecret($roomId: String!, $messageId: String!) {\n            result: makeMessageNotSecret(roomId: $roomId, messageId: $messageId) {\n                failureType\n            }\n        }\n    ':
        types.MakeMessageNotSecretDocument,
    '\n        mutation RenameFiles($input: [RenameFileInput!]!) {\n            result: renameFiles(input: $input)\n        }\n    ':
        types.RenameFilesDocument,
    '\n        mutation UpdateBookmark($roomId: String!, $newValue: Boolean!) {\n            result: updateBookmark(roomId: $roomId, newValue: $newValue) {\n                __typename\n                ... on UpdateBookmarkSuccessResult {\n                    prevValue\n                    currentValue\n                }\n                ... on UpdateBookmarkFailureResult {\n                    failureType\n                }\n            }\n        }\n    ':
        types.UpdateBookmarkDocument,
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
    source: '\n        mutation CreateFileTag($tagName: String!) {\n            result: createFileTag(tagName: $tagName) {\n                id\n                name\n            }\n        }\n    ',
): (typeof documents)['\n        mutation CreateFileTag($tagName: String!) {\n            result: createFileTag(tagName: $tagName) {\n                id\n                name\n            }\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        mutation DeleteFiles($filenames: [String!]!) {\n            result: deleteFiles(filenames: $filenames)\n        }\n    ',
): (typeof documents)['\n        mutation DeleteFiles($filenames: [String!]!) {\n            result: deleteFiles(filenames: $filenames)\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        mutation DeleteFileTag($tagId: String!) {\n            result: deleteFileTag(tagId: $tagId)\n        }\n    ',
): (typeof documents)['\n        mutation DeleteFileTag($tagId: String!) {\n            result: deleteFileTag(tagId: $tagId)\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        mutation DeleteRoom($id: String!) {\n            result: deleteRoom(id: $id) {\n                failureType\n            }\n        }\n    ',
): (typeof documents)['\n        mutation DeleteRoom($id: String!) {\n            result: deleteRoom(id: $id) {\n                failureType\n            }\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        mutation DeleteRoomAsAdmin($id: String!) {\n            result: deleteRoomAsAdmin(id: $id) {\n                failureType\n            }\n        }\n    ',
): (typeof documents)['\n        mutation DeleteRoomAsAdmin($id: String!) {\n            result: deleteRoomAsAdmin(id: $id) {\n                failureType\n            }\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        mutation EditFileTags($input: EditFileTagsInput!) {\n            result: editFileTags(input: $input)\n        }\n    ',
): (typeof documents)['\n        mutation EditFileTags($input: EditFileTagsInput!) {\n            result: editFileTags(input: $input)\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        mutation EntryToServer($password: String) {\n            result: entryToServer(password: $password) {\n                type\n            }\n        }\n    ',
): (typeof documents)['\n        mutation EntryToServer($password: String) {\n            result: entryToServer(password: $password) {\n                type\n            }\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        query GetFiles($input: GetFilesInput!) {\n            result: getFiles(input: $input) {\n                files {\n                    createdAt\n                    createdBy\n                    filename\n                    listType\n                    screenname\n                    thumbFilename\n                }\n            }\n        }\n    ',
): (typeof documents)['\n        query GetFiles($input: GetFilesInput!) {\n            result: getFiles(input: $input) {\n                files {\n                    createdAt\n                    createdBy\n                    filename\n                    listType\n                    screenname\n                    thumbFilename\n                }\n            }\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        query GetMyRoles {\n            result: getMyRoles {\n                admin\n            }\n        }\n    ',
): (typeof documents)['\n        query GetMyRoles {\n            result: getMyRoles {\n                admin\n            }\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        query GetRoom($id: String!) {\n            result: getRoom(id: $id) {\n                __typename\n                ... on GetJoinedRoomResult {\n                    role\n                    room {\n                        createdAt\n                        createdBy\n                        isBookmarked\n                        revision\n                        role\n                        stateJson\n                        updatedAt\n                    }\n                }\n                ... on GetNonJoinedRoomResult {\n                    roomAsListItem {\n                        createdAt\n                        createdBy\n                        id\n                        isBookmarked\n                        name\n                        requiresPlayerPassword\n                        requiresSpectatorPassword\n                        role\n                        updatedAt\n                    }\n                }\n                ... on GetRoomFailureResult {\n                    failureType\n                }\n            }\n        }\n    ',
): (typeof documents)['\n        query GetRoom($id: String!) {\n            result: getRoom(id: $id) {\n                __typename\n                ... on GetJoinedRoomResult {\n                    role\n                    room {\n                        createdAt\n                        createdBy\n                        isBookmarked\n                        revision\n                        role\n                        stateJson\n                        updatedAt\n                    }\n                }\n                ... on GetNonJoinedRoomResult {\n                    roomAsListItem {\n                        createdAt\n                        createdBy\n                        id\n                        isBookmarked\n                        name\n                        requiresPlayerPassword\n                        requiresSpectatorPassword\n                        role\n                        updatedAt\n                    }\n                }\n                ... on GetRoomFailureResult {\n                    failureType\n                }\n            }\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        query GetRoomsList {\n            result: getRoomsList {\n                __typename\n                ... on GetRoomsListSuccessResult {\n                    rooms {\n                        createdAt\n                        createdBy\n                        id\n                        isBookmarked\n                        name\n                        requiresPlayerPassword\n                        requiresSpectatorPassword\n                        role\n                        updatedAt\n                    }\n                }\n                ... on GetRoomsListFailureResult {\n                    failureType\n                }\n            }\n        }\n    ',
): (typeof documents)['\n        query GetRoomsList {\n            result: getRoomsList {\n                __typename\n                ... on GetRoomsListSuccessResult {\n                    rooms {\n                        createdAt\n                        createdBy\n                        id\n                        isBookmarked\n                        name\n                        requiresPlayerPassword\n                        requiresSpectatorPassword\n                        role\n                        updatedAt\n                    }\n                }\n                ... on GetRoomsListFailureResult {\n                    failureType\n                }\n            }\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        mutation CreateRoom($input: CreateRoomInput!) {\n            result: createRoom(input: $input) {\n                ... on CreateRoomFailureResult {\n                    failureType\n                }\n                ... on CreateRoomSuccessResult {\n                    id\n                    room {\n                        createdAt\n                        createdBy\n                        isBookmarked\n                        revision\n                        role\n                        stateJson\n                        updatedAt\n                    }\n                }\n            }\n        }\n    ',
): (typeof documents)['\n        mutation CreateRoom($input: CreateRoomInput!) {\n            result: createRoom(input: $input) {\n                ... on CreateRoomFailureResult {\n                    failureType\n                }\n                ... on CreateRoomSuccessResult {\n                    id\n                    room {\n                        createdAt\n                        createdBy\n                        isBookmarked\n                        revision\n                        role\n                        stateJson\n                        updatedAt\n                    }\n                }\n            }\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        mutation DeleteMessage($roomId: String!, $messageId: String!) {\n            result: deleteMessage(roomId: $roomId, messageId: $messageId) {\n                failureType\n            }\n        }\n    ',
): (typeof documents)['\n        mutation DeleteMessage($roomId: String!, $messageId: String!) {\n            result: deleteMessage(roomId: $roomId, messageId: $messageId) {\n                failureType\n            }\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        mutation EditMessage($roomId: String!, $messageId: String!, $text: String!) {\n            result: editMessage(roomId: $roomId, messageId: $messageId, text: $text) {\n                failureType\n            }\n        }\n    ',
): (typeof documents)['\n        mutation EditMessage($roomId: String!, $messageId: String!, $text: String!) {\n            result: editMessage(roomId: $roomId, messageId: $messageId, text: $text) {\n                failureType\n            }\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        mutation JoinRoomAsPlayer($id: String!, $name: String!, $password: String) {\n            result: joinRoomAsPlayer(id: $id, name: $name, password: $password) {\n                ... on JoinRoomFailureResult {\n                    failureType\n                }\n                ... on JoinRoomSuccessResult {\n                    operation {\n                        operatedBy {\n                            clientId\n                            userUid\n                        }\n                        revisionTo\n                        valueJson\n                    }\n                }\n            }\n        }\n    ',
): (typeof documents)['\n        mutation JoinRoomAsPlayer($id: String!, $name: String!, $password: String) {\n            result: joinRoomAsPlayer(id: $id, name: $name, password: $password) {\n                ... on JoinRoomFailureResult {\n                    failureType\n                }\n                ... on JoinRoomSuccessResult {\n                    operation {\n                        operatedBy {\n                            clientId\n                            userUid\n                        }\n                        revisionTo\n                        valueJson\n                    }\n                }\n            }\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        mutation JoinRoomAsSpectator($id: String!, $name: String!, $password: String) {\n            result: joinRoomAsSpectator(id: $id, name: $name, password: $password) {\n                ... on JoinRoomFailureResult {\n                    failureType\n                }\n                ... on JoinRoomSuccessResult {\n                    operation {\n                        operatedBy {\n                            clientId\n                            userUid\n                        }\n                        revisionTo\n                        valueJson\n                    }\n                }\n            }\n        }\n    ',
): (typeof documents)['\n        mutation JoinRoomAsSpectator($id: String!, $name: String!, $password: String) {\n            result: joinRoomAsSpectator(id: $id, name: $name, password: $password) {\n                ... on JoinRoomFailureResult {\n                    failureType\n                }\n                ... on JoinRoomSuccessResult {\n                    operation {\n                        operatedBy {\n                            clientId\n                            userUid\n                        }\n                        revisionTo\n                        valueJson\n                    }\n                }\n            }\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        mutation LeaveRoom($id: String!) {\n            result: leaveRoom(id: $id) {\n                failureType\n            }\n        }\n    ',
): (typeof documents)['\n        mutation LeaveRoom($id: String!) {\n            result: leaveRoom(id: $id) {\n                failureType\n            }\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        mutation MakeMessageNotSecret($roomId: String!, $messageId: String!) {\n            result: makeMessageNotSecret(roomId: $roomId, messageId: $messageId) {\n                failureType\n            }\n        }\n    ',
): (typeof documents)['\n        mutation MakeMessageNotSecret($roomId: String!, $messageId: String!) {\n            result: makeMessageNotSecret(roomId: $roomId, messageId: $messageId) {\n                failureType\n            }\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        mutation RenameFiles($input: [RenameFileInput!]!) {\n            result: renameFiles(input: $input)\n        }\n    ',
): (typeof documents)['\n        mutation RenameFiles($input: [RenameFileInput!]!) {\n            result: renameFiles(input: $input)\n        }\n    '];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n        mutation UpdateBookmark($roomId: String!, $newValue: Boolean!) {\n            result: updateBookmark(roomId: $roomId, newValue: $newValue) {\n                __typename\n                ... on UpdateBookmarkSuccessResult {\n                    prevValue\n                    currentValue\n                }\n                ... on UpdateBookmarkFailureResult {\n                    failureType\n                }\n            }\n        }\n    ',
): (typeof documents)['\n        mutation UpdateBookmark($roomId: String!, $newValue: Boolean!) {\n            result: updateBookmark(roomId: $roomId, newValue: $newValue) {\n                __typename\n                ... on UpdateBookmarkSuccessResult {\n                    prevValue\n                    currentValue\n                }\n                ... on UpdateBookmarkFailureResult {\n                    failureType\n                }\n            }\n        }\n    '];

export function graphql(source: string) {
    return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
    TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
