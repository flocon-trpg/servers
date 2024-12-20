import { simpleId } from '@flocon-trpg/core';
import { createUrqlClient } from '@flocon-trpg/sdk-urql';
import { createDefaultLogger, loggerRef } from '@flocon-trpg/utils';
import { loader } from '@monaco-editor/react';
import { QueryClient } from '@tanstack/react-query';
import { devtoolsExchange } from '@urql/devtools';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { atom, useAtomValue } from 'jotai';
import { atomWithObservable } from 'jotai/utils';
import pino from 'pino';
import React from 'react';
import { usePreviousDistinct } from 'react-use';
import { Observable, from, switchAll } from 'rxjs';
import urljoin from 'url-join';
import useConstant from 'use-constant';
import { storybookAtom } from '../atoms/storybookAtom/storybookAtom';
import { getHttpUri, getWsUri, webConfigAtom } from '../atoms/webConfigAtom/webConfigAtom';
import { useWebConfig } from '@/hooks/useWebConfig';
import {
    FirebaseUserState,
    authNotFound,
    loading,
    notSignIn,
} from '@/utils/firebase/firebaseUserState';

const mockType = 'mock';
const webConfigIsNullishType = 'webConfigIsNullish';
const successType = 'success';

type FirebaseAppAtomReturnType =
    | {
          type: typeof mockType;
      }
    | {
          type: typeof webConfigIsNullishType;
      }
    | {
          type: typeof successType;
          value: ReturnType<typeof initializeApp>;
      };

const firebaseAppAtom = atom<Promise<FirebaseAppAtomReturnType>>(async get => {
    const config = await get(webConfigAtom);
    if (config.isMock === true) {
        return { type: mockType };
    }
    if (config.value.firebaseConfig == null) {
        return { type: webConfigIsNullishType };
    }
    const app = initializeApp(config.value.firebaseConfig);
    return { type: successType, value: app };
});

export const useOnFirebaseAppChange = (onChange: () => void) => {
    const app = useAtomValue(firebaseAppAtom);
    const prevApp = usePreviousDistinct(app);
    const onChangeRef = React.useRef(onChange);

    return React.useEffect(() => {
        if (prevApp == null) {
            return;
        }
        if (app !== prevApp) {
            onChangeRef.current();
        }
    }, [app, prevApp]);
};

const httpUriAtom = atom(async get => {
    const config = await get(webConfigAtom);
    return urljoin(getHttpUri(config.value), 'graphql');
});

const wsUriAtom = atom(async get => {
    const config = await get(webConfigAtom);
    return urljoin(getWsUri(config.value), 'graphql');
});

/**
 * @returns 戻り値の `Auth` のインスタンスの名前を `auth` とすると、Firebase の仕様で、`auth` が変わらなくても `auth.currentUser` が変わることがある。もし `auth.currentUser` の変更を検知したい場合は `firebaseUserAtom` 等を利用する。
 */
export const firebaseAuthAtom = atom(async get => {
    const mock = get(storybookAtom).mock?.auth;
    if (mock != null) {
        return mock;
    }
    const app = await get(firebaseAppAtom);
    if (app.type !== successType) {
        return null;
    }
    return getAuth(app.value);
});

export const firebaseStorageAtom = atom(async get => {
    const mock = get(storybookAtom).mock?.storage;
    if (mock != null) {
        return mock;
    }
    const app = await get(firebaseAppAtom);
    if (app.type !== successType) {
        return null;
    }
    return getStorage(app.value);
});

