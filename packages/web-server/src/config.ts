import { firebaseConfig } from '@flocon-trpg/core';
import * as E from 'fp-ts/Either';
import { webConfig } from './configType';
import { formatValidationErrors } from './utils/io-ts-reporters';

// jsonファイルを直接importしても動くが、jsonファイルにミスがあるときに出るエラーメッセージをわかりやすくするため、io-ts&io-ts-reportersを用いて変換している。

// TODO: httpやwsが未指定のときは現在のURLから判断して自動的にURLを生成するが、このURLのうちhttp/httpsの部分やws/wssの部分だけ変えたいというケースに対応したほうがよさそうか？
const loadConfig = () => {
    const firebaseFile = process.env['NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG'];
    if (firebaseFile == null) {
        throw new Error(
            'Firebase config is not found. Set NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG environment variable.'
        );
    }

    const firebaseJson = JSON.parse(firebaseFile.toString());
    const firebaseConfigObject = E.mapLeft(formatValidationErrors)(
        firebaseConfig.decode(firebaseJson)
    );
    if (firebaseConfigObject._tag === 'Left') {
        throw new Error(firebaseConfigObject.left);
    }

    const webConfigFile = process.env['NEXT_PUBLIC_FLOCON_WEB_CONFIG'];
    if (webConfigFile == null) {
        throw new Error(
            'Web config is not found. Set NEXT_PUBLIC_FLOCON_WEB_CONFIG environment variable.'
        );
    }

    const webConfigJson = JSON.parse(webConfigFile.toString());
    const webConfigObject = E.mapLeft(formatValidationErrors)(webConfig.decode(webConfigJson));
    if (webConfigObject._tag === 'Left') {
        throw new Error(webConfigObject.left);
    }

    return {
        firebase: firebaseConfigObject.right,
        web: webConfigObject.right,
    };
};

export type Config = ReturnType<typeof loadConfig>;

let config: Config | null = null;

export const getConfig = (): Config => {
    if (config == null) {
        config = loadConfig();
    }
    return config;
};

export const getHttpUri = (config: Config) => {
    if (config.web.api?.url?.http == null) {
        return `${location.protocol}//${location.host}`;
    } else {
        return config.web.api.url.http;
    }
};

export const getWsUri = (config: Config) => {
    if (config.web.api?.url?.ws == null) {
        return `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`;
    } else {
        return config.web.api.url.ws;
    }
};
