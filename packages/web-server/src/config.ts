import { firebaseConfig } from '@flocon-trpg/core';
import { isTruthyString, parseEnvListValue } from '@flocon-trpg/utils';
import * as E from 'fp-ts/Either';
import { WebConfig } from './configType';
import { NEXT_PUBLIC_FIREBASE_CONFIG } from './env';
import { formatValidationErrors } from './utils/io-ts-reporters';

// jsonファイルを直接importしても動くが、jsonファイルにミスがあるときに出るエラーメッセージをわかりやすくするため、io-ts&io-ts-reportersを用いて変換している。

// TODO: httpやwsが未指定のときは現在のURLから判断して自動的にURLを生成するが、このURLのうちhttp/httpsの部分やws/wssの部分だけ変えたいというケースに対応したほうがよさそうか？
const loadConfig = (): WebConfig => {
    /* 
    We cannot do like this:
    
    const NEXT_PUBLIC_FOO = 'NEXT_PUBLIC_FOO';
    const alwaysUndefined = process.env[NEXT_PUBLIC_FOO];
    
    nor like this:

    import { NEXT_PUBLIC_FOO } from 'somewhere';
    const alwaysUndefined = process.env[NEXT_PUBLIC_FOO];

    Instead, we must do like this:

    const okValue = process.env.NEXT_PUBLIC_FOO;

    or like this:

    const okValue = process.env['NEXT_PUBLIC_FOO'];
    */

    const firebaseFile = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

    if (firebaseFile == null) {
        throw new Error(
            `Firebase config is not found. Set ${NEXT_PUBLIC_FIREBASE_CONFIG} environment variable.`
        );
    }

    const firebaseJson = JSON.parse(firebaseFile.toString());
    const firebaseConfigObject = E.mapLeft(formatValidationErrors)(
        firebaseConfig.decode(firebaseJson)
    );
    if (firebaseConfigObject._tag === 'Left') {
        throw new Error(firebaseConfigObject.left);
    }

    return {
        firebaseConfig: firebaseConfigObject.right,
        http: process.env.NEXT_PUBLIC_API_HTTP,
        ws: process.env.NEXT_PUBLIC_API_WS,
        authProviders: parseEnvListValue(process.env.NEXT_PUBLIC_AUTH_PROVIDERS),
        isUnlistedFirebaseStorageEnabled: isTruthyString(
            process.env.NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED
        ),
        isPublicFirebaseStorageEnabled: false,
    };
};

let config: WebConfig | null = null;

export const getConfig = (): WebConfig => {
    if (config == null) {
        config = loadConfig();
    }
    return config;
};

export const getHttpUri = (config: WebConfig) => {
    if (config.http == null) {
        return `${location.protocol}//${location.host}`;
    } else {
        return config.http;
    }
};

export const getWsUri = (config: WebConfig) => {
    if (config.ws == null) {
        return `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`;
    } else {
        return config.ws;
    }
};
