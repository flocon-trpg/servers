import {
    Options as $Options,
    Connection,
    Dictionary,
    IDatabaseDriver,
    LoggerNamespace,
} from '@mikro-orm/core';
import { File } from './graphql+mikro-orm/entities/file/mikro-orm';
import { FileTag } from './graphql+mikro-orm/entities/fileTag/mikro-orm';
import { Participant } from './graphql+mikro-orm/entities/participant/mikro-orm';
import { Room, RoomOp } from './graphql+mikro-orm/entities/room/mikro-orm';
import {
    DicePieceLog,
    RoomPrvMsg,
    RoomPubCh,
    RoomPubMsg,
    RoomSe,
    StringPieceLog,
} from './graphql+mikro-orm/entities/roomMessage/mikro-orm';
import { User } from './graphql+mikro-orm/entities/user/mikro-orm';
import * as t from 'io-ts';
import { sqliteDatabase } from './config/types';

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

type Options = $Options<IDatabaseDriver<Connection>>;

export const createSQLiteOptions = ({
    sqliteConfig,
    dirName,
    debug,
}: {
    sqliteConfig: t.TypeOf<typeof sqliteDatabase>;
    dirName: DirName;
    debug?: Debug;
}): Options => {
    return {
        entities,
        dbName: sqliteConfig.dbName,
        clientUrl: sqliteConfig.clientUrl,
        migrations: migrations({ dbType: 'sqlite', dirName }),
        type: 'sqlite',
        forceUndefined: true,
        debug,
    };
};

export const createPostgreSQLOptions = ({
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
}): Options => {
    const opts: Options = {
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
    };
    if (driverOptions != null) {
        opts.driverOptions = driverOptions;
    }
    return opts;
};

export const createMySQLOptions = ({
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
}): Options => {
    // HACK: driverOptionsにundefinedをセットするとmikro-ormでエラーが出るため、undefinedを渡さないようにしている。
    const opts: Options = {
        entities,
        dbName,
        migrations: migrations({ dbType: 'mysql', dirName }),
        type: 'mysql',
        debug,
        forceUndefined: true,
        clientUrl,
    };
    if (driverOptions != null) {
        opts.driverOptions = driverOptions;
    }
    return opts;
};
