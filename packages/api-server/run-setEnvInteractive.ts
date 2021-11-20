import { prompt } from 'inquirer';
import {
    FLOCON_API_ACCESS_CONTROL_ALLOW_ORIGIN,
    FLOCON_API_AUTO_MIGRATION,
    FLOCON_API_EMBEDDED_UPLOADER_COUNT_QUOTA,
    FLOCON_API_EMBEDDED_UPLOADER_MAX_FILE_SIZE,
    FLOCON_API_EMBEDDED_UPLOADER_PATH,
    FLOCON_API_EMBEDDED_UPLOADER_SIZE_QUOTA,
    FLOCON_API_ENTRY_PASSWORD,
    FLOCON_API_POSTGRESQL,
    FLOCON_API_SQLITE,
    NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG,
} from './src/env';
import { always, bcrypt, disabled, plain, postgresql, sqlite } from './src/configType';
import { hash } from 'bcrypt';
import {
    Lang,
    en,
    ja,
    Node,
    node,
    leaf,
    startApp,
    RootNode,
    firebaseConfigPrompt,
} from '@flocon-trpg/set-env-interactive-core';

const accessControlAllowOrigin = async (lang: Lang) => {
    let message: string;
    switch (lang) {
        case en:
            message = 'Enter Access-Control-Allow-Origin header value';
            break;
        case ja:
            message = 'Access-Control-Allow-Origin ヘッダーの値を入力してください';
            break;
    }

    const name = 'name';
    const result = await prompt<{ [name]: string }>({
        type: 'input',
        name,
        message,
    });
    return result[name];
};

const autoMigration = async (lang: Lang) => {
    let message: string;
    switch (lang) {
        case en:
            message = 'Enter Access-Control-Allow-Origin header value';
            break;
        case ja:
            message = 'Access-Control-Allow-Origin ヘッダーの値を入力してください';
            break;
    }

    const name = 'name';
    const result = await prompt<{ [name]: string }>({
        type: 'list',
        name,
        message,
        choices: [
            {
                name: always,
                value: always,
            },
            {
                name: disabled,
                value: disabled,
            },
        ],
    });
    return result[name];
};

const database =
    (databaseType: typeof sqlite | typeof postgresql) =>
    async (lang: Lang): Promise<string> => {
        {
            const dbName = 'dbName';
            const clientUrl = 'clientUrl';

            switch (databaseType) {
                case sqlite: {
                    let dbNameMessage: string;
                    switch (lang) {
                        case en:
                            dbNameMessage = 'Enter path (e.g. ./main.sqlite3)';
                            break;
                        case ja:
                            dbNameMessage = 'パスを入力してください (例: ./main.sqlite3)';
                            break;
                    }

                    const result = await prompt<{ [dbName]: string }>([
                        {
                            type: 'input',
                            name: dbName,
                            message: dbNameMessage,
                        },
                    ]);
                    return JSON.stringify(result);
                }
                case postgresql: {
                    let clientUrlMessage: string;
                    switch (lang) {
                        case en:
                            clientUrlMessage =
                                'Provide URL (e.g. postgresql://user:password@localhost:5432)';
                            break;
                        case ja:
                            clientUrlMessage =
                                'URLを入力してください (例: postgresql://user:password@localhost:5432)';
                            break;
                    }

                    let dbNameMessage: string;
                    switch (lang) {
                        case en:
                            dbNameMessage = 'Provide database name';
                            break;
                        case ja:
                            dbNameMessage = 'データベース名を入力してください';
                            break;
                    }

                    const result = await prompt<{ [dbName]: string; [clientUrl]: string }>([
                        {
                            type: 'input',
                            name: clientUrl,
                            message: clientUrlMessage,
                        },
                        {
                            type: 'input',
                            name: dbName,
                            message: dbNameMessage,
                        },
                    ]);
                    return JSON.stringify(result);
                }
            }
        }
    };

