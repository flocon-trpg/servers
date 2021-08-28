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
    CreateRoomMutation,
    CreateRoomMutationVariables,
    CreateRoomDocument,
} from './graphql';
import { EntryToServerResultType } from '../src/enums/EntryToServerResultType';

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

it.each(['SQLite', 'PostgreSQL'] as const)(
    'integration test',
    async dbType => {
        const httpUri = 'http://localhost:4000/graphql';
        const wsUri = 'ws://localhost:4000/graphql';
        const roomCreatorClient = createApolloClient(httpUri, wsUri, Resources.User.roomCreator);
        const server = await createTestServer(dbType);

        {
            const result = await roomCreatorClient.mutate<
                EntryToServerMutation,
                EntryToServerMutationVariables
            >({
                mutation: EntryToServerDocument,
                variables: { phrase: Resources.entryPassword },
            });
            expect(result.data?.result.type).toBe(EntryToServerResultType.Success);
        }

        {
            const result = await roomCreatorClient.mutate<
                CreateRoomMutation,
                CreateRoomMutationVariables
            >({
                mutation: CreateRoomDocument,
                variables: {
                    input: {
                        roomName: Resources.Room.name,
                        participantName: Resources.Participant.roomCreator,
                        joinAsPlayerPhrase: Resources.Room.playerPassword,
                        joinAsSpectatorPhrase: Resources.Room.spectatorPassword,
                    },
                },
            });
            expect(result.data?.result.__typename).toBe('CreateRoomSuccessResult');
        }

        // これがないとport 4000が開放されないので2個目以降のテストが失敗してしまう
        server.close();
    },
    timeout
);
