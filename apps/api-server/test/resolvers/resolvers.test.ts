/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as $MikroORM from '../../src/graphql+mikro-orm/entities/room/mikro-orm';
import { EM } from '../../src/utils/types';
import { User as User$MikroORM } from '../../src/graphql+mikro-orm/entities/user/mikro-orm';
import { File as File$MikroORM } from '../../src/graphql+mikro-orm/entities/file/mikro-orm';
import { DbConfig, createOrm, createTestServer } from './utils/createTestServer';
import { Resources } from './utils/resources';
import {
    CreateFileTagMutation,
    CreateRoomMutation,
    DeleteMessageMutation,
    DeleteRoomAsAdminMutation,
    DeleteRoomFailureType,
    DeleteRoomMutation,
    EditFileTagsMutation,
    EditMessageMutation,
    GetFilesQuery,
    GetMessagesQuery,
    GetRoomFailureType,
    GetRoomQuery,
    GetRoomsListQuery,
    JoinRoomAsPlayerMutation,
    JoinRoomAsSpectatorMutation,
    LeaveRoomMutation,
    OperateMutation,
    ParticipantRole,
    RoomPublicMessageFragment,
    WritePrivateMessageMutation,
    WritePublicMessageMutation,
} from '@flocon-trpg/typed-document-node';
import { EntryToServerResultType } from '../../src/enums/EntryToServerResultType';
import { ServerConfig } from '../../src/configType';
import { $free, UpOperation as U, parseState, roomTemplate } from '@flocon-trpg/core';
import axios from 'axios';
import FormData from 'form-data';
import urljoin from 'url-join';
import { readFileSync } from 'fs';
import { diff, serializeUpOperation, toUpOperation } from '@kizahasi/ot-string';
import { OperationResult } from '@urql/core';
import { maskTypeNames } from './utils/maskTypenames';
import { TestClients } from './utils/testClients';
import { isFalsyString, recordToArray } from '@flocon-trpg/utils';
import { TestClient } from './utils/testClient';
import produce from 'immer';
import { doAutoMigrationBeforeStart } from '../../src/migrate';

type UpOperation = U<typeof roomTemplate>;

const timeout = 20000;
const timeout_beforeAll = 20000;
const timeout_afterEach = 20000;

jest.setTimeout(timeout);

// Dateのmillisecond部分が丸められる仕様のDBの場合でも、entity作成時のDateはflushの有無にかかわらず丸められない。このため、
const roundMilliSecondsInObject = (source: unknown): unknown => {
    const roundMilliSeconds = (i: number): number => {
        return Math.round(i / 1000) * 1000;
    };

    function core(source: unknown): void {
        if (Array.isArray(source)) {
            source.forEach(x => core(x));
            return;
        }

        if (typeof source !== 'object') {
            return;
        }
        if (source == null) {
            return;
        }

        for (const key in source) {
            if (key === 'createdAt' || key === 'updatedAt') {
                const value = (source as any)[key];
                if (typeof value === 'number') {
                    (source as any)[key] = roundMilliSeconds(value);
                    continue;
                }
            }
            core((source as any)[key]);
        }
    }

    return produce(source, core);
};

