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
import MyAuthContext from '../contexts/MyAuthContext';
import store from '../store';
import { appConsole } from '../utils/appConsole';
import { useFirebaseUser } from '../hooks/useFirebaseUser';
import useUserConfig from '../hooks/localStorage/useUserConfig';
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
import { useIdToken } from '../hooks/useIdToken';

enableMapSet();

const config = getConfig();

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
