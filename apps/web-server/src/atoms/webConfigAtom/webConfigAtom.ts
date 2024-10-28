import { FirebaseConfig, firebaseConfig } from '@flocon-trpg/core';
import {
    PinoLogLevel,
    loggerRef,
    parseEnvListValue,
    parsePinoLogLevel,
    parseStringToBoolean,
} from '@flocon-trpg/utils';
import { Option } from '@kizahasi/option';
import { Result } from '@kizahasi/result';
import { atom } from 'jotai/vanilla';
import { MockableWebConfig, WebConfig } from '../../configType';
import { NEXT_PUBLIC_LOG_LEVEL } from '../../env';
import { fetchEnvTxtAtom } from '../fetchEnvTxtAtom/fetchEnvTxtAtom';
import { storybookAtom } from '../storybookAtom/storybookAtom';
import { DotenvParseOutput, parse } from '@/utils/dotEnvParse';

type EnvValue<TParsed> =
    | {
          source: undefined;
          parsed: undefined;
      }
    | {
          source: string;
          parsed: TParsed;
      };

type EnvSource = {
    firebaseConfig?: string;
    http?: string;
    ws?: string;
    authProviders?: string;
    isUnlistedFirebaseStorageEnabled?: string;
    logLevel?: string;
};

type EnvJson = {
    firebaseConfig?: FirebaseConfig;
    http?: string;
    ws?: string;
    authProviders?: string[];
    isUnlistedFirebaseStorageEnabled?: boolean;
    logLevel?: PinoLogLevel;
};

class Env {
    constructor(private readonly source: EnvSource) {}

    get firebaseConfig(): EnvValue<Result<FirebaseConfig> | undefined> {
        if (this.source.firebaseConfig == null) {
            return { source: undefined, parsed: undefined };
        }
        const parse = (): Result<FirebaseConfig> | undefined => {
            const firebaseFile = this.source.firebaseConfig;
            if (firebaseFile != null) {
                const firebaseJson: unknown = JSON.parse(firebaseFile.toString());
                // jsonファイルを直接importしても動くが、jsonファイルにミスがあるときに出るエラーメッセージをわかりやすくするため、zodを用いている。
                const firebaseConfigObject = firebaseConfig.safeParse(firebaseJson);
                if (!firebaseConfigObject.success) {
                    return Result.error(firebaseConfigObject.error.message);
                }
                return Result.ok(firebaseConfigObject.data);
            }

            return undefined;
        };

        return {
            source: this.source.firebaseConfig,
            parsed: parse(),
        };
    }

    get http(): string | undefined {
        return this.source.http;
    }

    get ws(): string | undefined {
        return this.source.ws;
    }

    get logLevel(): EnvValue<Result<PinoLogLevel | undefined>> {
        if (this.source.logLevel == null) {
            return { source: undefined, parsed: undefined };
        }
        const parsed = parsePinoLogLevel(this.source.logLevel, NEXT_PUBLIC_LOG_LEVEL);

        return {
            source: this.source.logLevel,
            parsed,
        };
    }

    get authProviders(): EnvValue<string[] | undefined> {
        if (this.source.authProviders == null) {
            return { source: undefined, parsed: undefined };
        }
        return {
            source: this.source.authProviders,
            parsed: parseEnvListValue(this.source.authProviders) ?? undefined,
        };
    }

    get isUnlistedFirebaseStorageEnabled(): EnvValue<Result<boolean>> {
        if (this.source.isUnlistedFirebaseStorageEnabled == null) {
            return { source: undefined, parsed: undefined };
        }

        const parsed = parseStringToBoolean(this.source.isUnlistedFirebaseStorageEnabled);

        return {
            source: this.source.isUnlistedFirebaseStorageEnabled,
            parsed: parsed.isError ? Result.error(parsed.error.ja) : parsed,
        };
    }
}

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

