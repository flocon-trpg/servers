import { FirebaseConfig, firebaseConfig } from '@flocon-trpg/core';
import {
    loggerRef,
    parseEnvListValue,
    parsePinoLogLevel,
    parseStringToBoolean,
} from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { atom } from 'jotai/vanilla';
import { WebConfig } from '../../configType';
import {
    NEXT_PUBLIC_FIREBASE_CONFIG,
    NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED,
    NEXT_PUBLIC_LOG_LEVEL,
} from '../../env';
import { FetchTextState } from '../../utils/types';
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
    processEnv: Env;
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

const processEnv = parseConfig(undefined);

export const mockProcessEnvAtom = atom<DotenvParseOutput | null>(null);

export const publicEnvTxtAtom = atom<FetchTextState>({ fetched: false });

export const envsAtom = atom<Result<Envs> | null>(get => {
    const mockProcessEnv = get(mockProcessEnvAtom);
    const $processEnv = mockProcessEnv == null ? processEnv : parseConfig(mockProcessEnv);
    if ($processEnv.isError) {
        return $processEnv;
    }
    const publicEnvTxt = get(publicEnvTxtAtom);
    if (!publicEnvTxt.fetched) {
        return null;
    }
    if (publicEnvTxt.value == null) {
        return Result.ok({ processEnv: $processEnv.value, publicEnvTxt: undefined });
    }
    const publicEnvTxtObject = parse(publicEnvTxt.value);
    const publicEnvTxtResult = parseConfig(publicEnvTxtObject);
    if (publicEnvTxtResult.isError) {
        return publicEnvTxtResult;
    }
    return Result.ok({
        processEnv: $processEnv.value,
        publicEnvTxt: publicEnvTxtResult.value,
    });
});

const mergeEnv = (envs: Envs): Env => {
    if (envs.publicEnvTxt == null) {
        return envs.processEnv;
    }
    const result = { ...envs.processEnv };
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

export const webConfigAtom = atom<Result<WebConfig> | null>(get => {
    const storybook = get(storybookAtom);
    const envs = get(envsAtom);
    if (storybook.mock?.webConfig != null) {
        return storybook.mock.webConfig;
    }
    if (envs == null) {
        return null;
    }
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
    return Result.ok(result);
});

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
