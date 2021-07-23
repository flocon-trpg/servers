"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = exports.checkMigrationsBeforeStart = void 0;
const config_1 = require("./config");
const mikro_orm_1 = require("./mikro-orm");
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
const migrationCheckErrorMessage = (dbType) => `❗ Pending migrations were found. You need to execute "migration-up" command to run the server. It is recommended to backup the DB before executing the command if the DB has some data you don't want to lose. DB is ${prettify(dbType)}. / 適用すべきマイグレーションが見つかりました。サーバーを稼働させるには"migration-up"コマンドを実行する必要があります。もし失いたくないデータがDBにある場合、そのコマンドを実行する前にDBをバックアップしておくことを推奨します。DBは${prettify(dbType)}です。`;
const migrationCheckOkMessage = (dbType) => `✔️ No pending migrations were found. DB is ${prettify(dbType)}. / 適用すべきマイグレーションはありません。DBは${prettify(dbType)}です。`;
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
    console.log(migrationCheckOkMessage(dbType));
};
exports.checkMigrationsBeforeStart = checkMigrationsBeforeStart;
const migrate = async (type) => {
    const serverConfig = await (() => {
        switch (type) {
            case up:
                return config_1.loadServerConfigAsMigrationUp();
            case down:
                return config_1.loadServerConfigAsMigrationDown();
            case check:
                return config_1.loadServerConfigAsMain();
            default:
                return config_1.loadServerConfigAsMigrationCreate();
        }
    })();
    let orm;
    let dbType;
    switch (serverConfig.database.__type) {
        case sqlite:
            orm = await mikro_orm_1.createSQLite(Object.assign(Object.assign({}, serverConfig.database.sqlite), { debug: type !== check }));
            dbType = sqlite;
            break;
        case postgresql:
            orm = await mikro_orm_1.createPostgreSQL(Object.assign(Object.assign({}, serverConfig.database.postgresql), { debug: type !== check }));
            dbType = postgresql;
            break;
    }
    switch (type) {
        case create: {
            console.log(`Migration-create is started. DB is ${prettify(dbType)}. / マイグレーションの作成を開始します。DBは${prettify(dbType)}です。`);
            try {
                const migrator = orm.getMigrator();
                await migrator.createMigration();
            }
            finally {
                await orm.close(true);
            }
            console.log(`😊 Migration-create has been successfully finished. DB is ${prettify(dbType)}. / マイグレーションの作成が正常に完了しました。DBは${prettify(dbType)}です。`);
            return;
        }
        case createInitial: {
            console.log(`Migration-create-init is started. DB is ${prettify(dbType)}. / マイグレーションの新規作成を開始します。DBは${prettify(dbType)}です。`);
            try {
                const migrator = orm.getMigrator();
                await migrator.createInitialMigration();
            }
            finally {
                await orm.close(true);
            }
            console.log(`😊 Migration-create-init has been successfully finished. DB is ${prettify(dbType)}. / マイグレーションの新規作成が正常に完了しました。DBは${prettify(dbType)}です。`);
            return;
        }
        case up: {
            console.log(`Migration-up is started. DB is ${prettify(dbType)}. / マイグレーションのupを開始します。DBは${prettify(dbType)}です。`);
            try {
                const migrator = orm.getMigrator();
                const migrations = await migrator.getPendingMigrations();
                if (migrations && migrations.length > 0) {
                    console.log('Pending migrations were found. Migrating... / 適用すべきマイグレーションが見つかりました。マイグレーションを行います…');
                    await migrator.up();
                }
                else {
                    console.log('✔️ No migration found. / 適用すべきマイグレーションはありません。');
                }
            }
            finally {
                await orm.close(true);
            }
            console.log(`😊 Migration-up has been successfully finished. DB is ${prettify(dbType)}. / マイグレーションのupが正常に完了しました。DBは${prettify(dbType)}です。`);
            return;
        }
        case down: {
            console.log(`Migration-down is started. DB is ${prettify(dbType)}. / マイグレーションのdownを開始します。DBは${prettify(dbType)}です。`);
            const config = await config_1.loadServerConfigAsMigrationDown();
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
            }
            finally {
                await orm.close(true);
            }
            console.log(`😊 Migration-down has been successfully finished. DB is ${prettify(dbType)}. / マイグレーションのdownが正常に完了しました。DBは${prettify(dbType)}です。`);
            return;
        }
        case check: {
            try {
                if (await hasMigrations(orm)) {
                    console.log(migrationCheckErrorMessage(dbType));
                }
                else {
                    console.log(migrationCheckOkMessage(dbType));
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
