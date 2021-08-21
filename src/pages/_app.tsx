import 'firebaseui/dist/firebaseui.css';
import '../css/antd.css';
import '../css/main.scss';

import React from 'react';
import { AppProps } from 'next/app';
import {
    ApolloClient,
    ApolloLink,
    ApolloProvider,
    FetchResult,
    HttpLink,
    InMemoryCache,
    NormalizedCacheObject,
    Operation,
    split,
    Observable,
    from,
} from '@apollo/client';
import 'firebase/auth';
import 'firebase/storage';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { Provider } from 'react-redux';
import useConstant from 'use-constant';
import MyAuthContext from '../contexts/MyAuthContext';
import store from '../store';
import { appConsole } from '../utils/appConsole';
import firebase from 'firebase/app';
import { useFirebaseUser } from '../hooks/useFirebaseUser';
import useUserConfig from '../hooks/localStorage/useUserConfig';
import { Config, getConfig, getHttpUri, getWsUri } from '../config';
import { Client, ClientOptions, createClient } from 'graphql-ws';
import { print, GraphQLError } from 'graphql';
import { simpleId } from '../utils/generators';
import ClientIdContext from '../contexts/ClientIdContext';
import { enableMapSet } from 'immer';
import { authToken } from '@kizahasi/util';
import Head from 'next/head';
import { useMonaco, loader } from '@monaco-editor/react';
import { ExpiryMap } from '../utils/expiryMap';
import { FirebaseStorageUrlCacheContext } from '../contexts/FirebaseStorageUrlCacheContext';
import urljoin from 'url-join';
import { onError } from '@apollo/client/link/error';

enableMapSet();

const config = getConfig();

// https://github.com/enisdenjo/graphql-ws のコードを使用
class WebSocketLink extends ApolloLink {
    private client: Client;

    constructor(options: ClientOptions) {
        super();
        this.client = createClient(options);
    }

    public request(operation: Operation): Observable<FetchResult> {
        return new Observable(sink => {
            return this.client.subscribe<FetchResult>(
                { ...operation, query: print(operation.query) },
                {
                    next: sink.next.bind(sink),
                    complete: sink.complete.bind(sink),
                    error: err => {
                        if (err instanceof Error) {
                            return sink.error(err);
                        }

                        if (err instanceof CloseEvent) {
                            return sink.error(
                                // reason will be available on clean closes
                                new Error(
                                    `Socket closed with event ${err.code} ${err.reason || ''}`
                                )
                            );
                        }

                        return sink.error(
                            new Error(
                                (err as GraphQLError[]).map(({ message }) => message).join(', ')
                            )
                        );
                    },
                }
            );
        });
    }
}

