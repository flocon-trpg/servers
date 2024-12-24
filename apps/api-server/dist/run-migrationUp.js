'use strict';

var migrate = require('./api-server/src/migrate.js');
var appConsole = require('./api-server/src/utils/appConsole.js');

migrate.migrateByNpmScript('up').catch((err) => {
    appConsole.AppConsole.error({
        en: '❌ migration failed. ',
        ja: '❌ マイグレーションに失敗しました。',
        errorObject: err,
    });
    process.exit(1);
});
//# sourceMappingURL=run-migrationUp.js.map
