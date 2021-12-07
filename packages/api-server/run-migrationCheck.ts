import { migrateByTsNode } from './src/migrate';
import { AppConsole } from './src/utils/appConsole';

migrateByTsNode('check').catch(err => {
    console.error(err);
    AppConsole.error({
        en: '❌ migration-check failed. ',
        ja: '❌ マイグレーションのチェックに失敗しました。',
    });
    process.exit(1);
});
