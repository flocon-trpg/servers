import { migrateByNpmScript } from './migrate';
import { AppConsole } from './utils/appConsole';

migrateByNpmScript('check').catch(err => {
    AppConsole.fatal({
        en: 'migration-check failed. ',
        ja: 'マイグレーションのチェックに失敗しました。',
        errorObject: err,
    });
    process.exit(1);
});