export const firebaseUserAtom = atomWithObservable(get => {
    const authPromise = get(firebaseAuthAtom);
    const result = authPromise.then(
        auth =>
            new Observable<FirebaseUserState>(observer => {
                if (auth == null) {
                    observer.next(authNotFound);
                    observer.complete();
                    return;
                }
                // authは最初はnullで、その後非同期でenv.txtが読み込まれてからnon-nullになるため、サイトを開いたときは正常の場合でも上のコードによりまずauthNotFoundがセットされる。
                // そのためこのようにloadingをセットしないと、onAuthStateChangedでuserを受信するまでauthNotFoundエラーがブラウザ画面に表示されてしまう。
                observer.next(loading);

                const unsubscribe = auth.onAuthStateChanged(user => {
                    observer.next(user == null ? notSignIn : user);
                });
                return () => {
                    unsubscribe();
                };
            }),
    );
    return from(result).pipe(switchAll()) satisfies Observable<FirebaseUserState>;
});

export const firebaseUserValueAtom = atom(async get => {
    const user = await get(firebaseUserAtom);
    if (typeof user === 'string') {
        return null;
    }
    return user;
});

/** @returns getIdTokenResultを実行したときにnon-nullishな値が返ってくると予想される場合は、canGetIdTokenResultはtrueとなる。 */
export const getIdTokenResultAtom = atom(async get => {
    const user = await get(firebaseUserValueAtom);
    const canGetIdToken = user != null && typeof user !== 'string';
    const getIdTokenResult = async () => {
        if (user == null) {
            return null;
        }
        return user.getIdTokenResult().catch(err => {
            loggerRef.autoDetectObj.error(err, 'failed at getIdToken');
            return null;
        });
    };

    const getIdToken = async () => {
        const idTokenResult = await getIdTokenResult();
        if (idTokenResult == null) {
            return idTokenResult;
        }
        return idTokenResult.token;
    };

    return { getIdTokenResult, getIdToken, canGetIdToken };
});

const urqlClientAtom = atom(async get => {
    const httpUri = await get(httpUriAtom);
    const wsUri = await get(wsUriAtom);
    const { getIdTokenResult, canGetIdToken } = await get(getIdTokenResultAtom);
    if (canGetIdToken) {
        return createUrqlClient({
            httpUrl: httpUri,
            wsUrl: wsUri,
            authorization: true,
            getUserIdTokenResult: getIdTokenResult,
            exchanges: defaultExchanges => [devtoolsExchange, ...defaultExchanges],
        });
    }
    return createUrqlClient({
        httpUrl: httpUri,
        wsUrl: wsUri,
        authorization: false,
        exchanges: defaultExchanges => [devtoolsExchange, ...defaultExchanges],
    });
});

const reactQueryClientAtom = atom(async get => {
    // ユーザーが変わったときにreact-queryのキャッシュを破棄させるため、firebaseUserValueAtomをgetしている。
    await get(firebaseUserValueAtom);

    return new QueryClient();
});

// アプリ内で1回のみ呼ばれることを想定。
export const useSetupApp = () => {
    const storybook = useAtomValue(storybookAtom);
    const config = useWebConfig();
    React.useEffect(() => {
        const defaultLevel = 'info';
        loggerRef.value = storybook.isStorybook
            ? pino()
            : createDefaultLogger({ logLevel: config.logLevel ?? defaultLevel });
    }, [config.logLevel, storybook.isStorybook]);

    const user = useAtomValue(firebaseUserAtom);
    const httpUri = useAtomValue(httpUriAtom);
    const wsUri = useAtomValue(wsUriAtom);

    const urqlClient = useAtomValue(urqlClientAtom);
    const reactQueryClient = useAtomValue(reactQueryClientAtom);

    const authNotFoundState = user === 'authNotFound';
    const clientId = useConstant(() => simpleId());

    React.useEffect(() => {
        // monaco editorのコンテキストメニューなどを日本語にしている。
        loader.config({ 'vs/nls': { availableLanguages: { '*': 'ja' } } });
    }, []);

    return React.useMemo(
        () => ({
            urqlClient,
            reactQueryClient,
            authNotFoundState,
            clientId,
            httpUri,
            wsUri,
        }),
        [authNotFoundState, clientId, httpUri, reactQueryClient, urqlClient, wsUri],
    );
};
