import { ApolloClient, ApolloProvider } from '@apollo/client';
import React, { PropsWithChildren } from 'react';
import { ClientIdContext } from '../../contexts/ClientIdContext';
import { FirebaseAuthenticationIdTokenContext } from '../../contexts/FirebaseAuthenticationIdTokenContext';
import { FirebaseStorageUrlCacheContext } from '../../contexts/FirebaseStorageUrlCacheContext';
import { FirebaseUserState, MyAuthContext } from '../../contexts/MyAuthContext';
import { ExpiryMap } from '../../utils/file/expiryMap';

export type Props = {
    clientId: string | null;
    apolloClient: ApolloClient<unknown>;
    user: FirebaseUserState;
    firebaseStorageUrlCache: ExpiryMap<string, string> | null;
    getIdToken: (() => Promise<string | null>) | null;
};

export const AllContextProvider: React.FC<PropsWithChildren<Props>> = ({
    clientId,
    apolloClient,
    user,
    firebaseStorageUrlCache,
    getIdToken,
    children,
}: PropsWithChildren<Props>) => {
    return (
        <ClientIdContext.Provider value={clientId}>
            <ApolloProvider client={apolloClient}>
                <MyAuthContext.Provider value={user}>
                    <FirebaseStorageUrlCacheContext.Provider value={firebaseStorageUrlCache}>
                        <FirebaseAuthenticationIdTokenContext.Provider value={getIdToken}>
                            {children}
                        </FirebaseAuthenticationIdTokenContext.Provider>
                    </FirebaseStorageUrlCacheContext.Provider>
                </MyAuthContext.Provider>
            </ApolloProvider>
        </ClientIdContext.Provider>
    );
};
