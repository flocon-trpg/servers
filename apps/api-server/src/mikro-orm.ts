import { loggerRef } from '@flocon-trpg/utils';
import {
    Options as $Options,
    Connection,
    Dictionary,
    IDatabaseDriver,
    LogContext,
    LoggerNamespace,
} from '@mikro-orm/core';
import { pickBy } from 'lodash';
import { z } from 'zod';
import { sqliteDatabase } from './config/types';
import { File } from './entities/file/entity';
import { FileTag } from './entities/fileTag/entity';
import { Participant } from './entities/participant/entity';
import { Room, RoomOp } from './entities/room/entity';
import {
    DicePieceLog,
    RoomPrvMsg,
    RoomPubCh,
    RoomPubMsg,
    RoomSe,
    StringPieceLog,
} from './entities/roomMessage/entity';
import { User } from './entities/user/entity';

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

/*
# mikro-ormのログレベルに関して

mikro-ormから出力されるログは、ログレベルをinfoとしている。

mikro-ormのログには実行されたSQLが含まれる。これらは、複数行に渡ること、Room.value のように巨大な文字列が含まれるため、ログレベルをdebug以下にすることも考えられる。だが、SQLiteではDBに行われた操作を確認する手段がおそらく他にないことと、pino-httpやGraphQLによるログも比較的巨大(例: getAvailableGameSystems query)なことと、pino-filterでフィルタリングすることもできるため、infoとした。
*/
const loggerFactory: Options['loggerFactory'] = () => {
    const logBase = (
        methodName: 'debug' | 'info' | 'warn' | 'error',
        namespace: LoggerNamespace,
        message: string,
        context?: LogContext,
    ): void => {
        const text = message;
        if (context == null) {
            loggerRef[methodName]({ namespace }, text);
        } else {
            loggerRef[methodName](
                {
                    context: {
                        ...context,
                        // pinoのlevelと重複して出力されるのを防ぐため、mikro-ormのログのlevelは取り除いている。
                        level: undefined,
                    },
                    namespace,
                },
                text,
            );
        }
    };
    return {
        log(namespace, message, context?) {
            logBase('debug', namespace, message, context);
        },
        error(namespace, message, context?) {
            logBase('error', namespace, message, context);
        },
        warn(namespace, message, context?) {
            logBase('warn', namespace, message, context);
        },
        logQuery(context) {
            let methodName: 'error' | 'info' | 'warn';
            switch (context.level) {
                case 'error':
                    methodName = 'error';
                    break;
                case 'info':
                case undefined:
                    methodName = 'info';
                    break;
                case 'warning':
                    methodName = 'warn';
                    break;
            }
            loggerRef[methodName](
                {
                    ...context,
                    // pinoのlevelと重複して出力されるのを防ぐため、mikro-ormのログのlevelは取り除いている。
                    level: undefined,
                },
                'MikroORM logQuery',
            );
        },
        setDebugMode() {
            // pinoのログレベルで管理する方針のため、debug modeの値は無視している。
            return;
        },
        isEnabled() {
            return true;
        },
    };
};

const optionsBase: Options = {
    loggerFactory,
    // デバッグ向けのログもすべて出力している。管理はログレベルで行う。
    debug: true,
};

export const createSQLiteOptions = ({
    sqliteConfig,
    dirName,
}: {
    sqliteConfig: z.TypeOf<typeof sqliteDatabase>;
    dirName: DirName;
}): Options => {
    const opts: Options = {
        ...optionsBase,
        entities,
        dbName: sqliteConfig.dbName,
        clientUrl: sqliteConfig.clientUrl,
        migrations: migrations({ dbType: 'sqlite', dirName }),
        type: 'sqlite',
        forceUndefined: true,
    };
    return pickBy(opts, x => x !== undefined);
};

export const createPostgreSQLOptions = ({
    dbName,
    dirName,
    clientUrl,
    driverOptions,
}: {
    dbName: string | undefined;
    dirName: DirName;
    clientUrl: string;
    driverOptions: Dictionary<unknown> | undefined;
}): Options => {
    const opts: Options = {
        ...optionsBase,
        entities,
        dbName,
        migrations: {
            ...migrations({ dbType: 'postgresql', dirName }),

            // https://github.com/mikro-orm/mikro-orm/issues/190#issuecomment-655763246
            disableForeignKeys: false,
        },
        type: 'postgresql',
        forceUndefined: true,
        clientUrl,
        driverOptions,
    };
    return pickBy(opts, x => x !== undefined);
};

export const createMySQLOptions = ({
    dbName,
    dirName,
    clientUrl,
    driverOptions,
}: {
    dbName: string | undefined;
    dirName: DirName;
    clientUrl: string;
    driverOptions: Dictionary<unknown> | undefined;
}): Options => {
    const opts: Options = {
        ...optionsBase,
        entities,
        dbName,
        migrations: migrations({ dbType: 'mysql', dirName }),
        type: 'mysql',
        forceUndefined: true,
        clientUrl,
        driverOptions,
    };
    return pickBy(opts, x => x !== undefined);
};
