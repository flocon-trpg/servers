import React, { PropsWithChildren } from 'react';
import { Client, Provider } from 'urql';
import { ClientIdContext } from '../../contexts/ClientIdContext';
import { FirebaseStorageUrlCacheContext } from '../../contexts/FirebaseStorageUrlCacheContext';
import { ExpiryMap } from '../../utils/file/expiryMap';

export type Props = {
    clientId: string | null;
    client: Client;
    firebaseStorageUrlCache: ExpiryMap<string, string> | null;
};

export const AllContextProvider: React.FC<PropsWithChildren<Props>> = ({
    clientId,
    client,
    firebaseStorageUrlCache,
    children,
}: PropsWithChildren<Props>) => {
    return (
        <ClientIdContext.Provider value={clientId}>
            <Provider value={client}>
                <FirebaseStorageUrlCacheContext.Provider value={firebaseStorageUrlCache}>
                    {children}
                </FirebaseStorageUrlCacheContext.Provider>
            </Provider>
        </ClientIdContext.Provider>
    );
};
