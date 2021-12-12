import {
    Connection,
    Dictionary,
    IDatabaseDriver,
    LoggerNamespace,
    MikroORM,
} from '@mikro-orm/core';
import { DatabaseConfig, postgresql, sqlite } from './configType';
import { File } from './graphql+mikro-orm/entities/file/mikro-orm';
import { FileTag } from './graphql+mikro-orm/entities/fileTag/mikro-orm';
import { Participant } from './graphql+mikro-orm/entities/participant/mikro-orm';
import { Room, RoomOp } from './graphql+mikro-orm/entities/room/mikro-orm';
import {
    DicePieceLog,
    StringPieceLog,
    RoomPrvMsg,
    RoomPubCh,
    RoomPubMsg,
    RoomSe,
} from './graphql+mikro-orm/entities/roomMessage/mikro-orm';
import { User } from './graphql+mikro-orm/entities/user/mikro-orm';

const entities = [
    Room,
    RoomOp,
    RoomPubMsg,
    RoomPrvMsg,
    DicePieceLog,
    StringPieceLog,
    RoomPubCh,
    RoomSe,
    User,
    Participant,
    File,
    FileTag,
];

type Debug = boolean | LoggerNamespace[];

const migrationPattern = /^[\w-]+\d+\.[jt]s$/;

export const createSQLite = async ({
    dbName,
    debug,
}: {
    dbName: string;
    debug?: Debug;
}): Promise<MikroORM<IDatabaseDriver<Connection>>> => {
    // TODO: dbNameを変える。
    return await MikroORM.init({
        entities,
        dbName,
        migrations: {
            path: `./dist/__migrations__/sqlite`,
            pattern: migrationPattern,
        },
        type: 'sqlite',
        forceUndefined: true,
        debug,
    });
};

export const createPostgreSQL = async ({
    dbName,
    clientUrl,
    debug,
    driverOptions,
}: {
    dbName: string | undefined;
    clientUrl: string;
    debug?: Debug;
    driverOptions: Dictionary<unknown> | undefined;
}): Promise<MikroORM<IDatabaseDriver<Connection>>> => {
    return await MikroORM.init({
        entities,
        dbName,
        migrations: {
            path: `./dist/__migrations__/postgresql`,
            pattern: migrationPattern,

            // https://github.com/mikro-orm/mikro-orm/issues/190#issuecomment-655763246
            disableForeignKeys: false,
        },
        type: 'postgresql',
        debug,
        forceUndefined: true,
        clientUrl,
        driverOptions,
    });
};

export const prepareORM = async (config: DatabaseConfig, debug: boolean) => {
    try {
        switch (config.__type) {
            case postgresql:
                return await createPostgreSQL({
                    ...config,
                    debug,
                });
            case sqlite:
                return await createSQLite({
                    ...config,
                    debug,
                });
        }
    } catch (error) {
        console.error('Could not connect to the database!');
        throw error;
    }
};
