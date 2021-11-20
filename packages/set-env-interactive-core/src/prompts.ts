import { prompt } from 'inquirer';
import { en, ja, Lang } from './app';

export const firebaseConfigPrompt = async (lang: Lang) => {
    let message: string;
    switch (lang) {
        case en:
            message = 'Enter a Firebase config file (JSON). The config file must be one line';
            break;
        case ja:
            message =
                'Firebase の設定ファイル (JSON) を入力してください. 設定ファイルは1行にして入力する必要があります';
            break;
    }

    const name = 'name';
    const result = await prompt<{ [name]: string }>({
        type: 'input',
        name,
        message,
    });
    let toReturn = result[name].trim();
    if (toReturn.includes('firebaseConfig')) {
        switch (lang) {
            case en:
                console.warn(
                    'The text might include "const firebaseConfig =". If so, fix and enter it again.'
                );
                break;
            case ja:
                console.warn(
                    '"const firebaseConfig =" の部分が含まれてしまっている可能性があります。もしそうであれば修正して再度入力してください。'
                );
                break;
        }
    }
    if (toReturn.endsWith(';')) {
        toReturn = toReturn.replace(/;$/, '');
        switch (lang) {
            case en:
                console.info('The last semicolon is automatically removed.');
                break;
            case ja:
                console.info('末尾のセミコロンは自動的に除去されました。');
                break;
        }
    }

    return toReturn;
};
