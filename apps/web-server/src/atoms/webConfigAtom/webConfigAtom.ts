import { FirebaseConfig, firebaseConfig } from '@flocon-trpg/core';
import {
    loggerRef,
    parseEnvListValue,
    parsePinoLogLevel,
    parseStringToBoolean,
} from '@flocon-trpg/utils';
import { Option } from '@kizahasi/option';
import { Result } from '@kizahasi/result';
import { atom } from 'jotai/vanilla';
import { MockableWebConfig, WebConfig } from '../../configType';
import {
    NEXT_PUBLIC_FIREBASE_CONFIG,
    NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED,
    NEXT_PUBLIC_LOG_LEVEL,
} from '../../env';
import { storybookAtom } from '../storybookAtom/storybookAtom';
import { DotenvParseOutput, parse } from '@/utils/dotEnvParse';

type Env = {
    firebaseConfig?: FirebaseConfig;
    http?: string;
    ws?: string;
    authProviders?: string[];
    isUnlistedFirebaseStorageEnabled?: boolean;
    logLevel?: string;
};

type Envs = {
    importMetaEnv: Env;
    publicEnvTxt: Env | undefined;
};

const tryToString = (value: unknown): string | undefined => {
    if (typeof value === 'string') {
        return value;
    }
    return undefined;
};

const parseConfig = (env: DotenvParseOutput | undefined): Result<Env> => {
    // TODO: ↓のコメントはNext.jsの話で、Viteだとどうなるかわからないので調査して修正する
    /* 
    Because of Next.js restrictions, we cannot do like these:
    
    // invalid code 1
    const NEXT_PUBLIC_FOO = 'NEXT_PUBLIC_FOO';
    const alwaysUndefined = process.env[NEXT_PUBLIC_FOO];
    
    // invalid code 2
    import { NEXT_PUBLIC_FOO } from './somewhere';
    const alwaysUndefined = process.env[NEXT_PUBLIC_FOO];

    // invalid code 3
    const f = (env) => {
        const alwaysUndefined = env[NEXT_PUBLIC_FOO];
    }
    f(process.env);

    Instead, we must do like these:

    // valid code 1
    const validValue = process.env.NEXT_PUBLIC_FOO;

    // valid code 2
    const validValue = process.env['NEXT_PUBLIC_FOO'];
    */

    const importMetaEnv = import.meta.env;

    const isUnlistedFirebaseStorageEnabled = parseStringToBoolean(
        env == null
            ? tryToString(importMetaEnv.NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED)
            : env.NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED,
    );
    if (isUnlistedFirebaseStorageEnabled.error) {
        loggerRef.warn(
            `${NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED} において次のエラーが発生したため、false とみなされます:` +
                isUnlistedFirebaseStorageEnabled.error.ja,
        );
    }

    // https://vite.dev/guide/env-and-mode#env-files によると、import.meta.env の値が number や boolean になることはないため、tryToString を使うことで値が抜け落ちることはない。

    const result: Env = {
        http:
            env == null
                ? tryToString(importMetaEnv.NEXT_PUBLIC_API_HTTP)
                : env.NEXT_PUBLIC_API_HTTP,
        ws: env == null ? tryToString(importMetaEnv.NEXT_PUBLIC_API_WS) : env.NEXT_PUBLIC_API_WS,
        logLevel:
            env == null
                ? tryToString(importMetaEnv.NEXT_PUBLIC_LOG_LEVEL)
                : env.NEXT_PUBLIC_LOG_LEVEL,
        authProviders:
            parseEnvListValue(
                env == null
                    ? tryToString(importMetaEnv.NEXT_PUBLIC_AUTH_PROVIDERS)
                    : env.NEXT_PUBLIC_AUTH_PROVIDERS,
            ) ?? undefined,
        isUnlistedFirebaseStorageEnabled: isUnlistedFirebaseStorageEnabled.value,
    };

    const firebaseFile =
        env == null
            ? tryToString(importMetaEnv.NEXT_PUBLIC_FIREBASE_CONFIG)
            : env.NEXT_PUBLIC_FIREBASE_CONFIG;

    if (firebaseFile != null) {
        const firebaseJson: unknown = JSON.parse(firebaseFile.toString());
        // jsonファイルを直接importしても動くが、jsonファイルにミスがあるときに出るエラーメッセージをわかりやすくするため、zodを用いている。
        const firebaseConfigObject = firebaseConfig.safeParse(firebaseJson);
        if (!firebaseConfigObject.success) {
            return Result.error(firebaseConfigObject.error.message);
        }
        result.firebaseConfig = firebaseConfigObject.data;
    }

    return Result.ok(result);
};

const importMetaEnv = parseConfig(undefined);

export const mockImportMetaEnvAtom = atom<DotenvParseOutput | null>(null);

