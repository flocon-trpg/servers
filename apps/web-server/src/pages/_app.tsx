import '../styles/css/antd.css';
import '../styles/css/main.scss';

import 'firebase/auth';
import 'firebase/storage';

import React from 'react';
import { AppProps } from 'next/app';
import useConstant from 'use-constant';
import { appConsole } from '../utils/appConsole';
import { enableMapSet } from 'immer';
import Head from 'next/head';
import { loader } from '@monaco-editor/react';
import { ExpiryMap } from '../utils/file/expiryMap';
import urljoin from 'url-join';
import { createUrqlClient } from '../utils/createUrqlClient';
import { getUserConfig, setUserConfig } from '../utils/localStorage/userConfig';
import { useMyUserUid } from '../hooks/useMyUserUid';
import { AllContextProvider } from '../components/behaviors/AllContextProvider';
import { simpleId } from '@flocon-trpg/core';
import { userConfigAtom } from '../atoms/userConfigAtom/userConfigAtom';
import { useAsync, useDebounce } from 'react-use';
import { roomConfigAtom } from '../atoms/roomConfigAtom/roomConfigAtom';
import { setRoomConfig } from '../utils/localStorage/roomConfig';
import { UserConfig } from '../atoms/userConfigAtom/types';
import { RoomConfig } from '../atoms/roomConfigAtom/types/roomConfig';
import { getHttpUri, getWsUri, publicEnvTxtAtom } from '../atoms/webConfigAtom/webConfigAtom';
import { useWebConfig } from '../hooks/useWebConfig';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, User, getAuth } from 'firebase/auth';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import { storybookAtom } from '../atoms/storybookAtom/storybookAtom';
import {
    FirebaseUserState,
    authNotFound,
    loading,
    notSignIn,
} from '../utils/firebase/firebaseUserState';
import { useGetIdToken } from '@/hooks/useGetIdToken';

enableMapSet();

const firebaseAppCoreAtom = atom<FirebaseApp | undefined>(undefined);
export const firebaseAppAtom = atom(get => get(firebaseAppCoreAtom));

const firebaseAuthCoreAtom = atom<Auth | undefined>(undefined);
export const firebaseAuthAtom = atom(get => {
    const mock = get(storybookAtom).mock?.auth;
    if (mock != null) {
        return mock;
    }
    return get(firebaseAuthCoreAtom);
});

const firebaseStorageCoreAtom = atom<FirebaseStorage | undefined>(undefined);
export const firebaseStorageAtom = atom(get => {
    const mock = get(storybookAtom).mock?.storage;
    if (mock != null) {
        return mock;
    }
    return get(firebaseStorageCoreAtom);
});

const firebaseUserCoreAtom = atom<FirebaseUserState>(loading);
export const firebaseUserAtom = atom(get => {
    const mock = get(storybookAtom).mock?.user;
    if (mock != null) {
        return mock;
    }
    return get(firebaseUserCoreAtom);
});
export const firebaseUserValueAtom = atom(get => {
    const user = get(firebaseUserCoreAtom);
    if (typeof user === 'string') {
        return null;
    }
    return user;
});

// localForageを用いてRoomConfigを読み込み、ReduxのStateと紐付ける。
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
        main();
        return () => {
            unmounted = true;
        };
    }, [userUid, setUserConfig]);
};

// _app.tsxで1回のみ呼ばれることを想定。
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
        [userConfig]
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
        [roomConfig]
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

