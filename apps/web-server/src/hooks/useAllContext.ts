import { useClient } from 'urql';
import React from 'react';
import { Props } from '../components/behaviors/AllContextProvider';
import { ClientIdContext } from '../contexts/ClientIdContext';
import { FirebaseStorageUrlCacheContext } from '../contexts/FirebaseStorageUrlCacheContext';
import { MyAuthContext } from '../contexts/MyAuthContext';

// AllContextProviderと合わせて使うためのhook
export const useAllContext = (): Props => {
    const clientId = React.useContext(ClientIdContext);
    const client = useClient();
    const user = React.useContext(MyAuthContext);
    const firebaseStorageUrlCache = React.useContext(FirebaseStorageUrlCacheContext);

    return {
        clientId,
        client,
        user,
        firebaseStorageUrlCache,
    };
};
