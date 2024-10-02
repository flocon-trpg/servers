'use strict';

var fs = require('fs');
var promises = require('fs/promises');
var bcrypt = require('bcrypt');
var inquirer = require('inquirer');

const ja = 'ja';
const en = 'en';
const filename = 'bcrypt-hash.txt';
const startApp = async () => {
    console.info('To exit without saving to a file, press Ctrl+C. / ファイルに保存せず途中で終了する場合は Ctrl+C を押してください。');
    let lang;
    {
        const name = 'name';
        const p = await inquirer.prompt([
            {
                type: 'list',
                name,
                message: 'Choose your language',
                choices: [
                    { name: 'English', value: en },
                    { name: 'Japanese', value: ja },
                ],
            },
        ]);
        const result = p[name];
        switch (result) {
            case en:
                lang = result;
                break;
            case ja:
                lang = result;
                break;
            default:
                throw new Error('this should not happen');
        }
    }
    const fileExists = fs.existsSync(filename);
    if (fileExists) {
        let message;
        switch (lang) {
            case en:
                message = `\`${filename}\` already exists. Overwrite?`;
                break;
            case ja:
                message = `\`${filename}\` はすでに存在します。上書きしますか？`;
                break;
        }
        const name = 'overwriteConfirm';
        const result = await inquirer.prompt([
            {
                type: 'confirm',
                name,
                message,
                default: false,
            },
        ]);
        if (result[name] !== true) {
            return;
        }
    }
    let hash;
    {
        let message;
        switch (lang) {
            case en:
                message = `Enter password to generate hash`;
                break;
            case ja:
                message = `ハッシュを生成するパスワードを入力してください`;
                break;
        }
        const name = 'password';
        const result = await inquirer.prompt([
            {
                type: 'password',
                name,
                message,
                mask: '*',
            },
        ]);
        const password = result[name];
        const rounds = 10;
        hash = await bcrypt.hash(password, rounds);
    }
    {
        switch (lang) {
            case ja:
                console.info(`\`${filename}\` への書き込みを開始します…`);
                break;
            case en:
                console.info(`Started writing to \`${filename}\`...`);
                break;
        }
        await promises.writeFile(filename, hash);
        switch (lang) {
            case ja:
                console.info('書き込みが成功しました');
                break;
            case en:
                console.info('Successfully finished');
                break;
        }
    }
};
startApp().catch(err => console.error(err));
//# sourceMappingURL=run-bcryptInteractive.js.map
