import { Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core';
import {
    loadServerConfigAsMain,
    loadServerConfigAsMigrationCreate,
    loadServerConfigAsMigrationDown,
    loadServerConfigAsMigrationUp,
} from './config';
import { createPostgreSQL, createSQLite } from './mikro-orm';

const check = 'check';
const create = 'create';
const createInitial = 'create-initial';
const up = 'up';
const down = 'down';

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

const migrationCheckErrorMessage = (dbType: DBType) =>
    `❗ Pending migrations were found. You need to execute "migration-up" command to run the server. It is recommended to backup the DB before executing the command if the DB has some data you don't want to lose. DB is ${prettify(
        dbType
    )}. / 適用すべきマイグレーションが見つかりました。サーバーを稼働させるには"migration-up"コマンドを実行する必要があります。もし失いたくないデータがDBにある場合、そのコマンドを実行する前にDBをバックアップしておくことを推奨します。DBは${prettify(
        dbType
    )}です。`;

const migrationCheckOkMessage = (dbType: DBType) =>
    `✔️ No pending migrations were found. DB is ${prettify(
        dbType
    )}. / 適用すべきマイグレーションはありません。DBは${prettify(dbType)}です。`;

const hasMigrations = async (orm: MikroORM<IDatabaseDriver<Connection>>) => {
    const migrator = orm.getMigrator();
    const migrations = await migrator.getPendingMigrations();
    return migrations && migrations.length > 0;
};

export const checkMigrationsBeforeStart = async (
    orm: MikroORM<IDatabaseDriver<Connection>>,
    dbType: DBType
) => {
    if (await hasMigrations(orm)) {
        await orm.close();
        throw migrationCheckErrorMessage(dbType);
    }
    console.log(migrationCheckOkMessage(dbType));
};

export const migrate = async (
    type: typeof check | typeof create | typeof createInitial | typeof up | typeof down
) => {
    const serverConfig = await (() => {
        switch (type) {
            case up:
                return loadServerConfigAsMigrationUp();
            case down:
                return loadServerConfigAsMigrationDown();
            case check:
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
            orm = await createSQLite({ ...serverConfig.database.sqlite, debug: type !== check });
            dbType = sqlite;
            break;
        case postgresql:
            orm = await createPostgreSQL({
                ...serverConfig.database.postgresql,
                debug: type !== check,
            });
            dbType = postgresql;
            break;
    }

    switch (type) {
        case create: {
            console.log(
                `Migration-create is started. DB is ${prettify(
                    dbType
                )}. / マイグレーションの作成を開始します。DBは${prettify(dbType)}です。`
            );
            try {
                const migrator = orm.getMigrator();
                await migrator.createMigration();
            } finally {
                // これがないとターミナルなどで実行したときに自動で終わらない。
                await orm.close(true);
            }
            console.log(
                `😊 Migration-create has been successfully finished. DB is ${prettify(
                    dbType
                )}. / マイグレーションの作成が正常に完了しました。DBは${prettify(dbType)}です。`
            );
            return;
        }
        case createInitial: {
            console.log(
                `Migration-create-init is started. DB is ${prettify(
                    dbType
                )}. / マイグレーションの新規作成を開始します。DBは${prettify(dbType)}です。`
            );
            try {
                const migrator = orm.getMigrator();
                await migrator.createInitialMigration();
            } finally {
                // これがないとターミナルなどで実行したときに自動で終わらない。
                await orm.close(true);
            }
            console.log(
                `😊 Migration-create-init has been successfully finished. DB is ${prettify(
                    dbType
                )}. / マイグレーションの新規作成が正常に完了しました。DBは${prettify(dbType)}です。`
            );
            return;
        }
        case up: {
            console.log(
                `Migration-up is started. DB is ${prettify(
                    dbType
                )}. / マイグレーションのupを開始します。DBは${prettify(dbType)}です。`
            );
            try {
                const migrator = orm.getMigrator();
                const migrations = await migrator.getPendingMigrations();
                if (migrations && migrations.length > 0) {
                    console.log(
                        'Pending migrations were found. Migrating... / 適用すべきマイグレーションが見つかりました。マイグレーションを行います…'
                    );
                    await migrator.up();
                } else {
                    console.log(
                        '✔️ No migration found. / 適用すべきマイグレーションはありません。'
                    );
                }
            } finally {
                // これがないとターミナルなどで実行したときに自動で終わらない。
                await orm.close(true);
            }
            console.log(
                `😊 Migration-up has been successfully finished. DB is ${prettify(
                    dbType
                )}. / マイグレーションのupが正常に完了しました。DBは${prettify(dbType)}です。`
            );
            return;
        }
        case down: {
            console.log(
                `Migration-down is started. DB is ${prettify(
                    dbType
                )}. / マイグレーションのdownを開始します。DBは${prettify(dbType)}です。`
            );

            const config = await loadServerConfigAsMigrationDown();
            if (!Number.isInteger(config.count)) {
                console.log('❌ "--count" must be integer');
                return;
            }
            if (config.count < 0) {
                console.log('❌ "--count" must not be negative');
                return;
            }

            try {
                const migrator = orm.getMigrator();
                for (const _ of new Array(config.count).fill('')) {
                    await migrator.down();
                    console.log('A migration-down is finished.');
                }
            } finally {
                // これがないとターミナルなどで実行したときに自動で終わらない。
                await orm.close(true);
            }
            console.log(
                `😊 Migration-down has been successfully finished. DB is ${prettify(
                    dbType
                )}. / マイグレーションのdownが正常に完了しました。DBは${prettify(dbType)}です。`
            );
            return;
        }
        case check: {
            try {
                if (await hasMigrations(orm)) {
                    console.log(migrationCheckErrorMessage(dbType));
                } else {
                    console.log(migrationCheckOkMessage(dbType));
                }
            } finally {
                // これがないとターミナルなどで実行したときに自動で終わらない。
                await orm.close(true);
            }
            return;
        }
    }
};
