"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = exports.checkMigrationsBeforeStart = void 0;
const config_1 = require("./config");
const mikro_orm_1 = require("./mikro-orm");
const appConsole_1 = require("./utils/appConsole");
const check = 'check';
const create = 'create';
const createInitial = 'create-initial';
const up = 'up';
const down = 'down';
const sqlite = 'sqlite';
const postgresql = 'postgresql';
const prettify = (dbType) => {
    switch (dbType) {
        case sqlite:
            return 'SQLite';
        case postgresql:
            return 'PostgreSQL';
    }
};
const migrationCheckErrorMessage = (dbType) => ({
    icon: '❗',
    en: `Pending migrations were found. You need to execute "migration-up" command to run the server. It is recommended to backup the DB before executing the command if the DB has some data you don't want to lose. DB is ${prettify(dbType)}`,
    ja: `適用すべきマイグレーションが見つかりました。サーバーを稼働させるには"migration-up"コマンドを実行する必要があります。もし失いたくないデータがDBにある場合、そのコマンドを実行する前にDBをバックアップしておくことを推奨します。DBは${prettify(dbType)}です。`,
});
const migrationCheckOkMessage = (dbType) => ({
    icon: '✔️',
    en: `No pending migrations were found. DB is ${prettify(dbType)}`,
    ja: `適用すべきマイグレーションはありません。DBは${prettify(dbType)}です。`,
});
const hasMigrations = async (orm) => {
    const migrator = orm.getMigrator();
    const migrations = await migrator.getPendingMigrations();
    return migrations && migrations.length > 0;
};
const checkMigrationsBeforeStart = async (orm, dbType) => {
    if (await hasMigrations(orm)) {
        await orm.close();
        throw migrationCheckErrorMessage(dbType);
    }
    appConsole_1.AppConsole.log(migrationCheckOkMessage(dbType));
};
exports.checkMigrationsBeforeStart = checkMigrationsBeforeStart;
const migrate = async (type) => {
    const serverConfig = await (() => {
        switch (type) {
            case up:
                return (0, config_1.loadServerConfigAsMigrationUp)();
            case down:
                return (0, config_1.loadServerConfigAsMigrationDown)();
            case check:
                return (0, config_1.loadServerConfigAsMain)();
            default:
                return (0, config_1.loadServerConfigAsMigrationCreate)();
        }
    })();
    let orm;
    let dbType;
    switch (serverConfig.database.__type) {
        case sqlite:
            orm = await (0, mikro_orm_1.createSQLite)(Object.assign(Object.assign({}, serverConfig.database), { debug: type !== check }));
            dbType = sqlite;
            break;
        case postgresql:
            orm = await (0, mikro_orm_1.createPostgreSQL)(Object.assign(Object.assign({}, serverConfig.database), { debug: type !== check }));
            dbType = postgresql;
            break;
    }
    switch (type) {
        case create: {
            appConsole_1.AppConsole.log({
                en: `Migration-create is started. DB is ${prettify(dbType)}.`,
                ja: `マイグレーションの作成を開始します。DBは${prettify(dbType)}です。`,
            });
            try {
                const migrator = orm.getMigrator();
                await migrator.createMigration();
            }
            finally {
                await orm.close(true);
            }
            appConsole_1.AppConsole.log({
                icon: '😊',
                en: `Migration-create has been successfully finished. DB is ${prettify(dbType)}.`,
                ja: `マイグレーションの作成が正常に完了しました。DBは${prettify(dbType)}です。`,
            });
            return;
        }
        case createInitial: {
            appConsole_1.AppConsole.log({
                en: `Migration-create-init is started. DB is ${prettify(dbType)}.`,
                ja: `マイグレーションの新規作成を開始します。DBは${prettify(dbType)}です。`,
            });
            try {
                const migrator = orm.getMigrator();
                await migrator.createInitialMigration();
            }
            finally {
                await orm.close(true);
            }
            appConsole_1.AppConsole.log({
                icon: '😊',
                en: `Migration-create-init has been successfully finished. DB is ${prettify(dbType)}.`,
                ja: `マイグレーションの新規作成が正常に完了しました。DBは${prettify(dbType)}です。`,
            });
            return;
        }
        case up: {
            appConsole_1.AppConsole.log({
                en: `Migration-up is started. DB is ${prettify(dbType)}`,
                ja: `マイグレーションのupを開始します。DBは${prettify(dbType)}です。`,
            });
            try {
                const migrator = orm.getMigrator();
                const migrations = await migrator.getPendingMigrations();
                if (migrations && migrations.length > 0) {
                    appConsole_1.AppConsole.log({
                        en: 'Pending migrations were found. Migrating...',
                        ja: '適用すべきマイグレーションが見つかりました。マイグレーションを行います…',
                    });
                    await migrator.up();
                }
                else {
                    appConsole_1.AppConsole.log({
                        icon: '✔️',
                        en: 'No migration found.',
                        ja: '適用すべきマイグレーションはありません。',
                    });
                }
            }
            finally {
                await orm.close(true);
            }
            appConsole_1.AppConsole.log({
                icon: '😊',
                en: `Migration-up has been successfully finished. DB is ${prettify(dbType)}.`,
                ja: `マイグレーションのupが正常に完了しました。DBは${prettify(dbType)}です。`,
            });
            return;
        }
        case down: {
            appConsole_1.AppConsole.log({
                en: `Migration-down is started. DB is ${prettify(dbType)}.`,
                ja: `マイグレーションのdownを開始します。DBは${prettify(dbType)}です。`,
            });
            const config = await (0, config_1.loadServerConfigAsMigrationDown)();
            if (!Number.isInteger(config.count)) {
                appConsole_1.AppConsole.log({ icon: '❌', en: '"--count" must be integer' });
                return;
            }
            if (config.count < 0) {
                appConsole_1.AppConsole.log({ icon: '❌', en: '"--count" must not be negative' });
                return;
            }
            try {
                const migrator = orm.getMigrator();
                for (const _ of new Array(config.count).fill('')) {
                    await migrator.down();
                    appConsole_1.AppConsole.log({ en: 'A migration-down is finished.' });
                }
            }
            finally {
                await orm.close(true);
            }
            appConsole_1.AppConsole.log({
                icon: '😊',
                en: `Migration-down has been successfully finished. DB is ${prettify(dbType)}.`,
                ja: `マイグレーションのdownが正常に完了しました。DBは${prettify(dbType)}です。`,
            });
            return;
        }
        case check: {
            try {
                if (await hasMigrations(orm)) {
                    appConsole_1.AppConsole.log(migrationCheckErrorMessage(dbType));
                }
                else {
                    appConsole_1.AppConsole.log(migrationCheckOkMessage(dbType));
                }
            }
            finally {
                await orm.close(true);
            }
            return;
        }
    }
};
exports.migrate = migrate;
