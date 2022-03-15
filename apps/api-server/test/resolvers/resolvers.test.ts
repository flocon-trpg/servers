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
} from '@flocon-trpg/typed-document-node';
import { EntryToServerResultType } from '../../src/enums/EntryToServerResultType';
import { ServerConfig } from '../../src/configType';
import { UpOperation, parseState } from '@flocon-trpg/core';
import axios from 'axios';
import FormData from 'form-data';
import urljoin from 'url-join';
import { readFileSync } from 'fs';
import { TextTwoWayOperation, TextUpOperation } from '@kizahasi/ot-string';
import { OperationResult } from '@urql/core';
import { maskTypeNames } from './utils/maskTypenames';
import { TestClients } from './utils/testClients';
import { isTruthyString, recordToArray } from '@flocon-trpg/utils';

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

const clearAllUsers = async (em: EM): Promise<void> => {
    for (const user of await em.find(User$MikroORM, {})) {
        em.remove(user);
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
            server.close();
        }
    };

    const setupUsers = async ({
        userUids,
        test,
    }: {
        userUids: ReadonlyArray<string>;
        test?: boolean;
    }) => {
        if (entryPassword == null) {
            return;
        }
        const clients = new TestClients({
            httpGraphQLUri,
            wsGraphQLUri,
            userUids,
        });

        for (const { value: client } of recordToArray(clients.clients)) {
            const result = await client.entryToServerMutation();
            if (test) {
                expect(result.data?.result.type).toBe(EntryToServerResultType.Success);
            }
        }
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
    ] as const)('tests AmIAdmin', async (userUid, isAdmin) => {
        await useTestServer(
            {
                admins: [Resources.UserUid.admin],
            },
            async () => {
                const clients = new TestClients({
                    httpGraphQLUri,
                    wsGraphQLUri,
                    userUids: [userUid] as const,
                });
                const client = clients.clients[userUid];

                const result = await client.amIAdminQuery({});
                expect(result.data?.result).toBe(isAdmin ? userUid : undefined);
            }
        );
    });

    it(
        'tests room',
        async () => {
            await useTestServer({}, async () => {
                const userUids = [
                    Resources.UserUid.master,
                    Resources.UserUid.player1,
                    Resources.UserUid.player2,
                    Resources.UserUid.spectator,
                    Resources.UserUid.notJoin,
                ] as const;
                await setupUsers({ userUids, test: true });

                const clients = new TestClients({
                    httpGraphQLUri,
                    wsGraphQLUri,
                    userUids,
                });

                const {
                    [Resources.UserUid.master]: roomMasterClient,
                    [Resources.UserUid.player1]: roomPlayer1Client,
                    [Resources.UserUid.player2]: roomPlayer2Client,
                    [Resources.UserUid.spectator]: roomSpectatorClient,
                } = clients.clients;

                let roomId: string;
                // mutation createRoom
                {
                    const actual = await roomMasterClient.createRoomMutation({
                        input: {
                            roomName: Resources.Room.name,
                            participantName: Resources.Participant.Name.master,
                            playerPassword: Resources.Room.playerPassword,
                            spectatorPassword: Resources.Room.spectatorPassword,
                        },
                    });
                    const actualData = Assert.CreateRoomMutation.toBeSuccess(actual);
                    roomId = actualData.id;
                }

                // because we got roomId, we can start subscriptions
                const {
                    value: {
                        [Resources.UserUid.master]: roomMasterClientSubscription,
                        [Resources.UserUid.player1]: roomPlayer1ClientSubscription,
                        [Resources.UserUid.player2]: roomPlayer2ClientSubscription,
                        [Resources.UserUid.spectator]: roomSpectatorClientSubscription,
                        [Resources.UserUid.notJoin]: notJoinUserClientSubscription,
                    },
                    all: allSubscriptions,
                } = clients.beginSubscriptions(roomId);

                // query getRoomsList
                {
                    // # testing
                    // - master can get the room
                    const roomMasterResult = Assert.GetRoomsListQuery.toBeSuccess(
                        await roomMasterClient.getRoomsListQuery()
                    );
                    console.log('getRoomsList query result: %o', roomMasterResult);
                    expect(roomMasterResult.rooms).toHaveLength(1);
                    expect(roomMasterResult.rooms[0]!.id).toBe(roomId);

                    // # testing
                    // - another user can get the room
                    const anotherUserResult = Assert.GetRoomsListQuery.toBeSuccess(
                        await roomPlayer1Client.getRoomsListQuery()
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
                        await roomPlayer1Client.joinRoomAsPlayerMutation({
                            id: roomId,
                            name: Resources.UserUid.player1,
                            password: Resources.Room.playerPassword,
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
                        await roomPlayer2Client.joinRoomAsPlayerMutation({
                            id: roomId,
                            name: Resources.UserUid.player2,
                            password: undefined,
                        })
                    );
                    allSubscriptions.toBeEmpty();

                    // # testing
                    // - joining as a player with a incorrent password should be failed
                    // - no event should be observed
                    Assert.JoinRoomMutation.toBeFailure(
                        await roomPlayer2Client.joinRoomAsPlayerMutation({
                            id: roomId,
                            name: Resources.UserUid.player2,
                            password: Resources.Room.spectatorPassword,
                        })
                    );
                    allSubscriptions.toBeEmpty();

                    // # testing
                    // - joining as a player with a corrent password should be success
                    // - master and player1 should get a operation event
                    Assert.JoinRoomMutation.toBeSuccess(
                        await roomPlayer2Client.joinRoomAsPlayerMutation({
                            id: roomId,
                            name: Resources.UserUid.player2,
                            password: Resources.Room.playerPassword,
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
                        await roomSpectatorClient.joinRoomAsSpectatorMutation({
                            id: roomId,
                            name: Resources.UserUid.spectator,
                            password: undefined,
                        })
                    );

                    Assert.JoinRoomMutation.toBeFailure(
                        await roomSpectatorClient.joinRoomAsSpectatorMutation({
                            id: roomId,
                            name: Resources.UserUid.spectator,
                            password: Resources.Room.playerPassword,
                        })
                    );

                    Assert.JoinRoomMutation.toBeSuccess(
                        await roomSpectatorClient.joinRoomAsSpectatorMutation({
                            id: roomId,
                            name: Resources.UserUid.spectator,
                            password: Resources.Room.spectatorPassword,
                        })
                    );

                    allSubscriptions.clear();
                }

                // operateのテストに必要なため、現在のroomのrevisionを取得
                let initRoomRevision: number;
                {
                    initRoomRevision = Assert.GetRoomQuery.toBeSuccess(
                        await roomPlayer1Client.getRoomQuery({
                            id: roomId,
                        })
                    ).room.revision;

                    allSubscriptions.clear();
                }

                const requestId = 'P1_REQID'; // @MaxLength(10)であるため10文字以下にしている

                // operateのテスト（異常系 - 無効なJSON）
                {
                    await Assert.OperateMutation.toBeFailure(
                        roomPlayer1Client.operateMutation({
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
                        $v: 2,
                        $r: 1,
                        name: textDiff({ prev: Resources.Room.name, next: newRoomName }),
                    };
                    const operationResult = await Assert.OperateMutation.toBeSuccess(
                        roomPlayer1Client.operateMutation({
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
                    const visibleTo = [Resources.UserUid.player1, Resources.UserUid.player2];

                    const privateMessage = Assert.WritePrivateMessageMutation.toBeSuccess(
                        await roomPlayer1Client.writePrivateMessageMutation({
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
                        await roomPlayer1Client.getRoomQuery({
                            id: roomId,
                        })
                    );
                    console.log('getRoom query result: %o', room);

                    expect(parseState(room.room.stateJson).name).toBe(newRoomName);
                }

                // 秘話などをDBに保存できているかどうかを確認するため、getMessagesを実行
                {
                    const player1Messages = Assert.GetMessagesQuery.toBeSuccess(
                        await roomPlayer1Client.getMessagesQuery({
                            roomId,
                        })
                    );
                    console.log('getMessages query result: %o', player1Messages);
                    const player2Messages = Assert.GetMessagesQuery.toBeSuccess(
                        await roomPlayer2Client.getMessagesQuery({
                            roomId,
                        })
                    );

                    expect(player1Messages.privateMessages).toHaveLength(1);
                    expect(player1Messages.privateMessages).toEqual(
                        player2Messages.privateMessages
                    );
                }

                // mutation leaveRoom
                // これによりplayer2がleave
                {
                    Assert.LeaveRoomMutation.toBeSuccess(
                        await roomPlayer1Client.leaveRoomMutation({
                            id: roomId,
                        })
                    );

                    // TODO: subscriptionのテストコードを書く
                    allSubscriptions.clear();
                }

                {
                    Assert.DeleteRoomMutation.toBeNotCreatedByYou(
                        await roomPlayer1Client.deleteRoomMutation({
                            id: roomId,
                        })
                    );

                    allSubscriptions.toBeEmpty();
                    allSubscriptions.clear();
                }

                {
                    Assert.DeleteRoomMutation.toBeSuccess(
                        await roomMasterClient.deleteRoomMutation({
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
                        await roomMasterClient.getRoomsListQuery()
                    );
                    expect(roomMasterResult.rooms).toEqual([]);

                    // # testing
                    // - another user cannot get any room
                    const anotherUserResult = Assert.GetRoomsListQuery.toBeSuccess(
                        await roomPlayer1Client.getRoomsListQuery()
                    );
                    expect(anotherUserResult.rooms).toEqual([]);

                    allSubscriptions.clear();
                }
            });
        },
        timeout
    );
});
