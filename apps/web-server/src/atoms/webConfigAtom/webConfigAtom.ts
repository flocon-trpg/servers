import { atom } from 'jotai';
import { WebConfig } from '../../configType';
import { Data, parse } from 'envfile';
import { Result } from '@kizahasi/result';
import { FirebaseConfig, firebaseConfig } from '@flocon-trpg/core';
import { parseEnvListValue, parseStringToBoolean } from '@flocon-trpg/utils';
import * as E from 'fp-ts/Either';
import { formatValidationErrors } from '../../utils/io-ts/io-ts-reporters';
import { NEXT_PUBLIC_FIREBASE_CONFIG } from '../../env';
import { FetchTextState } from '../../utils/types';
import { storybookAtom } from '../storybookAtom/storybookAtom';

type Env = {
    firebaseConfig?: FirebaseConfig;
    http?: string;
    ws?: string;
    authProviders?: string[];
    isUnlistedFirebaseStorageEnabled?: boolean;
};

type Envs = {
    processEnv: Env;
    publicEnvTxt: Env | undefined;
};

const parseConfig = (env: Data | undefined): Result<Env> => {
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
    const validValue = process,env['NEXT_PUBLIC_FOO'];
    */

    const isUnlistedFirebaseStorageEnabled = parseStringToBoolean(
        env == null
            ? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED
            : env.NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED
    );
    if (isUnlistedFirebaseStorageEnabled.error) {
        console.warn(isUnlistedFirebaseStorageEnabled.error.ja);
    }
    const result: Env = {
        http: env == null ? process.env.NEXT_PUBLIC_API_HTTP : env.NEXT_PUBLIC_API_HTTP,
        ws: env == null ? process.env.NEXT_PUBLIC_API_WS : env.NEXT_PUBLIC_API_WS,
        authProviders:
            parseEnvListValue(
                env == null
                    ? process.env.NEXT_PUBLIC_AUTH_PROVIDERS
                    : env.NEXT_PUBLIC_AUTH_PROVIDERS
            ) ?? undefined,
        isUnlistedFirebaseStorageEnabled: isUnlistedFirebaseStorageEnabled.value,
    };

    const firebaseFile =
        env == null ? process.env.NEXT_PUBLIC_FIREBASE_CONFIG : env.NEXT_PUBLIC_FIREBASE_CONFIG;

    if (firebaseFile != null) {
        const firebaseJson = JSON.parse(firebaseFile.toString());
        // jsonファイルを直接importしても動くが、jsonファイルにミスがあるときに出るエラーメッセージをわかりやすくするため、io-ts&io-ts-reportersを用いて変換している。
        const firebaseConfigObject = E.mapLeft(formatValidationErrors)(
            firebaseConfig.decode(firebaseJson)
        );
        if (firebaseConfigObject._tag === 'Left') {
            return Result.error(firebaseConfigObject.left);
        }
        result.firebaseConfig = firebaseConfigObject.right;
    }

    return Result.ok(result);
};

let processEnvConfigCache: Result<Env> | null = null;
const getProcessEnvConfig = () => {
    if (processEnvConfigCache == null) {
        processEnvConfigCache = parseConfig(undefined);
    }
    return processEnvConfigCache;
};

const processEnvAtom = atom(getProcessEnvConfig());

export const publicEnvTxtAtom = atom<FetchTextState>({ fetched: false });

export const envsAtom = atom<Result<Envs> | null>(get => {
    const processEnv = get(processEnvAtom);
    if (processEnv.isError) {
        return processEnv;
    }
    const publicEnvTxt = get(publicEnvTxtAtom);
    if (!publicEnvTxt.fetched) {
        return null;
    }
    if (publicEnvTxt.value == null) {
        return Result.ok({ processEnv: processEnv.value, publicEnvTxt: undefined });
    }
    const publicEnvTxtObject = parse(publicEnvTxt.value);
    const publicEnvTxtResult = parseConfig(publicEnvTxtObject);
    if (publicEnvTxtResult.isError) {
        return publicEnvTxtResult;
    }
    return Result.ok({
        processEnv: processEnv.value,
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
    const result: WebConfig = {
        authProviders: mergedEnv.authProviders,
        firebaseConfig: mergedEnv.firebaseConfig,
        isUnlistedFirebaseStorageEnabled: mergedEnv.isUnlistedFirebaseStorageEnabled ?? false,
        isPublicFirebaseStorageEnabled: false,
        http: mergedEnv.http,
        ws: mergedEnv.ws,
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
