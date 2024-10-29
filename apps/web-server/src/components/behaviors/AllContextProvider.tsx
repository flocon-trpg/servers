import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import React, { PropsWithChildren } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Client, Provider } from 'urql';
import { AntdThemeConfigProvider } from './AntdThemeConfigProvider';
import { RoomClientContext, RoomClientContextValue } from '@/contexts/RoomClientContext';

export type Props = {
    urqlClient: Client;
    reactQueryClient: QueryClient;
    compact?: boolean | undefined;
    roomClient: RoomClientContextValue | null;
    excludeAntdApp?: boolean;
};

export const AllContextProvider: React.FC<PropsWithChildren<Props>> = ({
    urqlClient,
    reactQueryClient,
    compact,
    roomClient,
    excludeAntdApp,
    children,
}: PropsWithChildren<Props>) => {
    return (
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
    );
};
