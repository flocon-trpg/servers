import { migrate } from './src/migrate';

migrate('check').catch(err => {
    console.log(err);
    console.log('❌ migration-check failed. / マイグレーションのチェックに失敗しました。');
});
