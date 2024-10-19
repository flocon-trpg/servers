import { simpleId } from '@flocon-trpg/core';
import { createUrqlClient } from '@flocon-trpg/sdk-urql';
import { createDefaultLogger, loggerRef } from '@flocon-trpg/utils';
import { loader } from '@monaco-editor/react';
import { QueryClient } from '@tanstack/react-query';
import { devtoolsExchange } from '@urql/devtools';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import pino from 'pino';
import React from 'react';
import { useAsync, useDebounce, useLatest } from 'react-use';
import urljoin from 'url-join';
import useConstant from 'use-constant';
import { roomConfigAtom } from '../atoms/roomConfigAtom/roomConfigAtom';
import { RoomConfig } from '../atoms/roomConfigAtom/types/roomConfig';
import { storybookAtom } from '../atoms/storybookAtom/storybookAtom';
import { UserConfig } from '../atoms/userConfigAtom/types';
import { userConfigAtom } from '../atoms/userConfigAtom/userConfigAtom';
import { getHttpUri, getWsUri, webConfigAtom } from '../atoms/webConfigAtom/webConfigAtom';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { useWebConfig } from '@/hooks/useWebConfig';
import {
    FirebaseUserState,
    authNotFound,
    loading,
    notSignIn,
} from '@/utils/firebase/firebaseUserState';
import { setRoomConfig } from '@/utils/localStorage/roomConfig';
import { getUserConfig, setUserConfig } from '@/utils/localStorage/userConfig';
import { atomWithObservable } from 'jotai/utils';
import { from, Observable, switchAll } from 'rxjs';

export const firebaseAppAtom = atom(async get => {
    const config = await get(webConfigAtom);

    if (config?.value == null) {
        return undefined;
    }
    return initializeApp(config.value.firebaseConfig);
});

const httpUriAtom = atom(async get => {
    const config = await get(webConfigAtom);
    if (config?.value == null) {
        return undefined;
    }
    return urljoin(getHttpUri(config.value), 'graphql');
});

const wsUriAtom = atom(async get => {
    const config = await get(webConfigAtom);
    if (config?.value == null) {
        return undefined;
    }
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
    if (app == null) {
        return null;
    }
    return getAuth(app);
});

export const firebaseStorageAtom = atom(async get => {
    const mock = get(storybookAtom).mock?.storage;
    if (mock != null) {
        return mock;
    }
    const app = await get(firebaseAppAtom);
    if (app == null) {
        return null;
    }
    return getStorage(app);
});

