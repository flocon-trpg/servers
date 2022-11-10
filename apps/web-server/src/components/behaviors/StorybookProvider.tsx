import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Client, Provider } from 'urql';
import { useTryRoomClient } from '@/hooks/roomClientHooks';

/** Storybookに表示するコンポーネント用のProviderです。Storybookやデバッグ以外で用いることは避けてください。 */
export const StorybookProvider: React.FC<{
    children: React.ReactNode;
    urqlClient?: Client;
    waitForRoomClient: boolean;
}> = ({ children, urqlClient, waitForRoomClient }) => {
    const queryClientRef = React.useRef(new QueryClient());
    const roomClient = useTryRoomClient();
    if (waitForRoomClient && roomClient == null) {
        return null;
    }

    let result = (
        <QueryClientProvider client={queryClientRef.current}>
            <DndProvider backend={HTML5Backend}>{children}</DndProvider>
        </QueryClientProvider>
    );
    if (urqlClient != null) {
        result = <Provider value={urqlClient}>{result}</Provider>;
    }

    return result;
};
