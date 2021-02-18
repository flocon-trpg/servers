import fs from 'fs';
import { createFirebaseConfig } from './@shared/config';
import { JSONObject } from './@shared/JSONObject';

// 本来はjsonファイルを直接importすれば動くが、jsonファイルにミスがあるときに出るエラーメッセージをわかりやすくするため、jsonファイルをtsファイルに変換してそれをimportさせている。
// jsonファイルを見てチェックするだけでは漏れが生じる可能性があるので、tsファイルに変換することでそれを排除している。

// TODO: httpやwsが未指定のときは現在のURLから判断して自動的にURLを生成するが、このURLのうちhttp/httpsの部分やws/wssの部分だけ変えたいというケースに対応したほうがよさそうか？
const loadConfig = () => {
    const firebaseFile = process.env['NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG'];
    if (firebaseFile == null) {
        throw 'Firebase config is not found. Set NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG environment variable.';
    }

    const firebaseJson = JSON.parse(firebaseFile.toString());
    const firebaseConfig = createFirebaseConfig(firebaseJson);

    const webConfigFile = process.env['NEXT_PUBLIC_FLOCON_WEB_CONFIG'];
    if (webConfigFile == null) {
        throw 'Web config is not found. Set NEXT_PUBLIC_FLOCON_WEB_CONFIG environment variable.';
    }

    const webConfigJson = JSON.parse(webConfigFile.toString());
    const webJSONObject = JSONObject.init(webConfigJson);
    const url = webJSONObject.tryGet('server')?.tryGet('url');
    const storage = webJSONObject.get('firebase').get('storage');

    return {
        firebase: {
            apiKey: firebaseConfig.apiKey,
            appId: firebaseConfig.appId,
            authDomain: firebaseConfig.authDomain,
            databaseURL: firebaseConfig.databaseURL,
            measurementId: firebaseConfig.measurementId,
            messagingSenderId: firebaseConfig.messagingSenderId,
            projectId: firebaseConfig.projectId,
            storageBucket: firebaseConfig.storageBucket,
        },
        web: {
            server: {
                url: {
                    http: url?.tryGet('http')?.valueAsNullableString() ?? undefined,
                    ws: url?.tryGet('ws')?.valueAsNullableString() ?? undefined,
                },
            },
            firebase: {
                storage: {
                    enablePublic: storage.get('enablePublic').valueAsBoolean(),
                    enableUnlisted: storage.get('enableUnlisted').valueAsBoolean(),
                },
            },
        },
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