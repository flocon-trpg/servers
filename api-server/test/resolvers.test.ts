/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as $MikroORM from '../src/graphql+mikro-orm/entities/room/mikro-orm';
import { EM } from '../src/utils/types';
import { User as User$MikroORM } from '../src/graphql+mikro-orm/entities/user/mikro-orm';
import { File as File$MikroORM } from '../src/graphql+mikro-orm/entities/file/mikro-orm';
import { Client as UrqlClientType } from '@urql/core';
import { createOrm, createTestServer, DbConfig } from './createTestServer';
import { Resources } from './resources';
import {
    EntryToServerMutation,
    EntryToServerMutationVariables,
    EntryToServerDocument,
    CreateRoomMutationVariables,
    CreateRoomDocument,
    GetRoomsListQuery,
    GetRoomsListQueryVariables,
    GetRoomsListDocument,
    CreateRoomMutation,
    JoinRoomAsPlayerMutation,
    JoinRoomAsPlayerMutationVariables,
    JoinRoomAsPlayerDocument,
    JoinRoomAsSpectatorMutation,
    JoinRoomAsSpectatorMutationVariables,
    JoinRoomAsSpectatorDocument,
    OperateMutation,
    OperateMutationVariables,
    GetRoomQuery,
    GetRoomQueryVariables,
    GetRoomDocument,
    WritePrivateMessageMutationVariables,
    WritePrivateMessageDocument,
    WritePrivateMessageMutation,
    OperateDocument,
    LeaveRoomMutationVariables,
    LeaveRoomDocument,
    LeaveRoomMutation,
    GetMessagesQuery,
    GetMessagesQueryVariables,
    GetMessagesDocument,
    DeleteRoomMutation,
    DeleteRoomMutationVariables,
    DeleteRoomDocument,
    DeleteRoomFailureType,
    GetFilesQuery,
    GetFilesQueryVariables,
    GetFilesDocument,
    EditFileTagsMutation,
    EditFileTagsMutationVariables,
    EditFileTagsDocument,
    CreateFileTagMutationVariables,
    CreateFileTagMutation,
    CreateFileTagDocument,
    DeleteFileTagMutationVariables,
    DeleteFileTagDocument,
    DeleteFileTagMutation,
    DeleteFilesMutation,
    DeleteFilesMutationVariables,
    DeleteFilesDocument,
} from '../generated/graphql';
import { EntryToServerResultType } from '../src/enums/EntryToServerResultType';
import { ServerConfig } from '../src/configType';
import { UpOperation, parseState } from '@kizahasi/flocon-core';
import axios from 'axios';
import FormData from 'form-data';
import urljoin from 'url-join';
import { readFileSync } from 'fs';
import { TextTwoWayOperation, TextUpOperation } from '@kizahasi/ot-string';
import { OperationResult } from '@urql/core';
import { maskTypeNames } from './maskTypenames';
import { TestClients } from './testClients';

const timeout = 20000;

const textDiff = ({ prev, next }: { prev: string; next: string }) => {
    if (prev === next) {
        return undefined;
    }
    const diff = TextTwoWayOperation.diff({
        first: prev,
        second: next,
    });
    const upOperation = TextTwoWayOperation.toUpOperation(diff);
    return TextUpOperation.toUnit(upOperation);
};

const clearAllRooms = async (em: EM): Promise<void> => {
    for (const room of await em.find($MikroORM.Room, {})) {
        await $MikroORM.deleteRoom(em, room);
    }
    await em.flush();
};

const clearAllFiles = async (em: EM): Promise<void> => {
    for (const file of await em.find(File$MikroORM, {})) {
        await file.fileTags.init();
        file.fileTags.removeAll();
        em.remove(file);
    }
    for (const user of await em.find(User$MikroORM, {})) {
        await user.files.init();
        user.files.removeAll();
        await user.fileTags.init();
        user.fileTags.removeAll();
    }
    await em.flush();
};

