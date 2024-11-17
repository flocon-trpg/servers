import { migrateByNpmScript } from './migrate';
import { AppConsole } from './utils/appConsole';

migrateByNpmScript('down').catch((err: Error) => {
    AppConsole.fatal({
        en: 'migration-down failed. ',
        errorObject: err,
    });
    process.exit(1);
});
