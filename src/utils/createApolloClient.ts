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
import { print, GraphQLError } from 'graphql';
import { authToken } from '@kizahasi/util';
import { onError } from '@apollo/client/link/error';

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

export const createApolloClient = (httpUri: string, wsUri: string, userIdToken: string | null) => {
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

    const httpLink = new HttpLink({
        uri: httpUri,
    });

    const link: ApolloLink = (() => {
        const wsLink = new WebSocketLink({
            url: wsUri,
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
    });

    return new ApolloClient({
        link: from([errorLink, link]),
        cache: new InMemoryCache(),
    });
};
