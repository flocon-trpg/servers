import 'firebaseui/dist/firebaseui.css';
import '../css/antd.css';
import '../css/main.scss';

import React from 'react';
import { AppProps } from 'next/app';
import { ApolloClient, ApolloLink, ApolloProvider, FetchResult, HttpLink, InMemoryCache, NormalizedCacheObject, Operation, split, Observable } from '@apollo/client';
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
import { Config, getConfig } from '../config';
import { Client, ClientOptions, createClient } from 'graphql-ws';
import { print, GraphQLError } from 'graphql';
import { simpleId } from '../utils/generators';
import ClientIdContext from '../contexts/ClientIdContext';
import { enableMapSet } from 'immer';
import { authToken } from '@kizahasi/util';
import Head from 'next/head';

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
        return new Observable((sink) => {
            return this.client.subscribe<FetchResult>(
                { ...operation, query: print(operation.query) },
                {
                    next: sink.next.bind(sink),
                    complete: sink.complete.bind(sink),
                    error: (err) => {
                        if (err instanceof Error) {
                            return sink.error(err);
                        }

                        if (err instanceof CloseEvent) {
                            return sink.error(
                                // reason will be available on clean closes
                                new Error(
                                    `Socket closed with event ${err.code} ${err.reason || ''}`,
                                ),
                            );
                        }

                        return sink.error(
                            new Error(
                                (err as GraphQLError[])
                                    .map(({ message }) => message)
                                    .join(', '),
                            ),
                        );
                    },
                },
            );
        });
    }
}

// サーバーでWebSocket（GraphQL subscriptionsで使っている）を呼び出そうとすると"Error: Unable to find native implementation, or alternative implementation for WebSocket!"というエラーが出るので、サーバー側で呼び出されるときはomitWebSocket===trueにすることでそれを回避できる。
const createApolloClient = (config: Config, signedInAs?: firebase.User, omitWebSocket?: boolean) => {
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
            }
        };
    });

    // https://www.apollographql.com/docs/react/data/subscriptions/
    let uri: string | undefined = config.web.api.url.http;
    if (uri === undefined) {
        uri = `${location.protocol}//${location.host}/graphql`;
    }
    appConsole.log(`GraphQL HTTP URL: ${uri}`);
    const httpLink = new HttpLink({
        uri,
    });

    const link: ApolloLink = (() => {
        if (omitWebSocket === true) {
            return httpLink;
        }
        let uri: string | undefined = config.web.api.url.ws;
        if (uri === undefined) {
            uri = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/graphql`;
        }
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
            authLink.concat(httpLink), // WebSocketLinkのほうはheaderを設定済みなので、httpLinkのほうにだけheaderを設定している
        );
    })();

    return new ApolloClient({
        link,
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

    if (apolloClient == null) {
        return (<div style={({ padding: 5 })}>
            {'しばらくお待ち下さい… / Please wait…'}
        </div>);
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
                            <Component {...pageProps} />
                        </MyAuthContext.Provider>
                    </Provider>
                </ApolloProvider>
            </ClientIdContext.Provider>
        </>
    );
};

export default App;