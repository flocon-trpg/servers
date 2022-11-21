'use strict';

var createORM = require('./config/createORM.js');
var createORMOptions = require('./config/createORMOptions.js');
var logConfigParser = require('./config/logConfigParser.js');
var serverConfigParser = require('./config/serverConfigParser.js');
var logger = require('./logger.js');
var appConsole = require('./utils/appConsole.js');
var commandLineArgs = require('./utils/commandLineArgs.js');

const check = 'check';
const create = 'create';
const createInitial = 'create-initial';
const up = 'up';
const down = 'down';
const autoMigrationAlways = 'autoMigrationAlways';
const migrationCheckErrorMessage = {
    icon: '❗',
    en: `Pending migrations were found. You need to execute "migration-up" command to run the server. It is recommended to backup the DB before executing the command if the DB has some data you don't want to lose.`,
    ja: `適用すべきマイグレーションが見つかりました。サーバーを稼働させるには"migration-up"コマンドを実行する必要があります。もし失いたくないデータがDBにある場合、そのコマンドを実行する前にDBをバックアップしておくことを推奨します。`,
};
const migrationCheckOkMessage = {
    icon: '✔️',
    en: `No pending migrations were found.`,
    ja: `適用すべきマイグレーションはありません。`,
};
const hasMigrations = async (orm) => {
    const migrator = orm.getMigrator();
    const migrations = await migrator.getPendingMigrations();
    return migrations && migrations.length > 0;
};
const migrateUpCore = async ({ type, orm, }) => {
    appConsole.AppConsole.infoAsNotice({
        en: `Migration-up is started${type === autoMigrationAlways ? '(reason: AUTO_MIGRATION is enabled)' : ''}.`,
        ja: `マイグレーションのupを開始します${type === autoMigrationAlways ? '(reason: AUTO_MIGRATION is enabled)' : ''}。`,
    });
    const migrator = orm.getMigrator();
    const migrations = await migrator.getPendingMigrations();
    if (migrations && migrations.length > 0) {
        appConsole.AppConsole.infoAsNotice({
            en: 'Pending migrations were found. Migrating...',
            ja: '適用すべきマイグレーションが見つかりました。マイグレーションを行います…',
        });
        await migrator.up();
    }
    else {
        appConsole.AppConsole.infoAsNotice({
            icon: '✔️',
            en: 'No migration found.',
            ja: '適用すべきマイグレーションはありません。',
        });
    }
    appConsole.AppConsole.infoAsNotice({
        icon: '😊',
        en: `Migration-up has been successfully finished.`,
        ja: `マイグレーションのupが正常に完了しました。`,
    });
};
const migrateByNpmScript = async (type) => {
    const logConfigResult = new logConfigParser.LogConfigParser(process.env).logConfig;
    logger.initializeLogger(logConfigResult);
    const serverConfigParser$1 = new serverConfigParser.ServerConfigParser(process.env);
    const serverConfig = serverConfigParser$1.serverConfigForMigration;
    if (serverConfig.isError) {
        throw new Error(serverConfig.error);
    }
    const createORM$1 = (...[serverConfig, databaseArg, dirName]) => {
        return createORM.createORM(createORMOptions.createORMOptions(serverConfig, databaseArg, dirName));
    };
    let orm = undefined;
    try {
        switch (type) {
            case create: {
                appConsole.AppConsole.infoAsNotice({
                    en: `Migration-create is started.`,
                    ja: `マイグレーションの作成を開始します。`,
                });
                const commandLineArgs$1 = await commandLineArgs.loadMigrationCreate();
                orm = await createORM$1(serverConfig.value, commandLineArgs$1.db, 'src');
                if (orm.isError) {
                    throw new Error(orm.error);
                }
                const migrator = orm.value.getMigrator();
                await migrator.createMigration();
                appConsole.AppConsole.infoAsNotice({
                    icon: '😊',
                    en: `Migration-create has been successfully finished.`,
                    ja: `マイグレーションの作成が正常に完了しました。`,
                });
                return;
            }
            case createInitial: {
                appConsole.AppConsole.infoAsNotice({
                    en: `Migration-create-init is started. `,
                    ja: `マイグレーションの新規作成を開始します。`,
                });
                const commandLineArgs$1 = await commandLineArgs.loadMigrationCreate();
                orm = await createORM$1(serverConfig.value, commandLineArgs$1.db, 'src');
                if (orm.isError) {
                    throw new Error(orm.error);
                }
                const migrator = orm.value.getMigrator();
                await migrator.createInitialMigration();
                appConsole.AppConsole.infoAsNotice({
                    icon: '😊',
                    en: `Migration-create-init has been successfully finished.`,
                    ja: `マイグレーションの新規作成が正常に完了しました。`,
                });
                return;
            }
            case up:
            case autoMigrationAlways: {
                const commandLineArgs$1 = await commandLineArgs.loadMigrationUpOrCheck();
                orm = await createORM$1(serverConfig.value, commandLineArgs$1.db, 'dist');
                if (orm.isError) {
                    throw new Error(orm.error);
                }
                await migrateUpCore({
                    orm: orm.value,
                    type,
                });
                return;
            }
            case down: {
                appConsole.AppConsole.infoAsNotice({
                    en: `Migration-down is started. `,
                    ja: `マイグレーションのdownを開始します。`,
                });
                const commandLineArgs$1 = await commandLineArgs.loadMigrationDown();
                orm = await createORM$1(serverConfig.value, commandLineArgs$1.db, 'dist');
                if (orm.isError) {
                    throw new Error(orm.error);
                }
                if (!Number.isInteger(commandLineArgs$1.count)) {
                    appConsole.AppConsole.fatal({ en: '"--count" must be integer' });
                    return;
                }
                if (commandLineArgs$1.count < 0) {
                    appConsole.AppConsole.fatal({ en: '"--count" must not be negative' });
                    return;
                }
                const migrator = orm.value.getMigrator();
                for (const _ of new Array(commandLineArgs$1.count).fill('')) {
                    await migrator.down();
                    appConsole.AppConsole.infoAsNotice({ en: 'A migration-down is finished.' });
                }
                appConsole.AppConsole.infoAsNotice({
                    icon: '😊',
                    en: `Migration-down has been successfully finished.`,
                    ja: `マイグレーションのdownが正常に完了しました。`,
                });
                return;
            }
            case check: {
                const commandLineArgs$1 = await commandLineArgs.loadMigrationUpOrCheck();
                orm = await createORM$1(serverConfig.value, commandLineArgs$1.db, 'dist');
                if (orm.isError) {
                    throw new Error(orm.error);
                }
                if (await hasMigrations(orm.value)) {
                    appConsole.AppConsole.infoAsNotice(migrationCheckErrorMessage);
                }
                else {
                    appConsole.AppConsole.infoAsNotice(migrationCheckOkMessage);
                }
                return;
            }
        }
    }
    finally {
        orm?.value?.close();
    }
};
const checkMigrationsBeforeStart = async (orm) => {
    if (await hasMigrations(orm)) {
        await orm.close();
        throw new Error(appConsole.AppConsole.messageToString(migrationCheckErrorMessage));
    }
    appConsole.AppConsole.infoAsNotice(migrationCheckOkMessage);
};
const doAutoMigrationBeforeStart = async (orm) => {
    await migrateUpCore({
        orm,
        type: autoMigrationAlways,
    });
};

exports.checkMigrationsBeforeStart = checkMigrationsBeforeStart;
exports.doAutoMigrationBeforeStart = doAutoMigrationBeforeStart;
exports.migrateByNpmScript = migrateByNpmScript;
//# sourceMappingURL=migrate.js.map
