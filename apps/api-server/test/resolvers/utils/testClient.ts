import ws from 'isomorphic-ws';
import { createClient, defaultExchanges, subscriptionExchange } from '@urql/core';
import { Resources } from './resources';
import { createClient as createWsClient } from 'graphql-ws';
import {
    CreateFileTagDocument,
    CreateFileTagMutation,
    CreateFileTagMutationVariables,
    CreateRoomDocument,
    CreateRoomMutation,
    CreateRoomMutationVariables,
    DeleteFileTagDocument,
    DeleteFileTagMutation,
    DeleteFileTagMutationVariables,
    DeleteFilesDocument,
    DeleteFilesMutation,
    DeleteFilesMutationVariables,
    DeleteMessageDocument,
    DeleteMessageMutation,
    DeleteMessageMutationVariables,
    DeleteRoomDocument,
    DeleteRoomMutation,
    DeleteRoomMutationVariables,
    EditFileTagsDocument,
    EditFileTagsMutation,
    EditFileTagsMutationVariables,
    EditMessageDocument,
    EditMessageMutation,
    EditMessageMutationVariables,
    EntryToServerDocument,
    EntryToServerMutation,
    EntryToServerMutationVariables,
    GetFilesDocument,
    GetFilesQuery,
    GetFilesQueryVariables,
    GetMessagesDocument,
    GetMessagesQuery,
    GetMessagesQueryVariables,
    JoinRoomAsPlayerDocument,
    JoinRoomAsPlayerMutation,
    JoinRoomAsPlayerMutationVariables,
    JoinRoomAsSpectatorDocument,
    JoinRoomAsSpectatorMutation,
    JoinRoomAsSpectatorMutationVariables,
    LeaveRoomDocument,
    LeaveRoomMutation,
    LeaveRoomMutationVariables,
    MakeMessageNotSecretDocument,
    MakeMessageNotSecretMutation,
    MakeMessageNotSecretMutationVariables,
    OperateDocument,
    OperateMutation,
    OperateMutationVariables,
    RoomEventDocument,
    RoomEventSubscription,
    RoomEventSubscriptionVariables,
    WritePrivateMessageDocument,
    WritePrivateMessageMutation,
    WritePrivateMessageMutationVariables,
    WritePublicMessageDocument,
    WritePublicMessageMutation,
    WritePublicMessageMutationVariables,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import { TestRoomEventSubscription } from './subscription';
import {
    DeleteRoomAsAdminDocument,
    DeleteRoomAsAdminMutation,
    DeleteRoomAsAdminMutationVariables,
    GetMyRolesDocument,
    GetMyRolesQuery,
    GetMyRolesQueryVariables,
    GetRoomDocument,
    GetRoomQuery,
    GetRoomQueryVariables,
    GetRoomsListDocument,
    GetRoomsListQuery,
    GetRoomsListQueryVariables,
    UpdateBookmarkDocument,
    UpdateBookmarkMutation,
    UpdateBookmarkMutationVariables,
} from '@flocon-trpg/typed-document-node-v0.7.2';

const wsClient = (wsUrl: string, testAuthorizationHeaderValue: string | undefined) =>
    createWsClient({
        url: wsUrl,
        connectionParams: async () => {
            return { [Resources.testAuthorizationHeader]: testAuthorizationHeaderValue };
        },
        webSocketImpl: ws, // node.js?????????webSocketImpl??????????????????????????????
    });

const createUrqlClient = (
    httpUrl: string,
    wsUrl: string,
    testAuthorizationHeaderValue: string | undefined
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
            ...defaultExchanges,
            subscriptionExchange({
                forwardSubscription: operation => ({
                    subscribe: sink => ({
                        unsubscribe: wsClient(wsUrl, testAuthorizationHeaderValue).subscribe(
                            operation,
                            sink
                        ),
                    }),
                }),
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

    public createFileTagMutation(variables: CreateFileTagMutationVariables) {
        return this.#core
            .mutation<CreateFileTagMutation, CreateFileTagMutationVariables>(
                CreateFileTagDocument,
                variables,
                {
                    requestPolicy: 'network-only',
                }
            )
            .toPromise();
    }

    public deleteFilesMutation(variables: DeleteFilesMutationVariables) {
        return this.#core
            .mutation<DeleteFilesMutation, DeleteFilesMutationVariables>(
                DeleteFilesDocument,
                variables,
                {
                    requestPolicy: 'network-only',
                }
            )
            .toPromise();
    }

    public deleteFileTagsMutation(variables: DeleteFileTagMutationVariables) {
        return this.#core
            .mutation<DeleteFileTagMutation, DeleteFileTagMutationVariables>(
                DeleteFileTagDocument,
                variables,
                {
                    requestPolicy: 'network-only',
                }
            )
            .toPromise();
    }

    public deleteRoomMutation(variables: DeleteRoomMutationVariables) {
        return this.#core
            .mutation<DeleteRoomMutation, DeleteRoomMutationVariables>(
                DeleteRoomDocument,
                variables,
                {
                    requestPolicy: 'network-only',
                }
            )
            .toPromise();
    }

    public deleteRoomAsAdminMutation(variables: DeleteRoomMutationVariables) {
        return this.#core
            .mutation<DeleteRoomAsAdminMutation, DeleteRoomAsAdminMutationVariables>(
                DeleteRoomAsAdminDocument,
                variables,
                {
                    requestPolicy: 'network-only',
                }
            )
            .toPromise();
    }

    public editFileTagsMutation(variables: EditFileTagsMutationVariables) {
        return this.#core
            .mutation<EditFileTagsMutation, EditFileTagsMutationVariables>(
                EditFileTagsDocument,
                variables,
                {
                    requestPolicy: 'network-only',
                }
            )
            .toPromise();
    }

    public entryToServerMutation({ password }: { password: string }) {
        return this.#core
            .mutation<EntryToServerMutation, EntryToServerMutationVariables>(
                EntryToServerDocument,
                { password },
                { requestPolicy: 'network-only' }
            )
            .toPromise();
    }

    public getFilesQuery(variables: GetFilesQueryVariables) {
        return this.#core
            .query<GetFilesQuery, GetFilesQueryVariables>(GetFilesDocument, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public getMyRolesQuery(variables: GetMyRolesQueryVariables) {
        return this.#core
            .query<GetMyRolesQuery, GetMyRolesQueryVariables>(GetMyRolesDocument, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public getRoomQuery(variables: GetRoomQueryVariables) {
        return this.#core
            .query<GetRoomQuery, GetRoomQueryVariables>(GetRoomDocument, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public getRoomsListQuery() {
        return this.#core
            .query<GetRoomsListQuery, GetRoomsListQueryVariables>(GetRoomsListDocument, undefined, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public getMessagesQuery(variables: GetMessagesQueryVariables) {
        return this.#core
            .query<GetMessagesQuery, GetMessagesQueryVariables>(GetMessagesDocument, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public createRoomMutation(variables: CreateRoomMutationVariables) {
        return this.#core
            .mutation<CreateRoomMutation, CreateRoomMutationVariables>(
                CreateRoomDocument,
                variables,
                { requestPolicy: 'network-only' }
            )
            .toPromise();
    }

    public deleteMessageMutation(variables: DeleteMessageMutationVariables) {
        return this.#core
            .mutation<DeleteMessageMutation, DeleteMessageMutationVariables>(
                DeleteMessageDocument,
                variables,
                { requestPolicy: 'network-only' }
            )
            .toPromise();
    }

    public editMessageMutation(variables: EditMessageMutationVariables) {
        return this.#core
            .mutation<EditMessageMutation, EditMessageMutationVariables>(
                EditMessageDocument,
                variables,
                { requestPolicy: 'network-only' }
            )
            .toPromise();
    }

    public joinRoomAsPlayerMutation(variables: JoinRoomAsPlayerMutationVariables) {
        return this.#core
            .mutation<JoinRoomAsPlayerMutation, JoinRoomAsPlayerMutationVariables>(
                JoinRoomAsPlayerDocument,
                variables,
                { requestPolicy: 'network-only' }
            )
            .toPromise();
    }

    public joinRoomAsSpectatorMutation(variables: JoinRoomAsSpectatorMutationVariables) {
        return this.#core
            .mutation<JoinRoomAsSpectatorMutation, JoinRoomAsSpectatorMutationVariables>(
                JoinRoomAsSpectatorDocument,
                variables,
                {
                    requestPolicy: 'network-only',
                }
            )
            .toPromise();
    }

    public leaveRoomMutation(variables: LeaveRoomMutationVariables) {
        return this.#core
            .mutation<LeaveRoomMutation, LeaveRoomMutationVariables>(LeaveRoomDocument, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public makeMessageNotSecret(variables: MakeMessageNotSecretMutationVariables) {
        return this.#core
            .mutation<MakeMessageNotSecretMutation, MakeMessageNotSecretMutationVariables>(
                MakeMessageNotSecretDocument,
                variables,
                {
                    requestPolicy: 'network-only',
                }
            )
            .toPromise();
    }

    public operateMutation(variables: OperateMutationVariables) {
        return this.#core
            .mutation<OperateMutation, OperateMutationVariables>(OperateDocument, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public updateBookmarkMutation(variables: UpdateBookmarkMutationVariables) {
        return this.#core
            .mutation<UpdateBookmarkMutation, UpdateBookmarkMutationVariables>(
                UpdateBookmarkDocument,
                variables,
                {
                    requestPolicy: 'network-only',
                }
            )
            .toPromise();
    }

    public writePrivateMessageMutation(variables: WritePrivateMessageMutationVariables) {
        return this.#core
            .mutation<WritePrivateMessageMutation, WritePrivateMessageMutationVariables>(
                WritePrivateMessageDocument,
                variables,
                {
                    requestPolicy: 'network-only',
                }
            )
            .toPromise();
    }

    public writePublicMessageMutation(variables: WritePublicMessageMutationVariables) {
        return this.#core
            .mutation<WritePublicMessageMutation, WritePublicMessageMutationVariables>(
                WritePublicMessageDocument,
                variables,
                {
                    requestPolicy: 'network-only',
                }
            )
            .toPromise();
    }

    public roomEventSubscription({ roomId }: { roomId: string }) {
        return new TestRoomEventSubscription(
            this.#core.subscription<RoomEventSubscription, RoomEventSubscriptionVariables>(
                RoomEventDocument,
                {
                    id: roomId,
                }
            )
        );
    }
}
