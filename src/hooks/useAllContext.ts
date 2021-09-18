import { useApolloClient } from '@apollo/client';
import React from 'react';
import { useStore } from 'react-redux';
import { Props } from '../components/AllContextProvider';
import ClientIdContext from '../contexts/ClientIdContext';
import { FirebaseAuthenticationIdTokenContext } from '../contexts/FirebaseAuthenticationIdTokenContext';
import { FirebaseStorageUrlCacheContext } from '../contexts/FirebaseStorageUrlCacheContext';
import { MyAuthContext } from '../contexts/MyAuthContext';

// AllContextProviderと合わせて使うためのhook
export const useAllContext = (): Props => {
    const clientId = React.useContext(ClientIdContext);
    const apolloClient = useApolloClient();
    const store = useStore();
    const user = React.useContext(MyAuthContext);
    const firebaseStorageUrlCache = React.useContext(FirebaseStorageUrlCacheContext);
    const idToken = React.useContext(FirebaseAuthenticationIdTokenContext);

    return {
        clientId,
        apolloClient,
        store,
        user,
        firebaseStorageUrlCache,
        idToken,
    };
};
