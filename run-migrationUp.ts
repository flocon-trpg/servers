import { migrate } from './src/migrate';

migrate('up').catch(err => {
    console.log(err);
    console.log('❌ migration failed. / マイグレーションに失敗しました。');
});