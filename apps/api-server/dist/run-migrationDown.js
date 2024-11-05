'use strict';

var migrate = require('./migrate.js');
var appConsole = require('./utils/appConsole.js');

migrate.migrateByNpmScript('down').catch((err) => {
    appConsole.AppConsole.fatal({
        en: 'migration-down failed. ',
        errorObject: err,
    });
    process.exit(1);
});
//# sourceMappingURL=run-migrationDown.js.map
