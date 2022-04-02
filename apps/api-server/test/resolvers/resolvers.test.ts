/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as $MikroORM from '../../src/graphql+mikro-orm/entities/room/mikro-orm';
import { EM } from '../../src/utils/types';
import { User as User$MikroORM } from '../../src/graphql+mikro-orm/entities/user/mikro-orm';
import { File as File$MikroORM } from '../../src/graphql+mikro-orm/entities/file/mikro-orm';
import { createOrm, createTestServer, DbConfig } from './utils/createTestServer';
import { Resources } from './utils/resources';
import {
    GetRoomsListQuery,
    CreateRoomMutation,
    JoinRoomAsPlayerMutation,
    JoinRoomAsSpectatorMutation,
    OperateMutation,
    GetRoomQuery,
    WritePrivateMessageMutation,
    LeaveRoomMutation,
    GetMessagesQuery,
    DeleteRoomMutation,
    DeleteRoomFailureType,
    GetFilesQuery,
    EditFileTagsMutation,
    CreateFileTagMutation,
    ParticipantRole,
    GetRoomFailureType,
    DeleteRoomAsAdminMutation,
    WritePublicMessageMutation,
    WriteRoomPublicMessageFailureType,
} from '@flocon-trpg/typed-document-node';
import { EntryToServerResultType } from '../../src/enums/EntryToServerResultType';
import { ServerConfig } from '../../src/configType';
import { UpOperation, parseState, $free } from '@flocon-trpg/core';
import axios from 'axios';
import FormData from 'form-data';
import urljoin from 'url-join';
import { readFileSync } from 'fs';
import { TextTwoWayOperation, TextUpOperation } from '@kizahasi/ot-string';
import { OperationResult } from '@urql/core';
import { maskTypeNames } from './utils/maskTypenames';
import { TestClients } from './utils/testClients';
import { isTruthyString, recordToArray } from '@flocon-trpg/utils';
import { TestClient } from './utils/testClient';

/*
To run tests in this file, you need to prepare SQLite and PostgreSQL. If you want to skip them, set TEST_SKIP_RESOLVERS env to "true".
*/

const TEST_SKIP_RESOLVERS = process.env.TEST_SKIP_RESOLVERS;
const skipResolvers = isTruthyString(TEST_SKIP_RESOLVERS);

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
        file.fileTags.getItems().forEach(x => em.remove(x));
        file.fileTags.removeAll();
        em.remove(file);
    }
    await em.flush();
};

const clearAllUsers = async (em: EM): Promise<void> => {
    for (const user of await em.find(User$MikroORM, {})) {
        await user.fileTags.init();
        user.fileTags.getItems().forEach(x => em.remove(x));
        user.fileTags.removeAll();
        await user.files.init();
        user.files.getItems().forEach(x => em.remove(x));
        user.files.removeAll();
        em.remove(user);
    }
    await em.flush();
};

const plainEntryPassword: ServerConfig['entryPassword'] = {
    type: 'plain',
    value: Resources.entryPassword,
};

