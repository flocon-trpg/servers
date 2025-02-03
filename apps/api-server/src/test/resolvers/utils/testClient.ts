import {
    GetMessagesDoc,
    OperateRoomDoc,
    RoomEventDoc,
    WritePrivateMessageDoc,
    WritePublicMessageDoc,
} from '@flocon-trpg/graphql-documents';
import { VariablesOf } from '@graphql-typed-document-node/core';
import { createClient as createWsClient } from 'graphql-ws';
import ws from 'isomorphic-ws';
import { cacheExchange, createClient, fetchExchange, subscriptionExchange } from 'urql';
import { graphql } from '../../../graphql-codegen';
import { Resources } from './resources';
import { TestRoomEventSubscription } from './subscription';

const wsClient = (wsUrl: string, testAuthorizationHeaderValue: string | undefined) =>
    createWsClient({
        url: wsUrl,
        connectionParams: async () => {
            return { [Resources.testAuthorizationHeader]: testAuthorizationHeaderValue };
        },
        webSocketImpl: ws, // node.jsでは、webSocketImplがないとエラーが出る
    });

const createUrqlClient = (
    httpUrl: string,
    wsUrl: string,
    testAuthorizationHeaderValue: string | undefined,
) => {
    const headers: Record<string, string> = {};
    if (testAuthorizationHeaderValue != null) {
        headers[Resources.testAuthorizationHeader] = testAuthorizationHeaderValue;
    }
    return createClient({
        url: httpUrl,
        fetchOptions: {
            headers,
        },
        exchanges: [
            cacheExchange,
            fetchExchange,
            subscriptionExchange({
                forwardSubscription: request => {
                    const input = { ...request, query: request.query || '' };
                    return {
                        subscribe: sink => ({
                            unsubscribe: wsClient(wsUrl, testAuthorizationHeaderValue).subscribe(
                                input,
                                sink,
                            ),
                        }),
                    };
                },
            }),
        ],
    });
};

type Client = ReturnType<typeof createUrqlClient>;

export class TestClient {
    readonly #core: Client;

    public constructor({
        httpUrl,
        wsUrl,
        testAuthorizationHeaderValue,
    }: {
        httpUrl: string;
        wsUrl: string;
        testAuthorizationHeaderValue: string | undefined;
    }) {
        this.#core = createUrqlClient(httpUrl, wsUrl, testAuthorizationHeaderValue);
    }

