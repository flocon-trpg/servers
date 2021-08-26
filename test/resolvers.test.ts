import * as $MikroORM from '../src/graphql+mikro-orm/entities/room/mikro-orm';
import { EM } from '../src/utils/types';
import { User as User$MikroORM } from '../src/graphql+mikro-orm/entities/user/mikro-orm';
import { UpOperation } from '@kizahasi/flocon-core';
import { BaasType } from '../src/enums/BaasType';
import { createApolloClient } from './createApolloClient';
import { createTestServer } from './createTestServer';
import { Resources } from './resources';
import {
    EntryToServerMutation,
    EntryToServerMutationVariables,
    EntryToServerDocument,
} from './graphql';
import { EntryToServerResultType } from '../src/enums/EntryToServerResultType';

const timeout = 20000;

const clientId = (i?: number) => `CLIENT_ID${i ?? ''}`;

type RoomValueOperation = Omit<UpOperation, 'bgms' | 'paramNames' | 'participants'>;

const resetDatabase = async (em: EM): Promise<void> => {
    for (const room of await em.find($MikroORM.Room, {})) {
        await $MikroORM.deleteRoom(em, room);
    }
    for (const user of await em.find(User$MikroORM, {})) {
        em.remove(user);
    }
    await em.flush();
};

const setupRoomAndUsersAndParticipants = ({
    em,
    setupRoom,
}: {
    em: EM;
    setupRoom?: (room: $MikroORM.Room) => void;
}) => {
    const roomName = 'ROOM_NAME';
    const creatorUserUid = 'CREATOR_ID';
    const creatorName = 'CREATOR_NAME';
    // nonCreatorは、creatorではないがoperateすることがあるユーザー。
    // anotherUserは、creatorではないしoperateにも関わらないユーザー。nonCreatorと区別するほうがコードがわかりやすくなるのでわけている。
    // これらは名前がわかりにくいのでリネームするほうがよさそうか。
    const nonCreatorUserUid = 'NON_CREATOR_ID';
    const nonCreatorName = 'NON_CREATOR_NAME';
    const anotherUserUid = 'ANOTHER_USER_ID';
    const anotherName = 'ANOTHER_USER_NAME';

    const room = new $MikroORM.Room({
        name: roomName,
        createdBy: creatorUserUid,
        value: {
            $version: 1,

            boolParamNames: {},
            numParamNames: {},
            strParamNames: {},
            boards: {},
            characters: {},
            bgms: {},
            memos: {},
            participants: {
                [creatorUserUid]: {
                    $version: 1,

                    // 現状はとりあえず全員がMasterのケースのみを考えている。
                    role: 'Master',
                    name: creatorName,
                    imagePieceValues: {},
                },
            },
            activeBoardKey: null,
            publicChannel1Name: 'メイン',
            publicChannel2Name: 'メイン2',
            publicChannel3Name: 'メイン3',
            publicChannel4Name: 'メイン4',
            publicChannel5Name: 'メイン5',
            publicChannel6Name: 'メイン6',
            publicChannel7Name: 'メイン7',
            publicChannel8Name: 'メイン8',
            publicChannel9Name: 'メイン9',
            publicChannel10Name: 'メイン10',
        },
    });
    if (setupRoom != null) {
        setupRoom(room);
    }

    const creatorUser = new User$MikroORM({ userUid: creatorUserUid, baasType: BaasType.Firebase });
    creatorUser.isEntry = true;
    em.persist([room]);

    return {
        room,
        creator: {
            userUid: creatorUserUid,
            name: creatorName,
        },
        nonCreator: {
            userUid: nonCreatorUserUid,
            name: nonCreatorName,
        },
        anotherUser: {
            userUid: anotherUserUid,
            name: anotherName,
        },
    };
};

it.each(['SQLite', 'PostgreSQL'] as const)(
    'integration test',
    async dbType => {
        const httpUri = 'http://localhost:4000/graphql';
        const wsUri = 'ws://localhost:4000/graphql';
        const apolloClient = createApolloClient(httpUri, wsUri, Resources.User.roomCreator);
        const server = await createTestServer(dbType);

        const result = await apolloClient.mutate<
            EntryToServerMutation,
            EntryToServerMutationVariables
        >({
            mutation: EntryToServerDocument,
            variables: { phrase: Resources.entryPassword },
        });
        expect(result.data?.result.type).toBe(EntryToServerResultType.Success);

        server.close();
    },
    timeout
);
