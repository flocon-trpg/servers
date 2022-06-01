import { useClient } from 'urql';
import React from 'react';
import { Props } from '../components/behaviors/AllContextProvider';
import { ClientIdContext } from '../contexts/ClientIdContext';
import { FirebaseStorageUrlCacheContext } from '../contexts/FirebaseStorageUrlCacheContext';

// AllContextProviderと合わせて使うためのhook
export const useAllContext = (): Props => {
    const clientId = React.useContext(ClientIdContext);
    const client = useClient();
    const firebaseStorageUrlCache = React.useContext(FirebaseStorageUrlCacheContext);

    return {
        clientId,
        client,
        firebaseStorageUrlCache,
    };
};
