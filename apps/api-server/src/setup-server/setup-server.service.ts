import { Result } from '@kizahasi/result';
import { Injectable } from '@nestjs/common';
import { FIREBASE_PROJECT_ID } from '../env';
import { InitializeFirebaseService } from '../initialize-firebase/initialize-firebase.service';
import { MigrationService } from '../migration/migration.service';
import { ServerConfig, ServerConfigService } from '../server-config/server-config.service';
import { AppConsole } from '../utils/appConsole';

const logEntryPasswordConfig = (serverConfig: ServerConfig) => {
    if (serverConfig.entryPassword == null) {
        AppConsole.infoAsNotice({
            icon: '🔓',
            en: 'Entry password is disabled.',
            ja: 'エントリーパスワードは無効化されています。',
        });
    } else {
        AppConsole.infoAsNotice({
            icon: '🔐',
            en: 'Entry password is enabled.',
            ja: 'エントリーパスワードは有効化されています。',
        });
    }
};

@Injectable()
export class SetupServerService {
    #setupResultCache: Result<undefined> | null = null;

    public constructor(
        private readonly serverConfigService: ServerConfigService,
        private readonly migrationService: MigrationService,
        private readonly initializeFirebaseService: InitializeFirebaseService,
    ) {}

    async #setupWithoutCache(): Promise<Result<undefined>> {
        const firebaseInitializationResult = await this.initializeFirebaseService.initialize();
        if (firebaseInitializationResult.isError) {
            return firebaseInitializationResult;
        }

        const serverConfig = this.serverConfigService.getValueForce();
        if (serverConfig.autoMigration) {
            try {
                await this.migrationService.doAutoMigrationBeforeStart();
            } catch (error: unknown) {
                return Result.error(`Migration failed. ${(error as Error).message}`);
            }
        } else {
            const checkMigrationResult = await this.migrationService.checkMigrationsBeforeStart();
            if (checkMigrationResult.isError) {
                return checkMigrationResult;
            }
        }
        logEntryPasswordConfig(serverConfig);

        return Result.ok(undefined);
    }

    public async setup(): Promise<Result<undefined>> {
        if (this.#setupResultCache != null) {
            return this.#setupResultCache;
        }
        this.#setupResultCache = await this.#setupWithoutCache();
        return this.#setupResultCache;
    }
}
