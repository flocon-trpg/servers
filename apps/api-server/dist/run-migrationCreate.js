'use strict';

var migrate = require('./migrate.js');
var appConsole = require('./utils/appConsole.js');
var commandLineArgs = require('./utils/commandLineArgs.js');

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
