import 'isomorphic-fetch'; // node.jsでは、これがないと@apollo/clientでエラーが出る
import ws from 'isomorphic-ws';
import {
    ApolloClient,
    ApolloLink,
    FetchResult,
    HttpLink,
    InMemoryCache,
    Operation,
    split,
    Observable,
    from,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { Client, ClientOptions, createClient } from 'graphql-ws';
import { print } from 'graphql';
import { onError } from '@apollo/client/link/error';
import { Resources } from './resources';

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
                        return sink.error(err);
                    },
                }
            );
        });
    }
}

export const createApolloClient = (
    httpUri: string,
    wsUri: string,
    testAuthorizationHeaderValue: string | undefined
) => {
    const authLink = setContext(async (_, { headers }) => {
        return {
            headers: {
                ...headers,
                [Resources.testAuthorizationHeader]: testAuthorizationHeaderValue,
            },
        };
    });

    const httpLink = new HttpLink({
        uri: httpUri,
    });

    const link: ApolloLink = (() => {
        const wsLink = new WebSocketLink({
            url: wsUri,
            connectionParams: async () => {
                return { [Resources.testAuthorizationHeader]: testAuthorizationHeaderValue };
            },
            webSocketImpl: ws, // node.jsでは、webSocketImplがないと@apollo/clientでエラーが出る
        });
        return split(
            ({ query }) => {
                const definition = getMainDefinition(query);
                return (
                    definition.kind === 'OperationDefinition' &&
                    definition.operation === 'subscription'
                );
            },
            wsLink,
            authLink.concat(httpLink)
        );
    })();

    const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
        if (graphQLErrors) {
            graphQLErrors.map(({ message, locations, path }) =>
                console.error(
                    `[GraphQL error]: Message: ${message}, Location: %O, Path: %O`,
                    locations,
                    path
                )
            );
        }
        if (networkError) {
            console.error(`[Network error]: %O`, networkError);
        }
        console.error(
            'operation name: %s, variable: %o',
            operation.operationName,
            operation.variables
        );
    });

    return new ApolloClient({
        link: from([errorLink, link]),
        cache: new InMemoryCache(),
    });
};
