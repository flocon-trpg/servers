import { prompt } from 'inquirer';
import {
    NEXT_PUBLIC_FLOCON_API_HTTP,
    NEXT_PUBLIC_FLOCON_API_WS,
    NEXT_PUBLIC_FLOCON_AUTH_PROVIDERS,
    NEXT_PUBLIC_FLOCON_FIREBASE_UPLOADER_ENABLED,
    NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG,
    email,
    google,
    twitter,
    facebook,
    github,
    phone,
} from './src/env';
import {
    Lang,
    en,
    ja,
    node,
    leaf,
    startApp,
    RootNode,
    firebaseConfigPrompt,
} from '@flocon-trpg/set-env-interactive-core';

const urlInput = (type: 'http' | 'ws') => async (lang: Lang) => {
    let message: string;
    switch (lang) {
        case en:
            message = `Enter ${type === 'http' ? 'HTTP(S)' : 'Websocket'} URL of API server`;
            break;
        case ja:
            message = `APIサーバーの ${
                type === 'http' ? 'HTTP(S)' : 'Websocket'
            } URL を入力してください`;
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

const b = async (lang: Lang): Promise<string> => {
    let message: string;
    switch (lang) {
        case en:
            message = `Enable it?`;
            break;
        case ja:
            message = '有効化しますか？';
            break;
    }

    const name = 'name';
    const result = await prompt<{ [name]: string }>({
        type: 'list',
        name,
        message,
        choices: ['true', 'false'],
    });
    return result[name];
};

const list = async (lang: Lang): Promise<string> => {
    let message: string;
    switch (lang) {
        case en:
            message = 'Choose Auth Providers of Firebase Authentication';
            break;
        case ja:
            message = 'Firebase Authentication の認証プロバイダを選択してください';
            break;
    }

    const name = 'name';
    const result = await prompt<{ [name]: string }>({
        type: 'checkbox',
        name,
        message,
        choices: [email, google, twitter, facebook, github, phone],
    });
    return result[name];
};

const main = async (): Promise<void> => {
    const rootKey = 'root';

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
        envKey: NEXT_PUBLIC_FLOCON_API_HTTP,
        question: urlInput('http'),
    });
    root.children.push({
        type: leaf,
        envKey: NEXT_PUBLIC_FLOCON_API_WS,
        question: urlInput('ws'),
    });
    root.children.push({
        type: leaf,
        envKey: NEXT_PUBLIC_FLOCON_AUTH_PROVIDERS,
        question: list,
    });
    root.children.push({
        type: leaf,
        envKey: NEXT_PUBLIC_FLOCON_FIREBASE_UPLOADER_ENABLED,
        question: b,
    });

    await startApp(root);
};

main().catch(err => console.log(err));
