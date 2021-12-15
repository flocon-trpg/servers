import { migrateByNpmScript } from './migrate';
import { AppConsole } from './utils/appConsole';

migrateByNpmScript('up').catch(err => {
    console.error(err);
    AppConsole.error({
        en: '❌ migration failed. ',
        ja: '❌ マイグレーションに失敗しました。',
    });
    process.exit(1);
});
