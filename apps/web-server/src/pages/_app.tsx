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
import { userConfigAtom } from '../atoms/userConfig/userConfigAtom';
import { roomNotificationsAtom, text } from '../atoms/room/roomAtom';
import { useAsync, useDebounce } from 'react-use';
import { roomConfigAtom } from '../atoms/roomConfig/roomConfigAtom';
import { setRoomConfig } from '../utils/localStorage/roomConfig';
import { UserConfig } from '../atoms/userConfig/types';
import { RoomConfig } from '../atoms/roomConfig/types/roomConfig';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { getHttpUri, getWsUri, publicEnvTxtAtom } from '../atoms/webConfig/webConfigAtom';
import { useWebConfig } from '../hooks/useWebConfig';
import { atom, useAtom, useSetAtom } from 'jotai';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import { Ref } from '../utils/ref';
import { storybookAtom } from '../atoms/storybook/storybookAtom';
import {
    FirebaseUserState,
    authNotFound,
    loading,
    notSignIn,
} from '../utils/firebase/firebaseUserState';

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

// この値がnull ⇔ UrqlClientにおけるAuthorizationヘッダーなどが空（= API serverにおいて、Firebase Authenticationでログインしていないと判断される）
// 値がfunctionだとjotaiが勝手にfunctionを実行してその結果をatomに保持してしまうため、必ずfunctionの状態で保持されるようにRefで包んでいる
const getIdTokenCoreAtom = atom<Ref<(() => Promise<string | null>) | null>>({ value: null });
export const getIdTokenAtom = atom(get => get(getIdTokenCoreAtom).value);

const firebaseUserCoreAtom = atom<FirebaseUserState>(loading);
export const firebaseUserAtom = atom(get => {
    const mock = get(storybookAtom).mock?.user;
    if (mock != null) {
        return mock;
    }
    return get(firebaseUserCoreAtom);
});

// localForageを用いてRoomConfigを読み込み、ReduxのStateと紐付ける。
// Userが変わるたびに、useUserConfigが更新される必要がある。_app.tsxなどどこか一箇所でuseUserConfigを呼び出すだけでよい。
const useUserConfig = (userUid: string | null): void => {
    const setUserConfig = useUpdateAtom(userConfigAtom);

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

// _app.tsxで1回のみ呼ばれることを想定。
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
    const setUser = useUpdateAtom(firebaseUserCoreAtom);
    React.useEffect(() => {
        if (auth == null) {
            setUser(authNotFound);
            return;
        }

        // authは最初はnullで、その後非同期でenv.txtが読み込まれてからnon-nullになるため、サイトを開いたときは正常の場合でも上のコードによりまずauthNotFoundがセットされる。
        // そのためこのようにloadingをセットしないと、onIdTokenChangedでuserを受信するまでauthNotFoundエラーがブラウザ画面に表示されてしまう。
        setUser(loading);

        const unsubscribe = auth.onIdTokenChanged(user => {
            setUser(user == null ? notSignIn : user);
        });
        return () => {
            unsubscribe();
        };
    }, [auth, setUser]);
};

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
    const setPublicEnvTxt = useUpdateAtom(publicEnvTxtAtom);
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

    const setFirebaseAuth = useUpdateAtom(firebaseAuthCoreAtom);
    const setFirebaseStorage = useUpdateAtom(firebaseStorageCoreAtom);
    React.useEffect(() => {
        setFirebaseAuth(firebaseApp == null ? undefined : getAuth(firebaseApp));
        setFirebaseStorage(firebaseApp == null ? undefined : getStorage(firebaseApp));
    }, [firebaseApp, setFirebaseAuth, setFirebaseStorage]);

    const setRoomNotification = useUpdateAtom(roomNotificationsAtom);

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
    const myUserUid = useMyUserUid();

    useUserConfig(myUserUid ?? null);
    useAutoSaveRoomConfig();
    useAutoSaveUserConfig();

    const setGetIdTokenState = useSetAtom(getIdTokenCoreAtom);
    const getIdToken = React.useMemo(() => {
        if (typeof user === 'string') {
            return null;
        }
        return async () => {
            return await user.getIdToken().catch(err => {
                console.error('failed at getIdToken', err);
                setRoomNotification({
                    type: text,
                    notification: {
                        type: 'error',
                        message:
                            'Firebase AuthenticationでIdTokenの取得に失敗しました。ブラウザのコンソールにエラーの内容を出力しました。',
                        createdAt: new Date().getTime(),
                    },
                });
                return null;
            });
        };
    }, [setRoomNotification, user]);
    const [urqlClient, setUrqlClient] = React.useState<ReturnType<typeof createUrqlClient>>();
    React.useEffect(() => {
        if (httpUri == null || wsUri == null) {
            return;
        }
        setUrqlClient(
            createUrqlClient({ httpUrl: httpUri, wsUrl: wsUri, getUserIdToken: getIdToken })
        );
        setGetIdTokenState({ value: getIdToken });
    }, [httpUri, wsUri, getIdToken, setGetIdTokenState]);
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
