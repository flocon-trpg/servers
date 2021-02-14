import { migrate } from './migrate';

migrate('up').catch(err => {
    console.log(err);
    console.log('❌ migration failed.');
});