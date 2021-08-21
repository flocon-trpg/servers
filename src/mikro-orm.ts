import { Connection, IDatabaseDriver, LoggerNamespace, MikroORM } from '@mikro-orm/core';
import { DatabaseConfig, postgresql, sqlite } from './configType';
import { File } from './graphql+mikro-orm/entities/file/mikro-orm';
import { Room, RoomOp } from './graphql+mikro-orm/entities/room/mikro-orm';
import {
    DicePieceValueLog,
    NumberPieceValueLog,
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
    DicePieceValueLog,
    NumberPieceValueLog,
    RoomPubCh,
    RoomSe,
    User,
    File,
];

type Debug = boolean | LoggerNamespace[];

export const createSQLite = async ({
    dbName,
    debug,
}: {
    dbName: string;
    debug?: Debug;
}): Promise<MikroORM<IDatabaseDriver<Connection>>> => {
    // TODO: dbNameを変える、パスもここからのディレクトリではなく実行されるtypescriptファイルの位置が基準となりわかりにくいので変える。
    return await MikroORM.init({
        entities,
        dbName,
        migrations: {
            path: './migrations/sqlite',
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
}: {
    dbName: string;
    clientUrl: string;
    debug?: Debug;
}): Promise<MikroORM<IDatabaseDriver<Connection>>> => {
    return await MikroORM.init({
        entities,
        dbName,
        migrations: {
            path: './migrations/postgresql',
        },
        type: 'postgresql',
        debug,
        forceUndefined: true,
        clientUrl,
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
