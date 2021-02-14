import { migrate } from './migrate';
import { loadMigrationCreate } from './src/utils/commandLineArgs';

const commandLineArgs = loadMigrationCreate();

migrate(commandLineArgs.init ? 'create-initial' : 'create').catch(err => {
    console.log(err);
    console.log('❌ migration failed.');
});