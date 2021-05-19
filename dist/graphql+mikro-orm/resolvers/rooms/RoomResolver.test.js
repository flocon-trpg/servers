"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const $MikroORM = __importStar(require("../../entities/room/mikro-orm"));
const mikro_orm_1 = require("../../../mikro-orm");
const mikro_orm_2 = require("../../entities/user/mikro-orm");
const PromiseQueue_1 = require("../../../utils/PromiseQueue");
const main_1 = require("../../../connection/main");
const timeout = 20000;
const PostgreSQL = {
    dbName: 'test',
    clientUrl: 'postgresql://test:test@localhost:5432',
};
const SQLite = { dbName: './test.sqlite3' };
const clientId = (i) => `CLIENT_ID${i !== null && i !== void 0 ? i : ''}`;
const resetDatabase = async (em) => {
    for (const room of await em.find($MikroORM.Room, {})) {
        await $MikroORM.deleteRoom(em, room);
    }
    for (const user of await em.find(mikro_orm_2.User, {})) {
        em.remove(user);
    }
    await em.flush();
};
const createResolverContext = (orm, uid) => ({
    decodedIdToken: {
        isError: false,
        value: {
            uid,
            firebase: {
                sign_in_provider: 'DUMMY_SIGN_IN_PROVIDER'
            }
        },
    },
    promiseQueue: new PromiseQueue_1.PromiseQueue({}),
    connectionManager: new main_1.InMemoryConnectionManager(),
    createEm: () => orm.em.fork(),
});
const setupRoomAndUsersAndParticipants = ({ em, setupRoom }) => {
    const roomName = 'ROOM_NAME';
    const creatorUserUid = 'CREATOR_ID';
    const creatorName = 'CREATOR_NAME';
    const nonCreatorUserUid = 'NON_CREATOR_ID';
    const nonCreatorName = 'NON_CREATOR_NAME';
    const anotherUserUid = 'ANOTHER_USER_ID';
    const anotherName = 'ANOTHER_USER_NAME';
    const room = new $MikroORM.Room({
        name: roomName,
        createdBy: creatorUserUid,
        value: {
            version: 1,
            boolParamNames: {},
            numParamNames: {},
            strParamNames: {},
            bgms: {},
            participants: {
                [creatorUserUid]: {
                    version: 1,
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
    const creatorUser = new mikro_orm_2.User({ userUid: creatorUserUid });
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
describe('operate then getRoom', () => {
    beforeAll(async () => {
        const psql = await mikro_orm_1.createPostgreSQL(PostgreSQL);
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
        const sqlite = await mikro_orm_1.createSQLite(SQLite);
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
    it('tests DB', async () => {
    }, timeout);
});