// サーバーでWebSocket（GraphQL subscriptionsで使っている）を呼び出そうとすると"Error: Unable to find native implementation, or alternative implementation for WebSocket!"というエラーが出るので、サーバー側で呼び出されるときはomitWebSocket===trueにすることでそれを回避できる。
const createApolloClient = (
    config: Config,
    signedInAs?: firebase.User,
    omitWebSocket?: boolean
) => {
    // headerについては https://hasura.io/blog/authentication-and-authorization-using-hasura-and-firebase/ を参考にした

    // https://www.apollographql.com/docs/react/networking/authentication/#header
    const authLink = setContext(async (_, { headers }) => {
        const token = await signedInAs?.getIdToken();
        if (token === undefined) {
            return headers;
        }
        // return the headers to the context so httpLink can read them
        return {
            headers: {
                ...headers,
                authorization: `Bearer ${token}`,
            },
        };
    });

    // https://www.apollographql.com/docs/react/data/subscriptions/
    const uri = urljoin(getHttpUri(config), 'graphql');
    appConsole.log(`GraphQL HTTP URL: ${uri}`);
    const httpLink = new HttpLink({
        uri,
    });

    const link: ApolloLink = (() => {
        if (omitWebSocket === true) {
            return httpLink;
        }
        const uri = urljoin(getWsUri(config), 'graphql');
        appConsole.log(`GraphQL WebSocket URL: ${uri}`);
        const wsLink = new WebSocketLink({
            url: uri,
            connectionParams: async () => {
                const token = await signedInAs?.getIdToken();
                if (token == null) {
                    return {};
                }
                return {
                    [authToken]: token,
                };
            },
        });
        // The split function takes three parameters:
        //
        // * A function that's called for each operation to execute
        // * The Link to use for an operation if the function returns a "truthy" value
        // * The Link to use for an operation if the function returns a "falsy" value
        return split(
            ({ query }) => {
                const definition = getMainDefinition(query);
                return (
                    definition.kind === 'OperationDefinition' &&
                    definition.operation === 'subscription'
                );
            },
            wsLink,
            authLink.concat(httpLink) // WebSocketLinkのほうはheaderを設定済みなので、httpLinkのほうにだけheaderを設定している
        );
    })();

    const errorLink = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
            graphQLErrors.map(({ message, locations, path }) =>
                console.log(
                    `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
                )
            );
        }
        if (networkError) {
            console.log(`[Network error]: ${networkError}`);
        }
    });

    return new ApolloClient({
        link: from([errorLink, link]),
        cache: new InMemoryCache(),
    });
};

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
    const user = useFirebaseUser();
    const [apolloClient, setApolloClient] = React.useState<ApolloClient<NormalizedCacheObject>>();
    React.useEffect(() => {
        const client = createApolloClient(config, typeof user === 'string' ? undefined : user);
        setApolloClient(client);
    }, [user]);
    useUserConfig(typeof user === 'string' ? null : user.uid, store.dispatch);

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
        const libSource = `
declare type Index5 = 1 | 2 | 3 | 4 | 5;

declare type Index20 =
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20;

declare type Bgm = {
    /**
     * 再生しているかどうかを表す値の取得、もしくは変更を行います。trueならば再生を、falseならば停止を表します。
     */
    isPlaying: boolean;

    /**
     * ボリュームを表す値の取得、もしくは変更を行います。通常は、0～100の数値を指定します。
     */
    volume: number;

    /**
     * 再生する音楽ファイルを表す値の取得、もしくは変更を行います。
     */
    files: FilePath[];
};

declare type Bgms = {
    new (): Bgms;

    /**
     * key番目のBGMを返します。例えばkeyに3を渡した場合は、BGM3を返します。該当するBGMオブジェクトが存在しない場合はundefinedを返します。
     * @param key - 1から5の整数である数値
     */
    find(key: Index5): Bgm | undefined;

    /**
     * key番目のBGMを返します。例えばkeyに3を渡した場合は、BGM3を返します。該当するBGMオブジェクトが存在しない場合は作成してから返します。
     * @param key - 1から5の整数である数値
     */
    ensure(key: Index5): Bgm;

    /**
     * key番目のBGMがもし存在するならば削除します。
     * @param key - 1から5の整数である数値
     */
    delete(key: Index5): boolean;
};

declare type BooleanParameter = {
    new (): BooleanParameter;

    /**
     * 値が非公開かどうかを表す値の取得、もしくは変更を行います。trueならば非公開、falseならば公開を表します。
     */
    isValueSecret: boolean;

    /**
     * 値の取得、もしくは変更を行います。
     */
    value: boolean | undefined;
};

declare type BooleanParameters = {
    new (): BooleanParameters;

    /**
     * パラメーター名がparamNameと一致する最初のパラメーターを探して、それを返します。見つからなかった場合はundefinedを返します。
     */
    find(paramName: string): BooleanParameter | undefined;
    /**
     * key番目のパラメーターを返します。例えばkeyに3を渡した場合は、チェックマークパラメーター3を返します。
     */
    find(key: Index20): BooleanParameter;

    /**
     * パラメーター名がparamNameと一致する最初のチェックマークパラメーターを探して、もし見つかった場合はその値を反転します。
     */
    toggleValue(paramName: string): void;
    /**
     * key番目のチェックマークパラメーターの値を反転します。
     */
    toggleValue(key: Index20): void;

    /**
     * パラメーター名がparamNameと一致する最初のチェックマークパラメーターを探して、もし見つかった場合はその値をnewValueに置き換えます。
     */
    setValue(paramName: string, newValue: boolean): void;
    /**
     * key番目のチェックマークパラメーターの値をnewValueに置き換えます。
     */
    setValue(key: Index20, newValue: boolean): void;

    /**
     * パラメーター名がparamNameと一致する最初のチェックマークパラメーターを探して、もし見つかった場合はその値の非公開状態をnewValueに置き換えます。
     */
    setIsValueSecret(paramName: string, newValue: boolean): void;
    /**
     * key番目のチェックマークパラメーターの非公開状態をnewValueに置き換えます。
     */
    setIsValueSecret(key: Index20, newValue: boolean): void;
};

declare type NumberParameter = {
    new (): NumberParameter;

    /**
     * 値が非公開かどうかを表す値の取得、もしくは変更を行います。trueならば非公開、falseならば公開を表します。
     */
    isValueSecret: boolean;

    /**
     * 値の取得、もしくは変更を行います。
     */
    value: number | undefined;
};

declare type NumberParameters = {
    new (): NumberParameters;

    /**
     * パラメーター名がparamNameと一致する最初の数値パラメーターを探して、それを返します。見つからなかった場合はundefinedを返します。
     */
    find(paramName: string): NumberParameter | undefined;
    /**
     * key番目の数値パラメーターを返します。例えばkeyに3を渡した場合は、数値パラメーター3を返します。
     */
    find(key: Index20): NumberParameter;

    /**
     * パラメーター名がparamNameと一致する最初の数値パラメーターを探して、もし見つかった場合はその値にincrementByの値を足します。
     */
    incrementValue(paramName: string, incrementBy: number): void;
    /**
     * key番目の数値パラメーターの値にincrementByの値を足します。
     */
    incrementValue(key: Index20, incrementBy: number): void;

    /**
     * パラメーター名がparamNameと一致する最初の数値パラメーターを探して、もし見つかった場合はその値からdecrementByの値を引きます。
     */
    decrementValue(paramName: string, decrementBy: number): void;
    /**
     * key番目の数値パラメーターの値からdecrementByの値を足します。
     */
    decrementValue(key: Index20, decrementBy: number): void;

    /**
     * パラメーター名がparamNameと一致する最初の数値パラメーターを探して、もし見つかった場合はその値をnewValueに置き換えます。
     */
    setValue(paramName: string, newValue: number): void;
    /**
     * key番目の数値パラメーターの値をnewValueに置き換えます。
     */
    setValue(key: Index20, newValue: number): void;

    /**
     * パラメーター名がparamNameと一致する最初の数値パラメーターを探して、もし見つかった場合はその値の非公開状態をnewValueに置き換えます。
     */
    setIsValueSecret(paramName: string, newValue: boolean): void;
    /**
     * key番目の数値パラメーターの非公開状態をnewValueに置き換えます。
     */
    setIsValueSecret(key: Index20, newValue: boolean): void;
};

declare type StringParameter = {
    new (): StringParameter;

    /**
     * 値が非公開かどうかを表す値の取得、もしくは変更を行います。trueならば非公開、falseならば公開を表します。
     */
    isValueSecret: boolean;

    /**
     * 値の取得、もしくは変更を行います。
     */
    value: string;
};

declare type StringParameters = {
    new (): StringParameters;

    /**
     * パラメーター名がparamNameと一致する最初の文字列パラメーターを探して、それを返します。見つからなかった場合はundefinedを返します。
     */
    find(paramName: string): StringParameter | undefined;
    /**
     * key番目の文字列パラメーターを返します。例えばkeyに3を渡した場合は、文字列パラメーター3を返します。
     */
    find(key: Index20): StringParameter;

    /**
     * パラメーター名がparamNameと一致する最初の文字列パラメーターを探して、もし見つかった場合はその値をnewValueに置き換えます。
     */
    setValue(paramName: string, newValue: string): void;
    /**
     * key番目の文字列パラメーターの値をnewValueに置き換えます。
     */
    setValue(key: Index20, newValue: string): void;

    /**
     * パラメーター名がparamNameと一致する最初の文字列パラメーターを探して、もし見つかった場合はその値の非公開状態をnewValueに置き換えます。
     */
    setIsValueSecret(paramName: string, newValue: boolean): void;
    /**
     * key番目の文字列パラメーターの非公開状態をnewValueに置き換えます。
     */
    setIsValueSecret(key: Index20, newValue: boolean): void;
};

declare type Character = {
    new (): Character;

    /**
     * アイコン画像のパスの取得、もしくは変更を行います。
     */
    icon: FilePath | null;

    /**
     * 立ち絵画像のパスの取得、もしくは変更を行います。
     */
    portrait: FilePath | null;

    /**
     * キャラクターの名前の取得、もしくは変更を行います。
     */
    name: string;

    /**
     * チェックマークパラメーター。
     */
    get booleanParameters(): BooleanParameters;

    /**
     * 数値パラメーター(現在値)。
     */
    get numberParameters(): NumberParameters;

    /**
     * 数値パラメーター(最大値)。
     */
    get maxNumberParameters(): NumberParameters;

    /**
     * 文字列パラメーター。
     */
    get stringParameters(): StringParameters;
};

declare type ParameterNames = {
    new (): ParameterNames;

    /**
     * パラメーター名を取得します。該当するパラメーター名が存在しない場合は、undefinedを返します。
     * @param key - 1から20の整数である数値
     */
    getName(key: Index20): string | undefined;

    /**
     * パラメーター名を変更します。該当するパラメーター名が存在しない場合は、パラメーターが自動的に作成されます。
     * @param key - 1から20の整数である数値
     */
    setName(key: Index20, newName: string): void;

    /**
     * パラメーターを削除します。該当するパラメーター名が存在した場合はtrueを、そうでなければfalseを返します。
     * @param key - 1から20の整数である数値
     */
    delete(key: Index20): boolean;
};

declare type FilePath = {
    /**
     * sourceType に Default を指定した場合は、例えば https://example.com/image.png のようにファイルへのリンクを指定してください。sourceType に FirebaseStorage を指定した場合は、/version/1/uploader/unlisted/<ユーザーID>/<ファイル名> のような文字列を指定してください。
     */
    path: string;

    /**
     * ファイルパスの種類を表します。例えば https://example.com/image.png のような通常のリンクを表す場合は Default という文字列を指定して下さい。Firebase Storage上のファイルを表す場合は FirebaseStorage という文字列を指定して下さい。
     */
    sourceType: 'Default' | 'FirebaseStorage';
};

declare type Room = {
    new (): Character;

    /**
     * 部屋名の取得、もしくは変更を行います。
     */
    name: string;

    /**
     * チェックマークパラメーターの名前。
     */
    get booleanParameterNames(): ParameterNames;

    /**
     * 数値パラメーターの名前。
     */
    get numberParameterNames(): ParameterNames;

    /**
     * 文字列パラメーターの名前。
     */
    get stringParameterNames(): ParameterNames;
};


declare var room: Room;
declare var character: Character;
        `;
        monaco.languages.typescript.typescriptDefaults.addExtraLib(libSource);
    }, [monaco]);

    if (apolloClient == null) {
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
                                <Component {...pageProps} />
                            </FirebaseStorageUrlCacheContext.Provider>
                        </MyAuthContext.Provider>
                    </Provider>
                </ApolloProvider>
            </ClientIdContext.Provider>
        </>
    );
};

export default App;
