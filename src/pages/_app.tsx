import 'antd/dist/antd.css';
import '../css/main.scss';

import React from 'react';
import { AppProps } from 'next/app';
import { ApolloClient, ApolloLink, ApolloProvider, HttpLink, InMemoryCache, NormalizedCacheObject, split } from '@apollo/client';
import 'firebase/auth';
import 'firebase/storage';
import { ConnectionParams } from 'subscriptions-transport-ws';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { Provider } from 'react-redux';
import useConstant from 'use-constant';
import MyAuthContext from '../contexts/MyAuthContext';
import store from '../store';
import { appConsole } from '../utils/appConsole';
import { authToken } from '../@shared/Constants';
import firebase from 'firebase/app';
import { useFirebaseUser } from '../hooks/useFirebaseUser';
import useUserConfig from '../hooks/localStorage/useUserConfig';
import { Config, getConfig } from '../config';
import ConfigContext from '../contexts/ConfigContext';

const config = getConfig();

// サーバーでWebSocket（GraphQL subscriptionsで使っている）を呼び出そうとすると"Error: Unable to find native implementation, or alternative implementation for WebSocket!"というエラーが出るので、サーバー側で呼び出されるときはomitWebSocket===trueにすることでそれを回避できる。
const createApolloClient = (config: Config, signedInAs?: firebase.User, omitWebSocket?: boolean) => {
    // headerについては https://hasura.io/blog/authentication-and-authorization-using-hasura-and-firebase/ を参考にした

    // https://www.apollographql.com/docs/react/data/subscriptions/
    let uri: string | undefined = config.web.server.url.http;
    if (uri === undefined) {
        uri = `${location.protocol}//${location.host}/graphql`;
    }
    appConsole.log(`GraphQL HTTP URL: ${uri}`);
    const httpLink = new HttpLink({
        uri,
    });

    const createConnectionParams = async () => {
        const token = await signedInAs?.getIdToken();
        const result: ConnectionParams = {};
        result[authToken] = token ? `Bearer ${token}` : '';
        return result;
    };

    const link: ApolloLink = (() => {
        if (omitWebSocket === true) {
            return httpLink;
        }
        let uri: string | undefined = config.web.server.url.ws;
        if (uri === undefined) {
            uri = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/graphql`;
        }
        appConsole.log(`GraphQL WebSocket URL: ${uri}`);
        const wsLink = new WebSocketLink({
            uri,
            options: {
                // https://github.com/apollographql/apollo-server/issues/1597#issuecomment-442534421
                connectionParams: createConnectionParams(),

                // herokuのfree planでwssを使う（wsだと問題ない模様）と、"WebSocket connection to 'wss://xxxxxx/graphql' failed: WebSocket is closed before the connection is established."というエラーが出ることが多い（herokuやfree planが理由の1つなのかどうかは不明）。
                // https://github.com/apollographql/subscriptions-transport-ws/issues/377 をヒントに、おそらくタイムアウトが早すぎるのが原因だと考えた。そこで、下のようにタイムアウトを適当な値であるが少し長めにとってみたところ、エラーはなくなった。
                // TODO: タイムアウトに関わりそうなプロパティを手当たり次第5000という適当な値に設定しているので、必要のない設定を削除したり、5000という値を調整したほうがいい。
                timeout: 5000,
                minTimeout: 5000,
                reconnect: true,
            }
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
            httpLink,
        );
    })();

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

    return new ApolloClient({
        link: authLink.concat(link),
        cache: new InMemoryCache(),
    });
};

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
    const user = useFirebaseUser();
    const [apolloClient, setApolloClient] = React.useState<ApolloClient<NormalizedCacheObject>>();
    React.useEffect(() => {
        const client = createApolloClient(config, user ?? undefined);
        setApolloClient(client);
    }, [user]);
    useUserConfig(user?.uid ?? null, store.dispatch);

    if (apolloClient == null) {
        return (<div style={({ padding: 5 })}>
            しばらくお待ち下さい…。もし約20秒以上この画面のままの場合、どこかで問題が発生している可能性があります。 / Please wait... If you have waited for more than about 20 seconds, something might be wrong.
        </div>);
    }
    return (
        <ApolloProvider client={apolloClient}>
            <Provider store={store}>
                <MyAuthContext.Provider value={user}>
                    <Component {...pageProps} />
                </MyAuthContext.Provider>
            </Provider>
        </ApolloProvider>
    );
};

export default App;