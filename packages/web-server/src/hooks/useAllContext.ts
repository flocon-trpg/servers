import { useApolloClient } from '@apollo/client';
import React from 'react';
import { Props } from '../components/AllContextProvider';
import { ClientIdContext } from '../contexts/ClientIdContext';
import { FirebaseAuthenticationIdTokenContext } from '../contexts/FirebaseAuthenticationIdTokenContext';
import { FirebaseStorageUrlCacheContext } from '../contexts/FirebaseStorageUrlCacheContext';
import { MyAuthContext } from '../contexts/MyAuthContext';

// AllContextProviderと合わせて使うためのhook
export const useAllContext = (): Props => {
    const clientId = React.useContext(ClientIdContext);
    const apolloClient = useApolloClient();
    const user = React.useContext(MyAuthContext);
    const firebaseStorageUrlCache = React.useContext(FirebaseStorageUrlCacheContext);
    const getIdToken = React.useContext(FirebaseAuthenticationIdTokenContext);

    return {
        clientId,
        apolloClient,
        user,
        firebaseStorageUrlCache,
        getIdToken,
    };
};
