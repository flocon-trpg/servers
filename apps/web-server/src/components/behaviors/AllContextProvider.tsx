import { App } from 'antd';
import React, { PropsWithChildren } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Client, Provider } from 'urql';
import { ClientIdContext } from '../../contexts/ClientIdContext';
import { AntdThemeConfigProvider } from './AntdThemeConfigProvider';

export type Props = {
    clientId: string | null;
    urqlClient: Client;
    reactQueryClient: QueryClient;
    compact?: boolean | undefined;
};

export const AllContextProvider: React.FC<PropsWithChildren<Props>> = ({
    clientId,
    urqlClient,
    reactQueryClient,
    compact,
    children,
}: PropsWithChildren<Props>) => {
    return (
        <ClientIdContext.Provider value={clientId}>
            <Provider value={urqlClient}>
                <QueryClientProvider client={reactQueryClient}>
                    <DndProvider backend={HTML5Backend}>
                        <AntdThemeConfigProvider compact={compact}>
                            <App>{children}</App>
                        </AntdThemeConfigProvider>
                    </DndProvider>
                </QueryClientProvider>
            </Provider>
        </ClientIdContext.Provider>
    );
};
