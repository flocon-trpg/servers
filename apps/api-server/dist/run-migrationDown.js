'use strict';

var migrate = require('./api-server/src/migrate.js');
var appConsole = require('./api-server/src/utils/appConsole.js');

migrate.migrateByNpmScript('down').catch((err) => {
    appConsole.AppConsole.fatal({
        en: 'migration-down failed. ',
        errorObject: err,
    });
    process.exit(1);
});
//# sourceMappingURL=run-migrationDown.js.map
