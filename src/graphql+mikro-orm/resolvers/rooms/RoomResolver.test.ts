import { ParticipantRole } from '../../../enums/ParticipantRole';

import * as $MikroORM from '../../entities/room/mikro-orm';
import * as GraphQL from '../../entities/room/graphql';
import { createPostgreSQL, createSQLite } from '../../../mikro-orm';
import { EM, ORM } from '../../../utils/types';
import { User as User$MikroORM } from '../../entities/user/mikro-orm';
import { v4 } from 'uuid';
import { ResolverContext } from '../../utils/Contexts';
import { PromiseQueue } from '../../../utils/PromiseQueue';
import { RoomResolver } from './RoomResolver';
import { __ } from '../../../@shared/collection';
import { GlobalRoom } from '../../entities/room/global';
import { InMemoryConnectionManager } from '../../../connection/main';
import * as RoomModule from '../../../@shared/ot/room/v1';

const timeout = 20000;

const PostgreSQL = {
    dbName: 'test',
    clientUrl: 'postgresql://test:test@localhost:5432',
};

const SQLite = { dbName: './test.sqlite3' };

const clientId = (i?: number) => `CLIENT_ID${i ?? ''}`;

type RoomValueOperation = Omit<RoomModule.UpOperation, 'bgms' | 'paramNames' | 'participants'>;

const resetDatabase = async (em: EM): Promise<void> => {
    for (const room of await em.find($MikroORM.Room, {})) {
        await $MikroORM.deleteRoom(em, room);
    }
    for (const user of await em.find(User$MikroORM, {})) {
        em.remove(user);
    }
    await em.flush();
};

const createResolverContext = (orm: ORM, uid: string): ResolverContext => ({
    decodedIdToken: {
        isError: false,
        value: {
            uid,
            firebase: {
                sign_in_provider: 'DUMMY_SIGN_IN_PROVIDER' // 適当な値
            }
        },
    },
    promiseQueue: new PromiseQueue({}),
    connectionManager: new InMemoryConnectionManager(),
    createEm: () => orm.em.fork(),
});

const setupRoomAndUsersAndParticipants = ({ em, setupRoom }: { em: EM; setupRoom?: (room: $MikroORM.Room) => void }) => {
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
            bgms: {},
            participants: {
                [creatorUserUid]: {
                    $version: 1,

                    // 現状はとりあえず全員がMasterのケースのみを考えている。
                    role: 'Master',
                    name: creatorName,
                    boards: {},
                    characters: {},
                    myNumberValues: {},
                }
            },
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
        }
    });
    if (setupRoom != null) {
        setupRoom(room);
    }

    const creatorUser = new User$MikroORM({ userUid: creatorUserUid });
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

// describeを使うことで、テストが並列ではなく上から順に走る模様。

describe('operate then getRoom', () => {
    beforeAll(async () => {
        const psql = await createPostgreSQL(PostgreSQL);
        try {
            const migrator = psql.getMigrator();
            const migrations = await migrator.getPendingMigrations();
            if (migrations && migrations.length > 0) {
                await migrator.up();
            }
        }
        finally {
            await psql.close();
        }
        const sqlite = await createSQLite(SQLite);
        try {
            const migrator = sqlite.getMigrator();
            const migrations = await migrator.getPendingMigrations();
            if (migrations && migrations.length > 0) {
                await migrator.up();
            }
        }
        finally {
            await sqlite.close();
        }
    }, timeout);


    it('tests DB', async (): Promise<void> => {
        // TODO: テスト実装
    }, timeout);
});