const requestId = 'P1_REQID'; // @MaxLength(10)であるため10文字以下にしている

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
                console.error('failed at CreateRoomMutation.toBeSuccess', source);
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

    export namespace DeleteRoomAsAdminMutation {
        export const toBeSuccess = (source: OperationResult<DeleteRoomAsAdminMutation>) => {
            expect(source.data?.result.failureType ?? undefined).toBeUndefined();
        };

        export const toBeError = (source: OperationResult<DeleteRoomAsAdminMutation>) => {
            expect(source?.error).not.toBeUndefined();
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
                console.error('failed at GetMessagesQuery.toBeSuccess', source);
                expect(source.data?.result.__typename).toBe('RoomMessages');
                throw new Error('Guard');
            }
            return source.data.result;
        };

        export const toBeFailure = (source: OperationResult<GetMessagesQuery>) => {
            if (source.data?.result.__typename !== 'GetRoomMessagesFailureResult') {
                expect(source.data?.result.__typename).toBe('GetRoomMessagesFailureResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };
    }

    export namespace GetRoomsListQuery {
        export const toBeSuccess = (source: OperationResult<GetRoomsListQuery>) => {
            if (source.data?.result.__typename !== 'GetRoomsListSuccessResult') {
                console.error('failed at GetRoomsListQuery.toBeSuccess', source);
                expect(source.data?.result.__typename).toBe('GetRoomsListSuccessResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };
    }

    export namespace GetRoomQuery {
        export const toBeSuccess = (source: OperationResult<GetRoomQuery>) => {
            if (source.data?.result.__typename !== 'GetJoinedRoomResult') {
                console.error('failed at GetRoomQuery.toBeSuccess', source);
                expect(source.data?.result.__typename).toBe('GetJoinedRoomResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };

        export const toBeNonJoined = (source: OperationResult<GetRoomQuery>) => {
            if (source.data?.result.__typename !== 'GetNonJoinedRoomResult') {
                expect(source.data?.result.__typename).toBe('GetNonJoinedRoomResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };

        export const toBeNotFound = (source: OperationResult<GetRoomQuery>) => {
            if (source.data?.result.__typename !== 'GetRoomFailureResult') {
                expect(source.data?.result.__typename).toBe('GetRoomFailureResult');
                throw new Error('Guard');
            }
            expect(source.data.result.failureType).toBe(GetRoomFailureType.NotFound);
        };
    }

    export namespace JoinRoomMutation {
        export const toBeSuccess = (
            source: OperationResult<JoinRoomAsPlayerMutation | JoinRoomAsSpectatorMutation>
        ) => {
            if (source.data?.result.__typename !== 'JoinRoomSuccessResult') {
                console.error('failed at JoinRoomMutation.toBeSuccess', source);
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
                console.error('failed at OperateMutation.toBeSuccess', sourceResult);
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

    export namespace WritePublicMessageMutation {
        export const toBeSuccess = (source: OperationResult<WritePublicMessageMutation>) => {
            if (source.data?.result.__typename !== 'RoomPublicMessage') {
                expect(source.data?.result.__typename).toBe('RoomPublicMessage');
                throw new Error('Guard');
            }
            return source.data.result;
        };

        export const toBeFailure = (source: OperationResult<WritePublicMessageMutation>) => {
            if (source.data?.result.__typename !== 'WriteRoomPublicMessageFailureResult') {
                expect(source.data?.result.__typename).toBe('WriteRoomPublicMessageFailureResult');
                throw new Error('Guard');
            }
            return source.data.result.failureType;
        };
    }
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
] as const)(
    'tests of resolvers',
    (dbType, entryPasswordConfig) => {
        if (skipResolvers) {
            console.info('SKIPS resolver tests because `TEST_SKIP_RESOLVERS` is true');
            // これがないと、テストがないため失敗とみなされる
            test('FAKE-TEST', () => undefined);
            return;
        }
        afterEach(async () => {
            const orm = await createOrm(dbType);
            await clearAllRooms(orm.em.fork());
            await clearAllFiles(orm.em.fork());
            await clearAllUsers(orm.em.fork());
            await orm.close();
        });

        const entryPassword = entryPasswordConfig == null ? undefined : Resources.entryPassword;

        type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

        const useTestServer = async (
            {
                admins,
            }: {
                admins?: ServerConfig['admins'];
            },
            main: (server: Awaited<ReturnType<typeof createTestServer>>) => PromiseLike<void>
        ) => {
            const server = await createTestServer({
                dbConfig: dbType,
                entryPasswordConfig,
                admins,
            });
            try {
                await main(server);
            } finally {
                await server.close();
            }
        };

        const setupUsers = async <TUserUids extends ReadonlyArray<string>>({
            userUids,
            test,
        }: {
            userUids: TUserUids;
            test?: boolean;
        }) => {
            const clients = new TestClients({
                httpGraphQLUri,
                wsGraphQLUri,
                userUids,
            });

            if (entryPassword == null) {
                return clients;
            }

            for (const { value: client } of recordToArray(
                clients.clients as Record<string, TestClient>
            )) {
                const result = await client.entryToServerMutation({ password: entryPassword });
                if (test) {
                    expect(result.data?.result.type).toBe(EntryToServerResultType.Success);
                }
            }

            return clients;
        };

        const setupUsersAndRoom = async <
            TUserUids extends ReadonlyArray<string>,
            TRoomMaster extends TUserUids[number]
        >({
            userUids,
            roomMasterUserUid,
            autoJoin,
            roomName,
            roomMasterName,
            playerPassword,
            spectatorPassword,
        }: {
            userUids: TUserUids;
            roomMasterUserUid: TRoomMaster;
            autoJoin?: Omit<{ [key in TUserUids[number]]?: 'player' | 'spectator' }, TRoomMaster>;
            roomName?: string;
            roomMasterName?: string;
            playerPassword?: string;
            spectatorPassword?: string;
        }) => {
            const clients = await setupUsers({ userUids });
            const actual = await clients.clients[roomMasterUserUid].createRoomMutation({
                input: {
                    roomName: roomName ?? Resources.Room.name,
                    participantName: roomMasterName ?? Resources.Participant.Name.master,
                    playerPassword,
                    spectatorPassword,
                },
            });
            const actualData = Assert.CreateRoomMutation.toBeSuccess(actual);
            const roomId = actualData.id;
            let roomRevision = actualData.room.revision;

            if (autoJoin != null) {
                for (const userUid in autoJoin) {
                    const autoJoinValue = (autoJoin as Record<string, 'player' | 'spectator'>)[
                        userUid
                    ];
                    if (autoJoinValue == null) {
                        continue;
                    }
                    const client = (clients.clients as Record<string, TestClient>)[userUid];
                    if (client == null) {
                        throw new Error('this should not happen');
                    }
                    switch (autoJoinValue) {
                        case 'player':
                            await client.joinRoomAsPlayerMutation({
                                id: roomId,
                                name: 'test player',
                                password: playerPassword,
                            });
                            break;
                        case 'spectator':
                            await client.joinRoomAsSpectatorMutation({
                                id: roomId,
                                name: 'test spectator',
                                password: spectatorPassword,
                            });
                            break;
                        default:
                            throw new Error('this should not happen');
                    }
                    roomRevision++;
                }
            }

            return {
                roomId,
                roomRevision,
                clients: clients.clients,
                subscriptions: clients.beginSubscriptions(roomId),
            };
        };

        it('tests entry', async () => {
            await useTestServer({}, async () => {
                const userUids = ['TestsEntry'];
                await setupUsers({ userUids, test: true });
            });
        });

        it.each(['public', 'unlisted'] as const)(
            'tests upload and delete file in uploader',
            async publicOrUnlisted => {
                await useTestServer({}, async () => {
                    const userUid1 = 'User1';
                    const userUid2 = 'User2';
                    const userUids = [userUid1, userUid2] as const;
                    await setupUsers({ userUids, test: true });

                    const clients = new TestClients({
                        httpGraphQLUri,
                        wsGraphQLUri,
                        userUids,
                    });

                    const { [userUid1]: clientToUploadFiles, [userUid2]: anotherClient } =
                        clients.clients;

                    {
                        const formData = new FormData();
                        formData.append(
                            'file',
                            readFileSync(
                                './test/resolvers/pexels-public-domain-pictures-68147.jpg'
                            ),
                            {
                                filename: 'test-image.jpg',
                            }
                        );
                        const axiosConfig = {
                            headers: {
                                ...formData.getHeaders(),
                                [Resources.testAuthorizationHeader]: userUid1,
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
                            await clientToUploadFiles.getFilesQuery({ input: { fileTagIds: [] } })
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
                            await anotherClient.getFilesQuery({ input: { fileTagIds: [] } })
                        );
                        expect(filesResult).toHaveLength(publicOrUnlisted === 'public' ? 1 : 0);
                    }

                    const cases = [
                        ['files', userUid1],
                        ['files', userUid2],
                        ['thumbs', userUid1],
                        ['thumbs', userUid2],
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
                            await clientToUploadFiles.createFileTagMutation({
                                tagName: fileTagName,
                            })
                        );
                        expect(fileTagResult.name).toBe(fileTagName);
                        fileTagId = fileTagResult.id;
                    }

                    {
                        Assert.EditFileTagsMutation.toBeSuccess(
                            await clientToUploadFiles.editFileTagsMutation({
                                input: {
                                    actions: [{ filename, add: [fileTagId], remove: [] }],
                                },
                            })
                        );
                    }

                    {
                        const filesResult = Assert.GetFilesQuery.toBeSuccess(
                            await clientToUploadFiles.getFilesQuery({
                                input: { fileTagIds: [fileTagId] },
                            })
                        );
                        expect(filesResult).toHaveLength(1);
                    }

                    for (const client of [clientToUploadFiles, anotherClient]) {
                        {
                            const nonExistFileTagId = fileTagId + fileTagId;
                            const filesResult = Assert.GetFilesQuery.toBeSuccess(
                                await client.getFilesQuery({
                                    input: { fileTagIds: [nonExistFileTagId] },
                                })
                            );
                            expect(filesResult).toHaveLength(0);
                        }
                    }

                    {
                        // TODO: publicでアップロードしたファイルは、アップロード者以外による削除を可能にするかどうかがまだ決定していない
                        const actual = await clientToUploadFiles.deleteFilesMutation({
                            filenames: [filename],
                        });
                        expect(actual.data?.result).toEqual([filename]);
                    }

                    for (const client of [clientToUploadFiles, anotherClient]) {
                        const filesResult = Assert.GetFilesQuery.toBeSuccess(
                            await client.getFilesQuery({
                                input: { fileTagIds: [] },
                            })
                        );
                        expect(filesResult).toHaveLength(0);
                    }
                });
            }
        );

        it.each([
            [Resources.UserUid.admin, true],
            [Resources.UserUid.notAdmin, false],
        ] as const)('tests AmIAdmin', async (userUid, isAdmin) => {
            await useTestServer(
                {
                    admins: [Resources.UserUid.admin],
                },
                async () => {
                    const clients = await setupUsers({ userUids: [userUid] as const });
                    const client = clients.clients[userUid];

                    const result = await client.amIAdminQuery({});
                    expect(result.data?.result).toBe(isAdmin ? userUid : undefined);
                }
            );
        });

        it('tests getRoomsListQuery', async () => {
            await useTestServer({}, async () => {
                const userUids = [Resources.UserUid.master, Resources.UserUid.player1] as const;
                const { clients, roomId } = await setupUsersAndRoom({
                    userUids,
                    roomMasterUserUid: Resources.UserUid.master,
                });

                // - master can get the room
                const roomMasterResult = Assert.GetRoomsListQuery.toBeSuccess(
                    await clients[Resources.UserUid.master].getRoomsListQuery()
                );
                console.log('getRoomsList query result: %o', roomMasterResult);
                expect(roomMasterResult.rooms).toHaveLength(1);
                expect(roomMasterResult.rooms[0]!.id).toBe(roomId);

                // - another user can get the room
                const anotherUserResult = Assert.GetRoomsListQuery.toBeSuccess(
                    await clients[Resources.UserUid.player1].getRoomsListQuery()
                );
                expect(anotherUserResult.rooms).toHaveLength(1);
                expect(anotherUserResult.rooms[0]!.id).toBe(roomId);
            });
        });

        it.each([undefined, Resources.Room.spectatorPassword])(
            'tests joinRoomAsPlayer with an incorrect password',
            async spectatorPassword => {
                await useTestServer({}, async () => {
                    const userUids = [Resources.UserUid.master, Resources.UserUid.player1] as const;
                    const { clients, subscriptions, roomId } = await setupUsersAndRoom({
                        userUids,
                        roomMasterUserUid: Resources.UserUid.master,
                        playerPassword: Resources.Room.playerPassword,
                        spectatorPassword,
                    });
                    const incorrectPassword = 'INCORRECT_PASSWORD';
                    Assert.JoinRoomMutation.toBeFailure(
                        await clients[Resources.UserUid.player1].joinRoomAsPlayerMutation({
                            id: roomId,
                            name: Resources.Participant.Name.player1,
                            password: incorrectPassword,
                        })
                    );
                    subscriptions.all.toBeEmpty();
                    subscriptions.all.clear();
                });
            }
        );

        it.each([undefined, Resources.Room.playerPassword])(
            'tests joinRoomAsSpectator with an incorrect password',
            async playerPassword => {
                await useTestServer({}, async () => {
                    const userUids = [Resources.UserUid.master, Resources.UserUid.player1] as const;
                    const { clients, subscriptions, roomId } = await setupUsersAndRoom({
                        userUids,
                        roomMasterUserUid: Resources.UserUid.master,
                        playerPassword,
                        spectatorPassword: Resources.Room.spectatorPassword,
                    });
                    const incorrectPassword = 'INCORRECT_PASSWORD';
                    Assert.JoinRoomMutation.toBeFailure(
                        await clients[Resources.UserUid.player1].joinRoomAsSpectatorMutation({
                            id: roomId,
                            name: Resources.Participant.Name.player1,
                            password: incorrectPassword,
                        })
                    );
                    subscriptions.all.toBeEmpty();
                    subscriptions.all.clear();
                });
            }
        );

        describe.each([
            {
                playerPassword: undefined,
                spectatorPassword: undefined,
            },
            {
                playerPassword: Resources.Room.playerPassword,
                spectatorPassword: undefined,
            },
            {
                playerPassword: undefined,
                spectatorPassword: Resources.Room.spectatorPassword,
            },
            {
                playerPassword: Resources.Room.playerPassword,
                spectatorPassword: Resources.Room.spectatorPassword,
            },
        ])('room tests with correct passwords', ({ playerPassword, spectatorPassword }) => {
            describe('joinRoomAsPlayer and joinRoomAsSpectator mutations with correct password', () => {
                it('tests successful joinRoomAsPlayer -> second joinRoomAsPlayer', async () => {
                    await useTestServer({}, async () => {
                        const userUids = [
                            Resources.UserUid.master,
                            Resources.UserUid.player1,
                        ] as const;
                        const { clients, subscriptions, roomId } = await setupUsersAndRoom({
                            userUids,
                            roomMasterUserUid: Resources.UserUid.master,
                            playerPassword,
                            spectatorPassword,
                        });

                        Assert.JoinRoomMutation.toBeSuccess(
                            await clients[Resources.UserUid.player1].joinRoomAsPlayerMutation({
                                id: roomId,
                                name: Resources.Participant.Name.player1,
                                password: playerPassword,
                            })
                        );
                        subscriptions.value[
                            Resources.UserUid.master
                        ].toBeExactlyOneRoomOperationEvent();
                        subscriptions.value[Resources.UserUid.player1].toBeEmpty();
                        subscriptions.all.clear();

                        Assert.JoinRoomMutation.toBeFailure(
                            await clients[Resources.UserUid.player1].joinRoomAsPlayerMutation({
                                id: roomId,
                                name: Resources.Participant.Name.player1,
                                password: playerPassword,
                            })
                        );
                        subscriptions.all.toBeEmpty();
                        subscriptions.all.clear();
                    });
                });

                it('tests joinRoomAsSpectator -> joinRoomAsSpectator -> joinRoomAsPlayer', async () => {
                    await useTestServer({}, async () => {
                        const userUids = [
                            Resources.UserUid.master,
                            Resources.UserUid.player1,
                            Resources.UserUid.notJoin,
                        ] as const;
                        const { clients, subscriptions, roomId } = await setupUsersAndRoom({
                            userUids,
                            roomMasterUserUid: Resources.UserUid.master,
                            playerPassword,
                            spectatorPassword,
                        });

                        Assert.JoinRoomMutation.toBeSuccess(
                            await clients[Resources.UserUid.player1].joinRoomAsSpectatorMutation({
                                id: roomId,
                                name: Resources.Participant.Name.player1,
                                password: spectatorPassword,
                            })
                        );
                        subscriptions.value[
                            Resources.UserUid.master
                        ].toBeExactlyOneRoomOperationEvent();
                        subscriptions.value[Resources.UserUid.player1].toBeEmpty();
                        subscriptions.all.clear();

                        Assert.JoinRoomMutation.toBeFailure(
                            await clients[Resources.UserUid.player1].joinRoomAsSpectatorMutation({
                                id: roomId,
                                name: Resources.Participant.Name.player1,
                                password: spectatorPassword,
                            })
                        );
                        subscriptions.all.toBeEmpty();
                        subscriptions.all.clear();

                        Assert.JoinRoomMutation.toBeFailure(
                            await clients[Resources.UserUid.player1].joinRoomAsPlayerMutation({
                                id: roomId,
                                name: Resources.Participant.Name.player1,
                                password: playerPassword,
                            })
                        );
                        subscriptions.all.toBeEmpty();
                        subscriptions.all.clear();
                    });
                });
            });

            it('tests getRoom', async () => {
                await useTestServer({}, async () => {
                    const userUids = [
                        Resources.UserUid.master,
                        Resources.UserUid.player1,
                        Resources.UserUid.spectator1,
                        Resources.UserUid.notJoin,
                    ] as const;
                    const { clients, roomId } = await setupUsersAndRoom({
                        userUids,
                        roomMasterUserUid: Resources.UserUid.master,
                        playerPassword,
                        spectatorPassword,
                        autoJoin: {
                            [Resources.UserUid.player1]: 'player',
                            [Resources.UserUid.spectator1]: 'spectator',
                        },
                    });

                    const masterResult = Assert.GetRoomQuery.toBeSuccess(
                        await clients[Resources.UserUid.master].getRoomQuery({
                            id: roomId,
                        })
                    );
                    expect(masterResult.role).toBe(ParticipantRole.Master);

                    const player1Result = Assert.GetRoomQuery.toBeSuccess(
                        await clients[Resources.UserUid.player1].getRoomQuery({
                            id: roomId,
                        })
                    );
                    expect(player1Result.role).toBe(ParticipantRole.Player);

                    const spectatorResult = Assert.GetRoomQuery.toBeSuccess(
                        await clients[Resources.UserUid.spectator1].getRoomQuery({
                            id: roomId,
                        })
                    );
                    expect(spectatorResult.role).toBe(ParticipantRole.Spectator);

                    const nonJoinedResult = Assert.GetRoomQuery.toBeNonJoined(
                        await clients[Resources.UserUid.notJoin].getRoomQuery({
                            id: roomId,
                        })
                    );
                    expect(nonJoinedResult.roomAsListItem.id).toBe(roomId);
                });
            });

            describe('operate mutation', () => {
                // TODO: Room.valueのJSONの容量が上限を超えるようなOperationを送信したときのテスト。例えば単にnameの文字数を一度に大量に増やそうとするとApollo ServerによりPayload Too Largeエラーが返されるため、テストには一工夫必要か。

                it('tests a valid operation', async () => {
                    await useTestServer({}, async () => {
                        const userUids = [
                            Resources.UserUid.master,
                            Resources.UserUid.player1,
                            Resources.UserUid.player2,
                            Resources.UserUid.spectator1,
                            Resources.UserUid.notJoin,
                        ] as const;
                        const { clients, roomId, roomRevision, subscriptions } =
                            await setupUsersAndRoom({
                                userUids,
                                roomMasterUserUid: Resources.UserUid.master,
                                playerPassword,
                                spectatorPassword,
                                roomName: Resources.Room.name,
                                autoJoin: {
                                    [Resources.UserUid.player1]: 'player',
                                    [Resources.UserUid.player2]: 'player',
                                    [Resources.UserUid.spectator1]: 'spectator',
                                },
                            });

                        const newRoomName = 'NEW_ROOM_NAME';
                        const operation: UpOperation = {
                            $v: 2,
                            $r: 1,
                            name: textDiff({ prev: Resources.Room.name, next: newRoomName }),
                        };
                        const operationResult = await Assert.OperateMutation.toBeSuccess(
                            clients[Resources.UserUid.player1].operateMutation({
                                id: roomId,
                                requestId,
                                revisionFrom: roomRevision,
                                operation: {
                                    clientId: Resources.ClientId.player1,
                                    valueJson: JSON.stringify(operation),
                                },
                            })
                        );

                        expect(operationResult.operation.revisionTo).toBe(roomRevision + 1);
                        const masterSubscriptionResult =
                            subscriptions.value[
                                Resources.UserUid.master
                            ].toBeExactlyOneRoomOperationEvent();
                        expect(maskTypeNames(masterSubscriptionResult)).toEqual(
                            maskTypeNames(operationResult.operation)
                        );
                        const player2SubscriptionResult =
                            subscriptions.value[
                                Resources.UserUid.player2
                            ].toBeExactlyOneRoomOperationEvent();
                        expect(maskTypeNames(player2SubscriptionResult)).toEqual(
                            maskTypeNames(operationResult.operation)
                        );
                        const spectatorSubscriptionResult =
                            subscriptions.value[
                                Resources.UserUid.spectator1
                            ].toBeExactlyOneRoomOperationEvent();
                        expect(maskTypeNames(spectatorSubscriptionResult)).toEqual(
                            maskTypeNames(operationResult.operation)
                        );
                        subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();

                        const room = Assert.GetRoomQuery.toBeSuccess(
                            await clients[Resources.UserUid.player1].getRoomQuery({
                                id: roomId,
                            })
                        );
                        expect(parseState(room.room.stateJson).name).toBe(newRoomName);
                    });
                });

                it('tests with invalid JSON', async () => {
                    await useTestServer({}, async () => {
                        const userUids = [
                            Resources.UserUid.master,
                            Resources.UserUid.player1,
                            Resources.UserUid.spectator1,
                            Resources.UserUid.notJoin,
                        ] as const;
                        const { clients, roomId, roomRevision, subscriptions } =
                            await setupUsersAndRoom({
                                userUids,
                                roomMasterUserUid: Resources.UserUid.master,
                                playerPassword,
                                spectatorPassword,
                                autoJoin: {
                                    [Resources.UserUid.player1]: 'player',
                                    [Resources.UserUid.spectator1]: 'spectator',
                                },
                            });

                        const invalidJSON = JSON.stringify({});

                        await Assert.OperateMutation.toBeFailure(
                            clients[Resources.UserUid.player1].operateMutation({
                                id: roomId,
                                requestId,
                                revisionFrom: roomRevision + 1,
                                operation: {
                                    clientId: Resources.ClientId.player1,
                                    valueJson: invalidJSON,
                                },
                            }),
                            'GraphQL'
                        );

                        subscriptions.all.toBeEmpty();
                    });
                });
            });

            describe('writePublicMessage mutation', () => {
                describe.each(['1', '10'] as const)(`tests public channel`, channelKey => {
                    it.each([Resources.UserUid.master, Resources.UserUid.player2] as const)(
                        'tests as a master or player',
                        async author => {
                            await useTestServer({}, async () => {
                                const userUids = [
                                    author,
                                    Resources.UserUid.master,
                                    Resources.UserUid.player1,
                                    Resources.UserUid.spectator1,
                                    Resources.UserUid.notJoin,
                                ] as const;
                                const { clients, roomId, subscriptions } = await setupUsersAndRoom({
                                    userUids,
                                    roomMasterUserUid: Resources.UserUid.master,
                                    playerPassword,
                                    spectatorPassword,
                                    autoJoin: {
                                        [Resources.UserUid.player1]: 'player',
                                        [Resources.UserUid.player2]:
                                            author === Resources.UserUid.player2
                                                ? 'player'
                                                : undefined,
                                        [Resources.UserUid.spectator1]: 'spectator',
                                    },
                                });

                                const text = 'TEXT';

                                const messageResult = Assert.WritePublicMessageMutation.toBeSuccess(
                                    await clients[author].writePublicMessageMutation({
                                        roomId,
                                        text,
                                        channelKey,
                                    })
                                );
                                const eventAsAuthor =
                                    subscriptions.value[
                                        author
                                    ].toBeExactlyOneRoomPublicMessageEvent();
                                expect(eventAsAuthor).toEqual(messageResult);
                                const eventAsMaster =
                                    subscriptions.value[
                                        Resources.UserUid.master
                                    ].toBeExactlyOneRoomPublicMessageEvent();
                                expect(eventAsMaster).toEqual(messageResult);
                                const eventAsPlayer1 =
                                    subscriptions.value[
                                        Resources.UserUid.player1
                                    ].toBeExactlyOneRoomPublicMessageEvent();
                                expect(eventAsPlayer1).toEqual(messageResult);
                                const eventAsSpectator1 =
                                    subscriptions.value[
                                        Resources.UserUid.spectator1
                                    ].toBeExactlyOneRoomPublicMessageEvent();
                                expect(eventAsSpectator1).toEqual(messageResult);
                                subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();

                                const messagesAsAuthor = Assert.GetMessagesQuery.toBeSuccess(
                                    await clients[author].getMessagesQuery({
                                        roomId,
                                    })
                                );
                                expect(messagesAsAuthor.publicMessages).toHaveLength(1);
                                const messagesAsMaster = Assert.GetMessagesQuery.toBeSuccess(
                                    await clients[Resources.UserUid.master].getMessagesQuery({
                                        roomId,
                                    })
                                );
                                expect(messagesAsMaster.publicMessages).toEqual(
                                    messagesAsAuthor.publicMessages
                                );
                                const messagesAsPlayer1 = Assert.GetMessagesQuery.toBeSuccess(
                                    await clients[Resources.UserUid.player1].getMessagesQuery({
                                        roomId,
                                    })
                                );
                                expect(messagesAsPlayer1.publicMessages).toEqual(
                                    messagesAsAuthor.publicMessages
                                );
                                const messagesAsSpectator = Assert.GetMessagesQuery.toBeSuccess(
                                    await clients[Resources.UserUid.spectator1].getMessagesQuery({
                                        roomId,
                                    })
                                );
                                expect(messagesAsSpectator.publicMessages).toEqual(
                                    messagesAsAuthor.publicMessages
                                );
                            });
                        }
                    );

                    it('tests as a spectator', async () => {
                        await useTestServer({}, async () => {
                            const userUids = [
                                Resources.UserUid.master,
                                Resources.UserUid.player1,
                                Resources.UserUid.spectator1,
                                Resources.UserUid.spectator2,
                                Resources.UserUid.notJoin,
                            ] as const;
                            const { clients, roomId, subscriptions } = await setupUsersAndRoom({
                                userUids,
                                roomMasterUserUid: Resources.UserUid.master,
                                playerPassword,
                                spectatorPassword,
                                autoJoin: {
                                    [Resources.UserUid.player1]: 'player',
                                    [Resources.UserUid.spectator1]: 'spectator',
                                    [Resources.UserUid.spectator2]: 'spectator',
                                },
                            });

                            const text = 'TEXT';

                            Assert.WritePublicMessageMutation.toBeFailure(
                                await clients[
                                    Resources.UserUid.spectator1
                                ].writePublicMessageMutation({
                                    roomId,
                                    text,
                                    channelKey,
                                })
                            );
                            subscriptions.all.toBeEmpty();

                            const messagesAsAuthor = Assert.GetMessagesQuery.toBeSuccess(
                                await clients[Resources.UserUid.spectator1].getMessagesQuery({
                                    roomId,
                                })
                            );
                            expect(messagesAsAuthor.publicMessages).toHaveLength(0);
                            const messagesAsMaster = Assert.GetMessagesQuery.toBeSuccess(
                                await clients[Resources.UserUid.master].getMessagesQuery({
                                    roomId,
                                })
                            );
                            expect(messagesAsMaster.publicMessages).toHaveLength(0);
                            const messagesAsPlayer1 = Assert.GetMessagesQuery.toBeSuccess(
                                await clients[Resources.UserUid.player1].getMessagesQuery({
                                    roomId,
                                })
                            );
                            expect(messagesAsPlayer1.publicMessages).toHaveLength(0);
                            const messagesAsSpectator2 = Assert.GetMessagesQuery.toBeSuccess(
                                await clients[Resources.UserUid.spectator2].getMessagesQuery({
                                    roomId,
                                })
                            );
                            expect(messagesAsSpectator2.publicMessages).toHaveLength(0);
                        });
                    });
                });

                it.each([Resources.UserUid.player2, Resources.UserUid.spectator2] as const)(
                    `tests ${$free} channel`,
                    async author => {
                        await useTestServer({}, async () => {
                            const userUids = [
                                author,
                                Resources.UserUid.master,
                                Resources.UserUid.player1,
                                Resources.UserUid.spectator1,
                                Resources.UserUid.notJoin,
                            ] as const;
                            const { clients, roomId, subscriptions } = await setupUsersAndRoom({
                                userUids,
                                roomMasterUserUid: Resources.UserUid.master,
                                playerPassword,
                                spectatorPassword,
                                autoJoin: {
                                    [Resources.UserUid.player1]: 'player',
                                    [Resources.UserUid.player2]:
                                        author === Resources.UserUid.player2 ? 'player' : undefined,
                                    [Resources.UserUid.spectator1]: 'spectator',
                                    [Resources.UserUid.spectator2]:
                                        author === Resources.UserUid.spectator2
                                            ? 'spectator'
                                            : undefined,
                                },
                            });

                            const text = 'TEXT';

                            const messageResult = Assert.WritePublicMessageMutation.toBeSuccess(
                                await clients[author].writePublicMessageMutation({
                                    roomId,
                                    text,
                                    channelKey: $free,
                                })
                            );
                            const eventAsMaster =
                                subscriptions.value[
                                    Resources.UserUid.master
                                ].toBeExactlyOneRoomPublicMessageEvent();
                            expect(eventAsMaster).toEqual(messageResult);
                            const eventAsPlayer1 =
                                subscriptions.value[
                                    Resources.UserUid.player1
                                ].toBeExactlyOneRoomPublicMessageEvent();
                            expect(eventAsPlayer1).toEqual(messageResult);
                            const eventAsSpectator1 =
                                subscriptions.value[
                                    Resources.UserUid.spectator1
                                ].toBeExactlyOneRoomPublicMessageEvent();
                            expect(eventAsSpectator1).toEqual(messageResult);
                            subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();

                            const messagesAsAuthor = Assert.GetMessagesQuery.toBeSuccess(
                                await clients[author].getMessagesQuery({
                                    roomId,
                                })
                            );
                            expect(messagesAsAuthor.publicMessages).toHaveLength(1);
                            const messagesAsMaster = Assert.GetMessagesQuery.toBeSuccess(
                                await clients[Resources.UserUid.master].getMessagesQuery({
                                    roomId,
                                })
                            );
                            expect(messagesAsMaster.publicMessages).toEqual(
                                messagesAsAuthor.publicMessages
                            );
                            const messagesAsPlayer1 = Assert.GetMessagesQuery.toBeSuccess(
                                await clients[Resources.UserUid.player1].getMessagesQuery({
                                    roomId,
                                })
                            );
                            expect(messagesAsPlayer1.publicMessages).toEqual(
                                messagesAsAuthor.publicMessages
                            );
                            const messagesAsSpectator1 = Assert.GetMessagesQuery.toBeSuccess(
                                await clients[Resources.UserUid.spectator1].getMessagesQuery({
                                    roomId,
                                })
                            );
                            expect(messagesAsSpectator1.publicMessages).toEqual(
                                messagesAsAuthor.publicMessages
                            );
                        });
                    }
                );
            });

            describe('writePrivateMessage mutation', () => {
                it('should succeed', async () => {
                    await useTestServer({}, async () => {
                        const userUids = [
                            Resources.UserUid.master,
                            Resources.UserUid.player1,
                            Resources.UserUid.player2,
                            Resources.UserUid.spectator1,
                            Resources.UserUid.notJoin,
                        ] as const;
                        const { clients, roomId, subscriptions } = await setupUsersAndRoom({
                            userUids,
                            roomMasterUserUid: Resources.UserUid.master,
                            playerPassword,
                            spectatorPassword,
                            autoJoin: {
                                [Resources.UserUid.player1]: 'player',
                                [Resources.UserUid.player2]: 'player',
                                [Resources.UserUid.spectator1]: 'spectator',
                            },
                        });

                        const text = 'TEXT';
                        const visibleTo = [Resources.UserUid.player1, Resources.UserUid.player2];

                        const privateMessage = Assert.WritePrivateMessageMutation.toBeSuccess(
                            await clients[Resources.UserUid.player1].writePrivateMessageMutation({
                                roomId,
                                text,
                                visibleTo,
                            })
                        );
                        subscriptions.value[Resources.UserUid.master].toBeEmpty();
                        const player2SubscriptionResult =
                            subscriptions.value[
                                Resources.UserUid.player2
                            ].toBeExactlyOneRoomPrivateMessageEvent();
                        expect(player2SubscriptionResult).toEqual(privateMessage);
                        subscriptions.value[Resources.UserUid.spectator1].toBeEmpty();
                        subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();

                        const masterMessages = Assert.GetMessagesQuery.toBeSuccess(
                            await clients[Resources.UserUid.master].getMessagesQuery({
                                roomId,
                            })
                        );
                        expect(masterMessages.privateMessages).toHaveLength(0);
                        const player1Messages = Assert.GetMessagesQuery.toBeSuccess(
                            await clients[Resources.UserUid.player1].getMessagesQuery({
                                roomId,
                            })
                        );
                        expect(player1Messages.privateMessages).toHaveLength(1);
                        const player2Messages = Assert.GetMessagesQuery.toBeSuccess(
                            await clients[Resources.UserUid.player2].getMessagesQuery({
                                roomId,
                            })
                        );
                        expect(player2Messages.privateMessages).toEqual(
                            player1Messages.privateMessages
                        );
                        const spectatorMessages = Assert.GetMessagesQuery.toBeSuccess(
                            await clients[Resources.UserUid.spectator1].getMessagesQuery({
                                roomId,
                            })
                        );
                        expect(spectatorMessages.privateMessages).toHaveLength(0);
                    });
                });
            });

            describe('leaveRoom mutation', () => {
                it('should succeed', async () => {
                    await useTestServer({}, async () => {
                        const userUids = [
                            Resources.UserUid.master,
                            Resources.UserUid.player1,
                            Resources.UserUid.player2,
                            Resources.UserUid.spectator1,
                            Resources.UserUid.notJoin,
                        ] as const;
                        const { clients, roomId, subscriptions } = await setupUsersAndRoom({
                            userUids,
                            roomMasterUserUid: Resources.UserUid.master,
                            playerPassword,
                            spectatorPassword,
                            autoJoin: {
                                [Resources.UserUid.player1]: 'player',
                                [Resources.UserUid.player2]: 'player',
                                [Resources.UserUid.spectator1]: 'spectator',
                            },
                        });

                        Assert.LeaveRoomMutation.toBeSuccess(
                            await clients[Resources.UserUid.player1].leaveRoomMutation({
                                id: roomId,
                            })
                        );

                        subscriptions.value[
                            Resources.UserUid.master
                        ].toBeExactlyOneRoomOperationEvent();
                        subscriptions.value[
                            Resources.UserUid.player2
                        ].toBeExactlyOneRoomOperationEvent();
                        subscriptions.value[
                            Resources.UserUid.spectator1
                        ].toBeExactlyOneRoomOperationEvent();
                        subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();

                        const room = Assert.GetRoomQuery.toBeSuccess(
                            await clients[Resources.UserUid.master].getRoomQuery({
                                id: roomId,
                            })
                        );
                        expect(
                            parseState(room.room.stateJson).participants[Resources.UserUid.master]
                                ?.role
                        ).not.toBeUndefined();
                        expect(
                            parseState(room.room.stateJson).participants[Resources.UserUid.player1]
                                ?.role
                        ).toBeUndefined();
                        expect(
                            parseState(room.room.stateJson).participants[Resources.UserUid.player2]
                                ?.role
                        ).not.toBeUndefined();
                        expect(
                            parseState(room.room.stateJson).participants[
                                Resources.UserUid.spectator1
                            ]?.role
                        ).not.toBeUndefined();
                    });
                });
            });

            describe('deleteRoom mutation', () => {
                it('should succeed', async () => {
                    await useTestServer({}, async () => {
                        const userUids = [
                            Resources.UserUid.master,
                            Resources.UserUid.player1,
                            Resources.UserUid.spectator1,
                        ] as const;
                        const { clients, roomId, subscriptions } = await setupUsersAndRoom({
                            userUids,
                            roomMasterUserUid: Resources.UserUid.master,
                            playerPassword,
                            spectatorPassword,
                            autoJoin: {
                                [Resources.UserUid.player1]: 'player',
                                [Resources.UserUid.spectator1]: 'spectator',
                            },
                        });

                        Assert.DeleteRoomMutation.toBeSuccess(
                            await clients[Resources.UserUid.master].deleteRoomMutation({
                                id: roomId,
                            })
                        );

                        subscriptions.value[
                            Resources.UserUid.player1
                        ].toBeExactlyOneDeleteRoomEvent({
                            deletedBy: Resources.UserUid.master,
                        });
                        subscriptions.value[
                            Resources.UserUid.spectator1
                        ].toBeExactlyOneDeleteRoomEvent({
                            deletedBy: Resources.UserUid.master,
                        });

                        Assert.GetRoomQuery.toBeNotFound(
                            await clients[Resources.UserUid.master].getRoomQuery({
                                id: roomId,
                            })
                        );
                        Assert.GetRoomQuery.toBeNotFound(
                            await clients[Resources.UserUid.player1].getRoomQuery({
                                id: roomId,
                            })
                        );
                        Assert.GetRoomQuery.toBeNotFound(
                            await clients[Resources.UserUid.spectator1].getRoomQuery({
                                id: roomId,
                            })
                        );
                    });
                });

                it.each([
                    Resources.UserUid.player1,
                    Resources.UserUid.spectator1,
                    Resources.UserUid.notJoin,
                ] as const)('tests unauthorized mutations', async mutatedBy => {
                    await useTestServer({}, async () => {
                        const userUids = [
                            Resources.UserUid.master,
                            Resources.UserUid.player1,
                            Resources.UserUid.spectator1,
                            Resources.UserUid.notJoin,
                        ] as const;
                        const { clients, roomId, subscriptions } = await setupUsersAndRoom({
                            userUids,
                            roomMasterUserUid: Resources.UserUid.master,
                            playerPassword,
                            spectatorPassword,
                            autoJoin: {
                                [Resources.UserUid.player1]: 'player',
                                [Resources.UserUid.spectator1]: 'spectator',
                            },
                        });

                        Assert.DeleteRoomMutation.toBeNotCreatedByYou(
                            await clients[mutatedBy].deleteRoomMutation({
                                id: roomId,
                            })
                        );

                        subscriptions.all.toBeEmpty();

                        Assert.GetRoomQuery.toBeSuccess(
                            await clients[Resources.UserUid.master].getRoomQuery({
                                id: roomId,
                            })
                        );
                        Assert.GetRoomQuery.toBeSuccess(
                            await clients[Resources.UserUid.player1].getRoomQuery({
                                id: roomId,
                            })
                        );
                        Assert.GetRoomQuery.toBeSuccess(
                            await clients[Resources.UserUid.spectator1].getRoomQuery({
                                id: roomId,
                            })
                        );
                        Assert.GetRoomQuery.toBeNonJoined(
                            await clients[Resources.UserUid.notJoin].getRoomQuery({
                                id: roomId,
                            })
                        );
                    });
                });
            });

            describe('deleteRoomAsAdmin mutation', () => {
                it('should succeed', async () => {
                    await useTestServer({ admins: [Resources.UserUid.admin] }, async () => {
                        const userUids = [
                            Resources.UserUid.admin,
                            Resources.UserUid.notAdmin,
                            Resources.UserUid.master,
                            Resources.UserUid.player1,
                            Resources.UserUid.spectator1,
                        ] as const;
                        const { clients, roomId, subscriptions } = await setupUsersAndRoom({
                            userUids,
                            roomMasterUserUid: Resources.UserUid.master,
                            playerPassword,
                            spectatorPassword,
                            autoJoin: {
                                [Resources.UserUid.player1]: 'player',
                                [Resources.UserUid.spectator1]: 'spectator',
                            },
                        });

                        Assert.DeleteRoomAsAdminMutation.toBeSuccess(
                            await clients[Resources.UserUid.admin].deleteRoomAsAdminMutation({
                                id: roomId,
                            })
                        );

                        subscriptions.value[Resources.UserUid.master].toBeExactlyOneDeleteRoomEvent(
                            {
                                deletedBy: Resources.UserUid.admin,
                            }
                        );
                        subscriptions.value[
                            Resources.UserUid.player1
                        ].toBeExactlyOneDeleteRoomEvent({
                            deletedBy: Resources.UserUid.admin,
                        });
                        subscriptions.value[
                            Resources.UserUid.spectator1
                        ].toBeExactlyOneDeleteRoomEvent({
                            deletedBy: Resources.UserUid.admin,
                        });

                        Assert.GetRoomQuery.toBeNotFound(
                            await clients[Resources.UserUid.master].getRoomQuery({
                                id: roomId,
                            })
                        );
                        Assert.GetRoomQuery.toBeNotFound(
                            await clients[Resources.UserUid.player1].getRoomQuery({
                                id: roomId,
                            })
                        );
                        Assert.GetRoomQuery.toBeNotFound(
                            await clients[Resources.UserUid.spectator1].getRoomQuery({
                                id: roomId,
                            })
                        );
                        Assert.GetRoomQuery.toBeNotFound(
                            await clients[Resources.UserUid.admin].getRoomQuery({
                                id: roomId,
                            })
                        );
                        Assert.GetRoomQuery.toBeNotFound(
                            await clients[Resources.UserUid.notAdmin].getRoomQuery({
                                id: roomId,
                            })
                        );
                    });
                });

                it.each([
                    Resources.UserUid.master,
                    Resources.UserUid.player1,
                    Resources.UserUid.spectator1,
                    Resources.UserUid.notAdmin,
                ] as const)('tests unauthorized mutations', async mutatedBy => {
                    await useTestServer({}, async () => {
                        const userUids = [
                            Resources.UserUid.notAdmin,
                            Resources.UserUid.master,
                            Resources.UserUid.player1,
                            Resources.UserUid.spectator1,
                        ] as const;
                        const { clients, roomId, subscriptions } = await setupUsersAndRoom({
                            userUids,
                            roomMasterUserUid: Resources.UserUid.master,
                            playerPassword,
                            spectatorPassword,
                            autoJoin: {
                                [Resources.UserUid.player1]: 'player',
                                [Resources.UserUid.spectator1]: 'spectator',
                            },
                        });

                        Assert.DeleteRoomAsAdminMutation.toBeError(
                            await clients[mutatedBy].deleteRoomAsAdminMutation({
                                id: roomId,
                            })
                        );

                        subscriptions.all.toBeEmpty();

                        Assert.GetRoomQuery.toBeSuccess(
                            await clients[Resources.UserUid.master].getRoomQuery({
                                id: roomId,
                            })
                        );
                        Assert.GetRoomQuery.toBeSuccess(
                            await clients[Resources.UserUid.player1].getRoomQuery({
                                id: roomId,
                            })
                        );
                        Assert.GetRoomQuery.toBeSuccess(
                            await clients[Resources.UserUid.spectator1].getRoomQuery({
                                id: roomId,
                            })
                        );
                    });
                });
            });
        });
    },
    timeout
);
