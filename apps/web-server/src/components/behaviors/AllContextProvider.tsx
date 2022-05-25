import { Client, Provider } from 'urql';
import React, { PropsWithChildren } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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
                        <DndProvider backend={HTML5Backend}>{children}</DndProvider>
                    </FirebaseStorageUrlCacheContext.Provider>
                </MyAuthContext.Provider>
            </Provider>
        </ClientIdContext.Provider>
    );
};
