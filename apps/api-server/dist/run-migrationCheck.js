'use strict';

var migrate = require('./migrate.js');
var appConsole = require('./utils/appConsole.js');

migrate.migrateByNpmScript('check').catch((err) => {
    appConsole.AppConsole.fatal({
        en: 'migration-check failed. ',
        ja: 'マイグレーションのチェックに失敗しました。',
        errorObject: err,
    });
    process.exit(1);
});
//# sourceMappingURL=run-migrationCheck.js.map
