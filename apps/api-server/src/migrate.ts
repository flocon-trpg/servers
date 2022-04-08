import { Result } from '@kizahasi/result';
import { Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core';
import { ServerConfigBuilder } from './config';
import { ServerConfigForMigration } from './configType';
import { AppConsole } from './utils/appConsole';
import {
    loadMigrationCreate,
    loadMigrationDown,
    loadMigrationUpOrCheck,
} from './utils/commandLineArgs';
import { ORM } from './utils/types';

const check = 'check';
const create = 'create';
const createInitial = 'create-initial';
const up = 'up';
const down = 'down';
const autoMigrationAlways = 'autoMigrationAlways';

const migrationCheckErrorMessage: AppConsole.Message = {
    icon: '❗',
    en: `Pending migrations were found. You need to execute "migration-up" command to run the server. It is recommended to backup the DB before executing the command if the DB has some data you don't want to lose.`,
    ja: `適用すべきマイグレーションが見つかりました。サーバーを稼働させるには"migration-up"コマンドを実行する必要があります。もし失いたくないデータがDBにある場合、そのコマンドを実行する前にDBをバックアップしておくことを推奨します。`,
};

const migrationCheckOkMessage: AppConsole.Message = {
    icon: '✔️',
    en: `No pending migrations were found.`,
    ja: `適用すべきマイグレーションはありません。`,
};

const hasMigrations = async (orm: MikroORM<IDatabaseDriver<Connection>>) => {
    const migrator = orm.getMigrator();
    const migrations = await migrator.getPendingMigrations();
    return migrations && migrations.length > 0;
};

const migrateUpCore = async ({
    type,
    orm,
}: {
    type: typeof up | typeof autoMigrationAlways;
    orm: ORM;
}) => {
    AppConsole.log({
        en: `Migration-up is started${
            type === autoMigrationAlways ? '(reason: AUTO_MIGRATION is enabled)' : ''
        }.`,
        ja: `マイグレーションのupを開始します${
            type === autoMigrationAlways ? '(reason: AUTO_MIGRATION is enabled)' : ''
        }。`,
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
        en: `Migration-up has been successfully finished.`,
        ja: `マイグレーションのupが正常に完了しました。`,
    });
};

export const migrateByNpmScript = async (
    type:
        | typeof check
        | typeof create
        | typeof createInitial
        | typeof up
        | typeof down
        | typeof autoMigrationAlways
) => {
    const serverConfigBuilder = new ServerConfigBuilder(process.env);
    const serverConfig = serverConfigBuilder.serverConfigForMigration;
    if (serverConfig.isError) {
        throw new Error(serverConfig.error);
    }

    let orm: Result<ORM> | undefined = undefined;
    try {
        switch (type) {
            case create: {
                AppConsole.log({
                    en: `Migration-create is started.`,
                    ja: `マイグレーションの作成を開始します。`,
                });
                const commandLineArgs = await loadMigrationCreate();
                orm = await ServerConfigForMigration.createORM(
                    serverConfig.value,
                    commandLineArgs.db ?? null,
                    'src',
                    true
                );
                if (orm.isError) {
                    throw new Error(orm.error);
                }
                const migrator = orm.value.getMigrator();
                await migrator.createMigration();
                AppConsole.log({
                    icon: '😊',
                    en: `Migration-create has been successfully finished.`,
                    ja: `マイグレーションの作成が正常に完了しました。`,
                });
                return;
            }
            case createInitial: {
                AppConsole.log({
                    en: `Migration-create-init is started. `,
                    ja: `マイグレーションの新規作成を開始します。`,
                });
                const commandLineArgs = await loadMigrationCreate();
                orm = await ServerConfigForMigration.createORM(
                    serverConfig.value,
                    commandLineArgs.db ?? null,
                    'src',
                    true
                );
                if (orm.isError) {
                    throw new Error(orm.error);
                }
                const migrator = orm.value.getMigrator();
                await migrator.createInitialMigration();
                AppConsole.log({
                    icon: '😊',
                    en: `Migration-create-init has been successfully finished.`,
                    ja: `マイグレーションの新規作成が正常に完了しました。`,
                });
                return;
            }
            case up:
            case autoMigrationAlways: {
                const commandLineArgs = await loadMigrationUpOrCheck();
                orm = await ServerConfigForMigration.createORM(
                    serverConfig.value,
                    commandLineArgs.db ?? null,
                    'dist',
                    true
                );
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
                AppConsole.log({
                    en: `Migration-down is started. `,
                    ja: `マイグレーションのdownを開始します。`,
                });

                const commandLineArgs = await loadMigrationDown();
                orm = await ServerConfigForMigration.createORM(
                    serverConfig.value,
                    commandLineArgs.db ?? null,
                    'dist',
                    true
                );
                if (orm.isError) {
                    throw new Error(orm.error);
                }

                if (!Number.isInteger(commandLineArgs.count)) {
                    AppConsole.log({ icon: '❌', en: '"--count" must be integer' });
                    return;
                }
                if (commandLineArgs.count < 0) {
                    AppConsole.log({ icon: '❌', en: '"--count" must not be negative' });
                    return;
                }

                const migrator = orm.value.getMigrator();
                for (const _ of new Array(commandLineArgs.count).fill('')) {
                    await migrator.down();
                    AppConsole.log({ en: 'A migration-down is finished.' });
                }
                AppConsole.log({
                    icon: '😊',
                    en: `Migration-down has been successfully finished.`,
                    ja: `マイグレーションのdownが正常に完了しました。`,
                });
                return;
            }
            case check: {
                const commandLineArgs = await loadMigrationUpOrCheck();
                orm = await ServerConfigForMigration.createORM(
                    serverConfig.value,
                    commandLineArgs.db ?? null,
                    'dist',
                    true
                );
                if (orm.isError) {
                    throw new Error(orm.error);
                }
                if (await hasMigrations(orm.value)) {
                    AppConsole.log(migrationCheckErrorMessage);
                } else {
                    AppConsole.log(migrationCheckOkMessage);
                }
                return;
            }
        }
    } finally {
        // これがないとターミナルなどで実行したときに自動で終わらない。
        orm?.value?.close();
    }
};

export const checkMigrationsBeforeStart = async (orm: MikroORM<IDatabaseDriver<Connection>>) => {
    if (await hasMigrations(orm)) {
        await orm.close();
        throw new Error(AppConsole.messageToString(migrationCheckErrorMessage));
    }
    AppConsole.log(migrationCheckOkMessage);
};

export const doAutoMigrationBeforeStart = async (orm: MikroORM<IDatabaseDriver<Connection>>) => {
    await migrateUpCore({
        orm,
        type: autoMigrationAlways,
    });
};
