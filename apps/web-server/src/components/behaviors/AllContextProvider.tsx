import { App } from 'antd';
import React, { PropsWithChildren } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Client, Provider } from 'urql';
import { ClientIdContext } from '../../contexts/ClientIdContext';
import { AntdThemeConfigProvider } from './AntdThemeConfigProvider';
import { RoomClientContext, RoomClientContextValue } from '@/contexts/RoomClientContext';

export type Props = {
    clientId: string | null;
    urqlClient: Client;
    reactQueryClient: QueryClient;
    compact?: boolean | undefined;
    roomClient: RoomClientContextValue | null;
    excludeAntdApp?: boolean;
};

export const AllContextProvider: React.FC<PropsWithChildren<Props>> = ({
    clientId,
    urqlClient,
    reactQueryClient,
    compact,
    roomClient,
    excludeAntdApp,
    children,
}: PropsWithChildren<Props>) => {
    return (
        <ClientIdContext.Provider value={clientId}>
            <Provider value={urqlClient}>
                <QueryClientProvider client={reactQueryClient}>
                    <DndProvider backend={HTML5Backend}>
                        <RoomClientContext.Provider value={roomClient}>
                            <AntdThemeConfigProvider compact={compact}>
                                {excludeAntdApp ? children : <App>{children}</App>}
                            </AntdThemeConfigProvider>
                        </RoomClientContext.Provider>
                    </DndProvider>
                </QueryClientProvider>
            </Provider>
        </ClientIdContext.Provider>
    );
};
