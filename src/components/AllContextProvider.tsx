import { ApolloClient, ApolloProvider } from '@apollo/client';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { AnyAction, Store } from 'redux';
import { ClientIdContext } from '../contexts/ClientIdContext';
import { FirebaseAuthenticationIdTokenContext } from '../contexts/FirebaseAuthenticationIdTokenContext';
import { FirebaseStorageUrlCacheContext } from '../contexts/FirebaseStorageUrlCacheContext';
import { FirebaseUserState, MyAuthContext } from '../contexts/MyAuthContext';
import { ExpiryMap } from '../utils/expiryMap';

export type Props = {
    clientId: string | null;
    apolloClient: ApolloClient<unknown>;
    store: Store<unknown, AnyAction>;
    user: FirebaseUserState;
    firebaseStorageUrlCache: ExpiryMap<string, string> | null;
    idToken: string | null;
};

export const AllContextProvider: React.FC<PropsWithChildren<Props>> = ({
    clientId,
    apolloClient,
    store,
    user,
    firebaseStorageUrlCache,
    idToken,
    children,
}: PropsWithChildren<Props>) => {
    return (
        <ClientIdContext.Provider value={clientId}>
            <ApolloProvider client={apolloClient}>
                <Provider store={store}>
                    <MyAuthContext.Provider value={user}>
                        <FirebaseStorageUrlCacheContext.Provider value={firebaseStorageUrlCache}>
                            <FirebaseAuthenticationIdTokenContext.Provider value={idToken}>
                                {children}
                            </FirebaseAuthenticationIdTokenContext.Provider>
                        </FirebaseStorageUrlCacheContext.Provider>
                    </MyAuthContext.Provider>
                </Provider>
            </ApolloProvider>
        </ClientIdContext.Provider>
    );
};
