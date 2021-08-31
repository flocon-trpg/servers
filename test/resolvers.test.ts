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
} from './graphql';
import { EntryToServerResultType } from '../src/enums/EntryToServerResultType';
import { ServerConfig } from '../src/configType';
import {
    ApolloClient,
    ApolloQueryResult,
    FetchResult,
    NormalizedCacheObject,
} from '@apollo/client';

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

    export namespace GetRoomsListQuery {
        export const toBeSuccess = (source: ApolloQueryResult<GetRoomsListQuery>) => {
            if (source.data?.result.__typename !== 'GetRoomsListSuccessResult') {
                expect(source.data?.result.__typename).toBe('GetRoomsListSuccessResult');
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
            const entryToServerMutation = async (client: ApolloClientType) => {
                return await client.mutate<EntryToServerMutation, EntryToServerMutationVariables>({
                    mutation: EntryToServerDocument,
                    variables: { phrase: Resources.entryPassword },
                });
            };

            const result = await entryToServerMutation(roomMasterClient);
            expect(result.data?.result.type).toBe(EntryToServerResultType.Success);

            // roomMaster以外のテストは成功するとみなし省略している
            await entryToServerMutation(roomPlayer1Client);
            await entryToServerMutation(roomPlayer2Client);
            await entryToServerMutation(roomSpectatorClient);
            await entryToServerMutation(notJoinUserClient);
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

        // query getRoomsList
        {
            const getRoomsListQuery = async (client: ApolloClientType) => {
                return await client.query<GetRoomsListQuery, GetRoomsListQueryVariables>({
                    query: GetRoomsListDocument,
                });
            };

            const roomMasterResult = Assert.GetRoomsListQuery.toBeSuccess(
                await getRoomsListQuery(roomMasterClient)
            );
            expect(roomMasterResult.rooms.length).toBe(1);
            expect(roomMasterResult.rooms[0].id).toBe(roomId);

            const anotherUserResult = Assert.GetRoomsListQuery.toBeSuccess(
                await getRoomsListQuery(roomPlayer1Client)
            );
            expect(anotherUserResult.rooms.length).toBe(1);
            expect(anotherUserResult.rooms[0].id).toBe(roomId);
        }

        // mutation joinRoomAsPlayer
        {
            const joinRoomAsPlayerMutation = async (
                client: ApolloClientType,
                variables: JoinRoomAsPlayerMutationVariables
            ) => {
                return await client.mutate<
                    JoinRoomAsPlayerMutation,
                    JoinRoomAsPlayerMutationVariables
                >({
                    mutation: JoinRoomAsPlayerDocument,
                    variables,
                });
            };

            Assert.JoinRoomMutation.toBeSuccess(
                await joinRoomAsPlayerMutation(roomPlayer1Client, {
                    id: roomId,
                    name: Resources.User.player1,
                    phrase: Resources.Room.playerPassword,
                })
            );

            Assert.JoinRoomMutation.toBeFailure(
                await joinRoomAsPlayerMutation(roomPlayer2Client, {
                    id: roomId,
                    name: Resources.User.player2,
                    phrase: undefined,
                })
            );

            Assert.JoinRoomMutation.toBeFailure(
                await joinRoomAsPlayerMutation(roomPlayer2Client, {
                    id: roomId,
                    name: Resources.User.player2,
                    phrase: Resources.Room.spectatorPassword,
                })
            );

            Assert.JoinRoomMutation.toBeSuccess(
                await joinRoomAsPlayerMutation(roomPlayer2Client, {
                    id: roomId,
                    name: Resources.User.player2,
                    phrase: Resources.Room.playerPassword,
                })
            );
        }

        // mutation joinRoomAsSpectator
        {
            const joinRoomAsSpectatorMutation = async (
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

            Assert.JoinRoomMutation.toBeFailure(
                await joinRoomAsSpectatorMutation(roomSpectatorClient, {
                    id: roomId,
                    name: Resources.User.spectator,
                    phrase: undefined,
                })
            );

            Assert.JoinRoomMutation.toBeFailure(
                await joinRoomAsSpectatorMutation(roomSpectatorClient, {
                    id: roomId,
                    name: Resources.User.spectator,
                    phrase: Resources.Room.playerPassword,
                })
            );

            Assert.JoinRoomMutation.toBeSuccess(
                await joinRoomAsSpectatorMutation(roomSpectatorClient, {
                    id: roomId,
                    name: Resources.User.spectator,
                    phrase: Resources.Room.spectatorPassword,
                })
            );
        }

        // これがないとport 4000が開放されないので2個目以降のテストが失敗してしまう
        server.close();
    },
    timeout
);