    public static createFileTagMutationDoc = graphql(`
        mutation CreateFileTag($tagName: String!) {
            result: createFileTag(tagName: $tagName) {
                id
                name
            }
        }
    `);
    public createFileTagMutation(
        variables: VariablesOf<typeof TestClient.createFileTagMutationDoc>,
    ) {
        return this.#core
            .mutation(TestClient.createFileTagMutationDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public static deleteFilesMutationDoc = graphql(`
        mutation DeleteFiles($filenames: [String!]!) {
            result: deleteFiles(filenames: $filenames)
        }
    `);
    public deleteFilesMutation(variables: VariablesOf<typeof TestClient.deleteFilesMutationDoc>) {
        return this.#core
            .mutation(TestClient.deleteFilesMutationDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public static deleteFileTagMutationDoc = graphql(`
        mutation DeleteFileTag($tagId: String!) {
            result: deleteFileTag(tagId: $tagId)
        }
    `);
    public deleteFileTagsMutation(
        variables: VariablesOf<typeof TestClient.deleteFileTagMutationDoc>,
    ) {
        return this.#core
            .mutation(TestClient.deleteFileTagMutationDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public static deleteRoomMutationDoc = graphql(`
        mutation DeleteRoom($roomId: String!) {
            result: deleteRoom(roomId: $roomId) {
                failureType
            }
        }
    `);
    public deleteRoomMutation(variables: VariablesOf<typeof TestClient.deleteRoomMutationDoc>) {
        return this.#core
            .mutation(TestClient.deleteRoomMutationDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public static deleteRoomAsAdminMutationDoc = graphql(`
        mutation DeleteRoomAsAdmin($roomId: String!) {
            result: deleteRoomAsAdmin(roomId: $roomId) {
                failureType
            }
        }
    `);
    public deleteRoomAsAdminMutation(
        variables: VariablesOf<typeof TestClient.deleteRoomAsAdminMutationDoc>,
    ) {
        return this.#core
            .mutation(TestClient.deleteRoomAsAdminMutationDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public static editFileTagsMutationDoc = graphql(`
        mutation EditFileTags($input: EditFileTagsInput!) {
            result: editFileTags(input: $input)
        }
    `);
    public editFileTagsMutation(variables: VariablesOf<typeof TestClient.editFileTagsMutationDoc>) {
        return this.#core
            .mutation(TestClient.editFileTagsMutationDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public static entryToServerMutationDoc = graphql(`
        mutation EntryToServer($password: String) {
            result: entryToServer(password: $password) {
                type
            }
        }
    `);
    public entryToServerMutation({ password }: { password?: string }) {
        return this.#core
            .mutation(
                TestClient.entryToServerMutationDoc,
                { password },
                { requestPolicy: 'network-only' },
            )
            .toPromise();
    }

    public static getFilesQueryDoc = graphql(`
        query GetFiles($input: GetFilesInput!) {
            result: getFiles(input: $input) {
                files {
                    createdAt
                    createdBy
                    filename
                    listType
                    screenname
                    thumbFilename
                }
            }
        }
    `);
    public getFilesQuery(variables: VariablesOf<typeof TestClient.getFilesQueryDoc>) {
        return this.#core
            .query(TestClient.getFilesQueryDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public static getMyRolesQueryDoc = graphql(`
        query GetMyRoles {
            result: getMyRoles {
                admin
            }
        }
    `);
    public getMyRolesQuery(variables: VariablesOf<typeof TestClient.getMyRolesQueryDoc>) {
        return this.#core
            .query(TestClient.getMyRolesQueryDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public static getRoomQueryDoc = graphql(`
        query GetRoom($roomId: String!) {
            result: getRoom(roomId: $roomId) {
                __typename
                ... on GetJoinedRoomResult {
                    role
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
                ... on GetNonJoinedRoomResult {
                    roomAsListItem {
                        createdAt
                        createdBy
                        roomId
                        isBookmarked
                        name
                        requiresPlayerPassword
                        requiresSpectatorPassword
                        role
                        updatedAt
                    }
                }
                ... on GetRoomFailureResult {
                    failureType
                }
            }
        }
    `);
    public getRoomQuery(variables: VariablesOf<typeof TestClient.getRoomQueryDoc>) {
        return this.#core
            .query(TestClient.getRoomQueryDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public static getRoomsListQueryDoc = graphql(`
        query GetRoomsList {
            result: getRoomsList {
                __typename
                ... on GetRoomsListSuccessResult {
                    rooms {
                        createdAt
                        createdBy
                        roomId
                        isBookmarked
                        name
                        requiresPlayerPassword
                        requiresSpectatorPassword
                        role
                        updatedAt
                    }
                }
                ... on GetRoomsListFailureResult {
                    failureType
                }
            }
        }
    `);
    public getRoomsListQuery() {
        return this.#core
            .query(
                TestClient.getRoomsListQueryDoc,
                {},
                {
                    requestPolicy: 'network-only',
                },
            )
            .toPromise();
    }

    public getMessagesQuery(variables: VariablesOf<typeof GetMessagesDoc>) {
        return this.#core
            .query(GetMessagesDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public static createRoomMutationDoc = graphql(`
        mutation CreateRoom($input: CreateRoomInput!) {
            result: createRoom(input: $input) {
                ... on CreateRoomFailureResult {
                    failureType
                }
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
            }
        }
    `);
    public createRoomMutation(variables: VariablesOf<typeof TestClient.createRoomMutationDoc>) {
        return this.#core
            .mutation(TestClient.createRoomMutationDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public static deleteMessageMutationDoc = graphql(`
        mutation DeleteMessage($roomId: String!, $messageId: String!) {
            result: deleteMessage(roomId: $roomId, messageId: $messageId) {
                failureType
            }
        }
    `);
    public deleteMessageMutation(
        variables: VariablesOf<typeof TestClient.deleteMessageMutationDoc>,
    ) {
        return this.#core
            .mutation(TestClient.deleteMessageMutationDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public static editMessageMutationDoc = graphql(`
        mutation EditMessage($roomId: String!, $messageId: String!, $text: String!) {
            result: editMessage(roomId: $roomId, messageId: $messageId, text: $text) {
                failureType
            }
        }
    `);
    public editMessageMutation(variables: VariablesOf<typeof TestClient.editMessageMutationDoc>) {
        return this.#core
            .mutation(TestClient.editMessageMutationDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public static joinRoomAsPlayerMutationDoc = graphql(`
        mutation JoinRoomAsPlayer($roomId: String!, $name: String!, $password: String) {
            result: joinRoomAsPlayer(roomId: $roomId, name: $name, password: $password) {
                ... on JoinRoomFailureResult {
                    failureType
                }
                ... on JoinRoomSuccessResult {
                    operation {
                        operatedBy {
                            clientId
                            userUid
                        }
                        revisionTo
                        valueJson
                    }
                }
            }
        }
    `);
    public joinRoomAsPlayerMutation(
        variables: VariablesOf<typeof TestClient.joinRoomAsPlayerMutationDoc>,
    ) {
        return this.#core
            .mutation(TestClient.joinRoomAsPlayerMutationDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public static joinRoomAsSpectatorDoc = graphql(`
        mutation JoinRoomAsSpectator($roomId: String!, $name: String!, $password: String) {
            result: joinRoomAsSpectator(roomId: $roomId, name: $name, password: $password) {
                ... on JoinRoomFailureResult {
                    failureType
                }
                ... on JoinRoomSuccessResult {
                    operation {
                        operatedBy {
                            clientId
                            userUid
                        }
                        revisionTo
                        valueJson
                    }
                }
            }
        }
    `);
    public joinRoomAsSpectatorMutation(
        variables: VariablesOf<typeof TestClient.joinRoomAsSpectatorDoc>,
    ) {
        return this.#core
            .mutation(TestClient.joinRoomAsSpectatorDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public static leaveRoomMutationDoc = graphql(`
        mutation LeaveRoom($roomId: String!) {
            result: leaveRoom(roomId: $roomId) {
                failureType
            }
        }
    `);
    public leaveRoomMutation(variables: VariablesOf<typeof TestClient.leaveRoomMutationDoc>) {
        return this.#core
            .mutation(TestClient.leaveRoomMutationDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public static makeMessageNotSecretDoc = graphql(`
        mutation MakeMessageNotSecret($roomId: String!, $messageId: String!) {
            result: makeMessageNotSecret(roomId: $roomId, messageId: $messageId) {
                failureType
            }
        }
    `);
    public makeMessageNotSecret(variables: VariablesOf<typeof TestClient.makeMessageNotSecretDoc>) {
        return this.#core
            .mutation(TestClient.makeMessageNotSecretDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public operateRoomMutation(variables: VariablesOf<typeof OperateRoomDoc>) {
        return this.#core
            .mutation(OperateRoomDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public static renameFilesMutationDoc = graphql(`
        mutation RenameFiles($input: [RenameFileInput!]!) {
            result: renameFiles(input: $input)
        }
    `);
    public renameFilesMutation(variables: VariablesOf<typeof TestClient.renameFilesMutationDoc>) {
        return this.#core
            .mutation(TestClient.renameFilesMutationDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public static updateBookmarkMutationDoc = graphql(`
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
    public updateBookmarkMutation(
        variables: VariablesOf<typeof TestClient.updateBookmarkMutationDoc>,
    ) {
        return this.#core
            .mutation(TestClient.updateBookmarkMutationDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public writePrivateMessageMutation(variables: VariablesOf<typeof WritePrivateMessageDoc>) {
        return this.#core
            .mutation(WritePrivateMessageDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public writePublicMessageMutation(variables: VariablesOf<typeof WritePublicMessageDoc>) {
        return this.#core
            .mutation(WritePublicMessageDoc, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public roomEventSubscription({ roomId }: { roomId: string }) {
        return new TestRoomEventSubscription(
            this.#core.subscription(RoomEventDoc, {
                roomId,
            }),
        );
    }
}
