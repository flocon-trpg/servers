import 'firebaseui/dist/firebaseui.css';
import '../css/antd.css';
import '../css/main.scss';

import 'firebase/auth';
import 'firebase/storage';

import React from 'react';
import { AppProps } from 'next/app';
import 'firebase/auth';
import 'firebase/storage';
import useConstant from 'use-constant';
import { authNotFound, FirebaseUserState, loading, notSignIn } from '../contexts/MyAuthContext';
import { store } from '../store';
import { appConsole } from '../utils/appConsole';
import { getConfig, getHttpUri, getWsUri } from '../config';
import { enableMapSet } from 'immer';
import Head from 'next/head';
import { loader } from '@monaco-editor/react';
import { ExpiryMap } from '../utils/expiryMap';
import urljoin from 'url-join';
import { createApolloClient } from '../utils/createApolloClient';
import { getUserConfig, setUserConfig } from '../utils/localStorage/userConfig';
import { getAuth } from '../utils/firebaseHelpers';
import { ConfigContext } from '../contexts/ConfigContext';
import { useMyUserUid } from '../hooks/useMyUserUid';
import { AllContextProvider } from '../components/AllContextProvider';
import { simpleId } from '@flocon-trpg/core';
import { Ref } from '../utils/ref';
import { useAtom } from 'jotai';
import { userConfigAtom } from '../atoms/userConfig/userConfigAtom';
import { addRoomNotificationAtom, Notification } from '../atoms/room/roomAtom';
import { writeonlyAtom } from '../atoms/writeonlyAtom';
import { useAsync,useThrottle } from 'react-use';
import { roomConfigAtom } from '../atoms/roomConfig/roomConfigAtom';
import { setRoomConfig } from '../utils/localStorage/roomConfig';

enableMapSet();

const config = getConfig();

const writeonlyUserConfigAtom = writeonlyAtom(userConfigAtom);

// localForageを用いてRoomConfigを読み込み、ReduxのStateと紐付ける。
// Userが変わるたびに、useUserConfigが更新される必要がある。_app.tsxなどどこか一箇所でuseUserConfigを呼び出すだけでよい。
const useUserConfig = (userUid: string | null): void => {
    const [, setUserConfig] = useAtom(writeonlyUserConfigAtom);

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
    const [userConfig] = useAtom(userConfigAtom);
    const throttledUserConfig = useThrottle(userConfig, throttleTimespan);
    useAsync(async () => {
        if (throttledUserConfig == null) {
            return;
        }

        // localForageから値を読み込んだ直後は常に値の書き込みが1回発生する仕様となっている。これはこれはほとんどのケースで無意味な処理だが、シンプルなコードを優先している。
        // CONSIDER: configをユーザーが更新した直後にすぐブラウザを閉じると、閉じる直前のconfigが保存されないケースがある。余裕があれば直したい（閉じるときに強制保存orダイアログを出すなど）。
        await setUserConfig(throttledUserConfig);
    }, [throttledUserConfig]);
};

// _app.tsxで1回のみ呼ばれることを想定。
const useAutoSaveRoomConfig = () => {
    const throttleTimespan = 500;
    const [roomConfig] = useAtom(roomConfigAtom);
    const throttledRoomConfig = useThrottle(roomConfig, throttleTimespan);
    useAsync(async () => {
        if (throttledRoomConfig == null) {
            return;
        }

        // localForageから値を読み込んだ直後は常に値の書き込みが1回発生する仕様となっている。RoomConfigの場合はUserConfigと比べて、不正な値が自動的されることがあるため、この仕様はより正当化される。
        // CONSIDER: configをユーザーが更新した直後にすぐブラウザを閉じると、閉じる直前のconfigが保存されないケースがある。余裕があれば直したい（閉じるときに強制保存orダイアログを出すなど）。
        await setRoomConfig(throttledRoomConfig);
    }, [throttledRoomConfig]);
};

// _app.tsxで1回のみ呼ばれることを想定。firebase authのデータを取得したい場合はContextで行う。
const useFirebaseUser = (): FirebaseUserState => {
    const config = React.useContext(ConfigContext);
    const auth = getAuth(config);
    const [user, setUser] = React.useState<FirebaseUserState>(loading);
    React.useEffect(() => {
        if (auth == null) {
            setUser(authNotFound);
            return;
        }
        const unsubscribe = auth.onIdTokenChanged(user => {
            setUser(user == null ? notSignIn : user);
        });
        return () => {
            unsubscribe();
            setUser(loading);
        };
    }, [auth]);
    return user;
};

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
    const [, setRoomNotification] = useAtom(addRoomNotificationAtom);

    const httpUri = urljoin(getHttpUri(config), 'graphql');
    const wsUri = urljoin(getWsUri(config), 'graphql');
    React.useEffect(() => {
        appConsole.log(`GraphQL HTTP URL: ${httpUri}`);
    }, [httpUri]);
    React.useEffect(() => {
        appConsole.log(`GraphQL WebSocket URL: ${wsUri}`);
    }, [wsUri]);

    const user = useFirebaseUser();
    const myUserUid = useMyUserUid(user);

    useUserConfig(myUserUid ?? null);
    useAutoSaveRoomConfig();
    useAutoSaveUserConfig();

    const getIdToken = React.useMemo(() => {
        if (typeof user === 'string') {
            return null;
        }
        return async () => {
            return await user.getIdToken().catch(err => {
                console.error('failed at getIdToken', err);
                setRoomNotification({
                    type: Notification.text,
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
    const [apolloClient, setApolloClient] = React.useState<ReturnType<typeof createApolloClient>>();
    // useStateの引数に(() => T)を渡すとTに変換されてしまうため、useState(getIdToken) とすると正常に動かない。useState(() => getIdToken)でも駄目だった。そのため、Refを用いている。
    const [getIdTokenState, setGetIdTokenState] = React.useState<Ref<typeof getIdToken>>({
        value: getIdToken,
    });
    React.useEffect(() => {
        setApolloClient(createApolloClient(httpUri, wsUri, getIdToken));
        setGetIdTokenState({ value: getIdToken });
    }, [httpUri, wsUri, getIdToken]);
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

    if (authNotFoundState) {
        return (
            <div style={{ padding: 5 }}>
                {
                    '予期しないエラーが発生しました: authNotFound / An unexpected error occured: authNotFound'
                }
            </div>
        );
    }
    if (apolloClient == null) {
        return <div style={{ padding: 5 }}>{'しばらくお待ち下さい… / Please wait…'}</div>;
    }
    return (
        <>
            <Head>
                <link rel='shortcut icon' href='/logo.png' />
            </Head>
            <AllContextProvider
                clientId={clientId}
                apolloClient={apolloClient}
                store={store}
                user={user}
                firebaseStorageUrlCache={firebaseStorageUrlCache}
                getIdToken={
                    // getIdTokenを直接渡すのではなくわざわざuseStateを用いて渡している理由:
                    // もし直接渡すと、「getIdTokenの値が変わる」の後に少し間をおいて「ApolloClientの値が変わる」ため、「getIdToken!=null ⇔ ApolloClientが認証済み」と判断しているコードにおいて、getIdTokenがnullからnon-nullに切り替わった瞬間の時点で認証されていないApolloClientが使われて、Access Denied!などのエラーが発生してしまうため。
                    getIdTokenState.value
                }
            >
                <Component {...pageProps} />
            </AllContextProvider>
        </>
    );
};

export default App;
