import '../beforeAllGlobal';
import { readFileSync } from 'fs';
import { $free, UpOperation as U, parseState, roomTemplate } from '@flocon-trpg/core';
import {
    CreateFileTagMutation,
    CreateRoomMutation,
    DeleteMessageMutation,
    DeleteRoomFailureType,
    DeleteRoomMutation,
    EditFileTagsMutation,
    EditMessageMutation,
    GetFilesQuery,
    GetMessagesQuery,
    JoinRoomAsPlayerMutation,
    JoinRoomAsSpectatorMutation,
    LeaveRoomMutation,
    MakeMessageNotSecretMutation,
    OperateMutation,
    ParticipantRole,
    RoomPublicMessageFragment,
    WritePrivateMessageMutation,
    WritePublicMessageMutation,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import {
    DeleteRoomAsAdminMutation,
    GetRoomFailureType,
    GetRoomQuery,
    GetRoomsListQuery,
    UpdateBookmarkMutation,
} from '@flocon-trpg/typed-document-node-v0.7.2';
import { loggerRef, parseStringToBoolean, recordToArray } from '@flocon-trpg/utils';
import { diff, serializeUpOperation, toUpOperation } from '@kizahasi/ot-string';
import { OperationResult } from '@urql/core';
import FormData from 'form-data';
import { produce } from 'immer';
import fetch from 'node-fetch';
import urljoin from 'url-join';
import { ServerConfig } from '../../src/config/types';
import { File as File$MikroORM } from '../../src/entities/file/entity';
import * as $MikroORM from '../../src/entities/room/entity';
import { User as User$MikroORM } from '../../src/entities/user/entity';
import { EntryToServerResultType } from '../../src/enums/EntryToServerResultType';
import { doAutoMigrationBeforeStart } from '../../src/migrate';
import { EM } from '../../src/types';
import { DbConfig, createOrm, createTestServer } from './utils/createTestServer';
import { sqlite1DbName, sqlite2DbName } from './utils/databaseConfig';
import { maskKeys, maskTypeNames } from './utils/maskKeys';
import { Resources } from './utils/resources';
import { TestClient } from './utils/testClient';
import { TestClients } from './utils/testClients';

type UpOperation = U<typeof roomTemplate>;

const timeout = 20000;
const timeout_beforeAll = 20000;
const timeout_afterEach = 20000;

jest.setTimeout(timeout);

// Dateのmillisecond部分が丸められる仕様のDBの場合でも、entity作成時のDateはflushの有無にかかわらず丸められない。このため、その差があってもテストがパスするようにしている。
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
                expect(source.error).toBeFalsy();
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
                throw new Error(source.error?.message);
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
                expect(source.error).toBeFalsy();
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

    export namespace MakeMessageNotSecretMutation {
        export const toBeSuccess = (source: OperationResult<MakeMessageNotSecretMutation>) => {
            expect(source.data?.result.failureType ?? undefined).toBeUndefined();
        };

        export const toBeFailure = (source: OperationResult<MakeMessageNotSecretMutation>) => {
            if (source.data?.result.failureType == null) {
                expect(source.data?.result.failureType ?? undefined).not.toBeUndefined();
                throw new Error('Guard');
            }
            return source.data.result.failureType;
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

    export namespace UpdateBookmarkMutation {
        export const toBeSuccess = (source: OperationResult<UpdateBookmarkMutation>) => {
            if (source.data?.result.__typename !== 'UpdateBookmarkSuccessResult') {
                expect(source.data?.result.__typename).toBe('UpdateBookmarkSuccessResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };

        export const toBeFailure = (source: OperationResult<UpdateBookmarkMutation>) => {
            if (source.data?.result.__typename !== 'UpdateBookmarkFailureResult') {
                expect(source.data?.result.__typename).toBe('UpdateBookmarkFailureResult');
                throw new Error('Guard');
            }
            return source.data.result.failureType;
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
    dbName: sqlite1DbName,
};
const sqlite2Type: DbConfig = {
    type: 'SQLite',
    dbName: sqlite2DbName,
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
    if (parseStringToBoolean(SQLITE_TEST).value === false) {
        loggerRef.info('Skips SQLite tests because SQLITE_TEST env is falsy.');
    } else {
        result.push([sqlite1Type, undefined], [sqlite2Type, plainEntryPassword]);
    }

    const POSTGRESQL_TEST = process.env.POSTGRESQL_TEST;
    if (parseStringToBoolean(POSTGRESQL_TEST).value === false) {
        loggerRef.info('Skips PostgreSQL tests because POSTGRESQL_TEST env is falsy.');
    } else {
        result.push([postgresqlType, plainEntryPassword]);
    }

    const MYSQL_TEST = process.env.MYSQL_TEST;
    if (parseStringToBoolean(MYSQL_TEST).value === false) {
        loggerRef.info('Skips MySQL tests because MYSQL_TEST env is falsy.');
    } else {
        result.push([mysqlType, plainEntryPassword]);
    }

    return result;
};

const cases = createCases();

type SystemTimeType = 1 | 2 | 3 | 4;
class SystemTimeManager {
    public constructor(private readonly enableFake: boolean) {}

    #systemTime1 = new Date(2025, 1, 1, 0, 1, 0);
    #systemTime2 = new Date(2025, 1, 1, 0, 1, 10);
    #systemTime3 = new Date(2025, 1, 1, 0, 1, 20);
    #systemTime4 = new Date(2025, 1, 1, 0, 1, 30);

    public expect(actual: number | null | undefined, acceptNullish?: 'acceptNullish') {
        return {
            toBeCloseToSystemTimeType: (expected: SystemTimeType) => {
                if (acceptNullish && actual == null) {
                    return;
                }
                const expectedTime = this.get(expected).getTime();
                expect(actual).toBeGreaterThanOrEqual(expectedTime - 2000);
                expect(actual).toBeLessThanOrEqual(expectedTime + 2000);
            },
        };
    }

    public get(pattern: SystemTimeType): Date {
        if (!this.enableFake) {
            return new Date();
        }
        switch (pattern) {
            case 1:
                return this.#systemTime1;
            case 2:
                return this.#systemTime2;
            case 3:
                return this.#systemTime3;
            case 4:
                return this.#systemTime4;
        }
    }

    public set(pattern: SystemTimeType): void {
        if (!this.enableFake) {
            return;
        }
        jest.setSystemTime(this.get(pattern));
    }

    public useFakeTimers() {
        if (this.enableFake) {
            jest.useFakeTimers();
        }
    }

    public useRealTimers() {
        if (this.enableFake) {
            jest.useRealTimers();
        }
    }
}

class CompositeDisposable {
    #disposables: (() => void | Promise<void>)[] = [];
    public add(disposable: () => void | Promise<void>) {
        this.#disposables.push(disposable);
    }

    public async dispose() {
        for (const d of this.#disposables) {
            await d();
        }
    }
}

describe.each(cases)('tests of resolvers %o', (dbType, entryPasswordConfig) => {
    // MySQLではjest.useFakeTimersの相性が悪い（DBにアクセスする際にフリーズする）ようなので無効化している
    const systemTimeManager = new SystemTimeManager(dbType.type !== 'MySQL');

    beforeAll(async () => {
        if (dbType.type !== 'SQLite') {
            return;
        }
        const orm = await createOrm(dbType);
        await doAutoMigrationBeforeStart(orm);
        await orm.close();
    }, timeout_beforeAll);

    // もし前回実行したテストが失敗している場合はゴミが残っているため、afterEachではなくbeforeEachを用いている。
    beforeEach(async () => {
        systemTimeManager.useFakeTimers();

        const orm = await createOrm(dbType);
        await clearAllRooms(orm.em.fork());
        await clearAllFiles(orm.em.fork());
        await clearAllUsers(orm.em.fork());
        await orm.close();
    }, timeout_afterEach);

    afterEach(() => {
        systemTimeManager.useRealTimers();
    });

    const entryPassword = entryPasswordConfig == null ? undefined : Resources.entryPassword;

    const useTestServer = async (
        {
            admins,
        }: {
            admins?: ServerConfig['admins'];
        },
        main: (params: {
            server: Awaited<ReturnType<typeof createTestServer>>;
            onFinally: Omit<CompositeDisposable, 'dispose'>;
        }) => PromiseLike<void>
    ) => {
        const onFinally = new CompositeDisposable();
        const server = await createTestServer({
            dbConfig: dbType,
            entryPasswordConfig,
            admins,
        });
        try {
            await main({ server, onFinally });
        } finally {
            await onFinally.dispose();
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
            /* jest.useFakeTimers() を有効にしてからmulterを利用しようとするとフリーズする。 https://github.com/expressjs/multer/issues/558
               このテストではmulterが実行されるため、jest.useFakeTimersを無効化している。*/
            systemTimeManager.useRealTimers();

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
                    const postResult = await fetch(
                        urljoin(httpUri, 'uploader', 'upload', publicOrUnlisted),
                        {
                            method: 'POST',
                            headers: {
                                [Resources.testAuthorizationHeader]: userUid1,
                            },
                            body: formData,
                        }
                    )
                        .then(r => r.ok)
                        .catch(err => err);
                    expect(postResult).toBe(true);
                }

                let filename: string;
                let thumbFilename: string | null | undefined;
                {
                    const filesResult = Assert.GetFilesQuery.toBeSuccess(
                        await clientToUploadFiles.getFilesQuery({ input: { fileTagIds: [] } })
                    );
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
                    const axiosResult = await fetch(
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
                        .then(r => r.ok)
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

                const newScreenname = 'new-screenname.png';
                {
                    const actual = await clientToUploadFiles.renameFilesMutation({
                        input: [
                            {
                                filename,
                                newScreenname,
                            },
                        ],
                    });
                    expect(actual.data?.result).toEqual([filename]);
                }

                {
                    const filesResult = Assert.GetFilesQuery.toBeSuccess(
                        await clientToUploadFiles.getFilesQuery({ input: { fileTagIds: [] } })
                    );
                    expect(filesResult).toHaveLength(1);
                    expect(filesResult[0]?.filename).toBe(filename);
                    expect(filesResult[0]?.screenname).toBe(newScreenname);
                }

                {
                    const filesResult = Assert.GetFilesQuery.toBeSuccess(
                        await anotherClient.getFilesQuery({ input: { fileTagIds: [] } })
                    );
                    expect(filesResult).toHaveLength(publicOrUnlisted === 'public' ? 1 : 0);
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
        await useTestServer({}, async ({ onFinally }) => {
            systemTimeManager.set(1);

            const userUids = [Resources.UserUid.master, Resources.UserUid.player1] as const;
            const roomName = 'TEST_ROOM';
            const { clients, roomId, subscriptions } = await setupUsersAndRoom({
                userUids,
                roomMasterUserUid: Resources.UserUid.master,
                roomName,
            });
            onFinally.add(() => subscriptions.all.unsubscribe());

            // - master can get the room
            const roomMasterResult = Assert.GetRoomsListQuery.toBeSuccess(
                await clients[Resources.UserUid.master].getRoomsListQuery()
            );
            loggerRef.trace({ roomMasterResult }, 'getRoomsList query result');
            expect(roomMasterResult.rooms).toHaveLength(1);
            expect(roomMasterResult.rooms[0]!.id).toBe(roomId);
            expect(roomMasterResult.rooms[0]!.name).toBe(roomName);
            expect(roomMasterResult.rooms[0]!.createdAt).toBeTruthy();
            expect(roomMasterResult.rooms[0]!.role).toBe(ParticipantRole.Master);
            expect(roomMasterResult.rooms[0]!.isBookmarked).toBe(false);
            systemTimeManager
                .expect(roomMasterResult.rooms[0]!.createdAt)
                .toBeCloseToSystemTimeType(1);
            systemTimeManager
                .expect(roomMasterResult.rooms[0]!.updatedAt, 'acceptNullish')
                .toBeCloseToSystemTimeType(1);

            // - another user can get the room
            const anotherUserResult = Assert.GetRoomsListQuery.toBeSuccess(
                await clients[Resources.UserUid.player1].getRoomsListQuery()
            );
            expect(anotherUserResult.rooms[0]!.role).toBeFalsy();
            expect(maskKeys(anotherUserResult.rooms, ['role'])).toEqual(
                maskKeys(roomMasterResult.rooms, ['role'])
            );
        });
    });

    it.each([undefined, Resources.Room.spectatorPassword])(
        'tests joinRoomAsPlayer with an incorrect password',
        async spectatorPassword => {
            await useTestServer({}, async ({ onFinally }) => {
                const userUids = [Resources.UserUid.master, Resources.UserUid.player1] as const;
                const { clients, subscriptions, roomId } = await setupUsersAndRoom({
                    userUids,
                    roomMasterUserUid: Resources.UserUid.master,
                    playerPassword: Resources.Room.playerPassword,
                    spectatorPassword,
                });
                onFinally.add(() => subscriptions.all.unsubscribe());

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
            await useTestServer({}, async ({ onFinally }) => {
                const userUids = [Resources.UserUid.master, Resources.UserUid.player1] as const;
                const { clients, subscriptions, roomId } = await setupUsersAndRoom({
                    userUids,
                    roomMasterUserUid: Resources.UserUid.master,
                    playerPassword,
                    spectatorPassword: Resources.Room.spectatorPassword,
                });
                onFinally.add(() => subscriptions.all.unsubscribe());

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
    ])('room tests with correct passwords: %o', ({ playerPassword, spectatorPassword }) => {
        it('updateBookmark mutation', async () => {
            await useTestServer({}, async ({ onFinally }) => {
                const userUids = [Resources.UserUid.master, Resources.UserUid.player1] as const;
                const {
                    clients,
                    roomId: room1Id,
                    subscriptions,
                } = await setupUsersAndRoom({
                    userUids,
                    roomMasterUserUid: Resources.UserUid.master,
                    playerPassword,
                    spectatorPassword,
                    autoJoin: { [Resources.UserUid.player1]: 'player' },
                });
                onFinally.add(() => subscriptions.all.unsubscribe());

                const anotherRoom = await clients[Resources.UserUid.master].createRoomMutation({
                    input: { participantName: '', roomName: '' },
                });
                const { id: room2Id } = Assert.CreateRoomMutation.toBeSuccess(anotherRoom);

                const testRooms = async ({
                    room1ValueAsMaster,
                    room2ValueAsMaster,
                    room1ValueAsPlayer,
                    room2ValueAsPlayer,
                }: {
                    room1ValueAsMaster: boolean;
                    room2ValueAsMaster: boolean;
                    room1ValueAsPlayer: boolean;
                    room2ValueAsPlayer: boolean;
                }) => {
                    const room1AsMaster = Assert.GetRoomQuery.toBeSuccess(
                        await clients[Resources.UserUid.master].getRoomQuery({ id: room1Id })
                    );
                    const room2AsMaster = Assert.GetRoomQuery.toBeSuccess(
                        await clients[Resources.UserUid.master].getRoomQuery({ id: room2Id })
                    );
                    const room1AsPlayer = Assert.GetRoomQuery.toBeSuccess(
                        await clients[Resources.UserUid.player1].getRoomQuery({ id: room1Id })
                    );
                    expect(room1AsMaster.room.isBookmarked).toBe(room1ValueAsMaster);
                    expect(room2AsMaster.room.isBookmarked).toBe(room2ValueAsMaster);
                    expect(room1AsPlayer.room.isBookmarked).toBe(room1ValueAsPlayer);

                    const roomsListAsMaster = Assert.GetRoomsListQuery.toBeSuccess(
                        await clients[Resources.UserUid.master].getRoomsListQuery()
                    );
                    const roomsListAsPlayer = Assert.GetRoomsListQuery.toBeSuccess(
                        await clients[Resources.UserUid.player1].getRoomsListQuery()
                    );
                    expect(roomsListAsMaster.rooms.find(r => r.id === room1Id)?.isBookmarked).toBe(
                        room1ValueAsMaster
                    );
                    expect(roomsListAsMaster.rooms.find(r => r.id === room2Id)?.isBookmarked).toBe(
                        room2ValueAsMaster
                    );
                    expect(roomsListAsPlayer.rooms.find(r => r.id === room1Id)?.isBookmarked).toBe(
                        room1ValueAsPlayer
                    );
                    expect(roomsListAsPlayer.rooms.find(r => r.id === room2Id)?.isBookmarked).toBe(
                        room2ValueAsPlayer
                    );
                };

                // bookmark room1
                {
                    const bookmarked = Assert.UpdateBookmarkMutation.toBeSuccess(
                        await clients[Resources.UserUid.master].updateBookmarkMutation({
                            roomId: room1Id,
                            newValue: true,
                        })
                    );
                    expect(bookmarked.prevValue).toBe(false);
                    expect(bookmarked.currentValue).toBe(true);

                    await testRooms({
                        room1ValueAsMaster: true,
                        room2ValueAsMaster: false,
                        room1ValueAsPlayer: false,
                        room2ValueAsPlayer: false,
                    });
                }

                // bookmark room1 again
                {
                    const bookmarked = Assert.UpdateBookmarkMutation.toBeSuccess(
                        await clients[Resources.UserUid.master].updateBookmarkMutation({
                            roomId: room1Id,
                            newValue: true,
                        })
                    );
                    expect(bookmarked.prevValue).toBe(true);
                    expect(bookmarked.currentValue).toBe(true);

                    await testRooms({
                        room1ValueAsMaster: true,
                        room2ValueAsMaster: false,
                        room1ValueAsPlayer: false,
                        room2ValueAsPlayer: false,
                    });
                }

                // bookmark not found room to expect failure
                {
                    Assert.UpdateBookmarkMutation.toBeFailure(
                        await clients[Resources.UserUid.master].updateBookmarkMutation({
                            roomId: 'invalidroomid',
                            newValue: true,
                        })
                    );

                    await testRooms({
                        room1ValueAsMaster: true,
                        room2ValueAsMaster: false,
                        room1ValueAsPlayer: false,
                        room2ValueAsPlayer: false,
                    });
                }

                // remove room1 bookmark
                {
                    const bookmarked = Assert.UpdateBookmarkMutation.toBeSuccess(
                        await clients[Resources.UserUid.master].updateBookmarkMutation({
                            roomId: room1Id,
                            newValue: false,
                        })
                    );
                    expect(bookmarked.prevValue).toBe(true);
                    expect(bookmarked.currentValue).toBe(false);

                    await testRooms({
                        room1ValueAsMaster: false,
                        room2ValueAsMaster: false,
                        room1ValueAsPlayer: false,
                        room2ValueAsPlayer: false,
                    });
                }

                // remove room1 bookmark again
                {
                    const bookmarked = Assert.UpdateBookmarkMutation.toBeSuccess(
                        await clients[Resources.UserUid.master].updateBookmarkMutation({
                            roomId: room1Id,
                            newValue: false,
                        })
                    );
                    expect(bookmarked.prevValue).toBe(false);
                    expect(bookmarked.currentValue).toBe(false);

                    await testRooms({
                        room1ValueAsMaster: false,
                        room2ValueAsMaster: false,
                        room1ValueAsPlayer: false,
                        room2ValueAsPlayer: false,
                    });
                }
            });
        });

        describe('joinRoomAsPlayer and joinRoomAsSpectator mutations with correct password', () => {
            it('tests successful joinRoomAsPlayer -> second joinRoomAsPlayer', async () => {
                await useTestServer({}, async ({ onFinally }) => {
                    const userUids = [Resources.UserUid.master, Resources.UserUid.player1] as const;
                    const { clients, subscriptions, roomId } = await setupUsersAndRoom({
                        userUids,
                        roomMasterUserUid: Resources.UserUid.master,
                        playerPassword,
                        spectatorPassword,
                    });
                    onFinally.add(() => subscriptions.all.unsubscribe());

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
                await useTestServer({}, async ({ onFinally }) => {
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
                    onFinally.add(() => subscriptions.all.unsubscribe());

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
            systemTimeManager.set(1);

            await useTestServer({}, async ({ onFinally }) => {
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
                onFinally.add(() => subscriptions.all.unsubscribe());

                const masterResult = Assert.GetRoomQuery.toBeSuccess(
                    await clients[Resources.UserUid.master].getRoomQuery({
                        id: roomId,
                    })
                );
                expect(masterResult.role).toBe(ParticipantRole.Master);
                expect(masterResult.room.createdAt).toBeTruthy();
                systemTimeManager
                    .expect(masterResult.room.updatedAt, 'acceptNullish')
                    .toBeCloseToSystemTimeType(1);
                const player1Result = Assert.GetRoomQuery.toBeSuccess(
                    await clients[Resources.UserUid.player1].getRoomQuery({
                        id: roomId,
                    })
                );
                expect(player1Result.role).toBe(ParticipantRole.Player);
                expect(maskKeys(player1Result, ['stateJson', 'role', 'isBookmarked'])).toEqual(
                    maskKeys(masterResult, ['stateJson', 'role', 'isBookmarked'])
                );

                const spectatorResult = Assert.GetRoomQuery.toBeSuccess(
                    await clients[Resources.UserUid.spectator1].getRoomQuery({
                        id: roomId,
                    })
                );
                expect(spectatorResult.role).toBe(ParticipantRole.Spectator);
                expect(maskKeys(spectatorResult, ['stateJson', 'role', 'isBookmarked'])).toEqual(
                    maskKeys(masterResult, ['stateJson', 'role', 'isBookmarked'])
                );

                const nonJoinedResult = Assert.GetRoomQuery.toBeNonJoined(
                    await clients[Resources.UserUid.notJoin].getRoomQuery({
                        id: roomId,
                    })
                );
                expect(nonJoinedResult.roomAsListItem.id).toBe(roomId);
                systemTimeManager
                    .expect(nonJoinedResult.roomAsListItem.createdAt)
                    .toBeCloseToSystemTimeType(1);
                systemTimeManager
                    .expect(nonJoinedResult.roomAsListItem.updatedAt, 'acceptNullish')
                    .toBeCloseToSystemTimeType(1);
            });
        });

        describe('operate mutation', () => {
            // TODO: Room.valueのJSONの容量が上限を超えるようなOperationを送信したときのテスト。例えば単にnameの文字数を一度に大量に増やそうとするとApollo ServerによりPayload Too Largeエラーが返されるため、テストには一工夫必要か。

            it('tests a valid operation', async () => {
                await useTestServer({}, async ({ onFinally }) => {
                    systemTimeManager.set(1);

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
                    onFinally.add(() => subscriptions.all.unsubscribe());

                    const newRoomName = 'NEW_ROOM_NAME';
                    systemTimeManager.set(2);
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
                    systemTimeManager.expect(room.room.updatedAt).toBeCloseToSystemTimeType(2);
                });
            });

            it('tests with invalid JSON', async () => {
                await useTestServer({}, async ({ onFinally }) => {
                    systemTimeManager.set(1);

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
                    onFinally.add(() => subscriptions.all.unsubscribe());

                    const invalidJSON = JSON.stringify({});

                    systemTimeManager.set(2);
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

                    const room = Assert.GetRoomQuery.toBeSuccess(
                        await clients[Resources.UserUid.player1].getRoomQuery({
                            id: roomId,
                        })
                    );
                    systemTimeManager.expect(room.room.updatedAt).toBeCloseToSystemTimeType(1);
                });
            });
        });

        describe.each([true, false])('doEditTest: %o', doEditTest => {
            describe.each([
                {
                    author: Resources.UserUid.master,
                    channelKey: '1',
                },
                {
                    author: Resources.UserUid.master,
                    channelKey: '10',
                },
                {
                    author: Resources.UserUid.master,
                    channelKey: $free,
                },
                {
                    author: Resources.UserUid.player2,
                    channelKey: '1',
                },
                {
                    author: Resources.UserUid.player2,
                    channelKey: '10',
                },
                {
                    author: Resources.UserUid.player2,
                    channelKey: $free,
                },
                {
                    author: Resources.UserUid.spectator1,
                    channelKey: $free,
                },
            ] as const)('author & channelKey: %o', ({ author, channelKey }) => {
                it('writePublicMessage(text) -> edit -> delete mutation (with date tests)', async () => {
                    await useTestServer({}, async ({ onFinally }) => {
                        systemTimeManager.set(1);

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
                        onFinally.add(() => subscriptions.all.unsubscribe());

                        const text = 'TEXT';

                        let authorMessage: RoomPublicMessageFragment;

                        // writePublicMessageMutation
                        {
                            systemTimeManager.set(2);

                            authorMessage = Assert.WritePublicMessageMutation.toBeSuccess(
                                await clients[author].writePublicMessageMutation({
                                    roomId,
                                    text,
                                    channelKey,
                                })
                            );
                            expect(authorMessage.initText).toBe(text);
                            expect(
                                subscriptions.all
                                    .except(Resources.UserUid.notJoin)
                                    .distinct(x => x.toBeExactlyOneRoomPublicMessage())
                            ).toEqual(authorMessage);
                            subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();

                            for (const userUid of [
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
                                    roundMilliSecondsInObject([authorMessage])
                                );
                                const room = Assert.GetRoomQuery.toBeSuccess(
                                    await clients[userUid].getRoomQuery({
                                        id: roomId,
                                    })
                                );
                                systemTimeManager
                                    .expect(room.room.updatedAt)
                                    .toBeCloseToSystemTimeType(2);
                            }
                        }

                        // editMessageMutation
                        if (doEditTest) {
                            systemTimeManager.set(3);

                            const editedText = 'EDITED_TEXT';
                            const editResult = Assert.EditMessageMutation.toBeSuccess(
                                await clients[author].editMessageMutation({
                                    roomId,
                                    text: editedText,
                                    messageId: authorMessage.messageId,
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
                                ...authorMessage,
                                updatedAt: undefined,
                                updatedText: undefined,
                            });
                            subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();

                            for (const userUid of [
                                Resources.UserUid.master,
                                Resources.UserUid.player1,
                                Resources.UserUid.spectator1,
                            ] as const) {
                                const room = Assert.GetRoomQuery.toBeSuccess(
                                    await clients[userUid].getRoomQuery({
                                        id: roomId,
                                    })
                                );
                                systemTimeManager
                                    .expect(room.room.updatedAt)
                                    .toBeCloseToSystemTimeType(3);
                            }
                        }

                        systemTimeManager.set(4);

                        {
                            const deleteResult = Assert.DeleteMessageMutation.toBeSuccess(
                                await clients[author].deleteMessageMutation({
                                    roomId,
                                    messageId: authorMessage.messageId,
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
                                ...authorMessage,
                                updatedAt: undefined,
                                updatedText: undefined,
                            });
                            subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();

                            for (const userUid of [
                                Resources.UserUid.master,
                                Resources.UserUid.player1,
                                Resources.UserUid.spectator1,
                            ] as const) {
                                const room = Assert.GetRoomQuery.toBeSuccess(
                                    await clients[userUid].getRoomQuery({
                                        id: roomId,
                                    })
                                );
                                systemTimeManager
                                    .expect(room.room.updatedAt)
                                    .toBeCloseToSystemTimeType(4);
                            }
                        }

                        subscriptions.all.unsubscribe();
                    });
                });

                describe.each([undefined, 'Kamigakari'])('gameType: %o', gameType => {
                    it('writePublicMessage(1d100) -> edit -> delete mutation', async () => {
                        jest.useRealTimers();

                        await useTestServer({}, async ({ onFinally }) => {
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
                            onFinally.add(() => subscriptions.all.unsubscribe());

                            const text = '1d100';

                            let authorMessage: RoomPublicMessageFragment;

                            // writePublicMessageMutation
                            {
                                authorMessage = Assert.WritePublicMessageMutation.toBeSuccess(
                                    await clients[author].writePublicMessageMutation({
                                        roomId,
                                        text,
                                        channelKey,
                                        gameType,
                                    })
                                );
                                expect(authorMessage.initText).toBe(text);
                                expect(authorMessage.initTextSource).toBe(text);
                                expect(authorMessage.updatedText).toBeFalsy();
                                expect(authorMessage.commandResult).toBeTruthy();
                                expect(
                                    maskTypeNames(
                                        subscriptions.all
                                            .except(Resources.UserUid.notJoin)
                                            .distinct(x => x.toBeExactlyOneRoomPublicMessage())
                                    )
                                ).toEqual(maskTypeNames(authorMessage));
                                subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();

                                for (const userUid of [
                                    Resources.UserUid.master,
                                    Resources.UserUid.player1,
                                    Resources.UserUid.spectator1,
                                ] as const) {
                                    const messages = Assert.GetMessagesQuery.toBeSuccess(
                                        await clients[userUid].getMessagesQuery({
                                            roomId,
                                        })
                                    );
                                    expect(
                                        roundMilliSecondsInObject(messages.publicMessages)
                                    ).toEqual(roundMilliSecondsInObject([authorMessage]));
                                }
                            }

                            // editMessageMutation
                            if (doEditTest) {
                                const editedText = 'EDITED_TEXT';
                                const editResult = Assert.EditMessageMutation.toBeSuccess(
                                    await clients[author].editMessageMutation({
                                        roomId,
                                        text: editedText,
                                        messageId: authorMessage.messageId,
                                    })
                                );
                                expect(editResult.failureType).toBeFalsy();
                                const updatedMessage = subscriptions.all
                                    .except(Resources.UserUid.notJoin)
                                    .distinct(x => x.toBeExactlyOneRoomPublicMessage());
                                expect(updatedMessage.updatedText?.currentText).toBe(editedText);
                                expect(
                                    maskKeys(updatedMessage, [
                                        '__typename',
                                        'updatedAt',
                                        'updatedText',
                                    ])
                                ).toEqual(
                                    maskKeys(authorMessage, [
                                        '__typename',
                                        'updatedAt',
                                        'updatedText',
                                    ])
                                );
                                subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();
                            }

                            {
                                const deleteResult = Assert.DeleteMessageMutation.toBeSuccess(
                                    await clients[author].deleteMessageMutation({
                                        roomId,
                                        messageId: authorMessage.messageId,
                                    })
                                );
                                expect(deleteResult.failureType).toBeFalsy();
                                const deletedMessage = subscriptions.all
                                    .except(Resources.UserUid.notJoin)
                                    .distinct(x => x.toBeExactlyOneRoomPublicMessage());
                                expect(deletedMessage.updatedText?.currentText).toBeFalsy();
                                expect(
                                    maskKeys(deletedMessage, [
                                        '__typename',
                                        'updatedAt',
                                        'updatedText',
                                    ])
                                ).toEqual(
                                    maskKeys(authorMessage, [
                                        '__typename',
                                        'updatedAt',
                                        'updatedText',
                                    ])
                                );
                                subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();
                            }
                            subscriptions.all.unsubscribe();
                        });
                    });

                    it('writePublicMessage(s1d100) -> edit -> reveal value -> delete mutation', async () => {
                        jest.useRealTimers();

                        await useTestServer({}, async ({ onFinally }) => {
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
                            onFinally.add(() => subscriptions.all.unsubscribe());

                            const text = 's1d100';

                            let authorMessage: RoomPublicMessageFragment;

                            // writePublicMessageMutation
                            {
                                authorMessage = Assert.WritePublicMessageMutation.toBeSuccess(
                                    await clients[author].writePublicMessageMutation({
                                        roomId,
                                        text,
                                        channelKey,
                                        gameType,
                                    })
                                );
                                expect(authorMessage.initText).toBe(text);
                                expect(authorMessage.initTextSource).toBe(text);
                                expect(authorMessage.updatedText).toBeFalsy();
                                expect(authorMessage.altTextToSecret).toBeTruthy();
                                expect(authorMessage.commandResult).toBeTruthy();
                                expect(authorMessage.isSecret).toBe(true);
                                expect(
                                    maskTypeNames(
                                        subscriptions.value[
                                            author
                                        ].toBeExactlyOneRoomPublicMessage()
                                    )
                                ).toEqual(maskTypeNames(authorMessage));
                                const nonAuthorMessage = subscriptions.all
                                    .except(author, Resources.UserUid.notJoin)
                                    .distinct(x => x.toBeExactlyOneRoomPublicMessage());
                                expect(nonAuthorMessage.initText).toBeFalsy();
                                expect(nonAuthorMessage.initTextSource).toBeFalsy();
                                expect(nonAuthorMessage.updatedText).toBeFalsy();
                                expect(nonAuthorMessage.altTextToSecret).toBeTruthy();
                                expect(nonAuthorMessage.commandResult).toBeFalsy();
                                expect(authorMessage.isSecret).toBe(true);
                                const maskingKeys = [
                                    '__typename',
                                    'initText',
                                    'initTextSource',
                                    'updatedText',
                                    'commandResult',
                                ];
                                expect(maskKeys(nonAuthorMessage, maskingKeys)).toEqual(
                                    maskKeys(authorMessage, maskingKeys)
                                );
                                subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();

                                for (const userUid of [
                                    Resources.UserUid.master,
                                    Resources.UserUid.player1,
                                    Resources.UserUid.spectator1,
                                ] as const) {
                                    const messages = Assert.GetMessagesQuery.toBeSuccess(
                                        await clients[userUid].getMessagesQuery({
                                            roomId,
                                        })
                                    );

                                    expect(messages.publicMessages).toHaveLength(1);

                                    if (userUid === author) {
                                        expect(
                                            messages.publicMessages[0]?.commandResult
                                        ).toBeTruthy();
                                    } else {
                                        expect(
                                            messages.publicMessages[0]?.commandResult
                                        ).toBeFalsy();
                                    }

                                    const maskingKeys = [
                                        '__typename',
                                        'initText',
                                        'initTextSource',
                                        'updatedText',
                                        'commandResult',
                                    ];
                                    expect(
                                        maskKeys(
                                            roundMilliSecondsInObject(messages.publicMessages),
                                            maskingKeys
                                        )
                                    ).toEqual(
                                        maskKeys(
                                            roundMilliSecondsInObject([authorMessage]),
                                            maskingKeys
                                        )
                                    );
                                }
                            }

                            let updatedAuthorMessage: RoomPublicMessageFragment | null = null;

                            // editMessageMutation
                            if (doEditTest) {
                                const editedText = 'EDITED_TEXT';
                                const editResult = Assert.EditMessageMutation.toBeSuccess(
                                    await clients[author].editMessageMutation({
                                        roomId,
                                        text: editedText,
                                        messageId: authorMessage.messageId,
                                    })
                                );
                                expect(editResult.failureType).toBeFalsy();
                                updatedAuthorMessage =
                                    subscriptions.value[author].toBeExactlyOneRoomPublicMessage();
                                expect(updatedAuthorMessage.updatedText?.currentText).toBe(
                                    editedText
                                );
                                expect(updatedAuthorMessage.commandResult).toBeTruthy();
                                const updatedNonAuthorMessage = subscriptions.all
                                    .except(author, Resources.UserUid.notJoin)
                                    .distinct(x => x.toBeExactlyOneRoomPublicMessage());
                                expect(updatedNonAuthorMessage.updatedText?.currentText).toBe(
                                    editedText
                                );
                                expect(updatedNonAuthorMessage.commandResult).toBeFalsy();
                                const maskingKeysForAuthor = [
                                    '__typename',
                                    'updatedAt',
                                    'updatedText',
                                ];
                                const maskingKeysForNonAuthor = [
                                    '__typename',
                                    'updatedAt',
                                    'updatedText',
                                    'commandResult',
                                ];
                                expect(
                                    maskKeys(updatedAuthorMessage, maskingKeysForAuthor)
                                ).toEqual(maskKeys(authorMessage, maskingKeysForAuthor));
                                expect(
                                    maskKeys(updatedNonAuthorMessage, maskingKeysForNonAuthor)
                                ).toEqual(maskKeys(authorMessage, maskingKeysForNonAuthor));
                                subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();
                            }

                            Assert.MakeMessageNotSecretMutation.toBeFailure(
                                await clients[Resources.UserUid.player1].makeMessageNotSecret({
                                    roomId,
                                    messageId: authorMessage.messageId,
                                })
                            );
                            Assert.MakeMessageNotSecretMutation.toBeFailure(
                                await clients[Resources.UserUid.notJoin].makeMessageNotSecret({
                                    roomId,
                                    messageId: authorMessage.messageId,
                                })
                            );

                            {
                                Assert.MakeMessageNotSecretMutation.toBeSuccess(
                                    await clients[author].makeMessageNotSecret({
                                        roomId,
                                        messageId: authorMessage.messageId,
                                    })
                                );
                                const updatedMessage = subscriptions.all
                                    .except(Resources.UserUid.notJoin)
                                    .distinct(x => x.toBeExactlyOneRoomPublicMessage());
                                if (doEditTest) {
                                    expect(updatedMessage.updatedText).toBeTruthy();
                                } else {
                                    expect(updatedMessage.updatedText).toBeFalsy();
                                }
                                expect(updatedMessage.isSecret).toBe(false);
                                expect(updatedMessage.commandResult).toBeTruthy();
                                const maskingKeys = ['__typename', 'updatedAt', 'isSecret'];
                                expect(
                                    maskKeys(roundMilliSecondsInObject(updatedMessage), maskingKeys)
                                ).toEqual(
                                    maskKeys(
                                        roundMilliSecondsInObject(
                                            updatedAuthorMessage ?? authorMessage
                                        ),
                                        maskingKeys
                                    )
                                );
                            }

                            {
                                const deleteResult = Assert.DeleteMessageMutation.toBeSuccess(
                                    await clients[author].deleteMessageMutation({
                                        roomId,
                                        messageId: authorMessage.messageId,
                                    })
                                );
                                expect(deleteResult.failureType).toBeFalsy();
                                const deletedMessage = subscriptions.all
                                    .except(Resources.UserUid.notJoin)
                                    .distinct(x => x.toBeExactlyOneRoomPublicMessage());
                                expect(deletedMessage.updatedText?.currentText).toBeFalsy();
                                const maskingKeys = [
                                    '__typename',
                                    'updatedAt',
                                    'updatedText',
                                    'isSecret',
                                ];
                                expect(maskKeys(deletedMessage, maskingKeys)).toEqual(
                                    maskKeys(authorMessage, maskingKeys)
                                );
                                subscriptions.value[Resources.UserUid.notJoin].toBeEmpty();
                            }
                            subscriptions.all.unsubscribe();
                        });
                    });
                });
            });
        });

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
            await useTestServer({}, async ({ onFinally }) => {
                systemTimeManager.set(1);

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
                onFinally.add(() => subscriptions.all.unsubscribe());

                const text = 'TEXT';
                systemTimeManager.set(2);
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

                    const room = Assert.GetRoomQuery.toBeSuccess(
                        await clients[userUid].getRoomQuery({
                            id: roomId,
                        })
                    );
                    systemTimeManager.expect(room.room.updatedAt).toBeCloseToSystemTimeType(1);
                }
            });
        });

        describe('writePrivateMessage mutation', () => {
            it('should succeed', async () => {
                await useTestServer({}, async ({ onFinally }) => {
                    systemTimeManager.set(1);

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
                    onFinally.add(() => subscriptions.all.unsubscribe());

                    const text = 'TEXT';
                    const visibleTo = [Resources.UserUid.player1, Resources.UserUid.player2];
                    systemTimeManager.set(2);

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

                    for (const userUid of [
                        Resources.UserUid.master,
                        Resources.UserUid.player1,
                        Resources.UserUid.player2,
                        Resources.UserUid.spectator1,
                    ] as const) {
                        const room = Assert.GetRoomQuery.toBeSuccess(
                            await clients[userUid].getRoomQuery({
                                id: roomId,
                            })
                        );
                        systemTimeManager.expect(room.room.updatedAt).toBeCloseToSystemTimeType(2);
                    }
                });
            });
        });

        describe('leaveRoom mutation', () => {
            it('should succeed', async () => {
                await useTestServer({}, async ({ onFinally }) => {
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
                    onFinally.add(() => subscriptions.all.unsubscribe());

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
                await useTestServer({}, async ({ onFinally }) => {
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
                    onFinally.add(() => subscriptions.all.unsubscribe());

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
                await useTestServer({}, async ({ onFinally }) => {
                    systemTimeManager.set(1);

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
                    onFinally.add(() => subscriptions.all.unsubscribe());

                    systemTimeManager.set(2);
                    Assert.DeleteRoomMutation.toBeNotCreatedByYou(
                        await clients[mutatedBy].deleteRoomMutation({
                            id: roomId,
                        })
                    );

                    subscriptions.all.toBeEmpty();

                    const room = Assert.GetRoomQuery.toBeSuccess(
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

                    systemTimeManager
                        .expect(room.room.updatedAt, 'acceptNullish')
                        .toBeCloseToSystemTimeType(1);
                });
            });
        });

        describe('deleteRoomAsAdmin mutation', () => {
            it('should succeed', async () => {
                await useTestServer(
                    { admins: [Resources.UserUid.admin] },
                    async ({ onFinally }) => {
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
                        onFinally.add(() => subscriptions.all.unsubscribe());

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

                        for (const userUid of userUids) {
                            Assert.GetRoomQuery.toBeNotFound(
                                await clients[userUid].getRoomQuery({
                                    id: roomId,
                                })
                            );
                        }
                    }
                );
            });

            it.each([
                Resources.UserUid.master,
                Resources.UserUid.player1,
                Resources.UserUid.spectator1,
                Resources.UserUid.notAdmin,
            ] as const)('tests unauthorized mutations', async mutatedBy => {
                await useTestServer({}, async ({ onFinally }) => {
                    systemTimeManager.set(1);

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
                    onFinally.add(() => subscriptions.all.unsubscribe());

                    systemTimeManager.set(2);
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
                        const room = Assert.GetRoomQuery.toBeSuccess(
                            await clients[userUid].getRoomQuery({
                                id: roomId,
                            })
                        );
                        systemTimeManager
                            .expect(room.room.updatedAt, 'acceptNullish')
                            .toBeCloseToSystemTimeType(1);
                    }
                });
            });
        });
    });
});
