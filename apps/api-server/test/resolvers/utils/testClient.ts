import ws from 'isomorphic-ws';
import { createClient, defaultExchanges, subscriptionExchange } from '@urql/core';
import { Resources } from './resources';
import { createClient as createWsClient } from 'graphql-ws';
import {
    AmIAdminDocument,
    AmIAdminQuery,
    AmIAdminQueryVariables,
    CreateFileTagDocument,
    CreateFileTagMutation,
    CreateFileTagMutationVariables,
    CreateRoomDocument,
    CreateRoomMutation,
    CreateRoomMutationVariables,
    DeleteFilesDocument,
    DeleteFilesMutation,
    DeleteFilesMutationVariables,
    DeleteFileTagDocument,
    DeleteFileTagMutation,
    DeleteFileTagMutationVariables,
    DeleteRoomDocument,
    DeleteRoomMutation,
    DeleteRoomMutationVariables,
    EditFileTagsDocument,
    EditFileTagsMutation,
    EditFileTagsMutationVariables,
    EntryToServerDocument,
    EntryToServerMutation,
    EntryToServerMutationVariables,
    GetFilesDocument,
    GetFilesQuery,
    GetFilesQueryVariables,
    GetMessagesDocument,
    GetMessagesQuery,
    GetMessagesQueryVariables,
    GetRoomDocument,
    GetRoomQuery,
    GetRoomQueryVariables,
    GetRoomsListDocument,
    GetRoomsListQuery,
    GetRoomsListQueryVariables,
    JoinRoomAsPlayerDocument,
    JoinRoomAsPlayerMutation,
    JoinRoomAsPlayerMutationVariables,
    JoinRoomAsSpectatorDocument,
    JoinRoomAsSpectatorMutation,
    JoinRoomAsSpectatorMutationVariables,
    LeaveRoomDocument,
    LeaveRoomMutation,
    LeaveRoomMutationVariables,
    OperateDocument,
    OperateMutation,
    OperateMutationVariables,
    RoomEventDocument,
    RoomEventSubscription,
    RoomEventSubscriptionVariables,
    WritePrivateMessageDocument,
    WritePrivateMessageMutation,
    WritePrivateMessageMutationVariables,
} from '@flocon-trpg/typed-document-node';
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
    testAuthorizationHeaderValue: string | undefined
) =>
    createClient({
        url: httpUrl,
        fetchOptions: () => ({
            headers: { [Resources.testAuthorizationHeader]: testAuthorizationHeaderValue },
        }),
        exchanges: [
            ...defaultExchanges,
            subscriptionExchange({
                forwardSubscription: operation => ({
                    subscribe: sink => ({
                        unsubscribe: wsClient(wsUrl, testAuthorizationHeaderValue).subscribe(
                            operation,
                            sink as any
                        ),
                    }),
                }),
            }),
        ],
    });

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

    public amIAdminQuery(variables: AmIAdminQueryVariables) {
        return this.#core
            .query<AmIAdminQuery, AmIAdminQueryVariables>(AmIAdminDocument, variables, {
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

    public joinRoomAsPlayerMutation(variables: JoinRoomAsPlayerMutationVariables) {
        return this.#core
            .mutation<JoinRoomAsPlayerMutation, JoinRoomAsPlayerMutationVariables>(
                JoinRoomAsPlayerDocument,
                variables,
                { requestPolicy: 'network-only' }
            )
            .toPromise();
    }

    public async joinRoomAsSpectatorMutation(variables: JoinRoomAsSpectatorMutationVariables) {
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

    public async leaveRoomMutation(variables: LeaveRoomMutationVariables) {
        return this.#core
            .mutation<LeaveRoomMutation, LeaveRoomMutationVariables>(LeaveRoomDocument, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    }

    public operateMutation(variables: OperateMutationVariables) {
        return this.#core
            .mutation<OperateMutation, OperateMutationVariables>(OperateDocument, variables, {
                requestPolicy: 'network-only',
            })
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
