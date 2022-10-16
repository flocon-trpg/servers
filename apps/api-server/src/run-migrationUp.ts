import { migrateByNpmScript } from './migrate';
import { AppConsole } from './utils/appConsole';

migrateByNpmScript('up').catch(err => {
    AppConsole.error({
        en: '❌ migration failed. ',
        ja: '❌ マイグレーションに失敗しました。',
        errorObject: err,
    });
    process.exit(1);
});
