'use strict';

var migrate = require('./api-server/src/migrate.js');
var appConsole = require('./api-server/src/utils/appConsole.js');
var commandLineArgs = require('./api-server/src/utils/commandLineArgs.js');

const main = async () => {
    const commandLineArgs$1 = await commandLineArgs.loadMigrationCreate();
    migrate.migrateByNpmScript(commandLineArgs$1.init ? 'create-initial' : 'create').catch((err) => {
        appConsole.AppConsole.fatal({
            en: 'migration failed. ',
            ja: 'マイグレーションに失敗しました。',
            errorObject: err,
        });
        process.exit(1);
    });
};
void main();
//# sourceMappingURL=run-migrationCreate.js.map
