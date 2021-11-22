import { prompt } from 'inquirer';
import { en, ja, Lang } from './app';

export const firebaseConfigPrompt = async (lang: Lang) => {
    switch (lang) {
        case en:
            console.info('Enter values if Firebase config file. Do not include ".');
            break;
        case ja:
            console.info('Firebase構成ファイルの値を入力してください。" は含めないでください。');
            break;
    }

    // type: editor を使う方法は見送り。理由は、envfileが改行を含んだ文字をうまく扱えないようなのと、Firebaseサイトから取得できるのはJavaScriptオブジェクトだが環境変数として使えるのはJSONなのでkeyに"を付けるのをユーザーが忘れてしまう可能性があるため。

    const apiKey = 'apiKey';
    const authDomain = 'authDomain';
    const databaseURL = 'databaseURL';
    const projectId = 'projectId';
    const storageBucket = 'storageBucket';
    const messagingSenderId = 'messagingSenderId';
    const appId = 'appId';
    const result = await prompt<{
        [apiKey]: string;
        [authDomain]: string;
        [databaseURL]: string;
        [projectId]: string;
        [storageBucket]: string;
        [messagingSenderId]: string;
        [appId]: string;
    }>([
        {
            type: 'input',
            name: apiKey,
            message: apiKey,
        },
        {
            type: 'input',
            name: authDomain,
            message: authDomain,
        },
        {
            type: 'input',
            name: databaseURL,
            message: databaseURL,
        },
        {
            type: 'input',
            name: projectId,
            message: projectId,
        },
        {
            type: 'input',
            name: storageBucket,
            message: storageBucket,
        },
        {
            type: 'input',
            name: messagingSenderId,
            message: messagingSenderId,
        },
        {
            type: 'input',
            name: appId,
            message: appId,
        },
    ]);

    switch (lang) {
        case en:
            console.info('(measurementId is skipped)');
            break;
        case ja:
            console.info('(measurementId の入力はスキップされます)');
            break;
    }

    return JSON.stringify({
        [apiKey]: result[apiKey].trim(),
        [authDomain]: result[authDomain].trim(),
        [databaseURL]: result[databaseURL].trim(),
        [projectId]: result[projectId].trim(),
        [storageBucket]: result[storageBucket].trim(),
        [messagingSenderId]: result[messagingSenderId].trim(),
        [appId]: result[appId].trim(),
    });
};