const toEnvSource = (env: DotenvParseOutput | undefined): EnvSource => {
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

    // https://vite.dev/guide/env-and-mode#env-files によると、import.meta.env の値が number や boolean になることはないため、tryToString を使うことで値が抜け落ちることはない。
    const result: EnvSource = {
        firebaseConfig:
            env == null
                ? tryToString(importMetaEnv.NEXT_PUBLIC_FIREBASE_CONFIG)
                : env.NEXT_PUBLIC_FIREBASE_CONFIG,
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
            env == null
                ? tryToString(importMetaEnv.NEXT_PUBLIC_AUTH_PROVIDERS)
                : env.NEXT_PUBLIC_AUTH_PROVIDERS,
        isUnlistedFirebaseStorageEnabled:
            env == null
                ? tryToString(importMetaEnv.NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED)
                : env.NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED,
    };

    return result;
};

const importMetaEnv = toEnvSource(undefined);

export const mockImportMetaEnvAtom = atom<DotenvParseOutput | null>(null);

export const mockPublicEnvTxtAtom = atom<Option<string | null>>(Option.none());

const envsAtom = atom<Promise<Envs>>(async get => {
    const mockImportMetaRawEnv = get(mockImportMetaEnvAtom);
    const importMetaEnvSource =
        mockImportMetaRawEnv == null ? importMetaEnv : toEnvSource(mockImportMetaRawEnv);
    const publicEnvTxt = await get(fetchEnvTxtAtom);
    const mockPublicEnvTxt = get(mockPublicEnvTxtAtom);
    const $publicEnvTxt = mockPublicEnvTxt.isNone ? publicEnvTxt : mockPublicEnvTxt.value;
    if ($publicEnvTxt == null) {
        return { importMetaEnv: new Env(importMetaEnvSource), publicEnvTxt: undefined };
    }
    const publicEnvTxtObject = parse($publicEnvTxt);
    const publicEnvTxtEnvSource = toEnvSource(publicEnvTxtObject);
    return {
        importMetaEnv: new Env(importMetaEnvSource),
        publicEnvTxt: new Env(publicEnvTxtEnvSource),
    };
});

const toEnvJson = (envs: Envs): EnvJson => {
    const keys = ['importMetaEnv', 'publicEnvTxt'] as const;
    const result: EnvJson = {};
    for (const key of keys) {
        result.authProviders = result.authProviders ?? envs?.[key]?.authProviders.parsed;
        result.firebaseConfig = result.firebaseConfig ?? envs?.[key]?.firebaseConfig.parsed?.value;
        result.http = result.http ?? envs?.[key]?.http;
        result.isUnlistedFirebaseStorageEnabled =
            result.isUnlistedFirebaseStorageEnabled ??
            envs?.[key]?.isUnlistedFirebaseStorageEnabled.parsed?.value;
        result.logLevel = result.logLevel ?? envs?.[key]?.logLevel.parsed?.value;
        result.ws = result.ws ?? envs?.[key]?.ws;
    }
    return result;
};

const envJsonAtom = atom(async get => {
    const envs = await get(envsAtom);
    return toEnvJson(envs);
});

type NonParsedMonitorElement<HasPublicEnvTxt extends boolean> = {
    importMetaEnv: string | undefined;
    publicEnvTxt: HasPublicEnvTxt extends true ? string | undefined : undefined;
    final: string | undefined;
};

type ParsedMonitorElement<HasPublicEnvTxt extends boolean, TParsed, TParsedFinal = TParsed> = {
    importMetaEnv: EnvValue<TParsed>;
    publicEnvTxt: HasPublicEnvTxt extends true ? EnvValue<TParsed> : undefined;
    final: TParsedFinal;
};

type Monitor<HasPublicEnvTxt extends boolean> = {
    firebaseConfig: ParsedMonitorElement<
        HasPublicEnvTxt,
        Result<FirebaseConfig> | undefined,
        FirebaseConfig | undefined
    >;
    http: NonParsedMonitorElement<HasPublicEnvTxt>;
    ws: NonParsedMonitorElement<HasPublicEnvTxt>;
    authProviders: ParsedMonitorElement<HasPublicEnvTxt, string[] | undefined>;
    isUnlistedFirebaseStorageEnabled: ParsedMonitorElement<
        HasPublicEnvTxt,
        Result<boolean>,
        boolean | undefined
    >;
    logLevel: ParsedMonitorElement<
        HasPublicEnvTxt,
        Result<PinoLogLevel | undefined>,
        PinoLogLevel | undefined
    >;
};