const plainEntryPassword: ServerConfig['entryPassword'] = {
    type: 'plain',
    value: Resources.entryPassword,
};

namespace Assert {
    export namespace CreateFileTagMutation {
        export const toBeSuccess = (source: OperationResult<CreateFileTagMutation>) => {
            if (source.data?.result == null) {
                expect(source.data?.result ?? undefined).not.toBeUndefined();
                throw new Error('Guard');
            }
            return source.data.result;
        };
    }

    export namespace CreateRoomMutation {
        export const toBeSuccess = (source: OperationResult<CreateRoomMutation>) => {
            if (source.data?.result.__typename !== 'CreateRoomSuccessResult') {
                expect(source.data?.result.__typename).toBe('CreateRoomSuccessResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };
    }

    export namespace DeleteRoomMutation {
        export const toBeSuccess = (source: OperationResult<DeleteRoomMutation>) => {
            expect(source.data?.result.failureType ?? undefined).toBeUndefined();
        };

        export const toBeNotCreatedByYou = (source: OperationResult<DeleteRoomMutation>) => {
            expect(source.data?.result.failureType).toBe(DeleteRoomFailureType.NotCreatedByYou);
        };
    }

    export namespace EditFileTagsMutation {
        export const toBeSuccess = (source: OperationResult<EditFileTagsMutation>) => {
            expect(source.data?.result).toBe(true);
        };
    }

    export namespace GetFilesQuery {
        export const toBeSuccess = (source: OperationResult<GetFilesQuery>) => {
            if (source.data == null) {
                throw source.error;
            }
            return source.data.result.files;
        };
    }

    export namespace GetMessagesQuery {
        export const toBeSuccess = (source: OperationResult<GetMessagesQuery>) => {
            if (source.data?.result.__typename !== 'RoomMessages') {
                expect(source.data?.result.__typename).toBe('RoomMessages');
                throw new Error('Guard');
            }
            return source.data.result;
        };
    }

    export namespace GetRoomsListQuery {
        export const toBeSuccess = (source: OperationResult<GetRoomsListQuery>) => {
            if (source.data?.result.__typename !== 'GetRoomsListSuccessResult') {
                expect(source.data?.result.__typename).toBe('GetRoomsListSuccessResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };
    }

    export namespace GetRoomQuery {
        export const toBeSuccess = (source: OperationResult<GetRoomQuery>) => {
            if (source.data?.result.__typename !== 'GetJoinedRoomResult') {
                expect(source.data?.result.__typename).toBe('GetJoinedRoomResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };
    }

    export namespace JoinRoomMutation {
        export const toBeSuccess = (
            source: OperationResult<JoinRoomAsPlayerMutation | JoinRoomAsSpectatorMutation>
        ) => {
            if (source.data?.result.__typename !== 'JoinRoomSuccessResult') {
                expect(source.data?.result.__typename).toBe('JoinRoomSuccessResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };

        export const toBeFailure = (
            source: OperationResult<JoinRoomAsPlayerMutation | JoinRoomAsSpectatorMutation>
        ) => {
            if (source.data?.result.__typename !== 'JoinRoomFailureResult') {
                expect(source.data?.result.__typename).toBe('JoinRoomFailureResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };
    }

    export namespace LeaveRoomMutation {
        export const toBeSuccess = (source: OperationResult<LeaveRoomMutation>) => {
            expect(source.data?.result.failureType ?? undefined).toBeUndefined();
        };
    }

    export namespace OperateMutation {
        export const toBeSuccess = async (source: Promise<OperationResult<OperateMutation>>) => {
            const sourceResult = await source;
            if (sourceResult.data?.result.__typename !== 'OperateRoomSuccessResult') {
                expect(sourceResult.data?.result.__typename).toBe('OperateRoomSuccessResult');
                throw new Error('Guard');
            }
            return sourceResult.data.result;
        };

        export const toBeFailure = async (
            source: Promise<OperationResult<OperateMutation>>,
            errorType: 'GraphQL'
        ) => {
            const sourceResult = await source;
            if (errorType === 'GraphQL') {
                expect(sourceResult.error?.graphQLErrors.length ?? 0).toBeGreaterThanOrEqual(1);
            }
        };
    }

    export namespace WritePrivateMessageMutation {
        export const toBeSuccess = (source: OperationResult<WritePrivateMessageMutation>) => {
            if (source.data?.result.__typename !== 'RoomPrivateMessage') {
                expect(source.data?.result.__typename).toBe('RoomPrivateMessage');
                throw new Error('Guard');
            }
            return source.data.result;
        };
    }
}

namespace GraphQL {
    export const createFileTagMutation = async (
        client: UrqlClientType,
        variables: CreateFileTagMutationVariables
    ) => {
        return await client
            .mutation<CreateFileTagMutation, CreateFileTagMutationVariables>(
                CreateFileTagDocument,
                variables,
                {
                    requestPolicy: 'network-only',
                }
            )
            .toPromise();
    };

    export const deleteFilesMutation = async (
        client: UrqlClientType,
        variables: DeleteFilesMutationVariables
    ) => {
        return await client
            .mutation<DeleteFilesMutation, DeleteFilesMutationVariables>(
                DeleteFilesDocument,
                variables,
                {
                    requestPolicy: 'network-only',
                }
            )
            .toPromise();
    };

    export const deleteFileTagsMutation = async (
        client: UrqlClientType,
        variables: DeleteFileTagMutationVariables
    ) => {
        return await client
            .mutation<DeleteFileTagMutation, DeleteFileTagMutationVariables>(
                DeleteFileTagDocument,
                variables,
                {
                    requestPolicy: 'network-only',
                }
            )
            .toPromise();
    };

    export const deleteRoomMutation = async (
        client: UrqlClientType,
        variables: DeleteRoomMutationVariables
    ) => {
        return await client
            .mutation<DeleteRoomMutation, DeleteRoomMutationVariables>(
                DeleteRoomDocument,
                variables,
                {
                    requestPolicy: 'network-only',
                }
            )
            .toPromise();
    };

    export const editFileTagsMutation = async (
        client: UrqlClientType,
        variables: EditFileTagsMutationVariables
    ) => {
        return await client
            .mutation<EditFileTagsMutation, EditFileTagsMutationVariables>(
                EditFileTagsDocument,
                variables,
                {
                    requestPolicy: 'network-only',
                }
            )
            .toPromise();
    };

    export const entryToServerMutation = async (client: UrqlClientType) => {
        return await client
            .mutation<EntryToServerMutation, EntryToServerMutationVariables>(
                EntryToServerDocument,
                { phrase: Resources.entryPassword },
                { requestPolicy: 'network-only' }
            )
            .toPromise();
    };

    export const getFilesQuery = async (
        client: UrqlClientType,
        variables: GetFilesQueryVariables
    ) => {
        return await client
            .query<GetFilesQuery, GetFilesQueryVariables>(GetFilesDocument, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    };

    export const getRoomQuery = async (
        client: UrqlClientType,
        variables: GetRoomQueryVariables
    ) => {
        return await client
            .query<GetRoomQuery, GetRoomQueryVariables>(GetRoomDocument, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    };

    export const getRoomsListQuery = async (client: UrqlClientType) => {
        return await client
            .query<GetRoomsListQuery, GetRoomsListQueryVariables>(GetRoomsListDocument, undefined, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    };

    export const getMessagesQuery = async (
        client: UrqlClientType,
        variables: GetMessagesQueryVariables
    ) => {
        return await client
            .query<GetMessagesQuery, GetMessagesQueryVariables>(GetMessagesDocument, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    };

    export const joinRoomAsPlayerMutation = async (
        client: UrqlClientType,
        variables: JoinRoomAsPlayerMutationVariables
    ) => {
        return await client
            .mutation<JoinRoomAsPlayerMutation, JoinRoomAsPlayerMutationVariables>(
                JoinRoomAsPlayerDocument,
                variables,
                { requestPolicy: 'network-only' }
            )
            .toPromise();
    };

    export const joinRoomAsSpectatorMutation = async (
        client: UrqlClientType,
        variables: JoinRoomAsSpectatorMutationVariables
    ) => {
        return await client
            .mutation<JoinRoomAsSpectatorMutation, JoinRoomAsSpectatorMutationVariables>(
                JoinRoomAsSpectatorDocument,
                variables,
                {
                    requestPolicy: 'network-only',
                }
            )
            .toPromise();
    };

    export const leaveRoomMutation = async (
        client: UrqlClientType,
        variables: LeaveRoomMutationVariables
    ) => {
        return await client
            .mutation<LeaveRoomMutation, LeaveRoomMutationVariables>(LeaveRoomDocument, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    };

    export const operateMutation = async (
        client: UrqlClientType,
        variables: OperateMutationVariables
    ) => {
        return await client
            .mutation<OperateMutation, OperateMutationVariables>(OperateDocument, variables, {
                requestPolicy: 'network-only',
            })
            .toPromise();
    };

    export const writePrivateMessageMutation = async (
        client: UrqlClientType,
        variables: WritePrivateMessageMutationVariables
    ) => {
        return await client
            .mutation<WritePrivateMessageMutation, WritePrivateMessageMutationVariables>(
                WritePrivateMessageDocument,
                variables,
                {
                    requestPolicy: 'network-only',
                }
            )
            .toPromise();
    };
}

const httpUri = 'http://localhost:4000';
const httpGraphQLUri = 'http://localhost:4000/graphql';
const wsGraphQLUri = 'ws://localhost:4000/graphql';

const sqlite1Type: DbConfig = {
    type: 'SQLite',
    dbName: './test1.sqlite3',
};
const sqlite2Type: DbConfig = {
    type: 'SQLite',
    dbName: './test2.sqlite3',
};
const postgresqlType: DbConfig = {
    type: 'PostgreSQL',
};

describe.each([
    [sqlite1Type, undefined],
    [sqlite2Type, plainEntryPassword],
    [postgresqlType, plainEntryPassword],
] as const)('integration test', (dbType, entryPasswordConfig) => {
    afterEach(async () => {
        // Userは各テストで使い回すため削除していない

        const orm = await createOrm(dbType);
        await clearAllRooms(orm.em.fork());
        await clearAllFiles(orm.em.fork());
    });

    const entryPassword = entryPasswordConfig == null ? undefined : Resources.entryPassword;

    it('tests entry (and setup users)', async () => {
        const server = await createTestServer(dbType, entryPasswordConfig);
        const clients = new TestClients({ httpGraphQLUri, wsGraphQLUri });

        const {
            roomMasterClient,
            roomPlayer1Client,
            roomPlayer2Client,
            roomSpectatorClient,
            notJoinUserClient,
        } = clients.clients;

        // mutation entryToServer if entryPassword != null
        if (entryPassword != null) {
            const result = await GraphQL.entryToServerMutation(roomMasterClient);
            expect(result.data?.result.type).toBe(EntryToServerResultType.Success);

            // roomMaster以外のテストは成功するとみなし省略している
            await GraphQL.entryToServerMutation(roomPlayer1Client);
            await GraphQL.entryToServerMutation(roomPlayer2Client);
            await GraphQL.entryToServerMutation(roomSpectatorClient);
            await GraphQL.entryToServerMutation(notJoinUserClient);
        }

        // これがないとport 4000が開放されないので2個目以降のテストが失敗してしまう。以降のテストも同様。
        server.close();
    });

    it.each(['public', 'unlisted'] as const)(
        'tests upload and delete file in uploader',
        async publicOrUnlisted => {
            const server = await createTestServer(dbType, entryPasswordConfig);
            const clients = new TestClients({ httpGraphQLUri, wsGraphQLUri });

            const { roomPlayer1Client: clientToUploadFiles, roomPlayer2Client: anotherClient } =
                clients.clients;

            {
                const formData = new FormData();
                formData.append(
                    'file',
                    readFileSync('./test/pexels-public-domain-pictures-68147.jpg'),
                    {
                        filename: 'test-image.jpg',
                    }
                );
                const axiosConfig = {
                    headers: {
                        ...formData.getHeaders(),
                        [Resources.testAuthorizationHeader]: Resources.User.player1,
                    },
                };
                const postResult = await axios
                    .post(
                        urljoin(httpUri, 'uploader', 'upload', publicOrUnlisted),
                        formData,
                        axiosConfig
                    )
                    .then(() => true)
                    .catch(err => err);
                expect(postResult).toBe(true);
            }

            let filename: string;
            let thumbFilename: string | null | undefined;
            {
                const filesResult = Assert.GetFilesQuery.toBeSuccess(
                    await GraphQL.getFilesQuery(clientToUploadFiles, { input: { fileTagIds: [] } })
                );
                console.log('GetFilesQuery result: %o', filesResult);
                expect(filesResult).toHaveLength(1);
                filename = filesResult[0]!.filename;
                thumbFilename = filesResult[0]!.thumbFilename;
                if (thumbFilename == null) {
                    throw new Error('thumbFilename should not be nullish');
                }
            }

            {
                const filesResult = Assert.GetFilesQuery.toBeSuccess(
                    await GraphQL.getFilesQuery(anotherClient, { input: { fileTagIds: [] } })
                );
                expect(filesResult).toHaveLength(publicOrUnlisted === 'public' ? 1 : 0);
            }

            const cases = [
                ['files', Resources.User.player1],
                ['files', Resources.User.player2],
                ['thumbs', Resources.User.player1],
                ['thumbs', Resources.User.player2],
            ] as const;
            for (const [fileType, id] of cases) {
                const axiosResult = await axios
                    .get(
                        urljoin(
                            httpUri,
                            'uploader',
                            fileType,
                            fileType === 'files' ? filename : thumbFilename
                        ),
                        {
                            headers: {
                                [Resources.testAuthorizationHeader]: id,
                            },
                        }
                    )
                    .then(() => true)
                    .catch(err => err);
                expect(axiosResult).toBe(true);
            }

            let fileTagId: string;
            {
                const fileTagName = 'FILE_TAG_NAME';
                const fileTagResult = Assert.CreateFileTagMutation.toBeSuccess(
                    await GraphQL.createFileTagMutation(clientToUploadFiles, {
                        tagName: fileTagName,
                    })
                );
                expect(fileTagResult.name).toBe(fileTagName);
                fileTagId = fileTagResult.id;
            }

            {
                Assert.EditFileTagsMutation.toBeSuccess(
                    await GraphQL.editFileTagsMutation(clientToUploadFiles, {
                        input: { actions: [{ filename, add: [fileTagId], remove: [] }] },
                    })
                );
            }

            {
                const filesResult = Assert.GetFilesQuery.toBeSuccess(
                    await GraphQL.getFilesQuery(clientToUploadFiles, {
                        input: { fileTagIds: [fileTagId] },
                    })
                );
                expect(filesResult).toHaveLength(1);
            }

            for (const client of [clientToUploadFiles, anotherClient]) {
                {
                    const nonExistFileTagId = fileTagId + fileTagId;
                    const filesResult = Assert.GetFilesQuery.toBeSuccess(
                        await GraphQL.getFilesQuery(client, {
                            input: { fileTagIds: [nonExistFileTagId] },
                        })
                    );
                    expect(filesResult).toHaveLength(0);
                }
            }

            {
                // TODO: publicでアップロードしたファイルは、アップロード者以外による削除を可能にするかどうかがまだ決定していない
                const actual = await GraphQL.deleteFilesMutation(clientToUploadFiles, {
                    filenames: [filename],
                });
                expect(actual.data?.result).toEqual([filename]);
            }

            for (const client of [clientToUploadFiles, anotherClient]) {
                const filesResult = Assert.GetFilesQuery.toBeSuccess(
                    await GraphQL.getFilesQuery(client, {
                        input: { fileTagIds: [] },
                    })
                );
                expect(filesResult).toHaveLength(0);
            }

            server.close();
        }
    );

    it(
        'tests room',
        async () => {
            const server = await createTestServer(dbType, entryPasswordConfig);
            const clients = new TestClients({ httpGraphQLUri, wsGraphQLUri });
            const { roomMasterClient, roomPlayer1Client, roomPlayer2Client, roomSpectatorClient } =
                clients.clients;

            let roomId: string;
            // mutation createRoom
            {
                const actual = await roomMasterClient
                    .mutation<CreateRoomMutation, CreateRoomMutationVariables>(CreateRoomDocument, {
                        input: {
                            roomName: Resources.Room.name,
                            participantName: Resources.ParticipantName.master,
                            joinAsPlayerPhrase: Resources.Room.playerPassword,
                            joinAsSpectatorPhrase: Resources.Room.spectatorPassword,
                        },
                    })
                    .toPromise();
                const actualData = Assert.CreateRoomMutation.toBeSuccess(actual);
                roomId = actualData.id;
            }

            // because we have roomId, we can start subscriptions
            const {
                roomMasterClientSubscription,
                roomPlayer1ClientSubscription,
                roomPlayer2ClientSubscription,
                roomSpectatorClientSubscription,
                notJoinUserClientSubscription,
                allSubscriptions,
            } = clients.beginSubscriptions(roomId);

            // query getRoomsList
            {
                // # testing
                // - master can get the room
                const roomMasterResult = Assert.GetRoomsListQuery.toBeSuccess(
                    await GraphQL.getRoomsListQuery(roomMasterClient)
                );
                console.log('getRoomsList query result: %o', roomMasterResult);
                expect(roomMasterResult.rooms).toHaveLength(1);
                expect(roomMasterResult.rooms[0]!.id).toBe(roomId);

                // # testing
                // - another user can get the room
                const anotherUserResult = Assert.GetRoomsListQuery.toBeSuccess(
                    await GraphQL.getRoomsListQuery(roomPlayer1Client)
                );
                expect(anotherUserResult.rooms).toHaveLength(1);
                expect(anotherUserResult.rooms[0]!.id).toBe(roomId);

                allSubscriptions.clear();
            }

            // mutation joinRoomAsPlayer
            // これによりplayer1とplayer2がjoin
            {
                // # testing
                // - joining as a player with a corrent password should be success
                // - master should get a operation event (a participant was added)
                Assert.JoinRoomMutation.toBeSuccess(
                    await GraphQL.joinRoomAsPlayerMutation(roomPlayer1Client, {
                        id: roomId,
                        name: Resources.User.player1,
                        phrase: Resources.Room.playerPassword,
                    })
                );
                roomMasterClientSubscription.toBeExactlyOneRoomOperationEvent();
                roomPlayer1ClientSubscription.toBeEmpty();
                allSubscriptions
                    .except(roomMasterClientSubscription, roomPlayer1ClientSubscription)
                    .toBeEmpty();
                allSubscriptions.clear();

                // # testing
                // - joining as a player with no password should be failed
                // - no event should be observed
                Assert.JoinRoomMutation.toBeFailure(
                    await GraphQL.joinRoomAsPlayerMutation(roomPlayer2Client, {
                        id: roomId,
                        name: Resources.User.player2,
                        phrase: undefined,
                    })
                );
                allSubscriptions.toBeEmpty();

                // # testing
                // - joining as a player with a incorrent password should be failed
                // - no event should be observed
                Assert.JoinRoomMutation.toBeFailure(
                    await GraphQL.joinRoomAsPlayerMutation(roomPlayer2Client, {
                        id: roomId,
                        name: Resources.User.player2,
                        phrase: Resources.Room.spectatorPassword,
                    })
                );
                allSubscriptions.toBeEmpty();

                // # testing
                // - joining as a player with a corrent password should be success
                // - master and player1 should get a operation event
                Assert.JoinRoomMutation.toBeSuccess(
                    await GraphQL.joinRoomAsPlayerMutation(roomPlayer2Client, {
                        id: roomId,
                        name: Resources.User.player2,
                        phrase: Resources.Room.playerPassword,
                    })
                );

                roomMasterClientSubscription.toBeExactlyOneRoomOperationEvent();
                roomPlayer1ClientSubscription.toBeExactlyOneRoomOperationEvent();
                roomPlayer2ClientSubscription.toBeEmpty();
                allSubscriptions
                    .except(
                        roomMasterClientSubscription,
                        roomPlayer1ClientSubscription,
                        roomPlayer2ClientSubscription
                    )
                    .toBeEmpty();
                allSubscriptions.clear();
            }

            // mutation joinRoomAsSpectator
            // これによりspectatorがjoin
            {
                Assert.JoinRoomMutation.toBeFailure(
                    await GraphQL.joinRoomAsSpectatorMutation(roomSpectatorClient, {
                        id: roomId,
                        name: Resources.User.spectator,
                        phrase: undefined,
                    })
                );

                Assert.JoinRoomMutation.toBeFailure(
                    await GraphQL.joinRoomAsSpectatorMutation(roomSpectatorClient, {
                        id: roomId,
                        name: Resources.User.spectator,
                        phrase: Resources.Room.playerPassword,
                    })
                );

                Assert.JoinRoomMutation.toBeSuccess(
                    await GraphQL.joinRoomAsSpectatorMutation(roomSpectatorClient, {
                        id: roomId,
                        name: Resources.User.spectator,
                        phrase: Resources.Room.spectatorPassword,
                    })
                );

                allSubscriptions.clear();
            }

            // operateのテストに必要なため、現在のroomのrevisionを取得
            let initRoomRevision: number;
            {
                initRoomRevision = Assert.GetRoomQuery.toBeSuccess(
                    await GraphQL.getRoomQuery(roomPlayer1Client, {
                        id: roomId,
                    })
                ).room.revision;

                allSubscriptions.clear();
            }

            const requestId = 'P1_REQID'; // @MaxLength(10)であるため10文字以下にしている

            // operateのテスト（異常系 - 無効なJSON）
            {
                await Assert.OperateMutation.toBeFailure(
                    GraphQL.operateMutation(roomPlayer1Client, {
                        id: roomId,
                        requestId,
                        revisionFrom: initRoomRevision + 1,
                        operation: {
                            clientId: Resources.ClientId.player1,
                            valueJson: JSON.stringify({}),
                        },
                    }),
                    'GraphQL'
                );
            }

            // TODO: Room.valueのJSONの容量が上限を超えるようなOperationを送信したときのテスト。例えば単にnameの文字数を一度に大量に増やそうとするとApollo ServerによりPayload Too Largeエラーが返されるため、テストには一工夫必要か。

            // operateのテスト（正常系）
            const newRoomName = 'NEW_ROOM_NAME';
            {
                const operation: UpOperation = {
                    $v: 1,
                    $r: 2,
                    name: textDiff({ prev: Resources.Room.name, next: newRoomName }),
                };
                const operationResult = await Assert.OperateMutation.toBeSuccess(
                    GraphQL.operateMutation(roomPlayer1Client, {
                        id: roomId,
                        requestId,
                        revisionFrom: initRoomRevision,
                        operation: {
                            clientId: Resources.ClientId.player1,
                            valueJson: JSON.stringify(operation),
                        },
                    })
                );
                console.log('operate mutation result: %o', operationResult);
                expect(operationResult.operation.revisionTo).toBe(initRoomRevision + 1);
                const masterSubscriptionResult =
                    roomMasterClientSubscription.toBeExactlyOneRoomOperationEvent();
                expect(maskTypeNames(masterSubscriptionResult)).toEqual(
                    maskTypeNames(operationResult.operation)
                );
                const player2SubscriptionResult =
                    roomPlayer2ClientSubscription.toBeExactlyOneRoomOperationEvent();
                expect(maskTypeNames(player2SubscriptionResult)).toEqual(
                    maskTypeNames(operationResult.operation)
                );
                const spectatorSubscriptionResult =
                    roomSpectatorClientSubscription.toBeExactlyOneRoomOperationEvent();
                expect(maskTypeNames(spectatorSubscriptionResult)).toEqual(
                    maskTypeNames(operationResult.operation)
                );
                notJoinUserClientSubscription.toBeEmpty();
                allSubscriptions.clear();
            }

            // 秘話の投稿テスト
            {
                const text = 'TEXT';
                const visibleTo = [Resources.User.player1, Resources.User.player2];

                const privateMessage = Assert.WritePrivateMessageMutation.toBeSuccess(
                    await GraphQL.writePrivateMessageMutation(roomPlayer1Client, {
                        roomId,
                        text,
                        visibleTo,
                    })
                );
                roomMasterClientSubscription.toBeEmpty();
                const player2SubscriptionResult =
                    roomPlayer2ClientSubscription.toBeExactlyOneRoomPrivateMessageEvent();
                expect(player2SubscriptionResult).toEqual(privateMessage);
                roomSpectatorClientSubscription.toBeEmpty();
                notJoinUserClientSubscription.toBeEmpty();
                allSubscriptions.clear();
            }

            // DBに保存できているかどうかを確認するため、再度getRoomを実行
            {
                const room = Assert.GetRoomQuery.toBeSuccess(
                    await GraphQL.getRoomQuery(roomPlayer1Client, {
                        id: roomId,
                    })
                );
                console.log('getRoom query result: %o', room);

                expect(parseState(room.room.stateJson).name).toBe(newRoomName);
            }

            // 秘話などをDBに保存できているかどうかを確認するため、getMessagesを実行
            {
                const player1Messages = Assert.GetMessagesQuery.toBeSuccess(
                    await GraphQL.getMessagesQuery(roomPlayer1Client, {
                        roomId,
                    })
                );
                console.log('getMessages query result: %o', player1Messages);
                const player2Messages = Assert.GetMessagesQuery.toBeSuccess(
                    await GraphQL.getMessagesQuery(roomPlayer2Client, {
                        roomId,
                    })
                );

                expect(player1Messages.privateMessages).toHaveLength(1);
                expect(player1Messages.privateMessages).toEqual(player2Messages.privateMessages);
            }

            // mutation leaveRoom
            // これによりplayer2がleave
            {
                Assert.LeaveRoomMutation.toBeSuccess(
                    await GraphQL.leaveRoomMutation(roomPlayer1Client, {
                        id: roomId,
                    })
                );

                // TODO: subscriptionのテストコードを書く
                allSubscriptions.clear();
            }

            {
                Assert.DeleteRoomMutation.toBeNotCreatedByYou(
                    await GraphQL.deleteRoomMutation(roomPlayer1Client, {
                        id: roomId,
                    })
                );

                allSubscriptions.toBeEmpty();
                allSubscriptions.clear();
            }

            {
                Assert.DeleteRoomMutation.toBeSuccess(
                    await GraphQL.deleteRoomMutation(roomMasterClient, {
                        id: roomId,
                    })
                );

                // TODO: subscriptionのテストコードを書く
                allSubscriptions.clear();
            }

            // query getRoomsList
            {
                // # testing
                // - master cannot get any room
                const roomMasterResult = Assert.GetRoomsListQuery.toBeSuccess(
                    await GraphQL.getRoomsListQuery(roomMasterClient)
                );
                expect(roomMasterResult.rooms).toEqual([]);

                // # testing
                // - another user cannot get any room
                const anotherUserResult = Assert.GetRoomsListQuery.toBeSuccess(
                    await GraphQL.getRoomsListQuery(roomPlayer1Client)
                );
                expect(anotherUserResult.rooms).toEqual([]);

                allSubscriptions.clear();
            }

            server.close();
        },
        timeout
    );
});
