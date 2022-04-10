import {
    Connection,
    Dictionary,
    IDatabaseDriver,
    LoggerNamespace,
    MikroORM,
} from '@mikro-orm/core';
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
export type DirName = 'src' | 'dist';

const migrations = ({
    dirName,
    dbType,
}: {
    dirName: DirName;
    dbType: 'sqlite' | 'mysql' | 'postgresql';
}) => {
    return {
        path: `./${dirName}/__migrations__/${dbType}`,
    };
};

export const createSQLite = async ({
    dbName,
    dirName,
    debug,
}: {
    dbName: string;
    dirName: DirName;
    debug?: Debug;
}): Promise<MikroORM<IDatabaseDriver<Connection>>> => {
    return await MikroORM.init({
        entities,
        dbName,
        migrations: migrations({ dbType: 'sqlite', dirName }),
        type: 'sqlite',
        forceUndefined: true,
        debug,
    });
};

export const createPostgreSQL = async ({
    dbName,
    dirName,
    clientUrl,
    debug,
    driverOptions,
}: {
    dbName: string | undefined;
    dirName: DirName;
    clientUrl: string;
    debug?: Debug;
    driverOptions: Dictionary<unknown> | undefined;
}): Promise<MikroORM<IDatabaseDriver<Connection>>> => {
    return await MikroORM.init({
        entities,
        dbName,
        migrations: {
            ...migrations({ dbType: 'postgresql', dirName }),

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

export const createMySQL = async ({
    dbName,
    dirName,
    clientUrl,
    debug,
    driverOptions,
}: {
    dbName: string | undefined;
    dirName: DirName;
    clientUrl: string;
    debug?: Debug;
    driverOptions: Dictionary<unknown> | undefined;
}): Promise<MikroORM<IDatabaseDriver<Connection>>> => {
    return await MikroORM.init({
        entities,
        dbName,
        migrations: migrations({ dbType: 'mysql', dirName }),
        type: 'mysql',
        debug,
        forceUndefined: true,
        clientUrl,
        driverOptions,
    });
};
