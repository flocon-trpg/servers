import { migrateByTsNode } from './src/migrate';
import { AppConsole } from './src/utils/appConsole';

migrateByTsNode('up').catch(err => {
    console.error(err);
    AppConsole.error({
        en: '❌ migration failed. ',
        ja: '❌ マイグレーションに失敗しました。',
    });
    process.exit(1);
});