const textDiff = ({ prev, next }: { prev: string; next: string }) => {
    if (prev === next) {
        return undefined;
    }
    const d = diff({
        prevState: prev,
        nextState: next,
    });
    const upOperation = toUpOperation(d);
    return serializeUpOperation(upOperation);
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
                expect(source.data?.result.__typename).toBe('CreateRoomSuccessResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };
    }

    export namespace DeleteMessageMutation {
        export const toBeSuccess = (source: OperationResult<DeleteMessageMutation>) => {
            if (source.data?.result.__typename !== 'DeleteMessageResult') {
                expect(source.data?.result.__typename).toBe('DeleteMessageResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };

        export const toBeFailure = (source: OperationResult<DeleteMessageMutation>) => {
            const failureType = source.data?.result.failureType;
            if (failureType == null) {
                expect(source.data?.result.failureType).not.toBeFalsy();
                throw new Error('Guard');
            }
            return failureType;
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

    export namespace EditMessageMutation {
        export const toBeSuccess = (source: OperationResult<EditMessageMutation>) => {
            if (source.data?.result.__typename !== 'EditMessageResult') {
                expect(source.data?.result.__typename).toBe('EditMessageResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };

        export const toBeFailure = (source: OperationResult<EditMessageMutation>) => {
            const failureType = source.data?.result.failureType;
            if (failureType == null) {
                expect(source.data?.result.failureType).not.toBeFalsy();
                throw new Error('Guard');
            }
            return failureType;
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
const mysqlType: DbConfig = {
    type: 'MySQL',
};

const createCases = (): [DbConfig, ServerConfig['entryPassword'] | undefined][] => {
    const result: [DbConfig, ServerConfig['entryPassword'] | undefined][] = [];

    const SQLITE_TEST = process.env.SQLITE_TEST;
    if (isFalsyString(SQLITE_TEST)) {
        console.info('Skips SQLite tests because SQLITE_TEST env is falsy.');
    } else {
        result.push([sqlite1Type, undefined], [sqlite2Type, plainEntryPassword]);
    }

    const POSTGRESQL_TEST = process.env.POSTGRESQL_TEST;
    if (isFalsyString(POSTGRESQL_TEST)) {
        console.info('Skips PostgreSQL tests because POSTGRESQL_TEST env is falsy.');
    } else {
        result.push([postgresqlType, plainEntryPassword]);
    }

    const MYSQL_TEST = process.env.MYSQL_TEST;
    if (isFalsyString(MYSQL_TEST)) {
        console.info('Skips MySQL tests because MYSQL_TEST env is falsy.');
    } else {
        result.push([mysqlType, plainEntryPassword]);
    }

    return result;
};

const cases = createCases();

describe.each(cases)('tests of resolvers %p', (dbType, entryPasswordConfig) => {
    beforeAll(async () => {
        if (dbType.type !== 'SQLite') {
            return;
        }
        const orm = await createOrm(dbType);
        await doAutoMigrationBeforeStart(orm);
    }, timeout_beforeAll);

    afterEach(async () => {
        const orm = await createOrm(dbType);
        await clearAllRooms(orm.em.fork());
        await clearAllFiles(orm.em.fork());
        await clearAllUsers(orm.em.fork());
        await orm.close();
    }, timeout_afterEach);

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
                const autoJoinValue = (autoJoin as Record<string, 'player' | 'spectator'>)[userUid];
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
                        readFileSync('./test/resolvers/pexels-public-domain-pictures-68147.jpg'),
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
    ] as const)('tests getMyRoles', async (userUid, isAdmin) => {
        await useTestServer(
            {
                admins: [Resources.UserUid.admin],
            },
            async () => {
                const clients = await setupUsers({ userUids: [userUid] as const });
                const client = clients.clients[userUid];

                const result = await client.getMyRolesQuery({});
                expect(result.data?.result.admin).toBe(isAdmin);
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
                    const userUids = [Resources.UserUid.master, Resources.UserUid.player1] as const;
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

        it.each([
            {
                doEditTest: true,
                author: Resources.UserUid.master,
                channelKey: '1',
            },
            {
                doEditTest: false,
                author: Resources.UserUid.master,
                channelKey: '1',
            },
            {
                doEditTest: true,
                author: Resources.UserUid.player2,
                channelKey: '1',
            },
            {
                doEditTest: false,
                author: Resources.UserUid.player2,
                channelKey: '1',
            },
            {
                doEditTest: true,
                author: Resources.UserUid.master,
                channelKey: '10',
            },
            {
                doEditTest: false,
                author: Resources.UserUid.master,
                channelKey: '10',
            },
            {
                doEditTest: true,
                author: Resources.UserUid.player2,
                channelKey: '10',
            },
            {
                doEditTest: false,
                author: Resources.UserUid.player2,
                channelKey: '10',
            },
            {
                doEditTest: true,
                author: Resources.UserUid.master,
                channelKey: $free,
            },
            {
                doEditTest: false,
                author: Resources.UserUid.master,
                channelKey: $free,
            },
            {
                doEditTest: true,
                author: Resources.UserUid.player2,
                channelKey: $free,
            },
            {
                doEditTest: false,
                author: Resources.UserUid.player2,
                channelKey: $free,
            },
            {
                doEditTest: true,
                author: Resources.UserUid.spectator1,
                channelKey: $free,
            },
            {
                doEditTest: false,
                author: Resources.UserUid.spectator1,
                channelKey: $free,
            },
        ] as const)(
            'writePublicMessage -> edit -> delete mutation',
            async ({ doEditTest, author, channelKey }) => {
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
                        },
                    });

                    const text = 'TEXT';

                    let message: RoomPublicMessageFragment;

                    // writePublicMessageMutation
                    {
                        message = Assert.WritePublicMessageMutation.toBeSuccess(
                            await clients[author].writePublicMessageMutation({
                                roomId,
                                text,
                                channelKey,
                            })
                        );
                        expect(message.initText).toBe(text);
                        expect(
                            subscriptions.all
                                .except(Resources.UserUid.notJoin)
                                .distinct(x => x.toBeExactlyOneRoomPublicMessage())
                        ).toEqual(message);
                        subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();

                        for (const userUid of [
                            author,
                            Resources.UserUid.master,
                            Resources.UserUid.player1,
                            Resources.UserUid.spectator1,
                        ] as const) {
                            const messages = Assert.GetMessagesQuery.toBeSuccess(
                                await clients[userUid].getMessagesQuery({
                                    roomId,
                                })
                            );
                            expect(roundMilliSecondsInObject(messages.publicMessages)).toEqual(
                                roundMilliSecondsInObject([message])
                            );
                        }
                    }

                    // editMessageMutation
                    if (doEditTest) {
                        const editedText = 'EDITED_TEXT';
                        const editResult = Assert.EditMessageMutation.toBeSuccess(
                            await clients[author].editMessageMutation({
                                roomId,
                                text: editedText,
                                messageId: message.messageId,
                            })
                        );
                        expect(editResult.failureType).toBeFalsy();
                        const updatedMessage = subscriptions.all
                            .except(Resources.UserUid.notJoin)
                            .distinct(x => x.toBeExactlyOneRoomPublicMessage());
                        expect(updatedMessage.updatedText?.currentText).toBe(editedText);
                        expect({
                            ...updatedMessage,
                            updatedAt: undefined,
                            updatedText: undefined,
                        }).toEqual({
                            ...message,
                            updatedAt: undefined,
                            updatedText: undefined,
                        });
                        subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();
                    }

                    const deleteResult = Assert.DeleteMessageMutation.toBeSuccess(
                        await clients[author].deleteMessageMutation({
                            roomId,
                            messageId: message.messageId,
                        })
                    );
                    expect(deleteResult.failureType).toBeFalsy();
                    const deletedMessage = subscriptions.all
                        .except(Resources.UserUid.notJoin)
                        .distinct(x => x.toBeExactlyOneRoomPublicMessage());
                    expect(deletedMessage.updatedText?.currentText).toBeFalsy();
                    expect({
                        ...deletedMessage,
                        updatedAt: undefined,
                        updatedText: undefined,
                    }).toEqual({
                        ...message,
                        updatedAt: undefined,
                        updatedText: undefined,
                    });
                    subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();
                });
            }
        );

        it.each([
            {
                author: Resources.UserUid.master,
                channelKey: '0',
            },
            {
                author: Resources.UserUid.master,
                channelKey: '11',
            },
            {
                author: Resources.UserUid.spectator1,
                channelKey: '1',
            },
            {
                author: Resources.UserUid.notJoin,
                channelKey: '1',
            },
            {
                author: Resources.UserUid.notJoin,
                channelKey: $free,
            },
        ] as const)('tests invalid writePublicMessageMutation', async ({ author, channelKey }) => {
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
                    await clients[author].writePublicMessageMutation({
                        roomId,
                        text,
                        channelKey,
                    })
                );
                subscriptions.all.toBeEmpty();

                for (const userUid of [
                    Resources.UserUid.master,
                    Resources.UserUid.player1,
                    Resources.UserUid.spectator1,
                    Resources.UserUid.spectator2,
                ] as const) {
                    const messages = Assert.GetMessagesQuery.toBeSuccess(
                        await clients[userUid].getMessagesQuery({
                            roomId,
                        })
                    );
                    expect(messages.publicMessages).toHaveLength(0);
                }
            });
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
                        ].toBeExactlyOneRoomPrivateMessage();
                    expect(player2SubscriptionResult).toEqual(privateMessage);
                    subscriptions.value[Resources.UserUid.spectator1].toBeEmpty();
                    subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();

                    for (const userUid of [
                        Resources.UserUid.master,
                        Resources.UserUid.spectator1,
                    ] as const) {
                        const messages = Assert.GetMessagesQuery.toBeSuccess(
                            await clients[userUid].getMessagesQuery({
                                roomId,
                            })
                        );
                        expect(messages.privateMessages).toHaveLength(0);
                    }

                    for (const userUid of [
                        Resources.UserUid.player1,
                        Resources.UserUid.player2,
                    ] as const) {
                        const messages = Assert.GetMessagesQuery.toBeSuccess(
                            await clients[userUid].getMessagesQuery({
                                roomId,
                            })
                        );
                        expect(roundMilliSecondsInObject(messages.privateMessages)).toEqual(
                            roundMilliSecondsInObject([player2SubscriptionResult])
                        );
                    }
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

                    subscriptions.all
                        .except(Resources.UserUid.notJoin)
                        .distinct(s => s.toBeExactlyOneRoomOperationEvent());
                    subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();

                    const room = Assert.GetRoomQuery.toBeSuccess(
                        await clients[Resources.UserUid.master].getRoomQuery({
                            id: roomId,
                        })
                    );
                    expect(
                        parseState(room.room.stateJson).participants?.[Resources.UserUid.master]
                            ?.role
                    ).not.toBeUndefined();
                    expect(
                        parseState(room.room.stateJson).participants?.[Resources.UserUid.player1]
                            ?.role
                    ).toBeUndefined();
                    expect(
                        parseState(room.room.stateJson).participants?.[Resources.UserUid.player2]
                            ?.role
                    ).not.toBeUndefined();
                    expect(
                        parseState(room.room.stateJson).participants?.[Resources.UserUid.spectator1]
                            ?.role
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

                    subscriptions.value[Resources.UserUid.player1].toBeExactlyOneDeleteRoomEvent({
                        deletedBy: Resources.UserUid.master,
                    });
                    subscriptions.value[Resources.UserUid.spectator1].toBeExactlyOneDeleteRoomEvent(
                        {
                            deletedBy: Resources.UserUid.master,
                        }
                    );

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

                    subscriptions.value[Resources.UserUid.master].toBeExactlyOneDeleteRoomEvent({
                        deletedBy: Resources.UserUid.admin,
                    });
                    subscriptions.value[Resources.UserUid.player1].toBeExactlyOneDeleteRoomEvent({
                        deletedBy: Resources.UserUid.admin,
                    });
                    subscriptions.value[Resources.UserUid.spectator1].toBeExactlyOneDeleteRoomEvent(
                        {
                            deletedBy: Resources.UserUid.admin,
                        }
                    );

                    for (const userUid of userUids) {
                        Assert.GetRoomQuery.toBeNotFound(
                            await clients[userUid].getRoomQuery({
                                id: roomId,
                            })
                        );
                    }
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

                    for (const userUid of [
                        Resources.UserUid.master,
                        Resources.UserUid.player1,
                        Resources.UserUid.spectator1,
                    ] as const) {
                        Assert.GetRoomQuery.toBeSuccess(
                            await clients[userUid].getRoomQuery({
                                id: roomId,
                            })
                        );
                    }
                });
            });
        });
    });
});
