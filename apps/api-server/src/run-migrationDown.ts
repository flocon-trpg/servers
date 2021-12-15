import { migrateByNpmScript } from './migrate';
import { AppConsole } from './utils/appConsole';

migrateByNpmScript('down').catch(err => {
    console.error(err);
    AppConsole.error({
        en: '❌ migration-down failed. ',
    });
    process.exit(1);
});
