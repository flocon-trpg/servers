'use strict';

var migrate = require('./api-server/src/migrate.js');
var appConsole = require('./api-server/src/utils/appConsole.js');

migrate.migrateByNpmScript('check').catch((err) => {
    appConsole.AppConsole.fatal({
        en: 'migration-check failed. ',
        ja: 'マイグレーションのチェックに失敗しました。',
        errorObject: err,
    });
    process.exit(1);
});
//# sourceMappingURL=run-migrationCheck.js.map
