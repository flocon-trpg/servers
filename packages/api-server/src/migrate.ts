import { Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core';
import {
    loadServerConfigAsCheck,
    loadServerConfigAsMain,
    loadServerConfigAsMigrationCreate,
    loadServerConfigAsMigrationDown,
    loadServerConfigAsMigrationUp,
} from './config';
import { createPostgreSQL, createSQLite } from './mikro-orm';
import { AppConsole } from './utils/appConsole';
import { ORM } from './utils/types';

const check = 'check';
const create = 'create';
const createInitial = 'create-initial';
const up = 'up';
const down = 'down';
const autoMigrationAlways = 'autoMigrationAlways';

const sqlite = 'sqlite';
const postgresql = 'postgresql';

type DBType = typeof sqlite | typeof postgresql;

const prettify = (dbType: DBType) => {
    switch (dbType) {
        case sqlite:
            return 'SQLite';
        case postgresql:
            return 'PostgreSQL';
    }
};

const migrationCheckErrorMessage = (dbType: DBType): AppConsole.Message => ({
    icon: '❗',
    en: `Pending migrations were found. You need to execute "migration-up" command to run the server. It is recommended to backup the DB before executing the command if the DB has some data you don't want to lose. DB is ${prettify(
        dbType
    )}`,
    ja: `適用すべきマイグレーションが見つかりました。サーバーを稼働させるには"migration-up"コマンドを実行する必要があります。もし失いたくないデータがDBにある場合、そのコマンドを実行する前にDBをバックアップしておくことを推奨します。DBは${prettify(
        dbType
    )}です。`,
});

const migrationCheckOkMessage = (dbType: DBType): AppConsole.Message => ({
    icon: '✔️',
    en: `No pending migrations were found. DB is ${prettify(dbType)}`,
    ja: `適用すべきマイグレーションはありません。DBは${prettify(dbType)}です。`,
});

const hasMigrations = async (orm: MikroORM<IDatabaseDriver<Connection>>) => {
    const migrator = orm.getMigrator();
    const migrations = await migrator.getPendingMigrations();
    return migrations && migrations.length > 0;
};

const migrateUpCore = async ({
    type,
    dbType,
    orm,
}: {
    type: typeof up | typeof autoMigrationAlways;
    dbType: DBType;
    orm: ORM;
}) => {
    AppConsole.log({
        en: `Migration-up is started${
            type === autoMigrationAlways ? '(reason: auto-migration=always)' : ''
        }. DB is ${prettify(dbType)}`,
        ja: `マイグレーションのupを開始します${
            type === autoMigrationAlways ? '(reason: auto-migration=always)' : ''
        }。DBは${prettify(dbType)}です。`,
    });
    const migrator = orm.getMigrator();
    const migrations = await migrator.getPendingMigrations();
    if (migrations && migrations.length > 0) {
        AppConsole.log({
            en: 'Pending migrations were found. Migrating...',
            ja: '適用すべきマイグレーションが見つかりました。マイグレーションを行います…',
        });
        await migrator.up();
    } else {
        AppConsole.log({
            icon: '✔️',
            en: 'No migration found.',
            ja: '適用すべきマイグレーションはありません。',
        });
    }
    AppConsole.log({
        icon: '😊',
        en: `Migration-up has been successfully finished. DB is ${prettify(dbType)}.`,
        ja: `マイグレーションのupが正常に完了しました。DBは${prettify(dbType)}です。`,
    });
};

export const migrateByTsNode = async (
    type:
        | typeof check
        | typeof create
        | typeof createInitial
        | typeof up
        | typeof down
        | typeof autoMigrationAlways
) => {
    const serverConfig = await (() => {
        switch (type) {
            case up:
                return loadServerConfigAsMigrationUp();
            case down:
                return loadServerConfigAsMigrationDown();
            case check:
                return loadServerConfigAsCheck();
            case autoMigrationAlways:
                return loadServerConfigAsMain();
            default:
                return loadServerConfigAsMigrationCreate();
        }
    })();

    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let dbType: DBType;
    // TODO: 他のDBにも対応させる
    switch (serverConfig.database.__type) {
        case sqlite:
            orm = await createSQLite({
                ...serverConfig.database,
                dir: 'src',
                debug: type !== check,
            });
            dbType = sqlite;
            break;
        case postgresql:
            orm = await createPostgreSQL({
                ...serverConfig.database,
                dir: 'src',
                debug: type !== check,
            });
            dbType = postgresql;
            break;
    }

    try {
        switch (type) {
            case create: {
                AppConsole.log({
                    en: `Migration-create is started. DB is ${prettify(dbType)}.`,
                    ja: `マイグレーションの作成を開始します。DBは${prettify(dbType)}です。`,
                });
                const migrator = orm.getMigrator();
                await migrator.createMigration();
                AppConsole.log({
                    icon: '😊',
                    en: `Migration-create has been successfully finished. DB is ${prettify(
                        dbType
                    )}.`,
                    ja: `マイグレーションの作成が正常に完了しました。DBは${prettify(dbType)}です。`,
                });
                return;
            }
            case createInitial: {
                AppConsole.log({
                    en: `Migration-create-init is started. DB is ${prettify(dbType)}.`,
                    ja: `マイグレーションの新規作成を開始します。DBは${prettify(dbType)}です。`,
                });
                const migrator = orm.getMigrator();
                await migrator.createInitialMigration();
                AppConsole.log({
                    icon: '😊',
                    en: `Migration-create-init has been successfully finished. DB is ${prettify(
                        dbType
                    )}.`,
                    ja: `マイグレーションの新規作成が正常に完了しました。DBは${prettify(
                        dbType
                    )}です。`,
                });
                return;
            }
            case up:
            case autoMigrationAlways:
                await migrateUpCore({
                    orm,
                    type,
                    dbType,
                });
                return;
            case down: {
                AppConsole.log({
                    en: `Migration-down is started. DB is ${prettify(dbType)}.`,
                    ja: `マイグレーションのdownを開始します。DBは${prettify(dbType)}です。`,
                });

                const config = await loadServerConfigAsMigrationDown();
                if (!Number.isInteger(config.count)) {
                    AppConsole.log({ icon: '❌', en: '"--count" must be integer' });
                    return;
                }
                if (config.count < 0) {
                    AppConsole.log({ icon: '❌', en: '"--count" must not be negative' });
                    return;
                }

                const migrator = orm.getMigrator();
                for (const _ of new Array(config.count).fill('')) {
                    await migrator.down();
                    AppConsole.log({ en: 'A migration-down is finished.' });
                }
                AppConsole.log({
                    icon: '😊',
                    en: `Migration-down has been successfully finished. DB is ${prettify(dbType)}.`,
                    ja: `マイグレーションのdownが正常に完了しました。DBは${prettify(dbType)}です。`,
                });
                return;
            }
            case check: {
                if (await hasMigrations(orm)) {
                    AppConsole.log(migrationCheckErrorMessage(dbType));
                } else {
                    AppConsole.log(migrationCheckOkMessage(dbType));
                }
                return;
            }
        }
    } finally {
        // これがないとターミナルなどで実行したときに自動で終わらない。
        orm.close();
    }
};

export const checkMigrationsBeforeStart = async (
    orm: MikroORM<IDatabaseDriver<Connection>>,
    dbType: DBType
) => {
    if (await hasMigrations(orm)) {
        await orm.close();
        throw migrationCheckErrorMessage(dbType);
    }
    AppConsole.log(migrationCheckOkMessage(dbType));
};

export const doAutoMigrationBeforeStart = async (
    orm: MikroORM<IDatabaseDriver<Connection>>,
    dbType: DBType
) => {
    await migrateUpCore({
        orm,
        dbType,
        type: autoMigrationAlways,
    });
};
