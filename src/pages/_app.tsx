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
import { Dispatch } from '@reduxjs/toolkit';
import { getUserConfig } from '../utils/localStorage/userConfig';
import { userConfigModule } from '../modules/userConfigModule';
import { getAuth } from '../utils/firebaseHelpers';
import { ConfigContext } from '../contexts/ConfigContext';
import { useMyUserUid } from '../hooks/useMyUserUid';
import { AllContextProvider } from '../components/AllContextProvider';
import { simpleId } from '@kizahasi/flocon-core';
import { Notification, roomModule } from '../modules/roomModule';
import { useLatest } from 'react-use';

enableMapSet();

const config = getConfig();

// localForageを用いてRoomConfigを読み込み、ReduxのStateと紐付ける。
// Userが変わるたびに、useUserConfigが更新される必要がある。_app.tsxなどどこか一箇所でuseUserConfigを呼び出すだけでよい。
// _app.tsxではProviderの範囲外なのでuseDispatchが使えないため、引数として受け取る形にしている。
const useUserConfig = (userUid: string | null, dispatch: Dispatch<any>): void => {
    React.useEffect(() => {
        let unmounted = false;
        const main = async () => {
            dispatch(userConfigModule.actions.reset(null));
            if (userUid == null) {
                return;
            }
            const userConfig = await getUserConfig(userUid);
            if (unmounted) {
                return;
            }
            dispatch(userConfigModule.actions.reset(userConfig));
        };
        main();
        return () => {
            unmounted = true;
        };
    }, [userUid, dispatch]);
};

// _app.tsxで1回のみ呼ばれることを想定。firebase authのデータを取得したい場合はContextで行う。
const useFirebaseUser = (): FirebaseUserState => {
    const config = React.useContext(ConfigContext);
    const auth = getAuth(config);
    const [user, setUser] = React.useState<FirebaseUserState>(loading);
    React.useEffect(() => {
        if (auth == null) {
            console.info('[調査用ログ] auth changed (null)');
            setUser(authNotFound);
            return;
        }
        console.info('[調査用ログ] authChange(non-null)');
        const unsubscribe = auth.onIdTokenChanged(user => {
            console.info('[調査用ログ] onIdTokenChanged');
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
    const httpUri = urljoin(getHttpUri(config), 'graphql');
    const wsUri = urljoin(getWsUri(config), 'graphql');
    React.useEffect(() => {
        appConsole.log(`GraphQL HTTP URL: ${httpUri}`);
    }, [httpUri]);
    React.useEffect(() => {
        appConsole.log(`GraphQL WebSocket URL: ${wsUri}`);
    }, [wsUri]);

    const user = useFirebaseUser();
    const latestUser = useLatest(user);
    const myUserUid = useMyUserUid(user);
    useUserConfig(myUserUid ?? null, store.dispatch);

    const getIdToken = React.useMemo(() => {
        if (typeof latestUser.current === 'string') {
            return null;
        }
        return async () => {
            if (typeof latestUser.current === 'string') {
                return null;
            }
            return await latestUser.current.getIdToken().catch(err => {
                console.error('failed at getIdToken', err);
                store.dispatch(
                    roomModule.actions.addNotification({
                        type: Notification.text,
                        notification: {
                            type: 'error',
                            message:
                                'Firebase AuthenticationでIdTokenの取得に失敗しました。ブラウザのコンソールにエラーの内容を出力しました。',
                            createdAt: new Date().getTime(),
                        },
                    })
                );
                return null;
            });
        };
    }, [latestUser]);
    const [apolloClient, setApolloClient] = React.useState<ReturnType<typeof createApolloClient>>();
    const [authNotFoundState, setAuthNotFoundState] = React.useState(false);
    React.useEffect(() => {
        setApolloClient(createApolloClient(httpUri, wsUri, getIdToken));
        setAuthNotFoundState(getIdToken == null);
    }, [httpUri, wsUri, getIdToken]);

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
                getIdToken={getIdToken}
            >
                <Component {...pageProps} />
            </AllContextProvider>
        </>
    );
};

export default App;
