import { migrateByNpmScript } from './migrate';
import { AppConsole } from './utils/appConsole';
import { loadMigrationCreate } from './utils/commandLineArgs';

const main = async () => {
    const commandLineArgs = await loadMigrationCreate();

    migrateByNpmScript(commandLineArgs.init ? 'create-initial' : 'create').catch((err: Error) => {
        AppConsole.fatal({
            en: 'migration failed. ',
            ja: 'マイグレーションに失敗しました。',
            errorObject: err,
        });
        process.exit(1);
    });
};

void main();
