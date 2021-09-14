import 'firebaseui/dist/firebaseui.css';
import '../css/antd.css';
import '../css/main.scss';

import 'firebase/auth';
import 'firebase/storage';

import React from 'react';
import { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import 'firebase/auth';
import 'firebase/storage';
import { Provider } from 'react-redux';
import useConstant from 'use-constant';
import { authNotFound, FirebaseUserState, loading, MyAuthContext, notSignIn } from '../contexts/MyAuthContext';
import store from '../store';
import { appConsole } from '../utils/appConsole';
import { getConfig, getHttpUri, getWsUri } from '../config';
import { simpleId } from '../utils/generators';
import ClientIdContext from '../contexts/ClientIdContext';
import { enableMapSet } from 'immer';
import Head from 'next/head';
import { useMonaco, loader } from '@monaco-editor/react';
import { ExpiryMap } from '../utils/expiryMap';
import { FirebaseStorageUrlCacheContext } from '../contexts/FirebaseStorageUrlCacheContext';
import urljoin from 'url-join';
import { monacoLibSource } from '../utils/libSource';
import { FirebaseAuthenticationIdTokenContext } from '../contexts/FirebaseAuthenticationIdTokenContext';
import { createApolloClient } from '../utils/createApolloClient';
import { Dispatch } from '@reduxjs/toolkit';
import { getUserConfig } from '../utils/localStorage/userConfig';
import userConfigModule from '../modules/userConfigModule';
import { getAuth } from '../utils/firebaseHelpers';
import ConfigContext from '../contexts/ConfigContext';

enableMapSet();

const config = getConfig();

// getIdTokenを複数箇所で呼び出すとidTokenの新旧が混在する可能性がある（要調査）ので、念のため_appのみで呼び出すようにしている
const useIdToken = () => {
   const user = useFirebaseUser();
    const [result, setResult] = React.useState<string>();
    React.useEffect(() => {
        console.log('user is updated: %o', user);
        if (typeof user === 'string') {
            setResult(undefined);
            return;
        }
        user.getIdToken().then(idToken => {
            console.log('idToken is updated');
            // ユーザーが変わったとき、新しいidTokenを入手するまでは前のidTokenを保持するようにしている。
            // こうすることで、一時的にidTokenがundefinedになるせいでApolloClientが一時的にidTokenなしモードに切り替わることを防ぐ狙いがある。
            setResult(idToken);
        });
    }, [user]);
    return result;
}

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
    const httpUri = urljoin(getHttpUri(config), 'graphql');
    const wsUri = urljoin(getWsUri(config), 'graphql');
    React.useEffect(() => {
        appConsole.log(`GraphQL HTTP URL: ${httpUri}`);
    }, [httpUri]);
    React.useEffect(() => {
        appConsole.log(`GraphQL WebSocket URL: ${wsUri}`);
    }, [wsUri]);

    const user = useFirebaseUser();
    useUserConfig(typeof user === 'string' ? null : user.uid, store.dispatch);

    const idToken = useIdToken();
    const [apolloClient, setApolloClient] = React.useState<ReturnType<typeof createApolloClient>>();
    React.useEffect(() => {
        setApolloClient(createApolloClient(httpUri, wsUri, idToken ?? null));
    }, [httpUri, wsUri, idToken]);

    const clientId = useConstant(() => simpleId());
    React.useEffect(() => {
        appConsole.log(`clientId: ${clientId}`);
    }, [clientId]);

    const firebaseStorageUrlCache = useConstant(() => new ExpiryMap<string, string>());

    React.useEffect(() => {
        // monaco editorのコンテキストメニューなどを日本語にしている。
        loader.config({ 'vs/nls': { availableLanguages: { '*': 'ja' } } });
    }, []);
    const monaco = useMonaco();
    React.useEffect(() => {
        if (monaco == null) {
            return;
        }
        const opts = monaco.languages.typescript.typescriptDefaults.getCompilerOptions();
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            ...opts,
            noLib: true,
            allowTsExtensions: true,
        });

        monaco.languages.typescript.typescriptDefaults.addExtraLib(monacoLibSource);
    }, [monaco]);

    if (idToken == null || apolloClient == null) {
        return <div style={{ padding: 5 }}>{'しばらくお待ち下さい… / Please wait…'}</div>;
    }
    return (
        <>
            <Head>
                <link rel="shortcut icon" href="/logo.png" />
            </Head>
            <ClientIdContext.Provider value={clientId}>
                <ApolloProvider client={apolloClient}>
                    <Provider store={store}>
                        <MyAuthContext.Provider value={user}>
                            <FirebaseStorageUrlCacheContext.Provider
                                value={firebaseStorageUrlCache}
                            >
                                <FirebaseAuthenticationIdTokenContext.Provider value={idToken}>
                                    <Component {...pageProps} />
                                </FirebaseAuthenticationIdTokenContext.Provider>
                            </FirebaseStorageUrlCacheContext.Provider>
                        </MyAuthContext.Provider>
                    </Provider>
                </ApolloProvider>
            </ClientIdContext.Provider>
        </>
    );
};

export default App;
