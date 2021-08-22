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
import { useAsync } from 'react-use';
import { monacoLibSource } from '../utils/libSource';
import { ApolloClientHasAuthorizationHeaderContext } from '../contexts/ApolloClientHasAuthorizationHeaderContext';

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
    userIdToken: string | null,
    omitWebSocket?: boolean
) => {
    // headerについては https://hasura.io/blog/authentication-and-authorization-using-hasura-and-firebase/ を参考にした

    // https://www.apollographql.com/docs/react/networking/authentication/#header
    const authLink = setContext(async (_, { headers }) => {
        if (userIdToken == null) {
            return { headers };
        }

        // return the headers to the context so httpLink can read them
        return {
            headers: {
                ...headers,
                authorization: `Bearer ${userIdToken}`,
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
                if (userIdToken == null) {
                    return {};
                }
                return {
                    [authToken]: userIdToken,
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
                    `[GraphQL error]: Message: ${message}, Location: %O, Path: %O`,
                    locations,
                    path
                )
            );
        }
        if (networkError) {
            console.log(`[Network error]: %O`, networkError);
        }
    });

    return new ApolloClient({
        link: from([errorLink, link]),
        cache: new InMemoryCache(),
    });
};

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
    const user = useFirebaseUser();
    const apolloClientAndIdToken = useAsync(async () => {
        if (typeof user === 'string') {
            return { apolloClient: createApolloClient(config, null), idToken: null };
        }
        const idToken = await user.getIdToken();
        return { apolloClient: createApolloClient(config, idToken), idToken };
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

        monaco.languages.typescript.typescriptDefaults.addExtraLib(monacoLibSource);
    }, [monaco]);

    if (apolloClientAndIdToken.value == null) {
        return <div style={{ padding: 5 }}>{'しばらくお待ち下さい… / Please wait…'}</div>;
    }
    return (
        <>
            <Head>
                <link rel="shortcut icon" href="/logo.png" />
            </Head>
            <ClientIdContext.Provider value={clientId}>
                <ApolloProvider client={apolloClientAndIdToken.value.apolloClient}>
                    <Provider store={store}>
                        <MyAuthContext.Provider value={user}>
                            <FirebaseStorageUrlCacheContext.Provider
                                value={firebaseStorageUrlCache}
                            >
                                <ApolloClientHasAuthorizationHeaderContext.Provider
                                    value={apolloClientAndIdToken.value.idToken != null}
                                >
                                    <Component {...pageProps} />
                                </ApolloClientHasAuthorizationHeaderContext.Provider>
                            </FirebaseStorageUrlCacheContext.Provider>
                        </MyAuthContext.Provider>
                    </Provider>
                </ApolloProvider>
            </ClientIdContext.Provider>
        </>
    );
};

export default App;