export const firebaseUserAtom = atomWithObservable(get => {
    const authPromise = get(firebaseAuthAtom);
    const result = authPromise.then(
        auth =>
            new Observable<FirebaseUserState>(observer => {
                if (auth == null) {
                    observer.next(authNotFound);
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

// アプリ内で1回のみ呼ばれることを想定。
// localForageを用いてRoomConfigを読み込み、jotaiのatomと紐付ける。
// Userが変わるたびに、useUserConfigが更新される必要がある。_app.tsxなどどこか一箇所でuseUserConfigを呼び出すだけでよい。
const useUserConfig = (userUid: string | null): void => {
    const setUserConfig = useSetAtom(userConfigAtom);

    React.useEffect(() => {
        let unmounted = false;
        const main = async () => {
            setUserConfig(null);
            if (userUid == null) {
                return;
            }
            const userConfig = await getUserConfig(userUid);
            if (unmounted) {
                return;
            }
            setUserConfig(userConfig);
        };
        void main();
        return () => {
            unmounted = true;
        };
    }, [userUid, setUserConfig]);
};

// アプリ内で1回のみ呼ばれることを想定。
const useAutoSaveUserConfig = () => {
    const throttleTimespan = 500;
    const userConfig = useAtomValue(userConfigAtom);

    // throttleでは非常に重くなるため、debounceを使っている
    const [debouncedUserConfig, setDebouncedUserConfig] = React.useState<UserConfig | null>(null);
    useDebounce(
        () => {
            setDebouncedUserConfig(userConfig);
        },
        throttleTimespan,
        [userConfig],
    );

    useAsync(async () => {
        if (debouncedUserConfig == null) {
            return;
        }

        // localForageから値を読み込んだ直後は常に値の書き込みが1回発生する仕様となっている。これはこれはほとんどのケースで無意味な処理だが、シンプルなコードを優先している。
        // CONSIDER: configをユーザーが更新した直後にすぐブラウザを閉じると、閉じる直前のconfigが保存されないケースがある。余裕があれば直したい（閉じるときに強制保存orダイアログを出すなど）。
        await setUserConfig(debouncedUserConfig);
    }, [debouncedUserConfig]);
};

// アプリ内で1回のみ呼ばれることを想定。
const useAutoSaveRoomConfig = () => {
    const throttleTimespan = 500;
    const roomConfig = useAtomValue(roomConfigAtom);

    // throttleでは非常に重くなるため、debounceを使っている
    const [debouncedRoomConfig, setDebouncedRoomConfig] = React.useState<RoomConfig | null>(null);
    useDebounce(
        () => {
            setDebouncedRoomConfig(roomConfig);
        },
        throttleTimespan,
        [roomConfig],
    );

    useAsync(async () => {
        if (debouncedRoomConfig == null) {
            return;
        }

        // localForageから値を読み込んだ直後は常に値の書き込みが1回発生する仕様となっている。無駄な処理ではあるが、パフォーマンスの問題はほぼ生じないと判断している。
        // CONSIDER: configをユーザーが更新した直後にすぐブラウザを閉じると、閉じる直前のconfigが保存されないケースがある。余裕があれば直したい（閉じるときに強制保存orダイアログを出すなど）。
        await setRoomConfig(debouncedRoomConfig);
    }, [debouncedRoomConfig]);
};

// アプリ内で1回のみ呼ばれることを想定。
export const useSetupApp = () => {
    const storybook = useAtomValue(storybookAtom);
    const config = useWebConfig();
    React.useEffect(() => {
        const defaultLevel = 'info';
        loggerRef.value = storybook.isStorybook
            ? pino()
            : createDefaultLogger({ logLevel: config?.value?.logLevel ?? defaultLevel });
    }, [config?.value?.logLevel, storybook.isStorybook]);

    const user = useAtomValue(firebaseUserAtom);
    const userValue = useAtomValue(firebaseUserValueAtom);
    const myUserUid = useMyUserUid();
    const httpUri = useAtomValue(httpUriAtom);
    const wsUri = useAtomValue(wsUriAtom);
    const { getIdTokenResult, canGetIdToken } = useAtomValue(getIdTokenResultAtom);
    const getIdTokenResultRef = useLatest(getIdTokenResult);

    useUserConfig(myUserUid ?? null);
    useAutoSaveRoomConfig();
    useAutoSaveUserConfig();

    const [urqlClient, setUrqlClient] = React.useState<ReturnType<typeof createUrqlClient>>();
    React.useEffect(() => {
        if (httpUri == null || wsUri == null) {
            return;
        }
        if (canGetIdToken) {
            setUrqlClient(
                createUrqlClient({
                    httpUrl: httpUri,
                    wsUrl: wsUri,
                    authorization: true,
                    getUserIdTokenResult: getIdTokenResultRef.current,
                    exchanges: defaultExchanges => [devtoolsExchange, ...defaultExchanges],
                }),
            );
        } else {
            setUrqlClient(
                createUrqlClient({
                    httpUrl: httpUri,
                    wsUrl: wsUri,
                    authorization: false,
                    exchanges: defaultExchanges => [devtoolsExchange, ...defaultExchanges],
                }),
            );
        }
    }, [
        httpUri,
        wsUri,
        getIdTokenResultRef,
        canGetIdToken,
        /*
        # userValueをdepsに加えている理由
        
        ## 理由1
        コンポーネントが最初にrenderされる時点では、ログインしていてもuserValueはnullishである。userValueがnullishのときは、getIdTokenを実行してもnullishな値が返される。その直後にonAuthStateChangedによってuserValueがnon-nullishとなる。
        useQueryなどといったurqlのhooksは即時実行されるため、もしuserValueがないと、idTokenを取得できない状態でhooksが実行されPermission errorが起こって終わりになってしまう。
        そこで、userValueが変化したときにUrqlClientのインスタンスを更新することで、urqlのhooksが今度はidTokenありの状態で再度実行されるため、正常に動作するようになるというのが理由。

        ## 理由2
        ユーザーが変わったときにUrqlのキャッシュを破棄させるため。
        */
        userValue,
    ]);

    const [reactQueryClient, setReactQueryClient] = React.useState<QueryClient | null>(null);
    React.useEffect(() => {
        setReactQueryClient(new QueryClient());
    }, [
        // ユーザーが変わったときにreact-queryのキャッシュを破棄させるため、userValueをdepsに加えている。
        userValue,
    ]);

    const authNotFoundState = user === 'authNotFound';
    const clientId = useConstant(() => simpleId());

    React.useEffect(() => {
        // monaco editorのコンテキストメニューなどを日本語にしている。
        loader.config({ 'vs/nls': { availableLanguages: { '*': 'ja' } } });
    }, []);

    return React.useMemo(
        () => ({
            config,
            urqlClient,
            reactQueryClient,
            authNotFoundState,
            clientId,
            httpUri,
            wsUri,
        }),
        [authNotFoundState, clientId, config, httpUri, reactQueryClient, urqlClient, wsUri],
    );
};
