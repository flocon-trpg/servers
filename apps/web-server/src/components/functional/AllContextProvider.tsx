import React, { PropsWithChildren } from 'react';
import { Client, Provider } from 'urql';
import { ClientIdContext } from '../../contexts/ClientIdContext';
import { FirebaseStorageUrlCacheContext } from '../../contexts/FirebaseStorageUrlCacheContext';
import { FirebaseUserState, MyAuthContext } from '../../contexts/MyAuthContext';
import { ExpiryMap } from '../../utils/file/expiryMap';

export type Props = {
    clientId: string | null;
    client: Client;
    user: FirebaseUserState;
    firebaseStorageUrlCache: ExpiryMap<string, string> | null;
};

export const AllContextProvider: React.FC<PropsWithChildren<Props>> = ({
    clientId,
    client,
    user,
    firebaseStorageUrlCache,
    children,
}: PropsWithChildren<Props>) => {
    return (
        <ClientIdContext.Provider value={clientId}>
            <Provider value={client}>
                <MyAuthContext.Provider value={user}>
                    <FirebaseStorageUrlCacheContext.Provider value={firebaseStorageUrlCache}>
                        {children}
                    </FirebaseStorageUrlCacheContext.Provider>
                </MyAuthContext.Provider>
            </Provider>
        </ClientIdContext.Provider>
    );
};