export type EnvsMonitorAtomReturnType =
    | {
          publicEnvTxtFetched: true;
          value: Monitor<true>;
      }
    | {
          publicEnvTxtFetched: false;
          value: Monitor<false>;
      };

export const envsMonitorAtom = atom<Promise<EnvsMonitorAtomReturnType>>(async get => {
    const envs = await get(envsAtom);
    const envJson = toEnvJson(envs);

    // この関数から何も処理せずにそのまま { envs, envJson } を返す手もあるが、そうすると Storybook で { envs, envJson } のモックを作るのが面倒になるためここで処理を行っている。

    if (envs.publicEnvTxt != null) {
        return {
            publicEnvTxtFetched: true,
            value: {
                firebaseConfig: {
                    importMetaEnv: envs.importMetaEnv.firebaseConfig,
                    publicEnvTxt: envs.publicEnvTxt.firebaseConfig,
                    final: envJson.firebaseConfig,
                },
                authProviders: {
                    importMetaEnv: envs.importMetaEnv.authProviders,
                    publicEnvTxt: envs.publicEnvTxt.authProviders,
                    final: envJson.authProviders,
                },
                isUnlistedFirebaseStorageEnabled: {
                    importMetaEnv: envs.importMetaEnv.isUnlistedFirebaseStorageEnabled,
                    publicEnvTxt: envs.publicEnvTxt.isUnlistedFirebaseStorageEnabled,
                    final: envJson.isUnlistedFirebaseStorageEnabled,
                },
                logLevel: {
                    importMetaEnv: envs.importMetaEnv.logLevel,
                    publicEnvTxt: envs.publicEnvTxt.logLevel,
                    final: envJson.logLevel,
                },
                http: {
                    importMetaEnv: envs.importMetaEnv.http,
                    publicEnvTxt: envs.publicEnvTxt.http,
                    final: envJson.http,
                },
                ws: {
                    importMetaEnv: envs.importMetaEnv.ws,
                    publicEnvTxt: envs.publicEnvTxt.ws,
                    final: envJson.ws,
                },
            },
        } satisfies EnvsMonitorAtomReturnType;
    }

    return {
        publicEnvTxtFetched: false,
        value: {
            firebaseConfig: {
                importMetaEnv: envs.importMetaEnv.firebaseConfig,
                publicEnvTxt: undefined,
                final: envJson.firebaseConfig,
            },
            authProviders: {
                importMetaEnv: envs.importMetaEnv.authProviders,
                publicEnvTxt: undefined,
                final: envJson.authProviders,
            },
            isUnlistedFirebaseStorageEnabled: {
                importMetaEnv: envs.importMetaEnv.isUnlistedFirebaseStorageEnabled,
                publicEnvTxt: undefined,
                final: envJson.isUnlistedFirebaseStorageEnabled,
            },
            logLevel: {
                importMetaEnv: envs.importMetaEnv.logLevel,
                publicEnvTxt: undefined,
                final: envJson.logLevel,
            },
            http: {
                importMetaEnv: envs.importMetaEnv.http,
                publicEnvTxt: undefined,
                final: envJson.http,
            },
            ws: {
                importMetaEnv: envs.importMetaEnv.ws,
                publicEnvTxt: undefined,
                final: envJson.ws,
            },
        },
    } satisfies EnvsMonitorAtomReturnType;
});

type WebConfigAtomReturnType =
    | {
          isMock: false;
          value: WebConfig;
      }
    | {
          isMock: true;
          value: MockableWebConfig;
      };

export const webConfigAtom = atom<Promise<WebConfigAtomReturnType>>(async get => {
    const storybook = get(storybookAtom);
    if (storybook.mock?.webConfig != null) {
        return {
            isMock: true,
            value: storybook.mock.webConfig,
        };
    }
    const mergedEnv = await get(envJsonAtom);
    const result: WebConfig = {
        authProviders: mergedEnv.authProviders,
        firebaseConfig: mergedEnv.firebaseConfig,
        isUnlistedFirebaseStorageEnabled: mergedEnv.isUnlistedFirebaseStorageEnabled ?? false,
        isPublicFirebaseStorageEnabled: false,
        http: mergedEnv.http,
        ws: mergedEnv.ws,
        logLevel: mergedEnv.logLevel,
    };
    return { isMock: false, value: result };
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