const entryPassword = async (lang: Lang): Promise<string> => {
    let typeMessage: string;
    switch (lang) {
        case en:
            typeMessage = 'Choose how to save a password';
            break;
        case ja:
            typeMessage = 'パスワードの保存方法を選択してください';
            break;
    }

    let passwordMessage: string;
    switch (lang) {
        case en:
            passwordMessage = 'Enter password';
            break;
        case ja:
            passwordMessage = 'パスワードを入力してください';
            break;
    }

    let bcryptName: string;
    switch (lang) {
        case en:
            bcryptName = 'hash by bcrypt';
            break;
        case ja:
            bcryptName = 'bcryptによるハッシュ';
            break;
    }

    let plainName: string;
    switch (lang) {
        case en:
            plainName = 'plain';
            break;
        case ja:
            plainName = '平文';
            break;
    }

    const type = 'type';
    const value = 'value';

    const promptResult = await prompt<{ [type]: string; [value]: string }>([
        {
            type: 'list',
            name: type,
            message: typeMessage,
            choices: [
                {
                    name: bcryptName,
                    value: bcrypt,
                },
                {
                    name: plainName,
                    value: plain,
                },
            ],
        },
        {
            type: 'password',
            name: value,
            message: passwordMessage,
            mask: '*',
        },
    ]);

    let rawResult: string;
    switch (promptResult[type]) {
        case plain: {
            rawResult = JSON.stringify(promptResult);
            break;
        }
        case bcrypt: {
            const rounds = 10;
            rawResult = JSON.stringify({
                [type]: promptResult[type],
                [value]: await hash(promptResult[value], rounds),
            });
            break;
        }
        default:
            throw new Error('this should not happen');
    }

    // dotenv-expandで展開されるのを防ぐため、エスケープしている
    return rawResult.replace(/\$/g, '\\$');
};

const embeddedUploaderPath = async (lang: Lang): Promise<string> => {
    let message: string;
    switch (lang) {
        case en:
            message = 'Enter directory path';
            break;
        case ja:
            message = 'ディレクトリパスを入力してください';
            break;
    }

    const name = 'name';
    const result = await prompt<{ [name]: string }>({
        type: 'input',
        name,
        message,
    });
    return result[name];
};

const inputNumber = async (lang: Lang, mode?: 'byte'): Promise<string> => {
    let message: string;
    switch (lang) {
        case en:
            message = `Enter a number${mode === 'byte' ? ' (byte)' : ''}`;
            break;
        case ja:
            message = `${mode === 'byte' ? '数値 (バイト) ' : '数値'}を入力してください`;
            break;
    }

    const name = 'name';
    const result = await prompt<{ [name]: string }>({
        type: 'number',
        name,
        message,
    });
    return result[name];
};

const main = async (): Promise<void> => {
    const rootKey = 'root';
    const embeddedUploaderFolderKey = 'embeddedUploaderFolder';

    const root: RootNode = {
        type: node,
        key: rootKey,
        children: [],
    };
    root.children.push({
        type: leaf,
        envKey: NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG,
        question: firebaseConfigPrompt,
    });
    root.children.push({
        type: leaf,
        envKey: FLOCON_API_AUTO_MIGRATION,
        question: autoMigration,
    });
    root.children.push({
        type: leaf,
        envKey: FLOCON_API_ENTRY_PASSWORD,
        question: entryPassword,
    });
    root.children.push({
        type: leaf,
        envKey: FLOCON_API_POSTGRESQL,
        question: database(postgresql),
    });
    root.children.push({
        type: leaf,
        envKey: FLOCON_API_SQLITE,
        question: database(sqlite),
    });
    const embeddedUploaderNode: Node = {
        type: node,
        parent: root,
        key: embeddedUploaderFolderKey,
        message: lang => {
            switch (lang) {
                case en:
                    return 'Embedded uploader';
                case ja:
                    return '内蔵アップローダー';
            }
        },
        children: [],
    };
    root.children.push(embeddedUploaderNode);
    embeddedUploaderNode.children.push({
        type: leaf,
        envKey: FLOCON_API_ACCESS_CONTROL_ALLOW_ORIGIN,
        question: accessControlAllowOrigin,
    });
    embeddedUploaderNode.children.push({
        type: leaf,
        envKey: FLOCON_API_EMBEDDED_UPLOADER_PATH,
        question: embeddedUploaderPath,
    });
    embeddedUploaderNode.children.push({
        type: leaf,
        envKey: FLOCON_API_EMBEDDED_UPLOADER_MAX_FILE_SIZE,
        question: lang => inputNumber(lang, 'byte'),
    });
    embeddedUploaderNode.children.push({
        type: leaf,
        envKey: FLOCON_API_EMBEDDED_UPLOADER_COUNT_QUOTA,
        question: lang => inputNumber(lang),
    });
    embeddedUploaderNode.children.push({
        type: leaf,
        envKey: FLOCON_API_EMBEDDED_UPLOADER_SIZE_QUOTA,
        question: lang => inputNumber(lang, 'byte'),
    });

    await startApp(root);
};

main().catch(err => console.log(err));
