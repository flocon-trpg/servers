import { migrateByTsNode } from './src/migrate';
import { AppConsole } from './src/utils/appConsole';

migrateByTsNode('down').catch(err => {
    console.error(err);
    AppConsole.error({
        en: '❌ migration-down failed. ',
    });
    process.exit(1);
});
