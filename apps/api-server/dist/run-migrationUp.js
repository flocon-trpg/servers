'use strict';

var migrate = require('./migrate.js');
var appConsole = require('./utils/appConsole.js');

migrate.migrateByNpmScript('up').catch(err => {
    appConsole.AppConsole.error({
        en: '❌ migration failed. ',
        ja: '❌ マイグレーションに失敗しました。',
        errorObject: err,
    });
    process.exit(1);
});
//# sourceMappingURL=run-migrationUp.js.map
