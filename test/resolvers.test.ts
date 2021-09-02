import * as $MikroORM from '../src/graphql+mikro-orm/entities/room/mikro-orm';
import { EM } from '../src/utils/types';
import { User as User$MikroORM } from '../src/graphql+mikro-orm/entities/user/mikro-orm';
import { createApolloClient } from './createApolloClient';
import { createTestServer } from './createTestServer';
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
    RoomEventSubscription,
    RoomEventSubscriptionVariables,
    RoomEventDocument,
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
} from './graphql';
import { EntryToServerResultType } from '../src/enums/EntryToServerResultType';
import { ServerConfig } from '../src/configType';
import {
    ApolloClient,
    ApolloQueryResult,
    FetchResult,
    NormalizedCacheObject,
} from '@apollo/client';
import { CompositeTestRoomEventSubscription, TestRoomEventSubscription } from './subscription';
import { UpOperation, parseState } from '@kizahasi/flocon-core';

const timeout = 20000;

const resetDatabase = async (em: EM): Promise<void> => {
    for (const room of await em.find($MikroORM.Room, {})) {
        await $MikroORM.deleteRoom(em, room);
    }
    for (const user of await em.find(User$MikroORM, {})) {
        em.remove(user);
    }
    await em.flush();
};

const plainEntryPassword: ServerConfig['entryPassword'] = {
    type: 'plain',
    value: Resources.entryPassword,
};

type ApolloClientType = ApolloClient<NormalizedCacheObject>;

