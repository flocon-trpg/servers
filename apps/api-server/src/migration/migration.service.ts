import { Result } from '@kizahasi/result';
import { Injectable } from '@nestjs/common';
import { MikroOrmService } from '../mikro-orm/mikro-orm.service';
import { ORM } from '../types';
import { AppConsole } from '../utils/appConsole';
import { YargsService } from '../yargs/yargs.service';

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

const hasMigrations = async (orm: ORM) => {
    const migrator = orm.getMigrator();
    const migrations = await migrator.getPendingMigrations();
    return migrations && migrations.length > 0;
};

@Injectable()
export class MigrationService {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly yargsService: YargsService,
    ) {}

    async #migrateByNpmScript({
        type,
    }: {
        type:
            | typeof check
            | typeof create
            | typeof createInitial
            | typeof up
            | typeof down
            | typeof autoMigrationAlways;
    }) {
        let orm: ORM | undefined = undefined;
        try {
            switch (type) {
                case create: {
                    AppConsole.infoAsNotice({
                        en: `Migration-create is started.`,
                        ja: `マイグレーションの作成を開始します。`,
                    });
                    orm = await this.mikroOrmService.createOrmForMigrationCreate('src');
                    const migrator = orm.getMigrator();
                    await migrator.createMigration();
                    AppConsole.infoAsNotice({
                        icon: '😊',
                        en: `Migration-create has been successfully finished.`,
                        ja: `マイグレーションの作成が正常に完了しました。`,
                    });
                    return;
                }
                case createInitial: {
                    AppConsole.infoAsNotice({
                        en: `Migration-create-init is started. `,
                        ja: `マイグレーションの新規作成を開始します。`,
                    });
                    orm = await this.mikroOrmService.createOrmForMigrationCreate('src');
                    const migrator = orm.getMigrator();
                    await migrator.createInitialMigration();
                    AppConsole.infoAsNotice({
                        icon: '😊',
                        en: `Migration-create-init has been successfully finished.`,
                        ja: `マイグレーションの新規作成が正常に完了しました。`,
                    });
                    return;
                }
                case up:
                case autoMigrationAlways: {
                    orm = await this.mikroOrmService.createOrmForMigrationUpOrCheck('dist');
                    await this.#migrateUpCore({
                        orm: orm,
                        type,
                    });
                    return;
                }
                case down: {
                    AppConsole.infoAsNotice({
                        en: `Migration-down is started. `,
                        ja: `マイグレーションのdownを開始します。`,
                    });

                    const commandLineArgs = await this.yargsService.getMigrationDown();
                    orm = await this.mikroOrmService.createOrmForMigrationDown('dist');

                    if (!Number.isInteger(commandLineArgs.count)) {
                        AppConsole.fatal({ en: '"--count" must be integer' });
                        return;
                    }
                    if (commandLineArgs.count < 0) {
                        AppConsole.fatal({ en: '"--count" must not be negative' });
                        return;
                    }

                    const migrator = orm.getMigrator();
                    for (const _ of new Array(commandLineArgs.count).fill('')) {
                        await migrator.down();
                        AppConsole.infoAsNotice({ en: 'A migration-down is finished.' });
                    }
                    AppConsole.infoAsNotice({
                        icon: '😊',
                        en: `Migration-down has been successfully finished.`,
                        ja: `マイグレーションのdownが正常に完了しました。`,
                    });
                    return;
                }
                case check: {
                    orm = await this.mikroOrmService.createOrmForMigrationUpOrCheck('dist');
                    if (await hasMigrations(orm)) {
                        AppConsole.infoAsNotice(migrationCheckErrorMessage);
                    } else {
                        AppConsole.infoAsNotice(migrationCheckOkMessage);
                    }
                    return;
                }
            }
        } finally {
            // これがないとターミナルなどで実行したときに自動で終わらない。
            void orm?.close();
        }
    }

    async #migrateUpCore({
        type,
        orm,
    }: {
        type: typeof up | typeof autoMigrationAlways;
        orm: ORM;
    }) {
        AppConsole.infoAsNotice({
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
            AppConsole.infoAsNotice({
                en: 'Pending migrations were found. Migrating...',
                ja: '適用すべきマイグレーションが見つかりました。マイグレーションを行います…',
            });
            await migrator.up();
        } else {
            AppConsole.infoAsNotice({
                icon: '✔️',
                en: 'No migration found.',
                ja: '適用すべきマイグレーションはありません。',
            });
        }
        AppConsole.infoAsNotice({
            icon: '😊',
            en: `Migration-up has been successfully finished.`,
            ja: `マイグレーションのupが正常に完了しました。`,
        });
    }

    public async checkMigrationsBeforeStart(): Promise<Result<void>> {
        const orm = await this.mikroOrmService.getOrmForMain();
        if (await hasMigrations(orm)) {
            await orm.close();
            return Result.error(AppConsole.messageToString(migrationCheckErrorMessage));
        }
        AppConsole.infoAsNotice(migrationCheckOkMessage);
        return Result.ok(undefined);
    }

    public async doAutoMigrationBeforeStart() {
        const orm = await this.mikroOrmService.getOrmForMain();
        await this.#migrateUpCore({
            orm,
            type: autoMigrationAlways,
        });
    }

    public async doMigrationCreate() {
        await this.#migrateByNpmScript({
            type: create,
        });
    }

    public async doMigrationCheck() {
        await this.#migrateByNpmScript({
            type: check,
        });
    }

    public async doMigrationUp() {
        await this.#migrateByNpmScript({
            type: up,
        });
    }

    public async doMigrationDown() {
        await this.#migrateByNpmScript({
            type: down,
        });
    }
}
