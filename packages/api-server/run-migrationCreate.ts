import { migrate } from './src/migrate';
import { AppConsole } from './src/utils/appConsole';
import { loadMigrationCreate } from './src/utils/commandLineArgs';

const main = async () => {
    const commandLineArgs = await loadMigrationCreate();

    migrate(commandLineArgs.init ? 'create-initial' : 'create').catch(err => {
        console.error(err);
        AppConsole.error({
            en: '❌ migration failed. ',
            ja: '❌ マイグレーションに失敗しました。',
        });
        process.exit(1);
    });
};

main();
