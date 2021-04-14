import { migrate } from './src/migrate';

migrate('down').catch(err => {
    console.log(err);
    console.log('❌ migration failed. / マイグレーションに失敗しました。');
});