namespace Assert {
    export namespace CreateRoomMutation {
        export const toBeSuccess = (source: FetchResult<CreateRoomMutation>) => {
            if (source.data?.result.__typename !== 'CreateRoomSuccessResult') {
                expect(source.data?.result.__typename).toBe('CreateRoomSuccessResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };
    }

    export namespace GetMessagesQuery {
        export const toBeSuccess = (source: ApolloQueryResult<GetMessagesQuery>) => {
            if (source.data?.result.__typename !== 'RoomMessages') {
                expect(source.data?.result.__typename).toBe('RoomMessages');
                throw new Error('Guard');
            }
            return source.data.result;
        };
    }

    export namespace GetRoomsListQuery {
        export const toBeSuccess = (source: ApolloQueryResult<GetRoomsListQuery>) => {
            if (source.data?.result.__typename !== 'GetRoomsListSuccessResult') {
                expect(source.data?.result.__typename).toBe('GetRoomsListSuccessResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };
    }

    export namespace GetRoomQuery {
        export const toBeSuccess = (source: ApolloQueryResult<GetRoomQuery>) => {
            if (source.data?.result.__typename !== 'GetJoinedRoomResult') {
                expect(source.data?.result.__typename).toBe('GetJoinedRoomResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };
    }

    export namespace JoinRoomMutation {
        export const toBeSuccess = (
            source: FetchResult<JoinRoomAsPlayerMutation | JoinRoomAsSpectatorMutation>
        ) => {
            if (source.data?.result.__typename !== 'JoinRoomSuccessResult') {
                expect(source.data?.result.__typename).toBe('JoinRoomSuccessResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };

        export const toBeFailure = (
            source: FetchResult<JoinRoomAsPlayerMutation | JoinRoomAsSpectatorMutation>
        ) => {
            if (source.data?.result.__typename !== 'JoinRoomFailureResult') {
                expect(source.data?.result.__typename).toBe('JoinRoomFailureResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };
    }

    export namespace LeaveRoomMutation {
        export const toBeSuccess = (source: FetchResult<LeaveRoomMutation>) => {
            expect(source.data?.result.failureType ?? undefined).toBeUndefined();
        };
    }

    export namespace OperateMutation {
        export const toBeSuccess = (source: FetchResult<OperateMutation>) => {
            if (source.data?.result.__typename !== 'OperateRoomSuccessResult') {
                expect(source.data?.result.__typename).toBe('OperateRoomSuccessResult');
                throw new Error('Guard');
            }
            return source.data.result;
        };
    }

    export namespace WritePrivateMessageMutation {
        export const toBeSuccess = (source: FetchResult<WritePrivateMessageMutation>) => {
            if (source.data?.result.__typename !== 'RoomPrivateMessage') {
                expect(source.data?.result.__typename).toBe('RoomPrivateMessage');
                throw new Error('Guard');
            }
            return source.data.result;
        };
    }
}

namespace GraphQL {
    export const entryToServerMutation = async (client: ApolloClientType) => {
        return await client.mutate<EntryToServerMutation, EntryToServerMutationVariables>({
            mutation: EntryToServerDocument,
            variables: { phrase: Resources.entryPassword },
        });
    };

    export const getRoomQuery = async (
        client: ApolloClientType,
        variables: GetRoomQueryVariables
    ) => {
        return await client.query<GetRoomQuery, GetRoomQueryVariables>({
            query: GetRoomDocument,
            variables,
        });
    };

    export const getRoomsListQuery = async (client: ApolloClientType) => {
        return await client.query<GetRoomsListQuery, GetRoomsListQueryVariables>({
            query: GetRoomsListDocument,
        });
    };

    export const getMessagesQuery = async (
        client: ApolloClientType,
        variables: GetMessagesQueryVariables
    ) => {
        return await client.query<GetMessagesQuery, GetMessagesQueryVariables>({
            query: GetMessagesDocument,
            variables,
        });
    };

    export const joinRoomAsPlayerMutation = async (
        client: ApolloClientType,
        variables: JoinRoomAsPlayerMutationVariables
    ) => {
        return await client.mutate<JoinRoomAsPlayerMutation, JoinRoomAsPlayerMutationVariables>({
            mutation: JoinRoomAsPlayerDocument,
            variables,
        });
    };

    export const joinRoomAsSpectatorMutation = async (
        client: ApolloClientType,
        variables: JoinRoomAsSpectatorMutationVariables
    ) => {
        return await client.mutate<
            JoinRoomAsSpectatorMutation,
            JoinRoomAsSpectatorMutationVariables
        >({
            mutation: JoinRoomAsSpectatorDocument,
            variables,
        });
    };

    export const leaveRoomMutation = async (
        client: ApolloClientType,
        variables: LeaveRoomMutationVariables
    ) => {
        return await client.mutate<LeaveRoomMutation, LeaveRoomMutationVariables>({
            mutation: LeaveRoomDocument,
            variables,
        });
    };

    export const operateMutation = async (
        client: ApolloClientType,
        variables: OperateMutationVariables
    ) => {
        return await client.mutate<OperateMutation, OperateMutationVariables>({
            mutation: OperateDocument,
            variables,
        });
    };

    export const writePrivateMessageMutation = async (
        client: ApolloClientType,
        variables: WritePrivateMessageMutationVariables
    ) => {
        return await client.mutate<
            WritePrivateMessageMutation,
            WritePrivateMessageMutationVariables
        >({
            mutation: WritePrivateMessageDocument,
            variables,
        });
    };
}

it.each([
    ['SQLite', undefined],
    ['SQLite', plainEntryPassword],
    ['PostgreSQL', plainEntryPassword],
] as const)(
    'integration test',
    async (dbType, entryPasswordConfig) => {
        const httpUri = 'http://localhost:4000/graphql';
        const wsUri = 'ws://localhost:4000/graphql';

        const roomMasterClient = createApolloClient(httpUri, wsUri, Resources.User.master);
        const roomPlayer1Client = createApolloClient(httpUri, wsUri, Resources.User.player1);
        const roomPlayer2Client = createApolloClient(httpUri, wsUri, Resources.User.player2);
        const roomSpectatorClient = createApolloClient(httpUri, wsUri, Resources.User.spectator);
        const notJoinUserClient = createApolloClient(httpUri, wsUri, Resources.User.notJoin);

        const server = await createTestServer(dbType, entryPasswordConfig);
        const entryPassword = entryPasswordConfig == null ? undefined : Resources.entryPassword;

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

        let roomId: string;
        // mutation createRoom
        {
            const actual = await roomMasterClient.mutate<
                CreateRoomMutation,
                CreateRoomMutationVariables
            >({
                mutation: CreateRoomDocument,
                variables: {
                    input: {
                        roomName: Resources.Room.name,
                        participantName: Resources.ParticipantName.master,
                        joinAsPlayerPhrase: Resources.Room.playerPassword,
                        joinAsSpectatorPhrase: Resources.Room.spectatorPassword,
                    },
                },
            });
            const actualData = Assert.CreateRoomMutation.toBeSuccess(actual);
            roomId = actualData.id;
        }

        // because we got roomId, we can do subscriptions
        const roomMasterClientSubscription = new TestRoomEventSubscription(
            roomMasterClient.subscribe<RoomEventSubscription, RoomEventSubscriptionVariables>({
                query: RoomEventDocument,
                variables: {
                    id: roomId,
                },
            })
        );
        const roomPlayer1ClientSubscription = new TestRoomEventSubscription(
            roomPlayer1Client.subscribe<RoomEventSubscription, RoomEventSubscriptionVariables>({
                query: RoomEventDocument,
                variables: {
                    id: roomId,
                },
            })
        );
        const roomPlayer2ClientSubscription = new TestRoomEventSubscription(
            roomPlayer2Client.subscribe<RoomEventSubscription, RoomEventSubscriptionVariables>({
                query: RoomEventDocument,
                variables: {
                    id: roomId,
                },
            })
        );
        const roomSpectatorClientSubscription = new TestRoomEventSubscription(
            roomSpectatorClient.subscribe<RoomEventSubscription, RoomEventSubscriptionVariables>({
                query: RoomEventDocument,
                variables: {
                    id: roomId,
                },
            })
        );
        const notJoinUserClientSubscription = new TestRoomEventSubscription(
            notJoinUserClient.subscribe<RoomEventSubscription, RoomEventSubscriptionVariables>({
                query: RoomEventDocument,
                variables: {
                    id: roomId,
                },
            })
        );
        const allSubscriptions = new CompositeTestRoomEventSubscription([
            roomMasterClientSubscription,
            roomPlayer1ClientSubscription,
            roomPlayer2ClientSubscription,
            roomSpectatorClientSubscription,
            notJoinUserClientSubscription,
        ]);

        // query getRoomsList
        {
            // # testing
            // - master can get the room
            const roomMasterResult = Assert.GetRoomsListQuery.toBeSuccess(
                await GraphQL.getRoomsListQuery(roomMasterClient)
            );
            console.log('getRoomsList query result: %o', roomMasterResult);
            expect(roomMasterResult.rooms.length).toBe(1);
            expect(roomMasterResult.rooms[0].id).toBe(roomId);

            // # testing
            // - another user can get the room
            const anotherUserResult = Assert.GetRoomsListQuery.toBeSuccess(
                await GraphQL.getRoomsListQuery(roomPlayer1Client)
            );
            expect(anotherUserResult.rooms.length).toBe(1);
            expect(anotherUserResult.rooms[0].id).toBe(roomId);

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

        let initRoomRevision;
        {
            initRoomRevision = Assert.GetRoomQuery.toBeSuccess(
                await GraphQL.getRoomQuery(roomPlayer1Client, {
                    id: roomId,
                })
            ).room.revision;

            allSubscriptions.clear();
        }

        const newRoomName = 'NEW_ROOM_NAME';
        {
            const requestId = 'P1_REQID'; // @MaxLength(10)であるため10文字以下にしている

            const operation: UpOperation = {
                $v: 1,
                name: {
                    newValue: newRoomName,
                },
            };
            const operationResult = Assert.OperateMutation.toBeSuccess(
                await GraphQL.operateMutation(roomPlayer1Client, {
                    id: roomId,
                    requestId,
                    revisionFrom: initRoomRevision,
                    operation: {
                        clientId: Resources.ClientId.player1,
                        valueJson: JSON.stringify(operation),
                    },
                })
            );
            console.log('operate query result: %o', operationResult);
            expect(operationResult.operation.revisionTo).toBe(initRoomRevision + 1);
            const masterSubscriptionResult =
                roomMasterClientSubscription.toBeExactlyOneRoomOperationEvent();
            expect(masterSubscriptionResult).toEqual(operationResult.operation);
            const player2SubscriptionResult =
                roomPlayer2ClientSubscription.toBeExactlyOneRoomOperationEvent();
            expect(player2SubscriptionResult).toEqual(operationResult.operation);
            const spectatorSubscriptionResult =
                roomSpectatorClientSubscription.toBeExactlyOneRoomOperationEvent();
            expect(spectatorSubscriptionResult).toEqual(operationResult.operation);
            notJoinUserClientSubscription.toBeEmpty();
            allSubscriptions.clear();
        }

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

            expect(player1Messages.privateMessages.length).toBe(1);
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

        // これがないとport 4000が開放されないので2個目以降のテストが失敗してしまう
        server.close();
    },
    timeout
);
