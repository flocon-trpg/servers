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
import { useMonaco, loader } from '@monaco-editor/react';
import { ExpiryMap } from '../utils/expiryMap';
import urljoin from 'url-join';
import { monacoLibSource } from '../utils/libSource';
import { createApolloClient } from '../utils/createApolloClient';
import { Dispatch } from '@reduxjs/toolkit';
import { getUserConfig } from '../utils/localStorage/userConfig';
import { userConfigModule } from '../modules/userConfigModule';
import { getAuth } from '../utils/firebaseHelpers';
import { ConfigContext } from '../contexts/ConfigContext';
import { useMyUserUid } from '../hooks/useMyUserUid';
import { AllContextProvider } from '../components/AllContextProvider';
import { simpleId } from '@kizahasi/flocon-core';

enableMapSet();

const config = getConfig();

// idTokenの値が変わらない場合はuseEffectをトリガーさせたくないため、トリガー回避が簡単にできるように、idTokenが取得できた場合はstringとして返している
type IdTokenState = string | { type: typeof loading | typeof notSignIn | typeof authNotFound };

// getIdTokenを複数箇所で呼び出すとidTokenの新旧が混在する可能性がある（要調査）ので、念のため_appのみで呼び出すようにしている
const useIdToken = (user: FirebaseUserState): IdTokenState => {
    const [result, setResult] = React.useState<IdTokenState>({ type: loading });
    React.useEffect(() => {
        switch (user) {
            case loading:
                console.info('useIdToken loading');
                // ユーザーが変わったとき、新しいidTokenを入手するまでは前のidTokenを保持するようにしている。
                // こうすることで、一時的にidTokenがundefinedになるせいでApolloClientが一時的にidTokenなしモードに切り替わることを防ぐ狙いがある。
                return;
            case notSignIn:
            case authNotFound:
                console.info('useIdToken ' + user);
                setResult({ type: user });
                return;
            default: {
                console.info('useIdToken userRef');
                user.value.getIdToken().then(idToken => {
                    // ユーザーが変わったとき、新しいidTokenを入手するまでは前のidTokenを保持するようにしている。
                    // こうすることで、一時的にidTokenがundefinedになるせいでApolloClientが一時的にidTokenなしモードに切り替わることを防ぐ狙いがある。
                    console.info('useIdToken set idToken');
                    setResult(idToken);
                });
                return;
            }
        }
    }, [user]);
    return result;
};

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
            console.info('auth changed (null)');
            setUser(authNotFound);
            return;
        }
        console.info('authChange(non-null)');
        const unsubscribe = auth.onIdTokenChanged(user => {
            console.info('onIdTokenChanged');
            // onIdTokenChangedが実行されるたびにgetIdTokenの結果は変わるが、userの参照は以前と同じである。そのため、depsに直接Userを入れると以前のものと等しいためidTokenの更新処理がされなくなってしまう。そのため、代わりにRef<User>としている。getIdTokenを実行するhookのdepsには、UserではなくRef<User>を書くことを忘れずに。
            setUser(user == null ? notSignIn : { value: user });
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
    const myUserUid = useMyUserUid(user);
    useUserConfig(myUserUid ?? null, store.dispatch);

    const idToken = useIdToken(user);
    const [apolloClient, setApolloClient] = React.useState<ReturnType<typeof createApolloClient>>();
    const [authNotFoundState, setAuthNotFoundState] = React.useState(false);
    React.useEffect(() => {
        if (typeof idToken === 'string') {
            setApolloClient(createApolloClient(httpUri, wsUri, idToken));
            setAuthNotFoundState(false);
            return;
        }
        switch (idToken.type) {
            case notSignIn:
                setApolloClient(createApolloClient(httpUri, wsUri, null));
                setAuthNotFoundState(false);
                break;
            case authNotFound:
                setApolloClient(undefined);
                setAuthNotFoundState(true);
                break;
            default:
                setApolloClient(undefined);
                setAuthNotFoundState(false);
                break;
        }
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
                idToken={typeof idToken === 'string' ? idToken : null}
            >
                <Component {...pageProps} />
            </AllContextProvider>
        </>
    );
};

export default App;