// もし fetch に失敗した状態でキャッシュされると再び fetch しに行くことはないので、atomWithCache は使っていない
const publicEnvTxtAtom = atom(async () => {
    // chromeなどではfetchできないと `http://localhost:3000/env.txt 404 (Not Found)` などといったエラーメッセージが表示されるが、実際は問題ない
    const envTxtObj = await fetch('/env.txt').catch(() => null);
    if (envTxtObj == null || !envTxtObj.ok) {
        // 正常に取得できなかったときはnullを返す
        return null;
    }
    return await envTxtObj.text();
});

export const mockPublicEnvTxtAtom = atom<Option<string | null>>(Option.none());

export const envsAtom = atom<Promise<Result<Envs>>>(async get => {
    const mockImportMetaEnv = get(mockImportMetaEnvAtom);
    const $importMetaEnv =
        mockImportMetaEnv == null ? importMetaEnv : parseConfig(mockImportMetaEnv);
    if ($importMetaEnv.isError) {
        return $importMetaEnv;
    }
    const publicEnvTxt = await get(publicEnvTxtAtom);
    const mockPublicEnvTxt = get(mockPublicEnvTxtAtom);
    const $publicEnvTxt = mockPublicEnvTxt.isNone ? publicEnvTxt : mockPublicEnvTxt.value;
    if ($publicEnvTxt == null) {
        return Result.ok({ importMetaEnv: $importMetaEnv.value, publicEnvTxt: undefined });
    }
    const publicEnvTxtObject = parse($publicEnvTxt);
    const publicEnvTxtResult = parseConfig(publicEnvTxtObject);
    if (publicEnvTxtResult.isError) {
        return publicEnvTxtResult;
    }
    return Result.ok({
        importMetaEnv: $importMetaEnv.value,
        publicEnvTxt: publicEnvTxtResult.value,
    });
});

const mergeEnv = (envs: Envs): Env => {
    if (envs.publicEnvTxt == null) {
        return envs.importMetaEnv;
    }
    const result = { ...envs.importMetaEnv };
    if (result.authProviders == null) {
        result.authProviders = envs.publicEnvTxt.authProviders;
    }
    if (result.firebaseConfig == null) {
        result.firebaseConfig = envs.publicEnvTxt.firebaseConfig;
    }
    if (result.http == null) {
        result.http = envs.publicEnvTxt.http;
    }
    if (result.isUnlistedFirebaseStorageEnabled == null) {
        result.isUnlistedFirebaseStorageEnabled =
            envs.publicEnvTxt.isUnlistedFirebaseStorageEnabled;
    }
    if (result.ws == null) {
        result.ws = envs.publicEnvTxt.ws;
    }
    return result;
};

type WebConfigAtomReturnType =
    | {
          isMock: false;
          value: WebConfig;
      }
    | {
          isMock: true;
          value: MockableWebConfig;
      };

export const webConfigAtom = atom<Promise<Result<WebConfigAtomReturnType>>>(async get => {
    const storybook = get(storybookAtom);
    if (storybook.mock?.webConfig != null) {
        if (storybook.mock.webConfig.isError) {
            return storybook.mock.webConfig;
        } else {
            return Result.ok({
                isMock: true,
                value: storybook.mock.webConfig.value,
            });
        }
    }
    const envs = await get(envsAtom);
    if (envs.isError) {
        return envs;
    }
    const mergedEnv: Env = mergeEnv(envs.value);
    if (mergedEnv.firebaseConfig == null) {
        return Result.error(`${NEXT_PUBLIC_FIREBASE_CONFIG} の値が見つかりませんでした。`);
    }
    const logLevel =
        mergedEnv.logLevel == null
            ? undefined
            : parsePinoLogLevel(mergedEnv.logLevel, NEXT_PUBLIC_LOG_LEVEL);
    if (logLevel?.isError === true) {
        loggerRef.warn(logLevel.error);
    }
    const result: WebConfig = {
        authProviders: mergedEnv.authProviders,
        firebaseConfig: mergedEnv.firebaseConfig,
        isUnlistedFirebaseStorageEnabled: mergedEnv.isUnlistedFirebaseStorageEnabled ?? false,
        isPublicFirebaseStorageEnabled: false,
        http: mergedEnv.http,
        ws: mergedEnv.ws,
        logLevel: logLevel?.value,
    };
    return Result.ok({ isMock: false, value: result });
});

export const getHttpUri = (config: MockableWebConfig) => {
    if (config.http == null) {
        return `${location.protocol}//${location.host}`;
    } else {
        return config.http;
    }
};

export const getWsUri = (config: MockableWebConfig) => {
    if (config.ws == null) {
        return `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`;
    } else {
        return config.ws;
    }
};
