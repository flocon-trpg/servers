import { migrate } from './src/migrate';
import { AppConsole } from './src/utils/appConsole';

migrate('up').catch(err => {
    console.error(err);
    AppConsole.error({
        en: '❌ migration failed. ',
        ja: '❌ マイグレーションに失敗しました。',
    });
    process.exit(1);
});