// _app.tsxで1回のみ呼ばれることを想定。
const useSubscribeFirebaseUser = (): void => {
    const auth = useAtomValue(firebaseAuthAtom);
    const setUser = useSetAtom(firebaseUserCoreAtom);
    React.useEffect(() => {
        if (auth == null) {
            setUser(authNotFound);
            return;
        }

        // authは最初はnullで、その後非同期でenv.txtが読み込まれてからnon-nullになるため、サイトを開いたときは正常の場合でも上のコードによりまずauthNotFoundがセットされる。
        // そのためこのようにloadingをセットしないと、onAuthStateChangedでuserを受信するまでauthNotFoundエラーがブラウザ画面に表示されてしまう。
        setUser(loading);

        const unsubscribe = auth.onAuthStateChanged(user => {
            setUser(user == null ? notSignIn : user);
        });
        return () => {
            unsubscribe();
        };
    }, [auth, setUser]);
};

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
    const setPublicEnvTxt = useSetAtom(publicEnvTxtAtom);
    React.useEffect(() => {
        const main = async () => {
            // chromeなどではfetchできないと `http://localhost:3000/env.txt 404 (Not Found)` などといったエラーメッセージが表示されるが、実際は問題ない
            const envTxtObj = await fetch('/env.txt');
            if (!envTxtObj.ok) {
                setPublicEnvTxt({ fetched: true, value: null });
                return;
            }
            const envTxt = await envTxtObj.text();
            setPublicEnvTxt({ fetched: true, value: envTxt });
        };
        main();
    }, [setPublicEnvTxt]);

    const config = useWebConfig();

    const [firebaseApp, setFirebaseApp] = useAtom(firebaseAppCoreAtom);
    React.useEffect(() => {
        if (config?.value == null) {
            setFirebaseApp(undefined);
            return;
        }
        setFirebaseApp(prevValue => {
            if (prevValue != null) {
                console.warn('Firebase app is initialized multiple times');
            }
            return initializeApp(config.value.firebaseConfig);
        });
    }, [config, setFirebaseApp]);

    const setFirebaseAuth = useSetAtom(firebaseAuthCoreAtom);
    const setFirebaseStorage = useSetAtom(firebaseStorageCoreAtom);
    React.useEffect(() => {
        setFirebaseAuth(firebaseApp == null ? undefined : getAuth(firebaseApp));
        setFirebaseStorage(firebaseApp == null ? undefined : getStorage(firebaseApp));
    }, [firebaseApp, setFirebaseAuth, setFirebaseStorage]);

    const [httpUri, setHttpUri] = React.useState<string>();
    const [wsUri, setWsUri] = React.useState<string>();
    React.useEffect(() => {
        if (config?.value == null) {
            setHttpUri(undefined);
            return;
        }
        setHttpUri(urljoin(getHttpUri(config.value), 'graphql'));
    }, [config]);
    React.useEffect(() => {
        if (config?.value == null) {
            setWsUri(undefined);
            return;
        }
        setWsUri(urljoin(getWsUri(config.value), 'graphql'));
    }, [config]);
    React.useEffect(() => {
        if (httpUri == null) {
            return;
        }
        appConsole.log(`GraphQL HTTP URL: ${httpUri}`);
    }, [httpUri]);
    React.useEffect(() => {
        if (wsUri == null) {
            return;
        }
        appConsole.log(`GraphQL WebSocket URL: ${wsUri}`);
    }, [wsUri]);

    useSubscribeFirebaseUser();
    const user = useAtomValue(firebaseUserAtom);
    const userValue = useAtomValue(firebaseUserValueAtom);
    const myUserUid = useMyUserUid();
    const { getIdToken } = useGetIdToken();

    useUserConfig(myUserUid ?? null);
    useAutoSaveRoomConfig();
    useAutoSaveUserConfig();

    const [urqlClient, setUrqlClient] = React.useState<ReturnType<typeof createUrqlClient>>();
    React.useEffect(() => {
        if (httpUri == null || wsUri == null) {
            return;
        }
        setUrqlClient(
            createUrqlClient({ httpUrl: httpUri, wsUrl: wsUri, getUserIdToken: getIdToken })
        );
    }, [
        httpUri,
        wsUri,
        getIdToken,
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
    const [authNotFoundState, setAuthNotFoundState] = React.useState(false);
    React.useEffect(() => {
        setAuthNotFoundState(user === 'authNotFound');
    }, [user]);

    const clientId = useConstant(() => simpleId());
    React.useEffect(() => {
        appConsole.log(`clientId: ${clientId}`);
    }, [clientId]);

    const firebaseStorageUrlCache = useConstant(() => new ExpiryMap<string, string>());

    React.useEffect(() => {
        // monaco editorのコンテキストメニューなどを日本語にしている。
        loader.config({ 'vs/nls': { availableLanguages: { '*': 'ja' } } });
    }, []);

    if (config == null) {
        return <div style={{ padding: 5 }}>{'env.txt を確認しています…'}</div>;
    }

    if (config.isError) {
        return <div style={{ padding: 5 }}>{`設定ファイルに問題があります: ${config.error}`}</div>;
    }

    if (authNotFoundState) {
        return (
            <div style={{ padding: 5 }}>
                {
                    '予期しないエラーが発生しました: authNotFound / An unexpected error occured: authNotFound'
                }
            </div>
        );
    }
    if (urqlClient == null) {
        return <div style={{ padding: 5 }}>{'しばらくお待ち下さい… / Please wait…'}</div>;
    }
    return (
        <>
            <Head>
                <link rel='shortcut icon' href='/assets/logo.png' />
            </Head>
            <AllContextProvider
                clientId={clientId}
                client={urqlClient}
                firebaseStorageUrlCache={firebaseStorageUrlCache}
            >
                <Component {...pageProps} />
            </AllContextProvider>
        </>
    );
};

export default App;
