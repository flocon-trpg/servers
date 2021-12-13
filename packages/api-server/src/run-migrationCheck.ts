import { migrateByNpmScript } from './migrate';
import { AppConsole } from './utils/appConsole';

migrateByNpmScript('check').catch(err => {
    console.error(err);
    AppConsole.error({
        en: '❌ migration-check failed. ',
        ja: '❌ マイグレーションのチェックに失敗しました。',
    });
    process.exit(1);
});
