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

const src = 'src';
const dist = 'dist';
type Dir = typeof src | typeof dist;

export const createSQLite = async ({
    dbName,
    debug,
    dir,
}: {
    dbName: string;
    debug?: Debug;
    dir: Dir;
}): Promise<MikroORM<IDatabaseDriver<Connection>>> => {
    // TODO: dbNameを変える。
    return await MikroORM.init({
        entities,
        dbName,
        migrations: {
            path: `./${dir}/__migrations__/sqlite`,
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
    dir,
    driverOptions,
}: {
    dbName: string | undefined;
    clientUrl: string;
    debug?: Debug;
    dir: Dir;
    driverOptions: Dictionary<unknown> | undefined;
}): Promise<MikroORM<IDatabaseDriver<Connection>>> => {
    return await MikroORM.init({
        entities,
        dbName,
        migrations: {
            path: `./${dir}/__migrations__/postgresql`,
        },
        type: 'postgresql',
        debug,
        forceUndefined: true,
        clientUrl,
        driverOptions,
    });
};

export const prepareORM = async (config: DatabaseConfig, dir: Dir, debug: boolean) => {
    try {
        switch (config.__type) {
            case postgresql:
                return await createPostgreSQL({
                    ...config,
                    dir,
                    debug,
                });
            case sqlite:
                return await createSQLite({
                    ...config,
                    dir,
                    debug,
                });
        }
    } catch (error) {
        console.error('Could not connect to the database!');
        throw error;
    }
};
